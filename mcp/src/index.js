#!/usr/bin/env node
// b0x - per-project design memory for the B0rk's UI/UX skill.
//
// Gives the agent three things it otherwise cannot do:
//   1. remember what the user rejected in THIS project (hard constraints)
//   2. remember what the user prefers here (soft defaults)
//   3. expose both as a compact snapshot it must honour
//
// Storage is a `.b0x/` folder at the project root. Nothing leaves the machine.

import fs from "node:fs";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { auditContrast, auditPalette } from "./tools/contrast.js";
import { auditTargetSize } from "./tools/target.js";
import { auditHtml } from "./tools/html-lint.js";
import { auditTokens } from "./tools/tokens-lint.js";
import {
  KINDS,
  append,
  autoInit,
  distillFeedback,
  findConflicts,
  getGlobalBaseline,
  getGlobalRoles,
  getRole,
  getUserGlobalDir,
  isInitialised,
  learnEntry,
  load,
  loadMerged,
  loadUserGlobal,
  normalise,
  remove,
  renderContext,
} from "./store.js";

const server = new McpServer(
  { name: "b0x", version: "0.2.0" },
  {
    capabilities: { tools: {} },
    instructions:
      "Global design roles & project memory for B0rk's UI/UX skill. Call b0x_context before doing UI/UX work in a project to read global repository baseline constraints and local project overrides. Inspect or spotlight roles with b0x_roles. Record durable feedback with b0x_record.",
  }
);

const asText = (v) => ({ content: [{ type: "text", text: typeof v === "string" ? v : JSON.stringify(v, null, 2) }] });

// When the project is unwritable (read-only checkout, permissions), memory is
// simply unavailable. Say so plainly so the agent proceeds without it instead
// of treating the failure as a design problem.
const UNAVAILABLE =
  "# Project design memory unavailable\n\n" +
  "The `.b0x` folder could not be created or read for this project (unwritable directory). " +
  "Continue the design work normally - memory is an enhancement, not a prerequisite. " +
  "Do not retry the b0x tools for this session.";
const notAvailable = ({ reason }) => reason === "disabled" ? null : UNAVAILABLE;

server.registerTool(
  "b0x_roles",
  {
    title: "Global UI/UX repository roles",
    description:
      "Inspect global UI/UX engineering roles shipped in the b0x repository (ui-engineer, ui-auditor, content-designer, motion-specialist, accessibility-specialist). Omit role parameter to list all available roles.",
    inputSchema: {
      role: z
        .string()
        .optional()
        .describe(
          "Role identifier to inspect: 'ui-engineer', 'ui-auditor', 'content-designer', 'motion-specialist', or 'accessibility-specialist'."
        ),
    },
  },
  async ({ role } = {}) => {
    const roles = getGlobalRoles();
    if (role) {
      const found = roles[role.trim().toLowerCase()];
      if (!found) {
        return asText({
          ok: false,
          error: `Unknown role '${role}'. Available global roles: ${Object.keys(roles).join(", ")}`,
        });
      }
      return asText({
        ok: true,
        role: role.trim().toLowerCase(),
        title: found.title,
        charter: found.charter,
        directives: found.directives,
      });
    }
    return asText({
      repository: "b0x (global repository roles)",
      totalRoles: Object.keys(roles).length,
      roles: Object.entries(roles).map(([id, r]) => ({
        id,
        title: r.title,
        charter: r.charter,
      })),
      hint: "Call b0x_roles with a specific role name to inspect its full directives, or call b0x_context({ role: '...' }) to spotlight that role.",
    });
  }
);

