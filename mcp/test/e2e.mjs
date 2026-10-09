// End-to-end test: drives the b0x server over the real MCP stdio protocol.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const SERVER = new URL("../src/index.js", import.meta.url).pathname;
const ESC = String.fromCharCode(27); // build escape bytes at runtime, never inline

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER],
    cwd: process.argv[2],
  });
  const client = new Client({ name: "b0x-test", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);

  const call = async (name, args = {}) => {
    const r = await client.callTool({ name, arguments: args });
    return r.content?.[0]?.text ?? "";
  };
  const t = (v) => console.log(`\n=== ${v} ===`);

  t("tools/list");
  const { tools } = await client.listTools();
  for (const tool of tools) console.log(`  ${tool.name} — ${tool.description.slice(0, 72)}`);

  t("b0x_roles (list all)");
  const allRoles = JSON.parse(await call("b0x_roles"));
  console.log(`  total roles: ${allRoles.totalRoles}`, allRoles.roles.map((r) => r.id).join(", "));

  t("b0x_roles (inspect ui-engineer)");
  const uiEng = JSON.parse(await call("b0x_roles", { role: "ui-engineer" }));
  console.log(`  title: ${uiEng.title} | directives: ${uiEng.directives.length}`);

  t("b0x_status (fresh project)");
  console.log("  " + (await call("b0x_status")).replace(/\n/g, "\n  "));

  t("auto-init: read-only call creates .b0x");
  const fsp = await import("node:fs");
  const path = await import("node:path");
  const dir = path.join(process.argv[2], ".b0x");
  console.log(`  .b0x created by a context read: ${fsp.existsSync(dir)}`);
  console.log(`  files: ${fsp.readdirSync(dir).sort().join(" ")}`);

  t("b0x_record x3");
  console.log("  " + JSON.parse(await call("b0x_record", {
    kind: "rejection",
    text: "No saturated accent bar on the leading edge of active nav rows",
    tags: ["accent", "navigation"],
    source: "user correction 2026-10-09",
  })).recorded.id);
  await call("b0x_record", { kind: "preference", text: "One primary CTA per view" });
  await call("b0x_record", { kind: "praise", text: "Compact settings list spacing" });

  t("b0x_list scope=all kind=rejection");
  const listedAll = JSON.parse(await call("b0x_list", { kind: "rejection", scope: "all" }));
  console.log(`  total=${listedAll.total} (includes global baseline + project)`);

  t("b0x_list scope=project");
  const listedProj = JSON.parse(await call("b0x_list", { scope: "project" }));
  console.log(`  project total=${listedProj.total}`);

  t("b0x_context with role spotlight");
  const ctxSpotlight = await call("b0x_context", { role: "content-designer" });
  console.log("  spotlight present:", ctxSpotlight.includes("Active role focus: Content Designer"));
  console.log("  global baseline present:", ctxSpotlight.includes("Global baseline hard rejections"));
  console.log("  project overrides present:", ctxSpotlight.includes("Project-specific memory"));

  t("schema rejects bad kind at the protocol layer");
  const bad = await client.callTool({ name: "b0x_record", arguments: { kind: "nonsense", text: "x" } });
  console.log(
    bad.isError
      ? "  rejected: " + (String(bad.content[0].text).match(/Expected[^,]*/)?.[0] ?? "input validation error")
      : "  FAIL: invalid kind was accepted"
  );

  t("input sanitisation");
  const evil = JSON.parse(
    await call("b0x_record", {
      kind: "preference",
      text: `safe${ESC}[31mRED${ESC}[0m`,
      tags: [`tag${ESC}[2J` + "z".repeat(60)],
    })
  ).recorded;
  const ctrl = new RegExp("[\\u0000-\\u0008\\u000E-\\u001F\\u007F-\\u009F]");
  console.log("  control chars stripped from text:", !ctrl.test(evil.text));
  console.log("  control chars stripped from tag :", !ctrl.test(evil.tags[0]));
  console.log("  long tag truncated to           :", evil.tags[0].length, "(max 40)");

  t("unicode survives intact");
  const uni = JSON.parse(
    await call("b0x_record", { kind: "preference", text: "palettes \u{1F3A8} 配色 نظام" })
  ).recorded.text;
  console.log("  emoji/CJK/RTL preserved:", /\u{1F3A8}/u.test(uni) && /配色/.test(uni) && /نظام/.test(uni));

  t("b0x_forget");
  const first = JSON.parse(await call("b0x_list", { scope: "project" })).entries[0];
  console.log("  " + (await call("b0x_forget", { id: first.id })).replace(/\n/g, " "));

  // Runs last: this destroys the local store, so anything after it has nothing to read.
  t("corrupt entries.json is survived");
  fsp.writeFileSync(path.join(process.argv[2], ".b0x", "entries.json"), "{ not json at all");
  const afterProj = JSON.parse(await call("b0x_list", { scope: "project" }));
  const afterAll = JSON.parse(await call("b0x_list", { scope: "all" }));
  console.log("  project reads cleanly after corruption (empty):", afterProj.total === 0);
  console.log("  global baseline rules survive corruption     :", afterAll.total >= 13);
  const rec = JSON.parse(await call("b0x_record", { kind: "preference", text: "recovers after corruption" }));
  console.log("  accepts new writes again                      :", rec.ok === true);

  t("stale lock does not wedge the store");
  fsp.writeFileSync(path.join(process.argv[2], ".b0x", ".lock"), "");
  const old = new Date(Date.now() - 60000);
  fsp.utimesSync(path.join(process.argv[2], ".b0x", ".lock"), old, old);
  const afterLock = JSON.parse(await call("b0x_record", { kind: "preference", text: "past a stale lock" }));
  console.log("  append past 60s-old lock:", afterLock.ok === true);
  console.log("  lock file removed      :", !fsp.existsSync(path.join(process.argv[2], ".b0x", ".lock")));

  t("b0x_check_contrast");
  const contrastSingle = JSON.parse(await call("b0x_check_contrast", { foreground: "#64748b", background: "#ffffff" }));
  console.log("  single contrast ratio:", contrastSingle.contrastRatio, "| passes AA:", contrastSingle.standards.wcag_2_2_AA.pass);
  const contrastPalette = JSON.parse(await call("b0x_check_contrast", {
    palette: [
      { foreground: "#0f172a", background: "#ffffff", role: "normal-text" },
      { foreground: "#94a3b8", background: "#ffffff", role: "normal-text" },
    ],
  }));
  console.log("  palette total:", contrastPalette.totalChecked, "| failing AA:", contrastPalette.failingAA, "| suggestion provided:", Boolean(contrastPalette.results[1].suggestion));

  t("b0x_check_target");
  const targetUndersized = JSON.parse(await call("b0x_check_target", { width: 16, height: 16 }));
  console.log("  undersized pass WCAG:", targetUndersized.standards.wcag_2_2_AA_2_5_8.pass, "| recommendations:", targetUndersized.recommendations.length > 0);
  const targetPadded = JSON.parse(await call("b0x_check_target", { width: 16, height: 16, padding: 14 }));
  console.log("  padded to 44px pass WCAG:", targetPadded.standards.wcag_2_2_AA_2_5_8.pass, "| pass Apple:", targetPadded.standards.apple_hig.pass);

  t("b0x_check_html");
  const htmlAudit = JSON.parse(await call("b0x_check_html", {
    snippet: '<button><svg></svg></button><input type="text"><a href="/x">click here</a><div onclick="foo()">Click</div>',
  }));
  console.log("  catches issues:", htmlAudit.totalIssues >= 4, "| critical count:", htmlAudit.summary.critical >= 3);

  t("b0x_check_tokens");
  const tokenAudit = JSON.parse(await call("b0x_check_tokens", {
    tokens: {
      color: { primary: { $value: "#2563eb", $type: "color" } },
      button: { bg: { $value: "#2563eb", $type: "color" } },
      spacing: { sm: { value: "4px" } },
    },
  }));
  console.log("  catches legacy & component leaks:", tokenAudit.totalIssues >= 2, "| total tokens:", tokenAudit.totalTokens);
  await client.close();
}

main().catch((e) => { console.error("FAILED:", e); process.exit(1); });
