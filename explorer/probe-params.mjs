// Exercises the optional parameters that probe-rest.mjs does not use (bias,
// diversify, backfill, geo/price/rating filters, weights, paging, external ids,
// ...). Each step is compared with a baseline call so the report says whether a
// parameter actually changed the answer. Writes results/rest/param-<step>.json
// and results/PARAMS_REPORT.md (including coverage of reference/endpoints.json).
//
// Usage: node probe-params.mjs [--only <substring>] [--delay <ms>]
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig, redact, RESULTS_DIR, ROOT } from "./lib/config.mjs";
import { qlooGet, firstList, label } from "./lib/rest.mjs";

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;
const delayMs = args.includes("--delay") ? Number(args[args.indexOf("--delay") + 1]) : 250;

// Stable Qloo entity ids, resolved by probe-rest.mjs.
const E = {
  radiohead: "70CAE5BF-2F4C-445C-A3E5-4EDACFC3591C",
  taylor: "4BBEF799-A0C4-4110-AB01-39216993C312",
  budapest: "DF788007-B5EA-4F29-872B-96BCB8EEC42F",
  huberman: "10E08FC9-04BB-4827-9331-7E9ABE1F7DB6",
  patagonia: "DB4CE34E-3A63-4947-946F-9D52502C5762",
  tartine: "FBBAF1EE-BC5A-4A9C-A971-2910A2214F27",
  breakingBad: undefined, // looked up below
};
const SF_POINT = "POINT(-122.4194 37.7749)";
const ctx = { tag: {}, audiences: [], seeds: {} };

const insights = (type, extra = {}) => ({ "filter.type": type, take: 10, ...extra });
const PLACE = (extra) => insights("urn:entity:place", { "signal.interests.entities": E.tartine, "filter.location.query": "San Francisco", ...extra });
const MOVIE = (extra) => insights("urn:entity:movie", { "signal.interests.entities": E.budapest, ...extra });
const ARTIST = (extra) => insights("urn:entity:artist", { "signal.interests.entities": E.radiohead, ...extra });
const BRAND = (extra) => insights("urn:entity:brand", { "signal.interests.entities": E.huberman, ...extra });
const BOOK = (extra) => insights("urn:entity:book", { "signal.interests.entities": E.radiohead, ...extra });
const TV = (extra) => insights("urn:entity:tv_show", { "signal.interests.entities": E.budapest, ...extra });
const PERSON = (extra) => insights("urn:entity:person", { "signal.interests.entities": E.radiohead, ...extra });
const HEAT = (extra) => insights("urn:heatmap", { "signal.interests.entities": E.tartine, "filter.location.query": "San Francisco", take: 20, ...extra });
const tagId = (key) => ctx.tag[key]?.id ?? ctx.tag[key]?.tag_id;

// step(name, path, params, {x: exercised parameter names, vs: baseline step name, needs})
const steps = [];
const step = (name, path, params, options = {}) => steps.push({ name, path, params, ...options });

// --- baselines --------------------------------------------------------------
step("base-place", "/v2/insights", PLACE(), { x: [] });
step("base-movie", "/v2/insights", MOVIE(), { x: [] });
step("base-artist", "/v2/insights", ARTIST(), { x: [] });
step("base-brand", "/v2/insights", BRAND(), { x: [] });
step("base-book", "/v2/insights", BOOK(), { x: [] });
step("base-tv", "/v2/insights", TV(), { x: [] });
step("base-person", "/v2/insights", PERSON(), { x: [] });
step("base-heatmap", "/v2/insights", HEAT(), { x: [] });

