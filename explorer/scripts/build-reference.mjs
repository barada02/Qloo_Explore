// Builds reference/endpoints.json (the data behind the playground's "Endpoint
// reference" tab) from Qloo's public docs. Each docs page embeds the OpenAPI
// definition of its endpoint; /v2/insights parameters are enriched with the
// descriptions and compatible entity types from the Parameter Reference.
//
// Usage: node scripts/build-reference.mjs   (needs network; output is committed)
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "../lib/config.mjs";

const DOCS = "https://docs.qloo.com/reference";
const PAGES = [
  "api-information", "get-search", "get-entities", "search-tags", "get-tag-types",
  "get-audiences", "get-audience-types", "insights-api-deep-dive", "analysis-compare", "get-trending",
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPage(slug) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(`${DOCS}/${slug}.md`);
    if (res.ok) return res.text();
    if (res.status !== 429) throw new Error(`${slug}: HTTP ${res.status}`);
    await sleep(3000 * attempt);
  }
  throw new Error(`${slug}: still rate limited`);
}

function openApiOf(markdown) {
  const match = markdown.match(/# OpenAPI definition\s*```json\n([\s\S]*?)\n```/);
  return match ? JSON.parse(match[1]) : undefined;
}

const resolve = (spec, node) => {
  const seen = new Set();
  while (node?.$ref && !seen.has(node.$ref)) {
    seen.add(node.$ref);
    node = node.$ref.replace(/^#\//, "").split("/").reduce((acc, key) => acc?.[key], spec);
  }
  return node;
};

function describeParameter(spec, raw) {
  const param = resolve(spec, raw);
  const schema = resolve(spec, param.schema) ?? {};
  const items = resolve(spec, schema.items);
  const example = param.example ?? param.examples?.default?.value ?? schema.example ?? schema.default;
  return {
    name: param.name,
    required: Boolean(param.required),
    type: schema.type === "array" ? `array<${items?.type ?? "string"}>` : schema.type ?? "string",
    description: (param.description ?? schema.description ?? "").trim(),
    enum: schema.enum ?? items?.enum,
    default: schema.default,
    example,
  };
}

// <tr><td>name</td><td>type</td><td>description</td><td>entity types</td></tr>
function parameterTable(markdown) {
  const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const sections = [["Filters", "Signals", "Output"], markdown.split(/<Tab title="(Filters|Signals|Output)">/).slice(1)];
  const rows = {};
  for (let i = 0; i < sections[1].length; i += 2) {
    const group = sections[1][i];
    for (const [, row] of sections[1][i + 1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => text(m[1]));
      if (cells.length >= 3) rows[text(cells[0]).replace(/`/g, "")] = { group, type: cells[1], description: cells[2], entityTypes: cells[3] ?? "" };
    }
  }
  return rows;
}

const endpoints = [];
for (const slug of PAGES) {
  const spec = openApiOf(await fetchPage(slug));
  if (!spec) throw new Error(`${slug}: no OpenAPI block`);
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (method !== "get") continue;
      endpoints.push({
        path,
        method: method.toUpperCase(),
        title: op.summary,
        description: (op.description ?? "").trim(),
        docs: `${DOCS}/${slug}`,
        parameters: (op.parameters ?? []).map((p) => describeParameter(spec, p)),
      });
    }
  }
  await sleep(800);
}

const table = parameterTable(await fetchPage("parameters"));
for (const endpoint of endpoints.filter((e) => e.path === "/v2/insights")) {
  for (const param of endpoint.parameters) {
    const extra = table[param.name];
    if (!extra) continue;
    param.group = extra.group;
    param.entityTypes = extra.entityTypes;
    if (extra.description.length > param.description.length) param.description = extra.description;
  }
}

// Order the endpoint list the way we probe it.
const order = ["/", "/search", "/entities", "/v2/tags", "/v2/tags/types", "/v2/audiences", "/v2/audiences/types", "/v2/insights", "/v2/analysis/compare", "/v2/trending"];
endpoints.sort((a, b) => order.indexOf(a.path) - order.indexOf(b.path));

await mkdir(join(ROOT, "reference"), { recursive: true });
await writeFile(join(ROOT, "reference", "endpoints.json"), JSON.stringify({ source: DOCS, builtAt: new Date().toISOString(), endpoints }, null, 2));
for (const e of endpoints) console.error(`${e.method} ${e.path} — ${e.parameters.length} parameters`);
