// Starts the official `qloo mcp` stdio server (from node_modules) and returns
// a connected MCP client.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join } from "node:path";
import { ROOT, harnessEnv } from "./config.mjs";

// Run the harness entry point with this node binary: the .bin/qloo shim is a
// shell script on Windows and cannot be spawned directly.
export const QLOO_BIN = join(ROOT, "node_modules", "@qloo", "qloo-harness", "dist", "bin.js");

export async function connectQlooMcp(config) {
  const client = new Client({ name: "qloo-explorer", version: "0.1.0" });
  await client.connect(
    new StdioClientTransport({ command: process.execPath, args: [QLOO_BIN, "mcp"], env: harnessEnv(config), stderr: "pipe" }),
  );
  return client;
}

// Normalizes a callTool result into the harness envelope.
export function envelopeOf(result) {
  const envelope = result.structuredContent;
  if (envelope?.status) return envelope;
  // qloo_capabilities returns a manifest, not a workflow envelope.
  if (envelope?.adapter) {
    return { ...envelope, status: envelope.adapter.ready ? "ok" : "error", summary: `credential ${envelope.adapter.ready ? "ready" : "missing"}` };
  }
  const text = result.content?.find((part) => part.type === "text")?.text;
  try {
    return JSON.parse(text);
  } catch {
    return { status: result.isError ? "error" : "unknown", summary: text ?? "" };
  }
}

// Example arguments per tool, used by the probe and as playground defaults.
// Bare names are ambiguous in Qloo ("Radiohead" is an artist, person and album),
// which makes the harness answer `needs_input`; entity UUIDs resolve cleanly.
// Radiohead = 70CAE5BF-2F4C-445C-A3E5-4EDACFC3591C, Taylor Swift = 4BBEF799-A0C4-4110-AB01-39216993C312, The Grand Budapest Hotel = DF788007-B5EA-4F29-872B-96BCB8EEC42F.
export const EXAMPLES = {
  qloo_capabilities: {},
  qloo_find_tags: { query: "cozy mystery", limit: 5 },
  qloo_describe: { entity: "Radiohead", type: "artist" },
  qloo_recommend: {
    target_type: "place",
    signals: ["70CAE5BF-2F4C-445C-A3E5-4EDACFC3591C", "DF788007-B5EA-4F29-872B-96BCB8EEC42F"],
    filter_location: "Lisbon",
    limit: 5,
  },
  qloo_rank: {
    options: ["DF788007-B5EA-4F29-872B-96BCB8EEC42F", "F01AC034-179A-47F3-8ADF-7A4D77559DCF", "B7A0731F-EC92-496A-9C40-47D9770489B6"], // Budapest, Fast & Furious, Amélie
    option_type: "movie",
    signals: ["70CAE5BF-2F4C-445C-A3E5-4EDACFC3591C"],
  },
  qloo_where_popular: { entity: "Radiohead", entity_type: "artist", within: "New York", limit: 10 },
  qloo_compare_audiences: { group_a: ["70CAE5BF-2F4C-445C-A3E5-4EDACFC3591C"], group_b: ["4BBEF799-A0C4-4110-AB01-39216993C312"], target_type: "brand", limit: 10 },
  qloo_audience_demographics: { entity: "Huberman Lab", entity_type: "podcast" },
  qloo_entity_tags: { entities: ["Huberman Lab"], entity_type: "podcast", limit: 10 },
  qloo_trends: {
    entities: ["3037F0E8-C912-4DC0-BDE3-1F94631F9DA6"], // Dune (2021)
    entity_type: "movie",
    start_date: "2026-01-01",
    end_date: "2026-09-30",
    limit: 10,
  },
};
