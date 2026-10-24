// Exercises every documented Qloo GET endpoint and every /v2/insights output
// type, chaining real IDs from earlier steps into later ones. Writes each raw
// response to results/rest/<step>.json and a summary to results/REST_REPORT.md.
//
// Usage: node probe-rest.mjs [--only <substring>] [--delay <ms>]
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig, redact, RESULTS_DIR } from "./lib/config.mjs";
import { qlooGet, firstList, label } from "./lib/rest.mjs";

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;
const delayMs = args.includes("--delay") ? Number(args[args.indexOf("--delay") + 1]) : 300;

const ctx = { entity: {}, tag: {} };
const id = (key) => ctx.entity[key]?.id;

// Entities used as seeds. Chosen to cover each search type, plus probes for
// the product ideas (podcasts → brands for SponsorFit, localities for Site Scout).
const SEARCHES = [
  ["artist", "Radiohead", "urn:entity:artist"],
  ["artist2", "Taylor Swift", "urn:entity:artist"],
  ["movie", "The Grand Budapest Hotel", "urn:entity:movie"],
  ["movie2", "Fast & Furious", "urn:entity:movie"],
  ["tv_show", "Breaking Bad", "urn:entity:tv_show"],
  ["book", "Dune", "urn:entity:book"],
  ["author", "Agatha Christie", "urn:entity:person"],
  ["podcast", "The Joe Rogan Experience", "urn:entity:podcast"],
  ["podcast2", "Huberman Lab", "urn:entity:podcast"],
  ["podcast3", "Lex Fridman Podcast", "urn:entity:podcast"],
  ["brand", "Patagonia", "urn:entity:brand"],
  ["brand2", "Nike", "urn:entity:brand"],
  ["videogame", "Elden Ring", "urn:entity:videogame"],
  ["place", "Tartine Bakery", "urn:entity:place"],
  ["locality", "Lisbon", "urn:entity:locality"],
  ["destination", "Kyoto", "urn:entity:destination"],
];

const INSIGHT_TYPES = ["artist", "movie", "tv_show", "book", "person", "podcast", "brand", "videogame", "destination"];
const tasteSignals = () => [id("artist"), id("movie")].filter(Boolean);

