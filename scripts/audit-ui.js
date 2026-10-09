#!/usr/bin/env node
// CLI utility for automated UI/UX, accessibility and design system audits.
// Usage:
//   ./scripts/audit-ui.js --contrast "#2563eb" "#ffffff"
//   ./scripts/audit-ui.js --target 20 20 --padding 12
//   ./scripts/audit-ui.js --html "<button><svg></svg></button>"
//   ./scripts/audit-ui.js --file src/components/Header.tsx
//   ./scripts/audit-ui.js --tokens tokens.json

import fs from "node:fs";
import path from "node:path";
import { auditContrast, auditPalette } from "../mcp/src/tools/contrast.js";
import { auditTargetSize } from "../mcp/src/tools/target.js";
import { auditHtml } from "../mcp/src/tools/html-lint.js";
import { auditTokens } from "../mcp/src/tools/tokens-lint.js";

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
B0rk's UI/UX Audit Tooling (CLI)

COMMANDS:
  --contrast <fg> <bg> [--role <normal-text|large-text|ui-component>]
      Check WCAG 2.2 contrast ratio, relative luminance, and get passing color suggestion.

  --target <width> <height> [--padding <px>] [--spacing <px>] [--inline]
      Audit touch/pointer target size against WCAG 2.5.8 (24x24), Apple HIG (44x44), Android (48x48).

  --html "<snippet>"
      Fast static audit of an HTML or JSX snippet for accessibility violations and anti-patterns.

  --file <filepath>
      Audit an HTML, JSX, TSX, or Vue file.

  --tokens <token-file.json>
      Validate a Design Tokens dictionary against DTCG 2025.10 and multi-tier taxonomy.

EXAMPLES:
  ./scripts/audit-ui.js --contrast "#64748b" "#ffffff"
  ./scripts/audit-ui.js --target 16 16 --padding 14
  ./scripts/audit-ui.js --html '<form><input type="text"><button><svg/></button></form>'
  ./scripts/audit-ui.js --file src/components/Button.tsx
`);
}

async function main() {
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  const cmd = args[0];

  if (cmd === "--contrast") {
    const fg = args[1];
    const bg = args[2];
    if (!fg || !bg) {
      console.error("Error: --contrast requires <foreground> and <background> colors.");
      process.exit(1);
    }
    const roleIdx = args.indexOf("--role");
    const role = roleIdx !== -1 ? args[roleIdx + 1] : "normal-text";
    const res = auditContrast(fg, bg, role);
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.standards.wcag_2_2_AA.pass ? 0 : 1);
  }

  if (cmd === "--target") {
    const w = parseFloat(args[1]);
    const h = parseFloat(args[2]);
    if (isNaN(w) || isNaN(h)) {
      console.error("Error: --target requires <width> and <height> numeric arguments.");
      process.exit(1);
    }
    const padIdx = args.indexOf("--padding");
    const padding = padIdx !== -1 ? parseFloat(args[padIdx + 1]) : 0;
    const spaceIdx = args.indexOf("--spacing");
    const spacing = spaceIdx !== -1 ? parseFloat(args[spaceIdx + 1]) : 0;
    const isInline = args.includes("--inline");
    const res = auditTargetSize({ width: w, height: h, padding, spacing, isInline });
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.standards.wcag_2_2_AA_2_5_8.pass ? 0 : 1);
  }

  if (cmd === "--html") {
    const snippet = args[1];
    if (!snippet) {
      console.error('Error: --html requires an HTML/JSX snippet string in quotes.');
      process.exit(1);
    }
    const res = auditHtml(snippet);
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.clean ? 0 : 1);
  }

  if (cmd === "--file") {
    const file = args[1];
    if (!file || !fs.existsSync(file)) {
      console.error(`Error: File not found: ${file}`);
      process.exit(1);
    }
    const content = fs.readFileSync(file, "utf8");
    const res = auditHtml(content);
    console.log(`Audited file: ${file}`);
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.clean ? 0 : 1);
  }

  if (cmd === "--tokens") {
    const file = args[1];
    if (!file || !fs.existsSync(file)) {
      console.error(`Error: Tokens file not found: ${file}`);
      process.exit(1);
    }
    const content = JSON.parse(fs.readFileSync(file, "utf8"));
    const res = auditTokens(content);
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.valid ? 0 : 1);
  }

  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
