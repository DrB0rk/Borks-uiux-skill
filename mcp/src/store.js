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
    return { ...findProject(start), created: false, reason: "disabled" };
  }
  const { root, real } = findProject(start);
  if (!real) return { root, real, created: false, reason: "not a project root" };
  const existed = isInitialised(root);
  ensure(root);
  if (!fs.existsSync(path.join(b0xDir(root), "context.md"))) renderContext(root, load(root));
  return { root, real, created: !existed };
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

export function save(root, entries) {
  ensure(root);
  const capped = entries.slice(-MAX_ENTRIES);
  writeAtomic(
    path.join(b0xDir(root), "entries.json"),
    JSON.stringify(capped, null, 2) + "\n"
  );
}

export function appendLog(root, event) {
  ensure(root);
  const line = JSON.stringify({ at: new Date().toISOString(), ...event }) + "\n";
  fs.appendFileSync(path.join(b0xDir(root), "feedback.jsonl"), line, "utf8");
}

export function normalise({ kind, text, tags, source }) {
  const errors = [];
  const k = String(kind ?? "").trim().toLowerCase();
  if (!KINDS.includes(k)) errors.push(`kind must be one of: ${KINDS.join(", ")}`);

  let t = String(text ?? "").trim();
  if (!t) errors.push("text is required");
  // Clamp silently as defence in depth. The MCP input schema already rejects
  // oversized text before this runs; throwing here as well would make the
  // clamp unreachable.
  else if (t.length > MAX_TEXT) t = t.slice(0, MAX_TEXT);

  let cleanTags = [];
  if (tags != null) {
    if (!Array.isArray(tags)) errors.push("tags must be an array of strings");
    else {
      cleanTags = tags
        .map((x) => String(x).trim().toLowerCase())
        .filter((x) => x && x.length <= 40)
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