server.registerTool(
  "b0x_status",
  {
    title: "Project memory & global roles status",
    description:
      "Check global repository roles/baseline status and whether this project has a .b0x memory folder with local entries.",
    inputSchema: {},
  },
  async () => {
    const { root, created, reason, available } = autoInit();
    const entries = available === false || !root || !isInitialised(root) ? [] : load(root);
    const counts = Object.fromEntries(KINDS.map((k) => [k, entries.filter((e) => e.kind === k).length]));
    const globalRoles = getGlobalRoles();
    const globalBaseline = getGlobalBaseline();
    const userGlobal = loadUserGlobal();
    return asText({
      globalRepository: {
        source: "b0x repository (global-roles.json)",
        roles: Object.keys(globalRoles),
        rolesCount: Object.keys(globalRoles).length,
        baselineRejections: globalBaseline.rejections?.length || 0,
        baselinePreferences: globalBaseline.preferences?.length || 0,
      },
      userGlobal: {
        path: getUserGlobalDir(),
        entriesCount: userGlobal.length,
      },
      project: {
        projectRoot: root,
        project: root ? root.split("/").pop() : null,
        initialised: root ? isInitialised(root) : false,
        createdNow: Boolean(created),
        ...(reason ? { autoInitSkipped: reason } : {}),
        b0xPath: root ? `${root}/.b0x` : null,
        localEntriesCount: entries.length,
        localCounts: counts,
      },
      hint: "Global repository roles & baseline constraints apply across all projects. Project .b0x provides local overrides.",
    });
  }
);

server.registerTool(
  "b0x_record",
  {
    title: "Record design feedback",
    description:
      "Remember durable design feedback. kind='rejection' is a HARD constraint; kind='preference' is a soft default; kind='praise' confirms something that worked. Supports scope='project' (local .b0x, default) or scope='global' (user-level ~/.b0x).",
    inputSchema: {
      kind: z.enum(KINDS).describe("rejection = hard 'never do this'; preference = soft default; praise = confirmed good"),
      text: z.string().min(1).max(2000).describe("The rule itself, stated as a directive."),
      tags: z.array(z.string()).max(12).optional().describe("Optional lowercase tags"),
      source: z.string().optional().describe("Where the feedback came from"),
      scope: z
        .enum(["project", "global"])
        .optional()
        .describe("Storage scope: 'project' (default, saves in project .b0x/) or 'global' (saves in user global ~/.b0x/)"),
    },
  },
  async ({ kind, text, tags, source, scope = "project" }) => {
    try {
      let targetRoot;
      if (scope === "global") {
        targetRoot = getUserGlobalDir();
      } else {
        const proj = autoInit();
        if (proj.available === false) return asText(notAvailable(proj) ?? "");
        targetRoot = proj.root;
      }
      const entry = normalise({ kind, text, tags, source });
      const { kept, dropped, droppedRejections, context } = append(targetRoot, entry);
      return asText({
        ok: true,
        scope,
        recorded: entry,
        total: kept.length,
        hardConstraints: kept.filter((e) => e.kind === "rejection").length,
        ...(dropped
          ? {
              trimmed: {
                dropped,
                droppedRejections,
                warning: droppedRejections
                  ? "Hard rejections were dropped to stay under the 500-entry cap. Review with b0x_list."
                  : "Oldest preferences were pruned to stay under the 500-entry cap.",
              },
            }
          : {}),
        contextPreview: context.split("\n").slice(0, 14).join("\n"),
      });
    } catch (err) {
      return asText({ ok: false, error: String(err?.message ?? err) });
    }
  }
);

server.registerTool(
  "b0x_list",
  {
    title: "List stored design memory",
    description: "List remembered entries, with optional scope and kind filters.",
    inputSchema: {
      kind: z.enum(KINDS).optional().describe("Filter by kind; omit for all"),
      scope: z
        .enum(["all", "global", "project"])
        .optional()
        .describe("Filter scope: 'global' (repo baseline + user global), 'project' (local .b0x only), or 'all' (merged, default)"),
      limit: z.number().int().min(1).max(500).optional().describe("Max entries to return (default 50)"),
    },
  },
  async ({ kind, scope = "all", limit = 50 }) => {
    const proj = autoInit();
    const root = proj.available === false ? null : proj.root;
    const merged = loadMerged(root);

    let entries = [];
    if (scope === "global") {
      entries = [...merged.globalRepo.rejections, ...merged.globalRepo.preferences, ...merged.globalUser];
    } else if (scope === "project") {
      entries = [...merged.project];
    } else {
      entries = merged.all;
    }

    if (kind) {
      entries = entries.filter((e) => e.kind === kind);
    }

    return asText({
      projectRoot: root,
      scope,
      total: entries.length,
      entries: entries.slice(-limit).reverse(),
    });
  }
);