// --- ranking tuning -----------------------------------------------------------
const ins = (name, base, extra, x, options = {}) => step(name, "/v2/insights", () => base(extra), { x: x ?? Object.keys(extra), vs: `base-${options.b}`, ...options });
ins("bias-trends-high", MOVIE, { "bias.trends": "high" }, undefined, { b: "movie" });
ins("bias-trends-off", MOVIE, { "bias.trends": "off" }, undefined, { b: "movie" });
ins("bias-content-based-0", ARTIST, { "bias.content_based": 0 }, undefined, { b: "artist" });
ins("bias-content-based-1", ARTIST, { "bias.content_based": 1 }, undefined, { b: "artist" });
ins("bias-quality-high", PLACE, { "bias.quality": "high" }, undefined, { b: "place" });
ins("sort-by-rating", PLACE, { sort_by: "rating" }, undefined, { b: "place" });
ins("sort-by-quality", PLACE, { sort_by: "quality" }, undefined, { b: "place" });
ins("sort-by-distance", PLACE, { sort_by: "distance", "filter.location": SF_POINT }, undefined, { b: "place" });
ins("diversify-city", (e) => ({ ...PLACE(), "filter.location.query": "California", ...e }), { "diversify.by": "properties.geocode.city", "diversify.take": 2 }, undefined, { b: "place" });
ins("diversify-metro", (e) => ({ ...PLACE(), "filter.location.query": "California", ...e }), { "diversify.by": "properties.geocode.metro", "diversify.take": 2 }, undefined, { b: "place" });
ins("diversify-subtype", (e) => ({ ...BRAND(), ...e }), { "diversify.by": "subtype", "diversify.take": 2 }, undefined, { b: "brand" });
ins("backfill-cross-domain", (e) => ({ ...MOVIE(), "filter.release_year.min": 2024, ...e }), { "backfill.cross_domain.take": 5 }, undefined, { b: "movie" });
ins("backfill-content-based", (e) => ({ ...MOVIE(), "filter.release_year.min": 2024, ...e }), { "backfill.content_based.take": 5 }, undefined, { b: "movie" });

// --- signals: weights, demographics, location ----------------------------------
ins("weight-entities-low", (e) => ({ ...ARTIST(), "signal.demographics.gender": "female", ...e }), { "signal.interests.entities.weight": "0.1" }, undefined, { b: "artist" });
ins("weight-age", (e) => ({ ...ARTIST(), "signal.demographics.age": "24_and_younger", ...e }), { "signal.demographics.age.weight": "high" }, undefined, { b: "artist" });
ins("weight-gender", (e) => ({ ...ARTIST(), "signal.demographics.gender": "female", ...e }), { "signal.demographics.gender.weight": "high" }, undefined, { b: "artist" });
ins("weight-tags", (e) => ({ ...BOOK(), "signal.interests.tags": tagId("cozy"), ...e }), { "signal.interests.tags.weight": "high" }, undefined, { b: "book", needs: () => tagId("cozy") });
ins("operator-signal-tags-intersection", (e) => ({ ...BOOK(), "signal.interests.tags": [tagId("cozy"), tagId("mystery")].filter(Boolean), ...e }), { "operator.signal.interests.tags": "intersection" }, undefined, { b: "book", needs: () => tagId("cozy") && tagId("mystery") });
ins("signal-audience", (e) => ({ ...BRAND(), ...e }), { "signal.demographics.audiences": () => ctx.audiences[0] }, undefined, { b: "brand", needs: () => ctx.audiences[0] });
ins("signal-audience-weight", (e) => ({ ...BRAND(), ...e }), { "signal.demographics.audiences": () => ctx.audiences[0], "signal.demographics.audiences.weight": "high" }, undefined, { b: "brand", needs: () => ctx.audiences[0] });
ins("signal-location-wkt", (e) => insights("urn:entity:place", { ...e }), { "signal.location": SF_POINT, "signal.location.radius": 2000, "signal.location.weight": "high", "signal.interests.entities": E.tartine }, undefined, { b: "place" });
ins("signal-interests-include", (e) => ({ ...ARTIST(), ...e }), { "signal.interests.entities.include": true }, undefined, { b: "artist" });

