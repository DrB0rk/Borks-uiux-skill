// End-to-end test: drives the b0x server over the real MCP stdio protocol.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const SERVER = new URL("../src/index.js", import.meta.url).pathname;

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

  t("b0x_record ×3");
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
  if (bad.isError) {
    console.log("  rejected:", String(bad.content[0].text).match(/Expected[^,]*/)?.[0] ?? "input validation error");
  } else {
    console.log("  FAIL: invalid kind was accepted");
  }

  t("b0x_forget");
  const first = JSON.parse(await call("b0x_list")).entries[0];
  console.log("  " + (await call("b0x_forget", { id: first.id })).replace(/\n/g, " "));

  await client.close();
}

main().catch((e) => { console.error("FAILED:", e); process.exit(1); });