server.registerTool(
  "b0x_forget",
  {
    title: "Forget a remembered entry",
    description: "Remove an entry by id. Use when a preference is superseded or was recorded in error.",
    inputSchema: { id: z.string().uuid().describe("Entry id returned by b0x_record or b0x_list") },
  },
  async ({ id }) => {
    const proj = autoInit();
    if (proj.available === false) return asText(notAvailable(proj) ?? "");
    const remaining = remove(proj.root, id);
    if (remaining === null) return asText({ ok: false, error: `No entry with id ${id}` });
    return asText({ ok: true, removed: id, total: remaining });
  }
);

server.registerTool(
  "b0x_learn",
  {
    title: "Automatically distill and learn from user design feedback",
    description:
      "Automated learning engine: parses natural language user feedback or corrections (e.g. 'I don't like the button padding, make it 8px'), distills it into a clean directive, automatically detects kind (rejection/preference/praise) and domain tags, resolves conflicts by superseding outdated rules, or reinforces existing rules. Call this whenever the user gives feedback or corrects UI/UX choices.",
    inputSchema: {
      feedback: z.string().min(1).describe("Natural language user feedback or correction"),
      context: z.string().optional().describe("Optional context hint about the screen or component (e.g. 'settings table', 'navigation bar')"),
      scope: z.enum(["project", "global"]).optional().describe("Storage scope: 'project' (default, local .b0x/) or 'global' (saves in user global ~/.b0x/)"),
      autoSupersede: z.boolean().optional().describe("Automatically supersede conflicting earlier rules (default true)"),
    },
  },
  async ({ feedback, context = "", scope = "project", autoSupersede = true }) => {
    try {
      let targetRoot;
      if (scope === "global") {
        targetRoot = getUserGlobalDir();
      } else {
        const proj = autoInit();
        if (proj.available === false) return asText(notAvailable(proj) ?? "");
        targetRoot = proj.root;
      }

      const distilled = distillFeedback(feedback, context);
      const entry = normalise({
        kind: distilled.kind,
        text: distilled.directive,
        tags: distilled.tags,
        source: "user feedback via b0x_learn",
      });

      const report = learnEntry(targetRoot, entry, { autoSupersede });

      return asText({
        ok: true,
        action: report.action,
        distilled: {
          raw: feedback,
          directive: entry.text,
          kind: entry.kind,
          tags: entry.tags,
        },
        reinforcements: report.reinforcements || 1,
        superseded: report.superseded || [],
        conflicts: report.conflicts || [],
        scope,
        totalActiveProjectRules: report.total,
        message: `Learned: [${entry.kind}] ${entry.text}${
          report.action === "superseded"
            ? ` (superseded ${report.superseded.length} conflicting rule)`
            : report.action === "reinforced"
            ? ` (reinforced ×${report.reinforcements})`
            : ""
        }`,
      });
    } catch (err) {
      return asText({ ok: false, error: String(err?.message ?? err) });
    }
  }
);

