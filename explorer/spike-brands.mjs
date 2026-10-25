// Spike 2 for Archetype: do category-filtered brand recommendations give non-generic partners?
// For 5 properties, prints top brands raw and per brand category (filter.tags on urn:tag:genre:brand:*).
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig, RESULTS_DIR } from "./lib/config.mjs";
import { qlooGet, firstList, label } from "./lib/rest.mjs";

const config = loadConfig();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const get = async (path, params) => { const res = await qlooGet(config, path, params); await sleep(250); return res; };

const PROPERTIES = [
  { key: "book", query: "The Secret History", types: "urn:entity:book" },
  { key: "game", query: "Elden Ring", types: "urn:entity:videogame" },
  { key: "film", query: "Dune", types: "urn:entity:movie", pick: (r) => r.find((x) => x.entity_id === "3037F0E8-C912-4DC0-BDE3-1F94631F9DA6") },
  { key: "tv", query: "Succession", types: "urn:entity:tv_show" },
  { key: "album", query: "Folklore Taylor Swift", types: "urn:entity:album" },
];
const CATEGORIES = ["fashion", "food", "beverage", "technology", "travel", "beauty", "sports", "automotive", "gaming", "retail"];

// 1. Find brand-genre tag ids for each category word.
const tags = {};
for (const word of CATEGORIES) {
  const items = firstList((await get("/v2/tags", { "filter.query": word, "filter.tag.types": "urn:tag:genre:brand", take: 5 })).body).items;
  const best = items.find((t) => t.name?.toLowerCase() === word) ?? items[0];
  if (best) tags[word] = best;
}
console.log("Brand category tags:", Object.entries(tags).map(([w, t]) => `${w}=${t.id}`).join("\n  "));

const report = {};
for (const prop of PROPERTIES) {
  const found = firstList((await get("/search", { query: prop.query, types: prop.types, take: 5 })).body).items;
  const entity = (prop.pick ? prop.pick(found) : undefined) ?? found[0];
  if (!entity) { console.log(`\n### ${prop.key}: not found`); continue; }
  console.log(`\n### ${prop.key}: ${entity.name} (${entity.entity_id})`);
  const base = { "filter.type": "urn:entity:brand", "signal.interests.entities": entity.entity_id, take: 10 };
  const line = (items) => items.slice(0, 6).map((b) => `${label(b)} ${String(b.query?.affinity ?? "").slice(0, 4)}`).join(" · ");
  const raw = await get("/v2/insights", base);
  const rawItems = firstList(raw.body).items;
  console.log(`  RAW [${raw.status}]: ${raw.ok ? line(rawItems) : JSON.stringify(raw.body).slice(0, 160)}`);
  report[prop.key] = { entity: entity.name, raw: rawItems.map(label), categories: {} };
  for (const [word, tag] of Object.entries(tags)) {
    const res = await get("/v2/insights", { ...base, "filter.tags": tag.id, take: 6 });
    const items = firstList(res.body).items;
    report[prop.key].categories[word] = items.map((b) => ({ name: label(b), affinity: b.query?.affinity }));
    console.log(`  ${word.padEnd(10)} [${res.status}] ${res.ok ? (items.length ? line(items) : "(none)") : JSON.stringify(res.body).slice(0, 120)}`);
  }
}
await mkdir(join(RESULTS_DIR, "spikes"), { recursive: true });
await writeFile(join(RESULTS_DIR, "spikes", "brand-categories.json"), JSON.stringify({ tags, report }, null, 2));
