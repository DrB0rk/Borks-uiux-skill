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

  t("b0x_list kind=rejection");
  const listed = JSON.parse(await call("b0x_list", { kind: "rejection" }));
  console.log(`  total=${listed.total}`, JSON.stringify(listed.entries[0]).slice(0, 110));

  t("b0x_context");
  console.log((await call("b0x_context")).split("\n").slice(0, 16).map((l) => "  " + l).join("\n"));

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
  const first = JSON.parse(await call("b0x_list")).entries[0];
  console.log("  " + (await call("b0x_forget", { id: first.id })).replace(/\n/g, " "));

  // Runs last: this destroys the store, so anything after it has nothing to read.
  t("corrupt entries.json is survived");
  fsp.writeFileSync(path.join(process.argv[2], ".b0x", "entries.json"), "{ not json at all");
  const after = JSON.parse(await call("b0x_list"));
  console.log("  reads cleanly, no crash:", after.total === 0);
  const rec = JSON.parse(await call("b0x_record", { kind: "preference", text: "recovers after corruption" }));
  console.log("  accepts new writes again:", rec.ok === true);

  await client.close();
}

main().catch((e) => { console.error("FAILED:", e); process.exit(1); });