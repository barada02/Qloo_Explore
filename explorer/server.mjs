// Small web playground. The browser never sees the Qloo key: it calls this
// server, which forwards to `qloo mcp` (workflows) or the REST API (raw).
//
// Usage: node server.mjs   then open http://localhost:3000
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig, redact, ROOT } from "./lib/config.mjs";
import { connectQlooMcp, envelopeOf, EXAMPLES } from "./lib/mcp.mjs";
import { qlooGet } from "./lib/rest.mjs";

const REST_PATHS = new Set([
  "/", "/entities", "/search", "/v2/analysis/compare", "/v2/audiences", "/v2/audiences/types",
  "/v2/insights", "/v2/tags", "/v2/tags/types", "/v2/trending",
]);
const PORT = Number(process.env.PORT ?? 3000);
const MAX_BODY = 1_000_000;
const config = loadConfig();

let mcpClient;
async function mcp() {
  mcpClient ??= connectQlooMcp(config).catch((error) => {
    mcpClient = undefined;
    throw error;
  });
  return mcpClient;
}

const routes = {
  "GET /api/status": async () => ({ baseUrl: config.baseUrl, hasKey: Boolean(config.apiKey) }),
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
    if (!REST_PATHS.has(path)) throw Object.assign(new Error(`Path not allowed: ${path}`), { status: 400 });
    return qlooGet(config, path, params);
  },
};

const server = createServer(async (req, res) => {
  const route = routes[`${req.method} ${new URL(req.url, "http://x").pathname}`];
  if (!route) {
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
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
        throw Object.assign(new Error("Content-Type must be application/json"), { status: 415 });
      }
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > MAX_BODY) throw Object.assign(new Error("Body too large"), { status: 413 });
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