// --- filters: places ------------------------------------------------------------
ins("filter-address", PLACE, { "filter.address": "Mission" }, undefined, { b: "place" });
ins("filter-geocode-name", (e) => insights("urn:entity:place", { "signal.interests.entities": E.tartine, ...e }), { "filter.geocode.name": "San Francisco", "filter.geocode.country_code": "US", "filter.geocode.admin1_region": "California" }, undefined, { b: "place" });
ins("filter-geocode-admin2", (e) => insights("urn:entity:place", { "signal.interests.entities": E.tartine, ...e }), { "filter.geocode.admin2_region": "San Francisco County" }, undefined, { b: "place" });
ins("filter-location-metro", (e) => insights("urn:entity:place", { "signal.interests.entities": E.tartine, ...e }), { "filter.location.metro": "San Francisco-Oakland-Berkeley" }, undefined, { b: "place" });
ins("filter-location-wkt-radius", (e) => insights("urn:entity:place", { "signal.interests.entities": E.tartine, ...e }), { "filter.location": SF_POINT, "filter.location.radius": 1500 }, undefined, { b: "place" });
ins("filter-location-geohash", (e) => insights("urn:entity:place", { "signal.interests.entities": E.tartine, ...e }), { "filter.location.geohash": "9q8y" }, undefined, { b: "place" });
ins("filter-exclude-location-query", (e) => PLACE({ ...e, "filter.location.query": "California" }), { "filter.exclude.location.query": "San Francisco" }, undefined, { b: "place" });
ins("filter-exclude-location-wkt", (e) => PLACE({ ...e, "filter.location.query": "California" }), { "filter.exclude.location": SF_POINT, "filter.exclude.location.radius": 20000 }, undefined, { b: "place" });
ins("filter-exclude-location-geohash", (e) => PLACE({ ...e, "filter.location.query": "California" }), { "filter.exclude.location.geohash": "9q8y" }, undefined, { b: "place" });
ins("filter-hours-monday", PLACE, { "filter.hours": "monday" }, undefined, { b: "place" });
ins("filter-popularity-range", PLACE, { "filter.popularity.min": 0.5, "filter.popularity.max": 0.9 }, undefined, { b: "place" });
ins("filter-price-level", PLACE, { "filter.price_level.min": 1, "filter.price_level.max": 2 }, undefined, { b: "place" });
ins("filter-business-rating", PLACE, { "filter.properties.business_rating.min": 4, "filter.properties.business_rating.max": 5 }, undefined, { b: "place" });
ins("filter-qloo-rating", PLACE, { "filter.rating.min": 4, "filter.rating.max": 5 }, undefined, { b: "place" });
ins("filter-hotel-class", (e) => insights("urn:entity:place", { "signal.interests.entities": E.tartine, "filter.location.query": "New York", ...e }), { "filter.hotel_class.min": 4, "filter.hotel_class.max": 5 }, undefined, { b: "place" });
ins("filter-price-range-hotel", (e) => insights("urn:entity:place", { "signal.interests.entities": E.tartine, "filter.location.query": "New York", ...e }), { "filter.price_range.from": 100, "filter.price_range.to": 400 }, undefined, { b: "place" });
ins("filter-external-resy", PLACE, { "filter.external.exists": "resy" }, undefined, { b: "place" });
ins("filter-external-resy-rating", PLACE, { "filter.external.exists": "resy", "operator.filter.external.exists": "union", "filter.external.resy.rating.min": 4, "filter.external.resy.rating.max": 5, "filter.external.resy.count.min": 50, "filter.external.resy.count.max": 100000, "filter.external.resy.party_size.min": 2, "filter.external.resy.party_size.max": 8 }, undefined, { b: "place" });
ins("filter-external-tripadvisor", PLACE, { "filter.external.tripadvisor.rating.min": 4, "filter.external.tripadvisor.rating.max": 5, "filter.external.tripadvisor.rating.count.min": 100, "filter.external.tripadvisor.rating.count.max": 100000 }, undefined, { b: "place" });
ins("filter-exists-image", PLACE, { "filter.exists": "properties.image" }, undefined, { b: "place" });
ins("filter-references-brand", PLACE, { "filter.references_brand": E.patagonia, "operator.filter.references_brand": "union" }, undefined, { b: "place" });