server.registerTool(
  "b0x_learn_from_audit",
  {
    title: "Record durable lesson from diagnostic audit fix",
    description:
      "Convert a verified diagnostic fix (contrast adjustment, touch target padding, or HTML accessibility repair) into an active project preference so the defect is never repeated.",
    inputSchema: {
      auditType: z.enum(["contrast", "target", "html", "tokens"]).describe("The audit tool that detected the issue"),
      issue: z.string().describe("Description of the detected issue (e.g. 'Failing text contrast on #94a3b8 on white')"),
      fix: z.string().describe("The verified fix applied (e.g. 'Use #66758a for normal text on white')"),
      scope: z.enum(["project", "global"]).optional(),
    },
  },
  async ({ auditType, issue, fix, scope = "project" }) => {
    try {
      let targetRoot;
      if (scope === "global") {
        targetRoot = getUserGlobalDir();
      } else {
        const proj = autoInit();
        if (proj.available === false) return asText(notAvailable(proj) ?? "");
        targetRoot = proj.root;
      }

      const entry = normalise({
        kind: "preference",
        text: `Verified ${auditType} fix: ${fix.trim()}`,
        tags: [auditType, "audit-fix"],
        source: `diagnostic audit (${auditType})`,
      });

      const report = learnEntry(targetRoot, entry, { autoSupersede: true });
      return asText({
        ok: true,
        action: report.action,
        rule: entry.text,
        remediedIssue: issue,
        totalActiveProjectRules: report.total,
      });
    } catch (err) {
      return asText({ ok: false, error: String(err?.message ?? err) });
    }
  }
);

server.registerTool(
  "b0x_context",
  {
    title: "Read design memory & global roles",
    description:
      "Return the unified memory snapshot: global repository baseline rules and roles, layered with local project overrides. Call this BEFORE doing UI/UX work.",
    inputSchema: {
      role: z
        .string()
        .optional()
        .describe("Optional role to focus/spotlight in context: 'ui-engineer', 'ui-auditor', 'content-designer', 'motion-specialist', 'accessibility-specialist'"),
    },
  },
  async ({ role } = {}) => {
    const proj = autoInit();
    const root = proj.available === false ? null : proj.root;
    const entries = root && isInitialised(root) ? load(root) : [];
    return asText(renderContext(root, entries, role));
  }
);

server.registerTool(
  "b0x_check_contrast",
  {
    title: "WCAG 2.2 color contrast & passing color suggestion",
    description:
      "Audit contrast between foreground and background colors against WCAG 2.2 AA (4.5:1 text, 3:1 large/component) and AAA (7:1). Supports hex (#fff), rgb(), hsl(), oklch(), and named colors. Suggests passing colors when failing. Also supports batch palette checks.",
    inputSchema: {
      foreground: z.string().optional().describe("Foreground color string (hex, rgb, hsl, oklch, or named color)"),
      background: z.string().optional().describe("Background color string (hex, rgb, hsl, oklch, or named color)"),
      role: z
        .enum(["normal-text", "large-text", "ui-component", "non-text"])
        .optional()
        .describe("Semantic role: 'normal-text' (>= 4.5:1, default), 'large-text' (>= 3:1), or 'ui-component' (>= 3:1)"),
      palette: z
        .array(
          z.object({
            foreground: z.string(),
            background: z.string(),
            role: z.enum(["normal-text", "large-text", "ui-component", "non-text"]).optional(),
          })
        )
        .optional()
        .describe("Batch audit of multiple color pairs in a palette"),
    },
  },
  async ({ foreground, background, role = "normal-text", palette }) => {
    try {
      if (palette && Array.isArray(palette)) {
        return asText(auditPalette(palette));
      }
      if (!foreground || !background) {
        return asText({ ok: false, error: "Provide either { foreground, background } or a { palette: [...] } array." });
      }
      return asText(auditContrast(foreground, background, role));
    } catch (err) {
      return asText({ ok: false, error: String(err?.message ?? err) });
    }
  }
);

