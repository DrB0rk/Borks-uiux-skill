// Store-level unit tests for b0x:
// global repository roles, baseline rules, cross-process locking,
// pruning priority, log rotation, and sanitisation.
//
//   node mcp/test/store.mjs

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const S = await import("../src/store.js");

let failures = 0;
const check = (name, pass, detail = "") => {
  console.log(`  ${pass ? "ok  " : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
  if (!pass) failures++;
};

function freshProject(name) {
  const dir = path.join(os.tmpdir(), `b0x-unit-${name}-${process.pid}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync("git", ["init", "-q", dir]);
  return dir;
}

console.log("=== global repository roles & baseline rules ===");
{
  const data = S.loadGlobalRepositoryData();
  check("global-roles.json loads", Boolean(data && data.roles));
  const roles = S.getGlobalRoles();
  const roleKeys = Object.keys(roles);
  check("5 global roles defined", roleKeys.length === 5, `found: ${roleKeys.join(", ")}`);
  check("ui-engineer role exists", Boolean(roles["ui-engineer"]?.charter));
  check("ui-auditor role exists", Boolean(roles["ui-auditor"]?.charter));
  check("content-designer role exists", Boolean(roles["content-designer"]?.charter));
  check("motion-specialist role exists", Boolean(roles["motion-specialist"]?.charter));
  check("accessibility-specialist role exists", Boolean(roles["accessibility-specialist"]?.charter));

  const role = S.getRole("ui-engineer");
  check("getRole('ui-engineer') returns directives", Array.isArray(role?.directives) && role.directives.length > 0);

  const baseline = S.getGlobalBaseline();
  check("baseline rejections exist", Array.isArray(baseline.rejections) && baseline.rejections.length >= 10);
  check("baseline preferences exist", Array.isArray(baseline.preferences) && baseline.preferences.length >= 15);

  const rejTexts = baseline.rejections.map((e) => e.text);
  check("baseline rejects hand-drawn SVG icons", rejTexts.some((t) => t.includes("Lucide")));
  check("baseline rejects marketing filler copy", rejTexts.some((t) => t.includes("filler language")));
  check("baseline rejects active leading-edge rail", rejTexts.some((t) => t.includes("accent bar or rail")));
  check("baseline rejects calling GSAP simply free", rejTexts.some((t) => t.includes("GSAP as simply free")));
  check("baseline rejects treating taste as defects", rejTexts.some((t) => t.includes("subjective taste")));
  check("baseline rejects fake trust signals", rejTexts.some((t) => t.includes("fake urgency") || t.includes("trust signals")));
  check("baseline rejects layout-thrash animations", rejTexts.some((t) => t.includes("layout-triggering")));
  check("baseline rejects streaming AI jitter", rejTexts.some((t) => t.includes("scroll-anchoring")));
  check("baseline rejects color as sole carrier", rejTexts.some((t) => t.includes("sole carrier") && t.includes("CVD")));
  check("baseline rejects dark mode halation", rejTexts.some((t) => t.includes("halation")));

  const prefTexts = baseline.preferences.map((e) => e.text);
  check("baseline prefers oklch colors", prefTexts.some((t) => t.includes("oklch")));
  check("baseline prefers container queries", prefTexts.some((t) => t.includes("container queries")));
  check("baseline prefers Popover API", prefTexts.some((t) => t.includes("Popover API")));
  check("baseline prefers INP performance", prefTexts.some((t) => t.includes("INP")));
  check("baseline prefers linear() spring physics", prefTexts.some((t) => t.includes("linear()")));
  check("baseline prefers 60-30-10 palette architecture", prefTexts.some((t) => t.includes("60-30-10")));
  check("baseline prefers scanning visual anchors", prefTexts.some((t) => t.includes("F-pattern")));
  check("baseline prefers audience-calibrated density", prefTexts.some((t) => t.includes("B2B") && t.includes("density")));
}

console.log("=== loadMerged: repository baseline + project memory ===");
{
  const root = freshProject("merged");
  S.autoInit(root);
  S.append(root, S.normalise({ kind: "preference", text: "Project specific preference 1" }));

  const merged = S.loadMerged(root);
  check("merged contains globalRepo rejections", merged.globalRepo.rejections.length >= 10);
  check("merged contains globalRepo preferences", merged.globalRepo.preferences.length >= 15);
  check("merged contains project entries", merged.project.length === 1);
  check("merged all combines both", merged.all.length >= 26);
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("=== renderContext: global roles + role spotlight + project overrides ===");
{
  const root = freshProject("ctx-render");
  S.autoInit(root);

  const defaultCtx = S.renderContext(root, []);
  check("context includes global repository roles heading", defaultCtx.includes("## Global repository roles"));
  check("context includes global baseline rejections", defaultCtx.includes("## Global baseline hard rejections"));
  check("context includes global baseline preferences", defaultCtx.includes("## Global baseline preferences"));
  check("context indicates no local project overrides yet", defaultCtx.includes("No local project overrides recorded yet"));

  const spotlightCtx = S.renderContext(root, [], "content-designer");
  check("spotlight includes active role focus", spotlightCtx.includes("### Active role focus: Content Designer"));
  check("spotlight includes role directives", spotlightCtx.includes("Cut adjectives, superlatives"));

  S.append(root, S.normalise({ kind: "rejection", text: "Project override: no tooltips" }));
  const withProject = S.renderContext(root, S.load(root));
  check("project override appears under project-specific memory", withProject.includes("Project override: no tooltips"));

  fs.rmSync(root, { recursive: true, force: true });
}

console.log("=== prune: hard rejections are never dropped first ===");
{
  const mk = (kind, n, p) => Array.from({ length: n }, (_, i) => S.normalise({ kind, text: p + i }));

  const softOnly = S.prune(mk("preference", 600, "p"));
  check("600 soft -> 500 kept", softOnly.kept.length === 500);
  check("  and 100 reported dropped", softOnly.dropped === 100);

  const mixed = S.prune([...mk("rejection", 300, "r"), ...mk("preference", 400, "p")]);
  check("300 rejections all survive alongside soft", mixed.kept.filter((e) => e.kind === "rejection").length === 300);
  check("  soft fills the remainder", mixed.kept.filter((e) => e.kind !== "rejection").length === 200);
  check("  no rejection dropped", mixed.droppedRejections === 0);

  const heavy = S.prune([...mk("rejection", 600, "r"), ...mk("preference", 600, "p")]);
  check("600 rejections alone still capped at 500", heavy.kept.length === 500);
  check("  kept set is entirely rejections", heavy.kept.every((e) => e.kind === "rejection"));
  check("  rejected-overflow reported honestly", heavy.droppedRejections === 100);
  check("  and never silently", heavy.dropped === 700);

  const exact = S.prune(mk("preference", 500, "p"));
  check("exactly at cap is a no-op", exact.dropped === 0 && exact.kept.length === 500);

  const ordered = heavy.kept.every((e, i, a) => i === 0 || String(a[i - 1].created) <= String(e.created));
  check("kept entries stay chronological", ordered);
}

console.log("=== prune: the slice(-0) footgun is handled ===");
{
  const rejections = Array.from({ length: 600 }, (_, i) => S.normalise({ kind: "rejection", text: "r" + i }));
  const soft = Array.from({ length: 10 }, (_, i) => S.normalise({ kind: "preference", text: "s" + i }));
  const r = S.prune([...rejections, ...soft]);
  check("zero soft budget keeps no soft entries", r.kept.every((e) => e.kind === "rejection"));
}

console.log("=== sanitisation ===");
{
  const ESC = String.fromCharCode(27);
  const ctrl = new RegExp("[\\u0000-\\u0008\\u000E-\\u001F\\u007F-\\u009F]");
  const e = S.normalise({ kind: "preference", text: `a${ESC}[31mb`, tags: [`t${ESC}[2J`] });
  check("control chars stripped from text", !ctrl.test(e.text));
  check("control chars stripped from tags", !ctrl.test(e.tags[0]));
  check("newline preserved", S.normalise({ kind: "preference", text: "a\nb" }).text === "a\nb");
  check("tab preserved", S.normalise({ kind: "preference", text: "a\tb" }).text === "a\tb");
  check("text clamped to 2000", S.normalise({ kind: "preference", text: "y".repeat(9000) }).text.length === 2000);
  check("tag truncated to 40", S.normalise({ kind: "preference", text: "x", tags: ["z".repeat(90)] }).tags[0].length === 40);
  const uni = S.normalise({ kind: "preference", text: "🎨 配色 نظام" });
  check("unicode preserved", uni.text === "🎨 配色 نظام");
}

console.log("=== path containment ===");
{
  const root = freshProject("paths");
  S.save(root, [S.normalise({ kind: "preference", text: "../../escape", tags: ["../../etc/passwd"] })]);
  check("no path escapes the project", !fs.existsSync("/tmp/etc") && fs.readdirSync(root).every((f) => f === ".b0x" || f === ".git"));
  const known = new Set(["config.json", "entries.json", "context.md", "feedback.jsonl", ".lock"]);
  const written = fs.readdirSync(path.join(root, ".b0x"));
  check(
    "only known fixed filenames written",
    written.every((f) => known.has(f)),
    written.join(",")
  );
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("=== concurrent processes do not lose entries ===");
{
  const root = freshProject("concurrent");
  const writer = path.join(root, "w.mjs");
  fs.writeFileSync(
    writer,
    `const S = await import(${JSON.stringify(new URL("../src/store.js", import.meta.url).pathname)});
     for (let i = 0; i < 5; i++) S.append(${JSON.stringify(root)}, S.normalise({ kind: "preference", text: process.argv[2] + "-" + i }));`
  );
  const procs = ["a", "b", "c", "d", "e", "f"].map((id) =>
    execFileSync(process.execPath, [writer, id], { stdio: "ignore" }) && null
  );
  const entries = S.load(root);
  const writers = new Set(entries.map((e) => e.text.split("-")[0]));
  check("all 30 appends survive", entries.length === 30, `got ${entries.length}`);
  check("all 6 writers represented", writers.size === 6, `got ${writers.size}`);
  check("no lock file left behind", !fs.existsSync(path.join(root, ".b0x", ".lock")));
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("=== stale lock is reclaimed ===");
{
  const root = freshProject("stale");
  S.autoInit(root);
  const lock = path.join(root, ".b0x", ".lock");
  fs.writeFileSync(lock, "");
  const old = new Date(Date.now() - 60000);
  fs.utimesSync(lock, old, old);
  const r = S.append(root, S.normalise({ kind: "preference", text: "past stale lock" }));
  check("append succeeds past a stale lock", r.kept.length === 1);
  check("stale lock removed", !fs.existsSync(lock));
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("=== log rotation is bounded ===");
{
  const root = freshProject("log");
  S.autoInit(root);
  const big = "x".repeat(1500);
  for (let i = 0; i < 1000; i++) S.appendLog(root, { action: "record", n: i, p: big });
  const logDir = path.join(root, ".b0x");
  const size = fs.statSync(path.join(logDir, "feedback.jsonl")).size;
  check("log stays bounded", size < 2 * 1024 * 1024, `${Math.round(size / 1024)}KB`);
  check("at most one rotated generation", !fs.existsSync(path.join(logDir, "feedback.jsonl.2")));
  const before = size;
  S.appendLog(root, { action: "record", n: "after-rotation" });
  check("still writable after rotation", fs.statSync(path.join(logDir, "feedback.jsonl")).size > before);
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("=== corrupt store recovers ===");
{
  const root = freshProject("corrupt");
  S.autoInit(root);
  fs.writeFileSync(path.join(root, ".b0x", "entries.json"), "{ not json");
  check("reads as empty rather than throwing", S.load(root).length === 0);
  const r = S.append(root, S.normalise({ kind: "preference", text: "after corruption" }));
  check("accepts writes after corruption", r.kept.length === 1);
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("=== context.md is never stale ===");
{
  const root = freshProject("ctx");
  S.autoInit(root);
  const before = fs.readFileSync(path.join(root, ".b0x", "context.md"), "utf8");
  check("empty store indicates no local project overrides yet", before.includes("No local project overrides recorded yet"));
  S.append(root, S.normalise({ kind: "rejection", text: "Never hand-draw icons" }));
  const after = fs.readFileSync(path.join(root, ".b0x", "context.md"), "utf8");
  check("append refreshes context.md", after.includes("Never hand-draw icons"));
  check("  and no longer claims no local overrides", !after.includes("No local project overrides recorded yet"));
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("=== distillFeedback: natural language to clean directive ===");
{
  const r1 = S.distillFeedback("Nah, stop putting large borders around cards", "card component");
  check("distill rejection detects kind", r1.kind === "rejection");
  check("distill rejection formats directive", r1.directive === "Never put large borders around cards");
  check("distill rejection extracts tags", r1.tags.includes("border") && r1.tags.includes("card"));

  const r2 = S.distillFeedback("The compact settings list looks great, keep it", "settings");
  check("distill praise detects kind", r2.kind === "praise");

  const r3 = S.distillFeedback("Actually, we prefer 24px padding on cards for touch comfort", "card");
  check("distill preference detects kind", r3.kind === "preference");
  check("distill preference formats directive", r3.directive === "Prefer 24px padding on cards for touch comfort");
  check("distill preference extracts tags", r3.tags.includes("padding") && r3.tags.includes("card"));
}

console.log("=== learnEntry: auto-deduplication, reinforcement, and conflict supersession ===");
{
  const root = freshProject("learn");
  S.autoInit(root);

  const e1 = S.normalise({ kind: "rejection", text: "Never use 24px padding on cards", tags: ["padding", "card"] });
  const a1 = S.learnEntry(root, e1);
  check("first entry added", a1.action === "added");
  check("reinforcements starts at 1", a1.entry.reinforcements === 1);

  // Duplicate reinforcement
  const a2 = S.learnEntry(root, S.normalise({ kind: "rejection", text: "Never use 24px padding on cards", tags: ["padding", "card"] }));
  check("duplicate call reinforces", a2.action === "reinforced");
  check("reinforcements increments to 2", a2.reinforcements === 2);
  check("total entries remains 1", a2.total === 1);

  // Conflicting preference supersedes earlier rejection
  const eConf = S.normalise({ kind: "preference", text: "Prefer 24px padding on cards for touch comfort", tags: ["padding", "card"] });
  const a3 = S.learnEntry(root, eConf);
  check("conflicting entry supersedes", a3.action === "superseded");
  check("superseded list contains old rule", a3.superseded.some((s) => s.id === e1.id));
  const currentEntries = S.load(root);
  check("only 1 active entry remains", currentEntries.length === 1);
  check("new preference is active", currentEntries[0].text === eConf.text);

  fs.rmSync(root, { recursive: true, force: true });
}
console.log("=== contrast.js: CVD simulations, halation, and 60-30-10 balance ===");
{
  const C = await import("../src/tools/contrast.js");
  const red = { r: 239, g: 68, b: 68 };
  const deut = C.simulateCvd(red, "deuteranopia");
  check("CVD deuteranopia transforms red channel", deut.r !== red.r && deut.g > 150);

  const prot = C.simulateCvd(red, "protanopia");
  check("CVD protanopia transforms red channel", prot.r !== red.r);

  const hal = C.auditContrast("#ffffff", "#000000");
  check("dark mode halation warning triggered on pure white on black", Boolean(hal.halationWarning));
  check("  and includes 18:1 warning text", hal.halationWarning.includes("Extreme contrast in dark mode"));

  const normalContrast = C.auditContrast("#f1f5f9", "#0f172a");
  check("off-white on deep slate has no halation warning", !normalContrast.halationWarning);
  check("  and provides CVD simulation results", Boolean(normalContrast.colorVisionDeficiency?.deuteranopia));

  const balanced = C.auditPaletteBalance({
    surface: ["#0f172a"],
    structural: ["#1e293b", "#334155"],
    accent: ["#38bdf8"],
  });
  check("60-30-10 balanced with single accent", balanced.balanced === true);

  const creep = C.auditPaletteBalance({
    surface: ["#0f172a"],
    structural: ["#1e293b"],
    accent: ["#38bdf8", "#f43f5e", "#10b981"],
  });
  check("60-30-10 flags accent creep with >2 accents", creep.balanced === false && creep.warnings.length > 0);
}

console.log(failures === 0 ? "\nAll store tests passed." : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
