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

export const DIR = ".b0x";
export const SCHEMA = 1;

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

export function normalise({ kind, text, tags, source }) {
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

  return {
    id: crypto.randomUUID(),
    kind: k,
    text: t,
    tags: cleanTags,
    source: String(source ?? "agent").slice(0, 120),
    created: new Date().toISOString(),
  };
}

/** Regenerate context.md - the compact snapshot the agent actually follows. */
export function renderContext(root, entries) {
  const rejections = entries.filter((e) => e.kind === "rejection");
  const preferences = entries.filter((e) => e.kind === "preference");
  const praise = entries.filter((e) => e.kind === "praise");

  const lines = [
    "# Project design memory",
    "",
    "> Generated by the b0x MCP server for the `b0rks-uiux` skill.",
    "> Edit through the `b0x_record` / `b0x_forget` tools, not by hand.",
    "",
  ];

  if (!entries.length) {
    lines.push(
      "This project has no recorded feedback yet. The folder was created automatically",
      "so memory is ready the moment the user gives a durable design preference or rejection.",
      "",
      "_Nothing recorded yet._",
      ""
    );
  }

  const section = (title, items, note) => {
    lines.push(`## ${title}`);
    lines.push("");
    if (!items.length) {
      lines.push("_None recorded._");
    } else {
      for (const e of items) {
        const tags = e.tags?.length ? ` _(tags: ${e.tags.join(", ")})_` : "";
        lines.push(`- ${e.text}${tags}`);
      }
    }
    if (note) {
      lines.push("");
      lines.push(`> ${note}`);
    }
    lines.push("");
  };

  section(
    "Hard rejections - never do these",
    rejections,
    "Treat as binding constraints. If a task requires breaking one, say so and ask before proceeding."
  );
  section(
    "Preferences - apply unless the task argues otherwise",
    preferences,
    "Defaults, not absolutes. A task-specific reason may override; note the reason when it does."
  );
  section("Confirmed to work", praise, "Patterns the user explicitly approved here.");

  lines.push("---");
  lines.push("");
  lines.push(
    `_${entries.length} entr${entries.length === 1 ? "y" : "ies"}. Generated ${new Date().toISOString()}._`
  );
  lines.push("");

  writeAtomic(path.join(b0xDir(root), "context.md"), lines.join("\n"));
  return lines.join("\n");
}