server.registerTool(
  "b0x_check_target",
  {
    title: "Touch and pointer target size validator",
    description:
      "Audit touch/pointer target dimensions against WCAG 2.5.8 (24x24 px min, Level AA), Apple HIG (44x44 pt), and Android Material (48x48 dp). Calculates recommended hit area / padding expansion for undersized controls.",
    inputSchema: {
      width: z.number().describe("Visible width in CSS pixels (e.g. 16, 24, 44)"),
      height: z.number().describe("Visible height in CSS pixels (e.g. 16, 24, 44)"),
      padding: z.union([z.number(), z.object({ x: z.number(), y: z.number() })]).optional().describe("Padding in px or { x, y } adding to effective hit area"),
      spacing: z.number().optional().describe("Perimeter spacing to nearest neighboring target in px"),
      isInline: z.boolean().optional().describe("True if target is inline within a sentence (WCAG 2.5.8 exception)"),
      isEssential: z.boolean().optional().describe("True if target dimensions are essential to functionality (e.g. map pin)"),
    },
  },
  async ({ width, height, padding, spacing, isInline, isEssential }) => {
    try {
      return asText(auditTargetSize({ width, height, padding, spacing, isInline, isEssential }));
    } catch (err) {
      return asText({ ok: false, error: String(err?.message ?? err) });
    }
  }
);

server.registerTool(
  "b0x_check_html",
  {
    title: "HTML / JSX accessibility and anti-pattern linter",
    description:
      "Fast static audit of HTML or JSX snippets or local component files. Catches unlabeled form inputs, unnamed icon buttons, clickable non-semantic divs, ambiguous links, missing image alt, invalid nesting, layout-thrash animations, and marketing filler copy.",
    inputSchema: {
      snippet: z.string().optional().describe("Raw HTML or JSX code string to analyze"),
      filePath: z.string().optional().describe("Relative path to an HTML, JSX, TSX, or Vue file in the project"),
    },
  },
  async ({ snippet, filePath }) => {
    try {
      let code = snippet;
      if (!code && filePath) {
        const proj = autoInit();
        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(proj.root || process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
          return asText({ ok: false, error: `File not found: ${filePath}` });
        }
        code = fs.readFileSync(fullPath, "utf8");
      }
      if (!code) {
        return asText({ ok: false, error: "Provide either a 'snippet' string or a 'filePath' relative to the project." });
      }
      return asText(auditHtml(code));
    } catch (err) {
      return asText({ ok: false, error: String(err?.message ?? err) });
    }
  }
);

server.registerTool(
  "b0x_check_tokens",
  {
    title: "Design tokens and DTCG 2025.10 validator",
    description:
      "Validate a Design Tokens dictionary against DTCG 2025.10 ($value, $type, {alias} format) and multi-tier taxonomy (detects raw hex values leaked into component layers).",
    inputSchema: {
      tokens: z.record(z.any()).optional().describe("Parsed design tokens JSON object"),
      filePath: z.string().optional().describe("Relative path to a tokens.json file in the project"),
    },
  },
  async ({ tokens, filePath }) => {
    try {
      let data = tokens;
      if (!data && filePath) {
        const proj = autoInit();
        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(proj.root || process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
          return asText({ ok: false, error: `File not found: ${filePath}` });
        }
        data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      }
      if (!data) {
        return asText({ ok: false, error: "Provide either a 'tokens' object or a 'filePath' relative to the project." });
      }
      return asText(auditTokens(data));
    } catch (err) {
      return asText({ ok: false, error: String(err?.message ?? err) });
    }
  }
);
const transport = new StdioServerTransport();
await server.connect(transport);

// Close cleanly on termination. Without this the process ignores SIGTERM and
// has to be SIGKILLed, which orphans it when the parent agent exits. Locks are
// released in a finally block, so an orderly shutdown cannot leave one behind
// either - and a lock that is left anyway is reclaimed after LOCK_STALE_MS.
let closing = false;
const shutdown = async (signal) => {
  if (closing) return;
  closing = true;
  try {
    await server.close();
  } catch {
    /* transport already gone */
  }
  process.exit(signal === "SIGINT" ? 130 : 0);
};

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => void shutdown(signal));
}

// A crash in one handler should surface, not silently wedge the server while
// the agent waits on a tool that will never answer.
process.on("uncaughtException", (err) => {
  process.stderr.write(`b0x: uncaught exception: ${err?.stack ?? err}\n`);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  process.stderr.write(`b0x: unhandled rejection: ${err?.stack ?? err}\n`);
});