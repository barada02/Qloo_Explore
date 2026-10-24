// Starts the official `qloo mcp` stdio server (from node_modules) and returns
// a connected MCP client.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join } from "node:path";
import { ROOT, harnessEnv } from "./config.mjs";

export const QLOO_BIN = join(ROOT, "node_modules", ".bin", "qloo");

export async function connectQlooMcp(config) {
  const client = new Client({ name: "qloo-explorer", version: "0.1.0" });
  await client.connect(
    new StdioClientTransport({ command: QLOO_BIN, args: ["mcp"], env: harnessEnv(config), stderr: "pipe" }),
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
export const EXAMPLES = {
  qloo_capabilities: {},
  qloo_find_tags: { query: "cozy mystery", limit: 5 },
  qloo_describe: { entity: "Radiohead", type: "artist" },
  qloo_recommend: {
    target_type: "place",
    signals: ["Radiohead", "The Grand Budapest Hotel"],
    filter_location: "Lisbon",
    limit: 5,
  },
  qloo_rank: {
    options: ["The Grand Budapest Hotel", "Fast & Furious", "Amelie"],
    option_type: "movie",
    signals: ["Radiohead"],
  },
  qloo_where_popular: { entity: "Radiohead", entity_type: "artist", within: "New York", limit: 10 },
  qloo_compare_audiences: { group_a: ["Radiohead"], group_b: ["Taylor Swift"], target_type: "brand", limit: 10 },
  qloo_audience_demographics: { entity: "Huberman Lab", entity_type: "podcast" },
  qloo_entity_tags: { entities: ["Huberman Lab"], entity_type: "podcast", limit: 10 },
  qloo_trends: {
    entities: ["Dune"],
    entity_type: "movie",
    start_date: "2026-01-01",
    end_date: "2026-09-30",
    limit: 10,
  },
};
