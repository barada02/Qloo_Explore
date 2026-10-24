# Qloo exploration findings

What we learned by calling `hackathon.api.qloo.com` for real (October 2026).
Evidence lives in `explorer/results/` and can be browsed in the explorer UI
(`cd explorer && npm start`, then http://localhost:3000). Reports:
`REST_REPORT.md`, `MCP_REPORT.md`, `PARAMS_REPORT.md`.

## Status

| Probe | Calls | Result |
| --- | --- | --- |
| REST endpoints (`probe-rest.mjs`) | 53 | 53 ok |
| MCP tools (`probe-mcp.mjs`) | 14 | 13 ok, 1 intentional `needs_input` |
| Optional parameters (`probe-params.mjs`) | 107 | 105 ok, 2 POST-only parameters rejected on GET |

## The API in one page

Qloo has **9 data endpoints plus `/`** (version/health info, currently `2.1.965`).
There is no LLM inside Qloo: it returns taste data, and our agent supplies the reasoning.

| Endpoint | Gives you |
| --- | --- |
| `/search` | Name to entity UUID. Types: artist, book, brand, movie, person, place, podcast, tv_show, videogame, locality, destination (+ legacy actor, album, author, director) |
| `/entities` | Entity details by Qloo id or by external id (MusicBrainz, IMDb, Spotify work; Wikidata returned nothing) |
| `/v2/tags`, `/v2/tags/types` | Tag search (semantic and typo-tolerant), 20 tag types |
| `/v2/audiences`, `/v2/audiences/types` | Predefined audience communities (AAPI, Latino, LGBTQ, Black...) and their types |
| `/v2/insights` | The engine: recommendations of any entity type, plus `urn:tag`, `urn:demographics`, `urn:heatmap` outputs. 105 parameters |
| `/v2/analysis/compare` | What differs between two groups of entities (tags) |
| `/v2/trending` | Weekly popularity series (percentile, rank, velocity) |

`qloo mcp` wraps these into 10 tools (`qloo_recommend`, `qloo_rank`, `qloo_describe`,
`qloo_where_popular`, `qloo_compare_audiences`, `qloo_audience_demographics`,
`qloo_entity_tags`, `qloo_trends`, `qloo_find_tags`, `qloo_capabilities`) that resolve
names to ids and return one envelope format (`ok | empty | needs_input | partial | degraded | error`).

## Things that will bite us

- **Names are ambiguous.** "Radiohead" is an artist, a person and an album; "Tartine Bakery" is two places.
  MCP tools answer `needs_input` with candidates. Resolve to a UUID first (`/search`), then pass UUIDs.
- **Required parameters not obvious from the name.** `/v2/audiences` needs at least one filter.
  `/v2/trending` needs `signal.interests.entities`, `filter.type`, `filter.start_date`, `filter.end_date`.
- **The docs are wrong in places** (the API's error messages are the truth):
  - `signal.interests.entities.include` is a **boolean**, not a list of ids.
  - `output.heatmap.boundary` accepts `urn:geohash` or `urn:entity:locality`, not "city"/"neighborhood".
  - `/search` `filter.location` must be `lat,lon`; `/v2/insights` accepts WKT `POINT(lon lat)`.
- **Limits:** 10 requests/second, 50,000/month (see `x-*-ratelimit-*` headers), max 20 results per MCP call.
- **Latency varies a lot.** Most calls 0.3 to 1.5 s. Slow: artist recommendations 3 s, weight tuning 7 to 8 s,
  exclude-location 9 s, `signal.location` 12 s, `diversify.by` over a whole state 20 s.
  Cache, and show progress in the UI.
- **Place recommendations lean toward landmarks** when the seed is a person or film (Lisbon test returned churches
  and viewpoints). Seeding with a place (e.g. a bakery) gives restaurants and cafes.
- `qloo mcp` is a stdio child process. It needs a long-running Node process, not serverless.
  See the hosting section below for the way around that.

## What the optional parameters actually do

Measured against a baseline call; "differs" means the result list changed.

**Changes results:** `bias.quality`, `bias.content_based` (0 vs 1 gives very different artists),
`sort_by=quality|distance`, `diversify.by` (city, metro), `backfill.*.take`, all `*.weight` parameters,
`signal.demographics.audiences`, `signal.location` (+radius), `signal.interests.entities.include=true`,
`operator.signal.interests.tags`, location filters (`filter.location` + radius, geohash, exclude-location variants),
`filter.address`, `filter.hours`, `filter.popularity.*`, `filter.price_level.*`, hotel class and price range,
Resy and Tripadvisor filters, `filter.references_brand`, `filter.exclude.entities`, movie/TV/book/person
date and year filters, `filter.content_rating`, `offset`, `page`, `filter.tag.types`,
`output.heatmap.boundary=urn:entity:locality` (returns named neighborhoods), `heatmap.dimensions` (+ dimension filters).

**No visible effect in our tests (may be no-ops for that case, not proven useless):**
`bias.trends` (movies), `sort_by=rating`, `diversify.by=subtype`, `filter.gender`, `filter.exists=properties.image`,
`filter.properties.business_rating.*`, `filter.rating.*`, `filter.release_date.*`, `filter.query`,
`filter.exclude.tags` with intersection, and every tested `/v2/analysis/compare` option (`model`, `filter.subtype`,
paging, location radius).

**Returned empty (probably wrong value format, retest):** `filter.geocode.*`, `filter.location.metro`,
`filter.release_country`, `filter.tags` with two tags as intersection, `/v2/audiences` popularity filter,
`/entities` by Wikidata id.

**Strong results for product ideas:**
- Podcast to brand fit works: Huberman Lab audience gave Onnit, Whoop, Rivian, Atom Finance.
- Demographics (`urn:demographics`) and taste tags (`urn:tag`) work per entity.
- Heatmaps are real: 2,158 points for San Francisco, 11,864 for the United States, locality names available.
- Explainability (`feature.explainability`) works on recommendations.
- Rank-a-shortlist works (`filter.results.entities`, or MCP `qloo_rank`).
- Audience segments can be used as a signal and compared.

## Not tested yet

- POST-only parameters: `filter.entities.query`, `filter.results.entities.query`,
  `filter.exclude.entities.query`, `signal.interests.entities.query` (the explorer client is GET only).
- 18 `/entities` `external.*` id types (we have no real ids for them).
- Quality of results for non-English or niche entities; stability of results over time.

## LLM integration plan (proposed, not started)

Goal: an agent that is clearly better because of Qloo (hackathon rule: it must not work the same without Qloo).

- **Model:** Google Gemini, called through the Vercel AI SDK (`ai` + `@ai-sdk/google`) with function calling.
  The model decides which Qloo tool to call; Qloo supplies the facts; Gemini writes the answer and explains the "why".
- **Qloo access:** the harness package exports `createDirectQlooWorkflowExecutorFromEnvironment` and `createQlooTools`,
  which run the same workflows in-process (no stdio child), so they can run on serverless. Fallback: our own thin
  tools over the REST client in `explorer/lib/rest.mjs`. Verify before relying on it.
- **Hosting:** Vercel fits the "live hosted demo" requirement. Keep the Qloo and Gemini keys in Vercel environment
  variables, never in the browser. Set a long `maxDuration` on the agent route (Qloo calls can take 20 s), cache Qloo
  responses, and rate-limit per visitor so a public demo does not burn the 50,000/month quota.
- **Proof it beats a plain LLM:** build an A/B view in the demo (same question answered with and without Qloo).
- **Submission checklist:** public repo, open-source license file, live URL, text description (see `Hackathon_info`).