// --- filters: media, people -------------------------------------------------------
ins("filter-content-rating", MOVIE, { "filter.content_rating": "R" }, undefined, { b: "movie" });
ins("filter-release-year", MOVIE, { "filter.release_year.min": 2015, "filter.release_year.max": 2025 }, undefined, { b: "movie" });
ins("filter-release-date", MOVIE, { "filter.release_date.min": "2020-01-01", "filter.release_date.max": "2025-12-31" }, undefined, { b: "movie" });
ins("filter-release-country", MOVIE, { "filter.release_country": ["FR"], "operator.filter.release_country": "union" }, undefined, { b: "movie" });
ins("filter-latest-known-year", TV, { "filter.latest_known_year.min": "2020", "filter.latest_known_year.max": "2026" }, undefined, { b: "tv" });
ins("filter-finale-year", TV, { "filter.finale_year.min": 2010, "filter.finale_year.max": 2020 }, undefined, { b: "tv" });
ins("filter-publication-year", BOOK, { "filter.publication_year.min": 1990, "filter.publication_year.max": 2010 }, undefined, { b: "book" });
ins("filter-date-of-birth", PERSON, { "filter.date_of_birth.min": "1960-01-01", "filter.date_of_birth.max": "1980-12-31" }, undefined, { b: "person" });
ins("filter-date-of-death", PERSON, { "filter.date_of_death.min": "1990-01-01", "filter.date_of_death.max": "2024-12-31" }, undefined, { b: "person" });
ins("filter-gender", ARTIST, { "filter.gender": "female" }, undefined, { b: "artist" });

// --- filters: tags / entities / paging ---------------------------------------------
ins("filter-tags-union", (e) => BOOK({ ...e }), { "filter.tags": () => [tagId("cozy"), tagId("mystery")].filter(Boolean), "operator.filter.tags": "union" }, undefined, { b: "book", needs: () => tagId("cozy") });
ins("filter-tags-intersection", (e) => BOOK({ ...e }), { "filter.tags": () => [tagId("cozy"), tagId("mystery")].filter(Boolean), "operator.filter.tags": "intersection" }, undefined, { b: "book", needs: () => tagId("cozy") && tagId("mystery") });
ins("filter-exclude-tags-intersection", BOOK, { "filter.exclude.tags": () => [tagId("cozy"), tagId("mystery")].filter(Boolean), "operator.filter.exclude.tags": "intersection" }, undefined, { b: "book", needs: () => tagId("cozy") });
ins("filter-results-tags", BOOK, { "filter.results.tags": () => tagId("cozy") }, undefined, { b: "book", needs: () => tagId("cozy") });
ins("filter-tag-types", (e) => insights("urn:tag", { "signal.interests.entities": E.radiohead, ...e }), { "filter.tag.types": "urn:tag:genre:media" }, undefined, { b: "artist" });
ins("filter-query", ARTIST, { "filter.query": "radio" }, undefined, { b: "artist" });
ins("filter-entities-query", ARTIST, { "filter.entities.query": "Thom Yorke" }, undefined, { b: "artist" });
ins("filter-results-entities-query", ARTIST, { "filter.results.entities.query": "Beck" }, undefined, { b: "artist" });
ins("filter-exclude-entities", ARTIST, { "filter.exclude.entities": () => ctx.seeds.topArtist }, undefined, { b: "artist", needs: () => ctx.seeds.topArtist });
ins("paging-offset", ARTIST, { offset: 5 }, undefined, { b: "artist" });
ins("paging-page-2", ARTIST, { page: 2 }, undefined, { b: "artist" });

// --- heatmaps --------------------------------------------------------------------------
ins("heatmap-boundary-locality", HEAT, { "output.heatmap.boundary": "urn:entity:locality" }, undefined, { b: "heatmap" });
ins("heatmap-boundary-geohash", HEAT, { "output.heatmap.boundary": "urn:geohash" }, undefined, { b: "heatmap" });
ins("heatmap-dimensions", HEAT, { "heatmap.dimensions": ["quality", "popularity", "price_level"] }, undefined, { b: "heatmap" });
ins("heatmap-dimension-price-filter", HEAT, { "heatmap.dimensions": "price_level", "filter.dimensions.price_level": [1, 2] }, undefined, { b: "heatmap" });
ins("heatmap-dimension-hotel-filter", HEAT, { "heatmap.dimensions": "hotel_class", "filter.dimensions.hotel_class": [4, 5] }, undefined, { b: "heatmap" });