const steps = [
  // --- meta / taxonomy -------------------------------------------------------
  { name: "api-root", path: "/" },
  { name: "tags-types", path: "/v2/tags/types" },
  { name: "audiences-types", path: "/v2/audiences/types" },
  { name: "audiences-list", path: "/v2/audiences", params: { "filter.parents.types": "urn:audience:communities", take: 10 } },
  {
    name: "tags-semantic-cozy-mystery",
    path: "/v2/tags",
    params: { "filter.query": "cozy mystery", "feature.semantic_search": true, take: 10 },
    save: (list) => (ctx.tag.cozy = list[0]),
  },
  {
    name: "tags-semantic-natural-wine",
    path: "/v2/tags",
    params: { "filter.query": "natural wine bar", "feature.semantic_search": true, take: 10 },
    save: (list) => (ctx.tag.wine = list[0]),
  },
  {
    name: "tags-semantic-outdoor",
    path: "/v2/tags",
    params: { "filter.query": "outdoor adventure", "feature.semantic_search": true, take: 10 },
    save: (list) => (ctx.tag.outdoor = list[0]),
  },
  { name: "tags-plain-jazz", path: "/v2/tags", params: { "filter.query": "jazz", take: 10 } },

  // --- search + entities -----------------------------------------------------
  ...SEARCHES.map(([key, query, types]) => ({
    name: `search-${key}`,
    path: "/search",
    params: { query, types, take: 5 },
    save: (list) => (ctx.entity[key] = list[0] && { id: list[0].entity_id ?? list[0].id, name: list[0].name }),
  })),
  { name: "search-untyped-amelie", path: "/search", params: { query: "Amelie", take: 5 } },
  {
    name: "entities-by-id",
    path: "/entities",
    needs: () => tasteSignals().length > 0,
    params: () => ({ entity_ids: [id("artist"), id("movie"), id("podcast")].filter(Boolean) }),
  },

  // --- insights: recommendations into every entity type ----------------------
  ...INSIGHT_TYPES.map((type) => ({
    name: `insights-recommend-${type}`,
    path: "/v2/insights",
    needs: () => tasteSignals().length > 0,
    params: () => ({
      "filter.type": `urn:entity:${type}`,
      "signal.interests.entities": tasteSignals(),
      take: 10,
    }),
  })),
  {
    name: "insights-places-in-lisbon",
    path: "/v2/insights",
    needs: () => tasteSignals().length > 0,
    params: () => ({
      "filter.type": "urn:entity:place",
      "signal.interests.entities": tasteSignals(),
      "filter.location.query": "Lisbon",
      take: 10,
    }),
  },
  {
    name: "insights-places-nyc-with-tag",
    path: "/v2/insights",
    needs: () => tasteSignals().length > 0 && ctx.tag.wine,
    params: () => ({
      "filter.type": "urn:entity:place",
      "signal.interests.entities": tasteSignals(),
      "filter.location.query": "New York",
      "filter.tags": ctx.tag.wine.id ?? ctx.tag.wine.tag_id,
      take: 10,
    }),
  },
  {
    name: "insights-explainability",
    path: "/v2/insights",
    needs: () => tasteSignals().length > 0,
    params: () => ({
      "filter.type": "urn:entity:movie",
      "signal.interests.entities": tasteSignals(),
      "feature.explainability": true,
      take: 5,
    }),
  },
  {
    name: "insights-tag-signal-books",
    path: "/v2/insights",
    needs: () => ctx.tag.cozy,
    params: () => ({
      "filter.type": "urn:entity:book",
      "signal.interests.tags": ctx.tag.cozy.id ?? ctx.tag.cozy.tag_id,
      take: 10,
    }),
  },
  {
    name: "insights-demographic-signal",
    path: "/v2/insights",
    params: {
      "filter.type": "urn:entity:artist",
      "signal.demographics.age": "24_and_younger",
      "signal.demographics.gender": "female",
      "signal.location.query": "London",
      take: 10,
    },
  },
  {
    name: "insights-exclude-tags",
    path: "/v2/insights",
    needs: () => tasteSignals().length > 0 && ctx.tag.cozy,
    params: () => ({
      "filter.type": "urn:entity:book",
      "signal.interests.entities": tasteSignals(),
      "filter.exclude.tags": ctx.tag.cozy.id ?? ctx.tag.cozy.tag_id,
      take: 10,
    }),
  },
  {
    name: "insights-rank-shortlist",
    path: "/v2/insights",
    needs: () => id("movie") && id("movie2") && id("artist"),
    params: () => ({
      "filter.type": "urn:entity:movie",
      "filter.results.entities": [id("movie"), id("movie2")],
      "signal.interests.entities": id("artist"),
      take: 2,
    }),
  },

  // --- insights: non-entity outputs ------------------------------------------
  {
    name: "insights-tags-for-entities",
    path: "/v2/insights",
    needs: () => tasteSignals().length > 0,
    params: () => ({ "filter.type": "urn:tag", "signal.interests.entities": tasteSignals(), take: 20 }),
  },
  {
    name: "insights-demographics-of-artist",
    path: "/v2/insights",
    needs: () => id("artist"),
    params: () => ({ "filter.type": "urn:demographics", "signal.interests.entities": id("artist") }),
  },
  {
    name: "insights-heatmap-nyc",
    path: "/v2/insights",
    needs: () => id("artist"),
    params: () => ({
      "filter.type": "urn:heatmap",
      "signal.interests.entities": id("artist"),
      "filter.location.query": "New York",
      take: 20,
    }),
  },
  {
    name: "insights-heatmap-usa",
    path: "/v2/insights",
    needs: () => id("brand"),
    params: () => ({
      "filter.type": "urn:heatmap",
      "signal.interests.entities": id("brand"),
      "filter.location.query": "United States",
      take: 20,
    }),
  },

  // --- SponsorFit validation: podcast audiences ------------------------------
  {
    name: "idea-podcasts-to-brands",
    path: "/v2/insights",
    needs: () => id("podcast") || id("podcast2"),
    params: () => ({
      "filter.type": "urn:entity:brand",
      "signal.interests.entities": [id("podcast"), id("podcast2"), id("podcast3")].filter(Boolean),
      "feature.explainability": true,
      take: 20,
    }),
  },
  {
    name: "idea-podcast-demographics",
    path: "/v2/insights",
    needs: () => id("podcast2"),
    params: () => ({ "filter.type": "urn:demographics", "signal.interests.entities": id("podcast2") }),
  },
  {
    name: "idea-podcast-tags",
    path: "/v2/insights",
    needs: () => id("podcast2"),
    params: () => ({ "filter.type": "urn:tag", "signal.interests.entities": id("podcast2"), take: 20 }),
  },

  // --- analysis / trending ---------------------------------------------------
  {
    name: "compare-two-audiences",
    path: "/v2/analysis/compare",
    needs: () => id("artist") && id("artist2"),
    params: () => ({
      "a.signal.interests.entities": id("artist"),
      "b.signal.interests.entities": id("artist2"),
      take: 10,
    }),
  },
  {
    name: "compare-podcast-vs-brand",
    path: "/v2/analysis/compare",
    needs: () => id("podcast2") && id("brand"),
    params: () => ({
      "a.signal.interests.entities": id("podcast2"),
      "b.signal.interests.entities": id("brand"),
      take: 10,
    }),
  },
  {
    name: "trending-movie-series",
    path: "/v2/trending",
    needs: () => id("movie"),
    params: () => ({
      "filter.type": "urn:entity:movie",
      "signal.interests.entities": id("movie"),
      "filter.start_date": "2026-01-01",
      "filter.end_date": "2026-09-30",
      take: 20,
    }),
  },
  {
    name: "trending-artists-like-radiohead",
    path: "/v2/trending",
    needs: () => id("artist"),
    params: () => ({ "filter.type": "urn:entity:artist", "signal.interests.entities": id("artist"), "filter.start_date": "2026-01-01", "filter.end_date": "2026-09-30", take: 10 }),
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const config = loadConfig();
  if (!config.apiKey) {
    console.error("No Qloo key. Set QLOO_API_KEY (or API_Key) in the environment.");
    return 2;
  }
  const outDir = join(RESULTS_DIR, "rest");
  await mkdir(outDir, { recursive: true });
  console.error(`Probing ${config.baseUrl} (${steps.length} steps)\n`);

  const rows = [];
  for (const step of steps) {
    if (only && !step.name.includes(only)) continue;
    if (step.needs && !step.needs()) {
      rows.push({ name: step.name, path: step.path, status: "SKIP", note: "missing input from an earlier step" });
      console.error(`SKIP ${step.name}`);
      continue;
    }
    const params = typeof step.params === "function" ? step.params() : step.params ?? {};
    const res = await qlooGet(config, step.path, params);
    if (res.status === 0 && rows.every((r) => r.status === "NET" || r.status === "SKIP")) {
      console.error(`Cannot reach ${config.baseUrl}: ${res.error}. Stopping.`);
      return 3;
    }
    const { kind, items } = firstList(res.body);
    if (res.ok && step.save) step.save(items);
    const sample = items.slice(0, 5).map(label).join(" · ");
    const note = res.ok ? `${items.length} ${kind ?? "items"}: ${sample}` : errorText(res);
    rows.push({ name: step.name, path: step.path, status: res.status || "NET", ms: res.ms, note, rateLimit: res.rateLimit });
    console.error(`${String(res.status || "NET").padEnd(4)} ${String(res.ms).padStart(5)}ms ${step.name} — ${note.slice(0, 140)}`);
    await writeFile(join(outDir, `${step.name}.json`), redact({ request: { path: step.path, params }, response: res }, config.apiKey));
    if (res.status === 429) await sleep(5000);
    await sleep(delayMs);
  }

  const passed = rows.filter((r) => typeof r.status === "number" && r.status < 400).length;
  const report = [
    "# Qloo REST probe report",
    "",
    `- Base URL: \`${config.baseUrl}\``,
    `- Run at: ${new Date().toISOString()}`,
    `- Result: **${passed}/${rows.length} steps returned 2xx/3xx**`,
    "",
    "Raw responses: `results/rest/<step>.json`.",
    "",
    "| Step | Endpoint | HTTP | ms | Result |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map((r) => `| ${r.name} | \`${r.path}\` | ${r.status} | ${r.ms ?? ""} | ${md(r.note)} |`),
    "",
    "## Resolved seed entities",
    "",
    ...Object.entries(ctx.entity).map(([k, v]) => `- ${k}: ${v ? `${v.name} (\`${v.id}\`)` : "_not found_"}`),
    "",
    "## Resolved seed tags",
    "",
    ...Object.entries(ctx.tag).map(([k, v]) => `- ${k}: ${v ? `${v.name} (\`${v.id ?? v.tag_id}\`)` : "_not found_"}`),
    "",
  ].join("\n");
  await writeFile(join(RESULTS_DIR, "REST_REPORT.md"), redact(report, config.apiKey));
  console.error(`\n${passed}/${rows.length} ok. Report: results/REST_REPORT.md`);
  return passed === rows.length ? 0 : 1;
}

function errorText(res) {
  if (res.error) return `network error: ${res.error}`;
  const body = res.body ?? {};
  return `error: ${body.error?.message ?? body.message ?? body.errors?.[0]?.message ?? JSON.stringify(body).slice(0, 200)}`;
}

const md = (text = "") => String(text).replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 300);

process.exitCode = await main();
