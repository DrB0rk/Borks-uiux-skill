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
  autoInit,
  ensure,
  findProjectRoot,
  isInitialised,
  load,
  normalise,
  renderContext,
  save,
  appendLog,
} from "./store.js";

const server = new McpServer(
  { name: "b0x", version: "0.1.0" },
  {
    capabilities: { tools: {} },
    instructions:
      "Per-project design memory for B0rk's UI/UX skill. Call b0x_context before doing UI/UX work in a project to read the user's stored rejections and preferences. Record durable feedback with b0x_record. Only record what the user actually said; do not invent preferences.",
  }
);

const asText = (v) => ({ content: [{ type: "text", text: typeof v === "string" ? v : JSON.stringify(v, null, 2) }] });

server.registerTool(
  "b0x_status",
  {
    title: "Project memory status",
    description:
      "Check whether this project has a .b0x memory folder and how much is stored. Use this to decide whether to initialise or read memory.",
    inputSchema: {},
  },
  async () => {
    const { root, created, reason } = autoInit();
    const entries = load(root);
    const counts = Object.fromEntries(KINDS.map((k) => [k, entries.filter((e) => e.kind === k).length]));
    return asText({
      projectRoot: root,
      project: root.split("/").pop(),
      initialised: isInitialised(root),
      createdNow: Boolean(created),
      ...(reason ? { autoInitSkipped: reason } : {}),
      b0xPath: `${root}/.b0x`,
      total: entries.length,
      counts,
      hint: entries.length
        ? "Call b0x_context and honour hard rejections before doing UI/UX work."
        : "Memory is ready but empty. Call b0x_record when the user gives durable design feedback.",
    });
  }
);

server.registerTool(
  "b0x_record",
  {
    title: "Record design feedback",
    description:
      "Remember durable design feedback for this project. kind='rejection' is a HARD constraint (never do this); kind='preference' is a soft default; kind='praise' confirms something that worked. Only record what the user actually said - never infer or invent preferences.",
    inputSchema: {
      kind: z.enum(KINDS).describe("rejection = hard 'never do this'; preference = soft default; praise = confirmed good"),
      text: z.string().min(1).max(2000).describe("The rule itself, stated as a directive. e.g. 'No coloured left border on cards'"),
      tags: z.array(z.string()).max(12).optional().describe("Optional lowercase tags, e.g. ['border','navigation']"),
      source: z.string().optional().describe("Where the feedback came from, e.g. 'user correction 2026-10-09'"),
    },
  },
  async ({ kind, text, tags, source }) => {
    try {
      const { root } = autoInit();
      ensure(root);
      const entry = normalise({ kind, text, tags, source });
      const entries = [...load(root), entry];
      save(root, entries);
      appendLog(root, { action: "record", id: entry.id, kind: entry.kind });
      const context = renderContext(root, entries);
      return asText({
        ok: true,
        recorded: entry,
        total: entries.length,
        hardConstraints: entries.filter((e) => e.kind === "rejection").length,
        contextPreview: context.split("\n").slice(0, 12).join("\n"),
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
    description: "List remembered entries for this project, optionally filtered by kind.",
    inputSchema: {
      kind: z.enum(KINDS).optional().describe("Filter by kind; omit for all"),
      limit: z.number().int().min(1).max(500).optional().describe("Max entries to return (default 50)"),
    },
  },
  async ({ kind, limit = 50 }) => {
    const { root } = autoInit();
    const entries = load(root).filter((e) => !kind || e.kind === kind);
    return asText({
      projectRoot: root,
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
    const { root } = autoInit();
    const entries = load(root);
    const next = entries.filter((e) => e.id !== id);
    if (next.length === entries.length) return asText({ ok: false, error: `No entry with id ${id}` });
    save(root, next);
    appendLog(root, { action: "forget", id });
    renderContext(root, next);
    return asText({ ok: true, removed: id, total: next.length });
  }
);

server.registerTool(
  "b0x_context",
  {
    title: "Read project design memory",
    description:
      "Return the compact memory snapshot to follow for this project: hard rejections first, then preferences, then confirmed patterns. Call this BEFORE doing UI/UX work.",
    inputSchema: {},
  },
  async () => {
    const { root } = autoInit();
    if (!isInitialised(root)) {
      return asText(
        "# Project design memory\n\n_No .b0x memory for this project yet._\n\nCall `b0x_record` when the user gives durable design feedback."
      );
    }
    const entries = load(root);
    return asText(renderContext(root, entries));
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);