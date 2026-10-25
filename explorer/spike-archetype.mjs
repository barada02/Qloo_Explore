// Throwaway spike for the Archetype AI idea: does book -> brand/artist/place work,
// can we find emerging artists, and does /v2/analysis/compare validate a pairing?
import { loadConfig } from "./lib/config.mjs";
import { qlooGet, firstList, label } from "./lib/rest.mjs";

const config = loadConfig();
const get = async (path, params) => {
  const res = await qlooGet(config, path, params);
  await new Promise((resolve) => setTimeout(resolve, 300));
  return res;
};
const show = (title, res) => {
  const { kind, items } = firstList(res.body);
  console.log(`\n## ${title} [${res.status}, ${res.ms}ms] ${res.ok ? `${items.length} ${kind}` : JSON.stringify(res.body).slice(0, 200)}`);
  return items;
};
const top = (items, n = 8) => items.slice(0, n).map((i) => `${label(i)} (${String(i.query?.affinity ?? "").slice(0, 5)})`).join(" · ");

for (const [bookName, tagQuery] of [["The Secret History", "dark academia"], ["Gone Girl", "psychological thriller"]]) {
  console.log(`\n==================== ${bookName} / ${tagQuery}`);
  const book = firstList((await get("/search", { query: bookName, types: "urn:entity:book", take: 3 })).body).items[0];
  console.log("book:", book.name, book.entity_id);
  const tag = firstList((await get("/v2/tags", { "filter.query": tagQuery, "feature.semantic_search": true, take: 3 })).body).items[0];
  console.log("tag:", tag?.name, tag?.id);
  const base = { "signal.interests.entities": book.entity_id, take: 10 };
  const withTag = tag ? { ...base, "signal.interests.tags": tag.id } : base;

  const brands = show("brands (book only)", await get("/v2/insights", { ...base, "filter.type": "urn:entity:brand" }));
  console.log(top(brands));
  console.log(top(show("brands (book + tag)", await get("/v2/insights", { ...withTag, "filter.type": "urn:entity:brand" }))));
  console.log(top(show("artists", await get("/v2/insights", { ...base, "filter.type": "urn:entity:artist" }))));
  console.log(top(show("emerging artists (popularity.max 0.6)", await get("/v2/insights", { ...base, "filter.type": "urn:entity:artist", "filter.popularity.max": 0.6 }))));
  console.log(top(show("places (New York)", await get("/v2/insights", { ...base, "filter.type": "urn:entity:place", "filter.location.query": "New York" }))));

  const brand = brands[0];
  if (!brand) continue;
  const compare = await get("/v2/analysis/compare", { "a.signal.interests.entities": book.entity_id, "b.signal.interests.entities": brand.entity_id, take: 10 });
  show(`compare: book vs ${brand.name}`, compare);
  console.log("compare tags:", top(firstList(compare.body).items));
  const sketch = await get("/analysis/compare", { entity_id_1: book.entity_id, entity_id_2: brand.entity_id });
  console.log("sketch-style GET /analysis/compare ->", sketch.status, JSON.stringify(sketch.body).slice(0, 120));
  console.log(top(show(`reverse: books for fans of ${brand.name}`, await get("/v2/insights", { "filter.type": "urn:entity:book", "signal.interests.entities": brand.entity_id, take: 10 }))));
  console.log(top(show("rank top-5 brands for ages 25-29", await get("/v2/insights", { ...base, "filter.type": "urn:entity:brand", "filter.results.entities": brands.slice(0, 5).map((b) => b.entity_id), "signal.demographics.age": "25_to_29", take: 5 }))));
}

const wrongBase = await fetch("https://qloo.com/search?query=x", { headers: { "X-Api-Key": config.apiKey } }).then((r) => r.status).catch((e) => e.message);
console.log(`\nsketch base https://qloo.com/search -> ${wrongBase}; real base ${config.baseUrl}`);
