# Qloo Explorer

A throwaway app for testing every Qloo endpoint before we commit to a product idea.

| Piece | What it does |
| --- | --- |
| `probe-rest.mjs` | Calls all 10 GET endpoints (`/`, `/search`, `/entities`, `/v2/tags`, `/v2/tags/types`, `/v2/audiences`, `/v2/audiences/types`, `/v2/insights`, `/v2/analysis/compare`, `/v2/trending`) and every `/v2/insights` output: 9 entity types, places in a city, `urn:tag`, `urn:demographics`, `urn:heatmap`, explainability, tag/demographic signals, exclude-tags, shortlist ranking. IDs found by search feed later steps. Includes checks for the SponsorFit (podcast → brand) and Site Scout (heatmap) ideas. |
| `probe-mcp.mjs` | Starts the official `qloo mcp` server (`@qloo/qloo-harness`) and calls every tool it exposes, plus a few idea checks. |
| `server.mjs` | Web UI at `http://localhost:3000` with three tabs: **Reference** (every endpoint and MCP tool with all allowed parameters and values, plus the saved calls for each), **All saved results** (searchable table of everything in `results/`, click a row for cards and full JSON), and **Playground** (run live calls). The key stays on the server. |
| `scripts/build-reference.mjs` | Rebuilds `reference/endpoints.json` from the official Qloo docs (needs network; output is committed). |
| `test/` | Offline plumbing tests against a local **stub** (fake data). They check our code, not Qloo. |

Outputs: `results/REST_REPORT.md`, `results/MCP_REPORT.md`, and raw JSON per step in `results/rest/` and `results/mcp/`.

## Run it locally

Requires Node ≥ 22.19.

```sh
cd explorer
npm install
export QLOO_API_KEY=...            # never commit it
export QLOO_BASE_URL=https://hackathon.api.qloo.com
npm run probe        # REST + MCP probes → results/
npm start            # playground on :3000
npm test             # offline tests (no key needed)
```

`API_Key` / `Server_URL` (this repo's cloud env names) work as fallbacks.
Options: `node probe-rest.mjs --only heatmap` runs only the matching steps. `--delay 500` sets the delay between calls in ms (default 300).

## Run it in GitHub Actions

`.github/workflows/qloo-probe.yml` runs the probes on every push that touches `explorer/`, or on demand
(Actions → *Qloo probe* → Run workflow). It commits the reports back to `explorer/results/`.
One-time setup: add the repository secret **`QLOO_API_KEY`** (Settings → Secrets and variables → Actions).
Without the secret, the workflow runs only the offline tests.

## Quota

A full run makes 53 REST calls and about 14 MCP calls (each MCP call makes 1–4 REST calls to resolve names). Don't loop it.
