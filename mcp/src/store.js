// Storage layer for the .b0x project memory folder.
//
// Layout (all filenames fixed, never derived from user input):
//   .b0x/config.json     schema marker + creation time
//   .b0x/entries.json    authoritative list of remembered items
//   .b0x/feedback.jsonl  append-only audit log, never rewritten
//   .b0x/context.md      generated snapshot the agent reads
//
// Writes are atomic (tmp file + rename) so an interrupted call cannot leave
// a half-written entries.json behind.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { fileURLToPath } from "node:url";

export const DIR = ".b0x";
export const SCHEMA = 1;

const GLOBAL_ROLES_FILE = fileURLToPath(new URL("./global-roles.json", import.meta.url));

const MAX_TEXT = 2000;
const MAX_TAGS = 12;
const MAX_ENTRIES = 500;
const MAX_LOG_BYTES = 1024 * 1024; // 1 MiB before the audit log rotates

export const KINDS = ["preference", "rejection", "praise"];

/**
 * Locate the project this call belongs to.
 *
 * `real` is true only when we found an actual project marker - an existing
 * .b0x, or a .git root. When false we fell back to the working directory
 * (some projects have no VCS), and callers should not litter it with a
 * memory folder unless the user asks.
 */
export function findProject(start = process.cwd()) {
  let dir = path.resolve(start);
  let gitRoot = null;
  for (;;) {
    if (fs.existsSync(path.join(dir, DIR))) return { root: dir, real: true };
    if (!gitRoot && fs.existsSync(path.join(dir, ".git"))) gitRoot = dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (gitRoot) return { root: gitRoot, real: true };
  return { root: path.resolve(start), real: false };
}

/** Back-compat wrapper: just the root path. */
export function findProjectRoot(start = process.cwd()) {
  return findProject(start).root;
}

export function b0xDir(root) {
  return path.join(root, DIR);
}

function writeAtomic(file, contents) {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, contents, "utf8");
  fs.renameSync(tmp, file);
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

export function loadGlobalRepositoryData() {
  return readJson(GLOBAL_ROLES_FILE, {
    version: "1.0.0",
    roles: {},
    baseline: { rejections: [], preferences: [] },
  });
}

export function getGlobalRoles() {
  const data = loadGlobalRepositoryData();
  return data.roles || {};
}

export function getRole(id) {
  const roles = getGlobalRoles();
  return roles[id] || null;
}

export function getGlobalBaseline() {
  const data = loadGlobalRepositoryData();
  return data.baseline || { rejections: [], preferences: [] };
}

export function getUserGlobalDir() {
  return path.join(os.homedir(), DIR);
}

export function loadUserGlobal() {
  const file = path.join(getUserGlobalDir(), "entries.json");
  const entries = readJson(file, []);
  return Array.isArray(entries) ? entries.filter((e) => e && typeof e.text === "string") : [];
}

export function loadMerged(root) {
  const baseline = getGlobalBaseline();
  const userGlobal = loadUserGlobal();
  const project = root && isInitialised(root) ? load(root) : [];

  const repoRejections = (baseline.rejections || []).map((e) => ({ ...e, scope: "global-repo" }));
  const repoPreferences = (baseline.preferences || []).map((e) => ({ ...e, scope: "global-repo" }));
  const userEntries = (userGlobal || []).map((e) => ({ ...e, scope: "global-user" }));
  const projEntries = (project || []).map((e) => ({ ...e, scope: "project" }));

  return {
    globalRepo: { rejections: repoRejections, preferences: repoPreferences },
    globalUser: userEntries,
    project: projEntries,
    all: [...repoRejections, ...repoPreferences, ...userEntries, ...projEntries],
  };
}

/** Block the current thread briefly. Used only to retry a contended lock. */
function sleepSync(ms) {
  const sab = new SharedArrayBuffer(4);
  Atomics.wait(new Int32Array(sab), 0, 0, ms);
}

const LOCK_STALE_MS = 10_000;
const LOCK_WAIT_MS = 3_000;

/**
 * Serialise read-modify-write across processes.
 *
 * O_EXCL creation is atomic on every POSIX filesystem and Windows, so this
 * works without native deps. A lock older than LOCK_STALE_MS is treated as
 * abandoned and removed, so a killed process cannot wedge the store forever.
 * If the wait budget is exhausted we proceed anyway rather than fail the call:
 * the atomic rename still guarantees a valid file, so the worst case is the
 * pre-existing last-write-wins, not corruption.
 */
export function withLock(root, fn) {
  const dir = b0xDir(root);
  fs.mkdirSync(dir, { recursive: true });
  const lock = path.join(dir, ".lock");
  const deadline = Date.now() + LOCK_WAIT_MS;

  let fd = null;
  for (;;) {
    try {
      fd = fs.openSync(lock, "wx");
      break;
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      try {
        if (Date.now() - fs.statSync(lock).mtimeMs > LOCK_STALE_MS) {
          fs.unlinkSync(lock);
          continue;
        }
      } catch {
        /* lock vanished between stat and unlink; retry immediately */
      }
      if (Date.now() > deadline) break; // give up waiting; still safe
      sleepSync(5);
    }
  }

  try {
    return fn();
  } finally {
    if (fd !== null) {
      try { fs.closeSync(fd); } catch { /* already gone */ }
      try { fs.unlinkSync(lock); } catch { /* already released */ }
    }
  }
}

export function ensure(root) {
  const dir = b0xDir(root);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const configFile = path.join(dir, "config.json");
  if (!fs.existsSync(configFile)) {
    writeAtomic(
      configFile,
      JSON.stringify(
        { schema: SCHEMA, created: new Date().toISOString(), project: path.basename(root) },
        null,
        2
      ) + "\n"
    );
  }
  // Create the store up front too, so a freshly initialised folder is
  // self-describing rather than looking half-built until the first record.
  const entriesFile = path.join(dir, "entries.json");
  if (!fs.existsSync(entriesFile)) writeAtomic(entriesFile, "[]\n");
  return dir;
}

/**
 * Create .b0x if it is missing, so memory is ready before anything is asked.
 *
 * Only does this inside a real project (a .git root or an existing .b0x).
 * In a bare directory with no VCS we decline rather than scatter memory
 * folders through /tmp. Set B0X_AUTOINIT=0 to turn this off entirely.
 */
export function autoInit(start = process.cwd()) {
  if (process.env.B0X_AUTOINIT === "0") {
    return { ...findProject(start), created: false, reason: "disabled", available: false };
  }
  let found;
  try {
    found = findProject(start);
  } catch (err) {
    return { root: path.resolve(start), real: false, created: false, available: false, reason: String(err?.code ?? err) };
  }
  if (!found.real) return { ...found, created: false, available: false, reason: "not a project root" };
  try {
    const existed = isInitialised(found.root);
    ensure(found.root);
    if (!fs.existsSync(path.join(b0xDir(found.root), "context.md"))) renderContext(found.root, load(found.root));
    return { ...found, created: !existed, available: true };
  } catch (err) {
    // Read-only or unwritable project. Memory is an enhancement, never a
    // prerequisite: report it and let the caller carry on without memory
    // rather than failing the whole tool call.
    return { ...found, created: false, available: false, reason: String(err?.code ?? err) };
  }
}

export function isInitialised(root) {
  return fs.existsSync(path.join(b0xDir(root), "entries.json")) ||
    fs.existsSync(path.join(b0xDir(root), "config.json"));
}

export function load(root) {
  const file = path.join(b0xDir(root), "entries.json");
  const entries = readJson(file, []);
  return Array.isArray(entries) ? entries.filter((e) => e && typeof e.text === "string") : [];
}

/**
 * Append an entry under the cross-process lock.
 *
 * This is the only correct way to add to the store: load, push and save must
 * not be separated by anything, or a concurrent writer's changes are lost.
 * Returns the prune report so callers can surface any trimming that happened.
 */
export function append(root, entry) {
  return withLock(root, () => {
    const report = save(root, [...load(root), entry]);
    appendLog(root, { action: "record", id: entry.id, kind: entry.kind });
    // Regenerate here as well as in remove(), so context.md can never go stale
    // regardless of whether the caller goes through the MCP tool or the store
    // API directly. The rendered text is returned so callers never re-render
    // outside the lock.
    const context = renderContext(root, report.kept);
    return { ...report, context };
  });
}

/** Remove by id under the lock, returning the remaining count or null. */
export function remove(root, id) {
  return withLock(root, () => {
    const entries = load(root);
    const next = entries.filter((e) => e.id !== id);
    if (next.length === entries.length) return null;
    save(root, next);
    appendLog(root, { action: "forget", id });
    renderContext(root, next);
    return next.length;
  });
}

/**
 * Trim to the cap without ever silently dropping a hard rejection.
 *
 * Rejections are binding constraints; losing one silently would be the worst
 * possible failure in a memory system. Soft entries are pruned oldest-first and
 * rejections are kept for as long as possible. If rejections alone exceed the
 * cap, the oldest are dropped and the caller is told, because that must not
 * happen invisibly either.
 */
export function prune(entries, cap = MAX_ENTRIES) {
  if (entries.length <= cap) return { kept: entries, dropped: 0, droppedRejections: 0 };

  const rejections = entries.filter((e) => e.kind === "rejection");
  const soft = entries.filter((e) => e.kind !== "rejection");

  // Keep every rejection, plus the most recent soft entries that fit.
  // `slice(-0)` is `slice(0)` in JavaScript and returns everything, so a zero
  // budget must be handled explicitly rather than sliced.
  const softBudget = Math.max(0, cap - rejections.length);
  const keptSoft = softBudget > 0 ? soft.slice(-softBudget) : [];
  const droppedSoft = soft.length - keptSoft.length;

  let kept = [...keptSoft, ...rejections];
  let droppedRejections = 0;
  if (kept.length > cap) {
    // Overwhelmingly rejections. Drop the oldest, but report it.
    droppedRejections = kept.length - cap;
    kept = kept.slice(-cap);
  }

  kept.sort((a, b) => String(a.created ?? "").localeCompare(String(b.created ?? "")));
  return { kept, dropped: droppedSoft + droppedRejections, droppedRejections };
}

export function save(root, entries) {
  ensure(root);
  const { kept, dropped, droppedRejections } = prune(entries);
  writeAtomic(
    path.join(b0xDir(root), "entries.json"),
    JSON.stringify(kept, null, 2) + "\n"
  );
  return { kept, dropped, droppedRejections };
}

export function appendLog(root, event) {
  ensure(root);
  const file = path.join(b0xDir(root), "feedback.jsonl");
  const line = JSON.stringify({ at: new Date().toISOString(), ...event }) + "\n";
  // Rotate past the cap, keeping one previous generation. A long-lived project
  // would otherwise grow this without bound, and it is an audit trail rather
  // than the source of truth - entries.json holds what actually matters.
  try {
    if (fs.statSync(file).size > MAX_LOG_BYTES) {
      const prev = `${file}.1`;
      try { fs.unlinkSync(prev); } catch { /* no previous rotation */ }
      fs.renameSync(file, prev);
    }
  } catch {
    /* no log yet */
  }
  fs.appendFileSync(file, line, "utf8");
}

export function normalise({ kind, text, tags, source, reinforcements = 1, lastReinforced }) {
  const errors = [];
  const k = String(kind ?? "").trim().toLowerCase();
  if (!KINDS.includes(k)) errors.push(`kind must be one of: ${KINDS.join(", ")}`);

  let t = String(text ?? "").trim();
  if (!t) errors.push("text is required");
  // Strip C0/C1 control characters. Entries are rendered into terminals and
  // diffs, so an embedded ESC (0x1b) could repaint or reposition the display.
  // Newline, carriage return and tab are kept because they carry meaning.
  else t = t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
  if (t.length > MAX_TEXT) t = t.slice(0, MAX_TEXT);

  let cleanTags = [];
  if (tags != null) {
    if (!Array.isArray(tags)) errors.push("tags must be an array of strings");
    else {
      cleanTags = tags
        .map((x) =>
          String(x)
            // Same control-character strip as text, for the same reason.
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
            .trim()
            .toLowerCase()
        )
        // Truncate rather than drop: a long tag is still useful signal, and
        // silently discarding it would look like the tag was never stored.
        .map((x) => (x.length > 40 ? x.slice(0, 40) : x))
        .filter(Boolean)
        .slice(0, MAX_TAGS);
    }
  }

  if (errors.length) throw new Error(errors.join("; "));

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    kind: k,
    text: t,
    tags: cleanTags,
    source: String(source ?? "agent").slice(0, 120),
    reinforcements: Math.max(1, parseInt(reinforcements, 10) || 1),
    lastReinforced: lastReinforced || now,
    created: now,
  };
}