// --- other endpoints -------------------------------------------------------------------------
step("search-place-geo", "/search", { query: "coffee", types: "urn:entity:place", "filter.location": "37.7749,-122.4194", "filter.radius": 2, sort_by: "distance", take: 10 }, { x: ["filter.location", "filter.radius", "sort_by"] });
step("search-place-filters", "/search", { query: "restaurant", types: "urn:entity:place", "filter.rating": 4, "filter.popularity": 0.5, "filter.address": "San Francisco", "filter.exists": "external.resy", take: 10 }, { x: ["filter.rating", "filter.popularity", "filter.address", "filter.exists"] });
step("search-sort-popularity-page2", "/search", { query: "pizza", types: "urn:entity:place", sort_by: "popularity", page: 2, take: 5 }, { x: ["sort_by", "page"] });
step("search-tags-operator", "/search", { query: "bar", types: "urn:entity:place", "filter.tags": () => [tagId("wine")].filter(Boolean), "operator.filter.tags": "union", take: 5 }, { x: ["operator.filter.tags"], needs: () => tagId("wine") });
step("entities-external-musicbrainz", "/entities", { "external.musicbrainz.ids": "a74b1b7f-71a5-4011-9441-d0b5e4122711" }, { x: ["external.musicbrainz.ids"] });
step("entities-external-wikidata", "/entities", { "external.wikidata.ids": "Q44190" }, { x: ["external.wikidata.ids"] });
step("entities-external-imdb", "/entities", { "external.imdb.ids": "tt2278388" }, { x: ["external.imdb.ids"] });
step("entities-external-spotify", "/entities", { "external.spotify.ids": "4Z8W4fKeB5YxbusRsdQVPb" }, { x: ["external.spotify.ids"] });
step("tags-typo-tolerance", "/v2/tags", { "filter.query": "Mediteranean", "feature.typo_tolerance": true, take: 5 }, { x: ["feature.typo_tolerance"] });
step("tags-no-typo-tolerance", "/v2/tags", { "filter.query": "Mediteranean", take: 5 }, { x: [] });
step("tags-by-type", "/v2/tags", { "filter.query": "pop", "filter.tag.types": "urn:tag:genre:media", take: 5 }, { x: ["filter.tag.types"] });
step("tags-popularity", "/v2/tags", { "filter.query": "pop", "filter.popularity.min": 0.5, "filter.popularity.max": 1, take: 5 }, { x: ["filter.popularity.min", "filter.popularity.max"] });
step("tags-page-2", "/v2/tags", { "filter.query": "jazz", take: 5, page: 2 }, { x: ["page"] });
step("tags-results-tags", "/v2/tags", { "filter.results.tags": () => [tagId("cozy")].filter(Boolean), "filter.query": "cozy", take: 5 }, { x: ["filter.results.tags"], needs: () => tagId("cozy") });
step("tag-types-page-2", "/v2/tags/types", { page: 2, take: 5 }, { x: ["page"] });
step("audiences-by-type", "/v2/audiences", { "filter.audience.types": "urn:audience:communities", take: 5 }, { x: ["filter.audience.types"] });
step("audiences-by-id", "/v2/audiences", { "filter.results.audiences": () => ctx.audiences.slice(0, 2), take: 5 }, { x: ["filter.results.audiences"], needs: () => ctx.audiences[0] });
step("audiences-popularity", "/v2/audiences", { "filter.audience.types": "urn:audience:communities", "filter.popularity.min": 0.3, "filter.popularity.max": 1, take: 5 }, { x: ["filter.popularity.min", "filter.popularity.max"] });
step("audiences-page-2", "/v2/audiences", { "filter.audience.types": "urn:audience:communities", take: 3, page: 2 }, { x: ["page"] });
step("audience-types-page-2", "/v2/audiences/types", { page: 2, take: 3 }, { x: ["page"] });
const COMPARE = (extra) => ({ "a.signal.interests.entities": E.radiohead, "b.signal.interests.entities": E.taylor, take: 10, ...extra });
step("compare-base", "/v2/analysis/compare", COMPARE(), { x: [] });
step("compare-model-descriptive", "/v2/analysis/compare", COMPARE({ model: "descriptive" }), { x: ["model"], vs: "compare-base" });
step("compare-model-predictive", "/v2/analysis/compare", COMPARE({ model: "predictive" }), { x: ["model"], vs: "compare-base" });
step("compare-subtype-genre", "/v2/analysis/compare", COMPARE({ "filter.subtype": "urn:tag:genre" }), { x: ["filter.subtype"], vs: "compare-base" });
step("compare-paging", "/v2/analysis/compare", COMPARE({ offset: 5, page: 2 }), { x: ["offset", "page"], vs: "compare-base" });
step("compare-location-radius", "/v2/analysis/compare", COMPARE({ "filter.location.query": "London", "filter.location.radius": 5000, "filter.exclude.location.query": "Camden", "filter.exclude.location.radius": 1000 }), { x: ["filter.location.radius", "filter.exclude.location.query", "filter.exclude.location.radius"], vs: "compare-base" });
step("compare-entities-query", "/v2/analysis/compare", COMPARE({ "filter.entities.query": "Thom Yorke" }), { x: ["filter.entities.query"], vs: "compare-base" });
const TREND = (extra) => ({ "filter.type": "urn:entity:artist", "signal.interests.entities": E.radiohead, "filter.start_date": "2026-01-01", "filter.end_date": "2026-09-30", take: 5, ...extra });
step("trending-base", "/v2/trending", TREND(), { x: [] });
step("trending-offset", "/v2/trending", TREND({ offset: 3 }), { x: ["offset"], vs: "trending-base" });
step("trending-page-2", "/v2/trending", TREND({ page: 2 }), { x: ["page"], vs: "trending-base" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const resolveValue = (value) => (typeof value === "function" ? value() : value);
const resolveParams = (params) => Object.fromEntries(Object.entries(typeof params === "function" ? params() : params).map(([k, v]) => [k, resolveValue(v)]));
const names = (items) => items.map(label);
const md = (text = "") => String(text).replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 260);
const errorText = (res) => (res.error ? `network error: ${res.error}` : res.body?.errors?.[0]?.message ?? res.body?.error?.message ?? res.body?.message ?? JSON.stringify(res.body).slice(0, 200));

function compare(items, baseItems) {
  if (!baseItems) return "";
  if (!items.length && !baseItems.length) return "both empty";
  const a = names(items), b = names(baseItems);
  if (a.join("|") === b.join("|")) return "same as baseline";
  const overlap = a.filter((n) => b.includes(n)).length;
  return `differs (${overlap}/${Math.max(a.length, b.length)} items shared)`;
}

async function seed(config) {
  const tags = async (key, query) => {
    const res = await qlooGet(config, "/v2/tags", { "filter.query": query, "feature.semantic_search": true, take: 3 });
    ctx.tag[key] = firstList(res.body).items[0];
  };
  await tags("cozy", "cozy"); await tags("mystery", "mystery"); await tags("wine", "wine bar");
  const aud = await qlooGet(config, "/v2/audiences", { "filter.parents.types": "urn:audience:communities", take: 3 });
  ctx.audiences = firstList(aud.body).items.map((a) => a.id ?? a.audience_id ?? a.entity_id).filter(Boolean);
  const top = await qlooGet(config, "/v2/insights", ARTIST({ take: 3 }));
  ctx.seeds.topArtist = firstList(top.body).items[0]?.entity_id;
}

async function main() {
  const config = loadConfig();
  if (!config.apiKey) {
    console.error("No Qloo key. Set QLOO_API_KEY (or API_Key) in the environment.");
    return 2;
  }
  const outDir = join(RESULTS_DIR, "rest");
  await mkdir(outDir, { recursive: true });
  console.error(`Probing ${config.baseUrl} (${steps.length} parameter steps)\n`);
  await seed(config);

  const rows = [], listsByStep = {}, exercised = new Map();
  for (const s of steps) {
    if (only && !s.name.includes(only) && !s.name.startsWith("base-") && !s.name.endsWith("-base")) continue;
    if (s.needs && !s.needs()) {
      rows.push({ ...s, status: "SKIP", note: "missing input (tag/audience lookup returned nothing)" });
      console.error(`SKIP ${s.name}`);
      continue;
    }
    const params = resolveParams(s.params);
    const res = await qlooGet(config, s.path, params);
    if (res.status === 0 && rows.every((r) => r.status === "NET" || r.status === "SKIP")) {
      console.error(`Cannot reach ${config.baseUrl}: ${res.error}. Stopping.`);
      return 3;
    }
    const { kind, items } = firstList(res.body);
    listsByStep[s.name] = items;
    const change = res.ok ? compare(items, listsByStep[s.vs]) : "";
    const note = res.ok ? `${items.length} ${kind ?? "items"}: ${names(items).slice(0, 4).join(" · ")}` : `error: ${errorText(res)}`;
    rows.push({ ...s, params, status: res.status || "NET", ms: res.ms, count: items.length, change, note });
    for (const name of s.x ?? []) {
      const key = `${s.path} ${name}`;
      const prev = exercised.get(key);
      exercised.set(key, res.ok || prev === "ok" ? "ok" : "rejected");
    }
    console.error(`${String(res.status || "NET").padEnd(4)} ${String(res.ms).padStart(5)}ms ${s.name} — ${change ? change + " — " : ""}${note.slice(0, 110)}`);
    await writeFile(join(outDir, `param-${s.name}.json`), redact({ request: { path: s.path, params }, response: res }, config.apiKey));
    if (res.status === 429) await sleep(5000);
    await sleep(delayMs);
  }

  // Coverage against the reference built from the Qloo docs.
  const reference = JSON.parse(await readFile(join(ROOT, "reference", "endpoints.json"), "utf8")).endpoints;
  const probeRestSource = await readFile(join(ROOT, "probe-rest.mjs"), "utf8");
  const coverage = reference.map((e) => {
    const rest = e.parameters.filter((p) => probeRestSource.includes(`"${p.name}"`) || new RegExp(`\\b${p.name.replace(/\./g, "\\.")}\\b`).test(probeRestSource));
    const names = new Set(rest.map((p) => p.name));
    const worked = [], rejected = [], untested = [];
    for (const p of e.parameters) {
      const state = exercised.get(`${e.path} ${p.name}`);
      if (state === "ok") worked.push(p.name);
      else if (state === "rejected") rejected.push(p.name);
      else if (names.has(p.name)) worked.push(p.name);
      else untested.push(p.name);
    }
    return { path: e.path, total: e.parameters.length, worked, rejected, untested };
  });

  const ok = rows.filter((r) => typeof r.status === "number" && r.status < 400).length;
  const report = [
    "# Parameter probe report",
    "",
    `- Base URL: \`${config.baseUrl}\``,
    `- Run at: ${new Date().toISOString()}`,
    `- Result: **${ok}/${rows.length} steps returned 2xx**. A 400 is useful information: it means the parameter is not valid in that combination (see Result column).`,
    "",
    "Raw responses: `results/rest/param-<step>.json` (also browsable in the web UI).",
    "",
    "| Step | Endpoint | Parameters exercised | HTTP | ms | vs baseline | Result |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...rows.filter((r) => !r.name.startsWith("base-")).map((r) => `| ${r.name} | \`${r.path}\` | ${md((r.x ?? []).join(", "))} | ${r.status} | ${r.ms ?? ""} | ${r.change ?? ""} | ${md(r.note)} |`),
    "",
    "## Parameter coverage (from reference/endpoints.json)",
    "",
    "| Endpoint | Parameters | Worked | Rejected (400) | Never exercised |",
    "| --- | --- | --- | --- | --- |",
    ...coverage.map((c) => `| \`${c.path}\` | ${c.total} | ${c.worked.length} | ${c.rejected.length ? c.rejected.join(", ") : "0"} | ${c.untested.length ? c.untested.join(", ") : "0"} |`),
    "",
  ].join("\n");
  await writeFile(join(RESULTS_DIR, "PARAMS_REPORT.md"), redact(report, config.apiKey));
  console.error(`\n${ok}/${rows.length} ok. Report: results/PARAMS_REPORT.md`);
  for (const c of coverage) console.error(`${c.path.padEnd(22)} worked ${c.worked.length}/${c.total}, rejected ${c.rejected.length}, untested ${c.untested.length}`);
  return 0;
}

process.exitCode = await main();
