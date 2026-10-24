// Offline plumbing tests against the stub API: they check that our client,
// the harness wiring, and the report writers work. They do NOT validate Qloo.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startStub } from "./stub-qloo.mjs";
import { buildUrl, firstList } from "../lib/rest.mjs";
import { redact } from "../lib/config.mjs";
import { ROOT } from "../lib/config.mjs";

const run = promisify(execFile);
const KEY = "test-key-123";
let stub, work;

before(async () => {
  stub = await startStub({ apiKey: KEY });
  // Run the probes from a copy so test output never lands in results/.
  work = await mkdtemp(join(tmpdir(), "qloo-explorer-"));
  for (const entry of ["lib", "probe-rest.mjs", "probe-mcp.mjs", "package.json"]) await cp(join(ROOT, entry), join(work, entry), { recursive: true });
  await cp(join(ROOT, "node_modules"), join(work, "node_modules"), { recursive: true, verbatimSymlinks: true });
});
after(async () => {
  stub.close();
  await rm(work, { recursive: true, force: true });
});

const env = () => ({ ...process.env, QLOO_API_KEY: KEY, QLOO_BASE_URL: stub.url, API_Key: "", Server_URL: "" });

test("buildUrl comma-joins arrays and drops empty values", () => {
  const url = buildUrl("https://x.test", "/v2/insights", { a: ["1", "2"], b: "", c: undefined, d: true });
  assert.equal(url.search, "?a=1%2C2&d=true");
});

test("firstList finds nested result arrays", () => {
  assert.deepEqual(firstList({ results: { heatmap: [1] } }), { kind: "heatmap", items: [1] });
  assert.deepEqual(firstList({ results: [2] }).items, [2]);
});

test("redact removes the key", () => {
  assert.equal(redact("a test-key-123 b", KEY), "a [REDACTED] b");
});

test("REST probe hits every endpoint, chains ids, and never writes the key", async () => {
  await run("node", ["probe-rest.mjs", "--delay", "0"], { cwd: work, env: env() });
  const paths = new Set(stub.requests.map((r) => r.path));
  for (const p of ["/", "/search", "/entities", "/v2/tags", "/v2/tags/types", "/v2/audiences", "/v2/audiences/types", "/v2/insights", "/v2/analysis/compare", "/v2/trending"]) {
    assert.ok(paths.has(p), `missing ${p}`);
  }
  const types = new Set(stub.requests.map((r) => r.query["filter.type"]).filter(Boolean));
  for (const t of ["urn:heatmap", "urn:demographics", "urn:tag", "urn:entity:place", "urn:entity:brand"]) assert.ok(types.has(t), `missing ${t}`);
  const report = await readFile(join(work, "results", "REST_REPORT.md"), "utf8");
  assert.match(report, /steps returned 2xx/);
  assert.doesNotMatch(report, /SKIP/);
  const raw = await readFile(join(work, "results", "rest", "insights-heatmap-nyc.json"), "utf8");
  assert.ok(!raw.includes(KEY));
});

test("MCP probe drives the real qloo mcp server against the stub", async () => {
  const before = stub.requests.length;
  await run("node", ["probe-mcp.mjs"], { cwd: work, env: { ...env(), QLOO_HOME: join(work, ".qloo") } }).catch((e) => e);
  const report = await readFile(join(work, "results", "MCP_REPORT.md"), "utf8");
  assert.match(report, /qloo_recommend/);
  assert.ok(stub.requests.length > before, "qloo mcp made no API calls");
  assert.ok(stub.requests.slice(before).every((r) => r.key === KEY));
});
