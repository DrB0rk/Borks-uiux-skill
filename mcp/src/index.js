#!/usr/bin/env node
// b0x - per-project design memory for the B0rk's UI/UX skill.
//
// Gives the agent three things it otherwise cannot do:
//   1. remember what the user rejected in THIS project (hard constraints)
//   2. remember what the user prefers here (soft defaults)
//   3. expose both as a compact snapshot it must honour
//
// Storage is a `.b0x/` folder at the project root. Nothing leaves the machine.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  KINDS,
  append,
  autoInit,
  getGlobalBaseline,
  getGlobalRoles,
  getRole,
  getUserGlobalDir,
  isInitialised,
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