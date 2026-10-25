# Qloo API — what it can actually do

Sources: the official kit (`github.com/qloo/qloo-hackathon-kit`) and the source of
`@qloo/qloo-harness@0.1.26` (the npm package the kit tells us to use).
Live calls to `hackathon.api.qloo.com` have **not** been made yet; the cloud
sandbox's network policy blocks that host and `docs.qloo.com`. Everything below
is read from the official client code, not from observed responses.

## How we're allowed to call it

| Surface | What it is | Use for |
| --- | --- | --- |
| `qloo api <endpoint>` | Raw REST call, JSON out | Debugging, one-off lookups |
| `qloo exec <workflow>` | Validated workflow, normalized envelope | Backend without an LLM in the loop |
| `qloo mcp` | Local stdio MCP server, same workflows | Give the tools to our agent's model |
| `qloo explore` | Terminal chat agent | Exploring the data by hand |

Rules that shape the architecture:
- The key lives **only on a backend** (`QLOO_API_KEY` env var). Never in a browser or mobile bundle.
- `qloo mcp` is stdio, so the backend must be a **long-running Node ≥22.19 process on a VM or container**
  (Fly.io / Railway / Render / a VM). **Serverless is not supported** for this route.
- Max 20 results per call. Quota and rate limits are shared across all surfaces. Cache results.
- **No PII to Qloo** (names, emails, device IDs, location history). Results are *aggregate affinities*,
  never claims about an individual, and not for health, credit, housing, or employment decisions.

## Raw endpoints (seen in the harness)

| Endpoint | Purpose |
| --- | --- |
| `GET /search` | Find an entity by name (with `type`, `take`) |
| `GET /entities` | Look up entities by ID |
| `GET /v2/tags`, `/v2/tags/types` | Find tags (genres, moods, cuisines, styles…), with semantic search |
| `GET /v2/audiences`, `/v2/audiences/types` | Predefined audience segments |
| `GET /v2/insights` | **The core engine.** Recommendations from signals plus filters |
| `GET /v2/analysis/compare` | Compare two groups of entities |
| `GET /v2/trending` | Trending entities and popularity over time |

### `/v2/insights` parameters (the important one)
- **Output type** `filter.type`: `urn:entity:{artist, book, brand, movie, person, place, podcast, tv_show, videogame, locality, destination…}`,
  `urn:tag` (what characterizes the signals), `urn:demographics` (age and gender skew), `urn:heatmap` (geographic affinity)
- **Signals** (what to bias towards): `signal.interests.entities` (+ `.weight`), `signal.interests.tags` (+ `.weight`),
  `signal.location.query` (+ `.weight`), `signal.demographics.age`, `signal.demographics.gender`
- **Filters** (hard constraints): `filter.location.query`, `filter.tags`, `filter.exclude.tags`, `filter.tag.types`,
  `filter.query`, `filter.results.entities` (rank only these, which is how "rank a shortlist" works), `filter.start_date` / `end_date`
- **Features**: `feature.explainability` (why an item scored), `feature.semantic_search`

## Workflows / MCP tools (what our agent would call)

| Tool | Answers |
| --- | --- |
| `qloo_find_tags` | "Which Qloo tags mean *cozy mystery* / *natural wine bar* / *brutalist*?" |
| `qloo_describe` / `qloo_search` | Resolve "Wes Anderson" to an entity and its metadata |
| `qloo_recommend` | Fans of X (+ tags, + demographic, + location) also like **Y of type T**. Works across domains |
| `qloo_rank` | Rank **our own shortlist** for a taste profile, location, or audience |
| `qloo_where_popular` | Where is this entity loved, within a region (heatmap) |
| `qloo_compare_audiences` | How two fan bases overlap and differ |
| `qloo_audience_demographics` | Age and gender skew of an entity's audience |
| `qloo_entity_tags` | Which concepts characterize a set of entities (taste fingerprint) |
| `qloo_trends` | Popularity time series for 1–5 entities |

Every result has the same envelope: `status` ∈ `ok | empty | needs_input | partial | degraded | error`,
plus `summary`, `results`, and `error.{code,retryable,recovery}`. `needs_input` means the name was ambiguous,
so show the candidates to the user and let them pick.

## What's unique compared with an LLM alone

1. **Cross-domain taste transfer.** "Loves Studio Ghibli + Khruangbin" becomes real *restaurants in Lisbon*,
   *brands*, *books*. An LLM only free-associates here.
2. **Location-grounded places.** Real restaurants and venues filtered to a city, ranked by taste affinity.
3. **Audience intelligence.** Heatmaps, demographic skew, and audience comparison: data a small business or creator has no other way to get.
4. **Ranking a shortlist we supply.** That makes Qloo a *scoring function* inside an agent loop, not just a search box.
5. **Explainability.** It returns why an item matched, so the agent can cite evidence instead of hallucinating it.

## Unknowns to verify first (once network access is enabled)
- Entity coverage for **podcasts, brands, and localities** outside the US (it decides several ideas below).
- Whether `urn:heatmap` returns neighborhood-level or only city-level granularity.
- How restaurant/place metadata looks (address, price, hours, images?).
- Real latency and quota numbers.