const DOMAIN_KEYWORDS = [
  "padding", "margin", "spacing", "gap",
  "radius", "border-radius", "rounded",
  "border", "rail", "divider", "outline",
  "contrast", "color", "colour", "background", "accent",
  "font", "typography", "heading", "weight",
  "icon", "svg", "lucide",
  "animation", "motion", "transition", "spring", "gsap",
  "card", "table", "button", "modal", "dialog", "popover",
  "form", "input", "label",
  "copy", "marketing", "filler",
];

export function extractDomainTags(text) {
  const lower = String(text || "").toLowerCase();
  const matched = [];
  for (const kw of DOMAIN_KEYWORDS) {
    if (lower.includes(kw)) {
      matched.push(kw === "colour" ? "color" : kw === "rounded" ? "radius" : kw);
    }
  }
  return Array.from(new Set(matched)).slice(0, MAX_TAGS);
}

function textWords(text) {
  return new Set(
    String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3)
  );
}

function jaccard(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function findDuplicate(entries, newEntry) {
  const newW = textWords(newEntry.text);
  for (const existing of entries) {
    if (existing.kind !== newEntry.kind) continue;
    if (existing.text.trim().toLowerCase() === newEntry.text.trim().toLowerCase()) {
      return existing;
    }
    const existingW = textWords(existing.text);
    if (jaccard(newW, existingW) >= 0.75) {
      return existing;
    }
  }
  return null;
}

export function findConflicts(entries, newEntry) {
  const newDomains = new Set(newEntry.tags?.length ? newEntry.tags : extractDomainTags(newEntry.text));
  if (!newDomains.size) return [];

  const conflicts = [];
  const newW = textWords(newEntry.text);

  for (const existing of entries) {
    const existingDomains = new Set(existing.tags?.length ? existing.tags : extractDomainTags(existing.text));
    const shared = Array.from(newDomains).filter((d) => existingDomains.has(d));
    if (!shared.length) continue;

    const isPolarityConflict =
      (existing.kind === "rejection" && newEntry.kind === "preference") ||
      (existing.kind === "preference" && newEntry.kind === "rejection");

    const similarity = jaccard(newW, textWords(existing.text));

    if (isPolarityConflict && (similarity >= 0.25 || shared.length >= 2)) {
      conflicts.push(existing);
    } else if (existing.kind === newEntry.kind && similarity >= 0.5 && existing.text !== newEntry.text) {
      conflicts.push(existing);
    }
  }
  return conflicts;
}

/**
 * Distill natural-language user feedback into structured directive, kind, and tags.
 */
export function distillFeedback(rawFeedback, contextHint = "") {
  if (!rawFeedback || typeof rawFeedback !== "string") {
    throw new Error("rawFeedback must be a non-empty string.");
  }

  const text = rawFeedback.trim();
  const lower = text.toLowerCase();

  let kind = "preference";
  const rejectionPatterns = [
    /\b(never|don't|dont|do not|stop|avoid|hate|dislike|remove|no more|terrible|awful)\b/i,
    /\bnot (good|working|acceptable)\b/i,
    /\b(get rid of|drop the)\b/i,
    /\btoo (much|loud|bright|flashy|cluttered|dense|big|small)\b/i,
  ];
  const praisePatterns = [
    /\b(great|love|perfect|keep|excellent|works well|approved|good job|nice|looks good)\b/i,
    /\b(exactly right|nailed it)\b/i,
  ];

  if (rejectionPatterns.some((p) => p.test(lower))) {
    kind = "rejection";
  } else if (praisePatterns.some((p) => p.test(lower))) {
    kind = "praise";
  }

  let cleaned = text
    .replace(/^(hey|hi|hello|please|can you|could you|i want you to|make sure to|i think|actually|honestly|just|nah|no)[,\s]+/gi, "")
    .replace(/[.!?]+$/, "")
    .trim();

  let directive = cleaned;
  if (kind === "rejection") {
    if (!/^(never|do not|avoid|no\b)/i.test(cleaned)) {
      const rest = cleaned
        .replace(/^(stop|don't|dont|get rid of)\s+/i, "")
        .replace(/^(putting|using|doing)\b/i, (m) => (m.toLowerCase() === "putting" ? "put" : m.toLowerCase() === "using" ? "use" : "do"));
      directive = `Never ${rest}`;
    }
  } else if (kind === "praise") {
    directive = cleaned;
  } else if (kind === "preference") {
    if (/^(i prefer|we prefer|prefer|always|use)\s+/i.test(cleaned)) {
      directive = cleaned.replace(/^(i prefer|we prefer)\s+/i, "Prefer ");
    } else {
      directive = `Prefer ${cleaned}`;
    }
  }

  const tags = extractDomainTags(`${directive} ${contextHint}`);

  return {
    kind,
    directive: directive.slice(0, MAX_TEXT),
    raw: text,
    tags,
    confidence: "high",
  };
}

/**
 * Smart append that auto-deduplicates (increments reinforcement) and resolves conflicts.
 */
export function learnEntry(root, entry, { autoSupersede = true } = {}) {
  return withLock(root, () => {
    ensure(root);
    const entries = load(root);

    // 1. Check for duplicate or near-duplicate -> reinforce
    const existingDup = findDuplicate(entries, entry);
    if (existingDup) {
      existingDup.reinforcements = (existingDup.reinforcements || 1) + 1;
      existingDup.lastReinforced = new Date().toISOString();
      if (entry.tags?.length) {
        existingDup.tags = Array.from(new Set([...(existingDup.tags || []), ...entry.tags])).slice(0, MAX_TAGS);
      }
      save(root, entries);
      appendLog(root, { action: "reinforce", id: existingDup.id, count: existingDup.reinforcements });
      const context = renderContext(root, entries);
      return {
        action: "reinforced",
        entry: existingDup,
        reinforcements: existingDup.reinforcements,
        total: entries.length,
        context,
      };
    }

    // 2. Check for conflicts -> supersede
    const conflicts = findConflicts(entries, entry);
    let superseded = [];
    let nextEntries = entries;

    if (conflicts.length > 0 && autoSupersede) {
      const conflictIds = new Set(conflicts.map((c) => c.id));
      superseded = conflicts;
      nextEntries = entries.filter((e) => !conflictIds.has(e.id));
      for (const c of conflicts) {
        appendLog(root, { action: "supersede", id: c.id, supersededBy: entry.id });
      }
    }

    // 3. Save new entry
    const report = save(root, [...nextEntries, entry]);
    appendLog(root, { action: "learn", id: entry.id, kind: entry.kind });
    const context = renderContext(root, report.kept);
    return {
      action: superseded.length > 0 ? "superseded" : "added",
      entry,
      superseded: superseded.map((s) => ({ id: s.id, text: s.text })),
      conflicts: conflicts.map((c) => ({ id: c.id, text: c.text })),
      total: report.kept.length,
      ...report,
      context,
    };
  });
}
/** Regenerate context.md - the compact snapshot the agent actually follows. */
export function renderContext(root, entries = [], roleId = null) {
  const baseline = getGlobalBaseline();
  const roles = getGlobalRoles();
  const userGlobal = loadUserGlobal();

  const lines = [
    "# B0rk's UI/UX — Global Roles & Project Design Memory",
    "",
    "> Powered by the b0x MCP server. Shipped with global repository roles and baseline constraints from the b0x repository, layered with project-specific overrides.",
    "",
  ];

  // Global Roles Section
  lines.push("## Global repository roles");
  lines.push("");
  for (const [id, r] of Object.entries(roles)) {
    lines.push(`- **${id}**: ${r.title} — ${r.charter}`);
  }
  lines.push("");

  // Role Spotlight if requested
  if (roleId && roles[roleId]) {
    const r = roles[roleId];
    lines.push(`### Active role focus: ${r.title}`);
    lines.push(`**Charter:** ${r.charter}`);
    lines.push("");
    lines.push("**Directives:**");
    for (const d of r.directives || []) {
      lines.push(`- ${d}`);
    }
    lines.push("");
  }

  // Global Baseline Hard Rejections
  lines.push("## Global baseline hard rejections (all projects)");
  lines.push("");
  for (const rej of baseline.rejections || []) {
    const tags = rej.tags?.length ? ` _(tags: ${rej.tags.join(", ")})_` : "";
    lines.push(`- ${rej.text}${tags}`);
  }
  lines.push("");
  lines.push("> Binding global constraints. If a task requires breaking one, say so explicitly and ask before proceeding.");
  lines.push("");

  // Global Baseline Preferences
  lines.push("## Global baseline preferences (apply unless task argues otherwise)");
  lines.push("");
  for (const pref of baseline.preferences || []) {
    const tags = pref.tags?.length ? ` _(tags: ${pref.tags.join(", ")})_` : "";
    lines.push(`- ${pref.text}${tags}`);
  }
  lines.push("");
  lines.push("> Global defaults. A task-specific reason may override; note the reason when it does.");
  lines.push("");

  // User Global rules (from ~/.b0x if any)
  if (userGlobal.length > 0) {
    const userRej = userGlobal.filter((e) => e.kind === "rejection");
    const userPref = userGlobal.filter((e) => e.kind === "preference");
    if (userRej.length > 0 || userPref.length > 0) {
      lines.push("## User global custom rules (~/.b0x)");
      lines.push("");
      for (const e of userRej) {
        const tags = e.tags?.length ? ` _(tags: ${e.tags.join(", ")})_` : "";
        lines.push(`- [Rejection] ${e.text}${tags}`);
      }
      for (const e of userPref) {
        const tags = e.tags?.length ? ` _(tags: ${e.tags.join(", ")})_` : "";
        lines.push(`- [Preference] ${e.text}${tags}`);
      }
      lines.push("");
    }
  }

  // Project-Specific Memory
  const projRejections = entries.filter((e) => e.kind === "rejection");
  const projPreferences = entries.filter((e) => e.kind === "preference");
  const projPraise = entries.filter((e) => e.kind === "praise");

  lines.push("## Project-specific memory (`.b0x/`)");
  lines.push("");

  if (!entries.length) {
    lines.push(
      "_No local project overrides recorded yet. Call `b0x_record` to store project-specific rules._"
    );
    lines.push("");
  } else {
    if (projRejections.length > 0) {
      lines.push("### Project rejections (overrides)");
      lines.push("");
      for (const e of projRejections) {
        const tags = e.tags?.length ? ` _(tags: ${e.tags.join(", ")})_` : "";
        const rf = e.reinforcements > 1 ? ` _(reinforced ×${e.reinforcements})_` : "";
        lines.push(`- ${e.text}${tags}${rf}`);
      }
      lines.push("");
    }
    if (projPreferences.length > 0) {
      lines.push("### Project preferences");
      lines.push("");
      for (const e of projPreferences) {
        const tags = e.tags?.length ? ` _(tags: ${e.tags.join(", ")})_` : "";
        const rf = e.reinforcements > 1 ? ` _(reinforced ×${e.reinforcements})_` : "";
        lines.push(`- ${e.text}${tags}${rf}`);
      }
      lines.push("");
    }
    if (projPraise.length > 0) {
      lines.push("### Confirmed to work here");
      lines.push("");
      for (const e of projPraise) {
        const tags = e.tags?.length ? ` _(tags: ${e.tags.join(", ")})_` : "";
        const rf = e.reinforcements > 1 ? ` _(reinforced ×${e.reinforcements})_` : "";
        lines.push(`- ${e.text}${tags}${rf}`);
      }
    }
  }

  lines.push("---");
  lines.push("");
  const totalRules =
    (baseline.rejections?.length || 0) +
    (baseline.preferences?.length || 0) +
    userGlobal.length +
    entries.length;
  lines.push(
    `_Total active rules: ${totalRules} (global baseline: ${(baseline.rejections?.length || 0) + (baseline.preferences?.length || 0)}, user global: ${userGlobal.length}, project: ${entries.length}). Generated ${new Date().toISOString()}._`
  );
  lines.push("");

  const rendered = lines.join("\n");
  if (root) {
    try {
      writeAtomic(path.join(b0xDir(root), "context.md"), rendered);
    } catch {
      /* ignore write failure in unwritable project root */
    }
  }
  return rendered;
}