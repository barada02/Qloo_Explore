// Small web playground. The browser never sees the Qloo key: it calls this
// server, which forwards to `qloo mcp` (workflows) or the REST API (raw), and
// also serves the endpoint reference and the saved probe results.
//
// Usage: node server.mjs   then open http://localhost:3000
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig, redact, ROOT, RESULTS_DIR } from "./lib/config.mjs";
import { connectQlooMcp, envelopeOf, EXAMPLES } from "./lib/mcp.mjs";
import { qlooGet, firstList, label } from "./lib/rest.mjs";

const REST_PATHS = new Set([
  "/", "/entities", "/search", "/v2/analysis/compare", "/v2/audiences", "/v2/audiences/types",
  "/v2/insights", "/v2/tags", "/v2/tags/types", "/v2/trending",
]);
const PORT = Number(process.env.PORT ?? 3000);
const MAX_BODY = 1_000_000;
const SAFE_NAME = /^[\w.-]+$/;
const config = loadConfig();

let mcpClient;
async function mcp() {
  mcpClient ??= connectQlooMcp(config).catch((error) => {
    mcpClient = undefined;
    throw error;
  });
  return mcpClient;
}

const fail = (status, message) => Object.assign(new Error(message), { status });

// One row per saved probe call (results/rest and results/mcp).
async function listResults() {
  const rows = [];
  for (const kind of ["rest", "mcp"]) {
    let files = [];
    try {
      files = await readdir(join(RESULTS_DIR, kind));
    } catch {
      continue;
    }
    for (const file of files.filter((f) => f.endsWith(".json") && !f.startsWith("_"))) {
      const name = file.slice(0, -".json".length);
      const saved = JSON.parse(await readFile(join(RESULTS_DIR, kind, file), "utf8"));
      if (kind === "rest") {
        const { request, response } = saved;
        const { kind: listKind, items } = firstList(response.body);
        rows.push({
          kind, name, endpoint: request.path, params: request.params, ok: response.ok, status: response.status, ms: response.ms,
          count: items.length, listKind, sample: items.slice(0, 4).map(label).join(" · "),
          error: response.ok ? undefined : response.error ?? response.body?.errors?.[0]?.message ?? response.body?.error?.message,
        });
      } else {
        const { tool, arguments: params, envelope } = saved;
        const items = Array.isArray(envelope.results) ? envelope.results : Array.isArray(envelope.series) ? envelope.series : firstList(envelope).items;
        const ok = ["ok", "partial", "degraded"].includes(envelope.status);
        rows.push({
          kind, name, endpoint: tool, params, ok, status: envelope.status,
          count: envelope.result_count ?? items.length, sample: items.slice(0, 4).map(label).join(" · "),
          error: ok ? undefined : envelope.summary,
        });
      }
    }
  }
  return rows;
}

const routes = {
  "GET /api/status": async () => ({ baseUrl: config.baseUrl, hasKey: Boolean(config.apiKey) }),
  "GET /api/reference": async () => JSON.parse(await readFile(join(ROOT, "reference", "endpoints.json"), "utf8")),
  "GET /api/results": listResults,
  "GET /api/tools": async () => {
    const { tools } = await (await mcp()).listTools();
    return tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema, example: EXAMPLES[t.name] ?? {} }));
  },
  "POST /api/tool": async ({ name, arguments: args = {} }) => {
    const started = performance.now();
    const envelope = envelopeOf(await (await mcp()).callTool({ name, arguments: args }));
    return { ms: Math.round(performance.now() - started), envelope };
  },
  "POST /api/rest": async ({ path, params = {} }) => {
    if (!REST_PATHS.has(path)) throw fail(400, `Path not allowed: ${path}`);
    return qlooGet(config, path, params);
  },
};

const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://x").pathname;
  const saved = req.method === "GET" ? pathname.match(/^\/api\/results\/(rest|mcp)\/([^/]+)$/) : null;
  const route = saved
    ? async () => {
        if (!SAFE_NAME.test(saved[2])) throw fail(400, "bad name");
        try {
          return JSON.parse(await readFile(join(RESULTS_DIR, saved[1], `${saved[2]}.json`), "utf8"));
        } catch {
          throw fail(404, "no such saved result");
        }
      }
    : routes[`${req.method} ${pathname}`];
  if (!route) {
    if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(await readFile(join(ROOT, "public", "index.html")));
    }
    res.writeHead(404).end("not found");
    return;
  }
  try {
    let body = {};
    if (req.method === "POST") {
      if (!/^application\/json\b/i.test(req.headers["content-type"] ?? "")) {
        throw fail(415, "Content-Type must be application/json");
      }
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > MAX_BODY) throw fail(413, "Body too large");
      }
      body = raw ? JSON.parse(raw) : {};
    }
    const result = await route(body);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(redact(result, config.apiKey));
  } catch (error) {
    res.writeHead(error.status ?? 500, { "content-type": "application/json" });
    res.end(redact({ error: error.message }, config.apiKey));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.error(`Qloo explorer on http://localhost:${PORT} → ${config.baseUrl}${config.apiKey ? "" : " (NO KEY SET)"}`);
});

const shutdown = async () => {
  server.close();
  await (await mcpClient?.catch(() => undefined))?.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
