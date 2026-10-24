# Ideation: what to build on Qloo

The bar: **if it would work the same without Qloo, it's the wrong product.** Each idea
should have a real buyer with a recurring pain. The agent should use Qloo as an
evidence and scoring engine inside a loop, not as a single API call behind a chat box.

Scoring (1–5): **Q** = depends on Qloo · **B** = buyer and pain is real · **W** = demo wow ·
**F** = feasible in hackathon scope · **A** = agentic depth (multi-step, tools, decisions)

| # | Idea | Q | B | W | F | A | Total |
|---|------|---|---|---|---|---|------|
| 1 | **SponsorFit**: brand-sponsorship matchmaker for podcasters and creators | 5 | 5 | 4 | 4 | 5 | **23** |
| 2 | **Site Scout**: where to open, pop up, or tour, grounded in local taste | 5 | 4 | 5 | 4 | 4 | **22** |
| 3 | **Opening Brief**: a full cultural concept kit for a new venue | 5 | 4 | 5 | 3 | 4 | **21** |
| 4 | **Concierge-in-a-box** for boutique hotels and Airbnb hosts | 5 | 4 | 4 | 4 | 3 | 20 |
| 5 | **Gift agent**: cross-domain gift and experience finder from described tastes | 4 | 3 | 4 | 5 | 3 | 19 |
| 6 | **Reminiscence planner** for care homes (era- and culture-matched music, film, food activities) | 4 | 4 | 4 | 4 | 3 | 19 |
| 7 | **Group-chat decider** (Discord/Slack bot that ranks where and what for a group) | 4 | 2 | 4 | 4 | 4 | 18 |
| 8 | **Campaign culture brief** for marketers | 4 | 4 | 3 | 4 | 3 | 18 (this is Qloo's own core business, so judges have seen it) |
| 9 | **Cold-start taste onboarding** (MCP/SDK so any app can personalize from 3 answers) | 4 | 3 | 2 | 4 | 2 | 15 |

---

## 1. SponsorFit: sponsor matchmaking for creators ⭐ top pick

**Pain.** About 90% of podcasters and mid-size creators have no audience-insight data. They
pitch the same 10 brands (Squarespace, HelloFresh…) or wait on marketplaces. Brands
waste spend on bad-fit shows. An LLM can only guess the fit from the show's genre.

**What the agent does**
1. The creator enters their show, plus 3–5 shows or creators their audience also likes. Nothing personal.
2. `qloo_describe` resolves the podcast entities (`needs_input` brings up a picker if a name is ambiguous).
3. `qloo_audience_demographics` and `qloo_entity_tags` build an **audience taste fingerprint**.
4. `qloo_recommend target_type=brand` with those signals gives **brands with real affinity**. Exclude-tags drop
   categories the creator won't promote.
5. `qloo_compare_audiences` (creator vs. the brand's typical fans) gives a **fit score with explanations**.
6. The LLM writes a **media kit** and **per-brand pitch emails** that cite the Qloo evidence ("your
   listeners over-index on X, which aligns with brand Y's audience").
7. Loop: the creator rejects a brand, and the agent re-ranks with `qloo_rank` on the remaining shortlist.

**Why only Qloo.** Affinity between an audience and a brand *is* the product. Without it you have a pitch-email generator.
**Business.** Freemium for creators. Paid tier: unlimited pitches, a CRM, tracking. Second side: brands search for shows (marketplace).
**Risk to validate first.** Podcast coverage and brand coverage in Qloo. If podcasts are thin, pivot to
"YouTube/newsletter creator signals = the 5 artists, films, and brands your audience loves".

## 2. Site Scout: where to pop up, open, or tour

**Pain.** DTC brands, indie bands, food trucks, and franchise scouts choose cities and neighborhoods from gut feel or
costly foot-traffic data that says nothing about *taste*.

**Agent loop.** Concept input ("natural-wine bar with Japanese listening-room vibe") → `qloo_find_tags` and seed entities →
`qloo_where_popular within=<region>` heatmap → `qloo_rank` candidate localities → for the top 3, `qloo_recommend place`
with `filter_location` to find **adjacent venues and competitors** and `qloo_audience_demographics`. Output: a
**map and a scored shortlist with "why here" evidence** and a launch checklist (local partner brands, local music acts for the opening night).
**Why only Qloo.** Taste heatmaps per region. **Wow.** A map lights up live as the agent works.
**Risk.** Heatmap granularity (city vs. neighborhood).

## 3. Opening Brief: cultural concept kit for a new venue

For restaurant, café, boutique-hotel, or shop founders and the interior designers and branding agencies who serve them.
Inputs: location + 3 references ("feels like Tartine meets Wes Anderson"). Agent output: local audience profile,
**music direction** (artists that fit audience *and* concept), **design and brand references**, menu or merch cues
from the local cuisine affinity, partner brands for collabs, and an "avoid" list. It can be combined with #2 as one
product: *"Where to open, and what it should feel like."*

## 4. Concierge-in-a-box (boutique hotels, Airbnb hosts)

At check-in a guest taps 3 things they love (a film, an artist, a food). The agent gives hyper-local restaurants, bars, and
venues with `filter_location` and cross-domain signals, plus a daily plan. The host buys it per property per month.
Clear B2B SaaS. The demo is good but resembles trip planners (a crowded space).

## 5–9 (backup ideas)
- **Gift agent.** Strong cross-domain demo ("dad: Clint Eastwood, jazz, BBQ" gives a book, a vinyl, a brand, a local restaurant). Seasonal, weaker business.
- **Reminiscence planner.** Care-home staff enter the decade a resident grew up in, the region, and loves. The agent outputs music, film, and food
  activities. Social impact. Must stay away from health inference (Qloo safe-use rules).
- **Group-chat decider.** Fun, viral. Monetization is hard.
- **Campaign culture brief.** Real buyer, but it duplicates Qloo's own product.
- **Cold-start onboarding SDK.** Good infrastructure play, weak for a judge to "try end-to-end".

---

## Recommendation

Shortlist **#1 SponsorFit** and **#2+#3 merged ("Site Scout + Opening Brief")**. Pick between them after a
**1-hour data spike** against the live API:

| Check | Query | Kills / confirms |
| --- | --- | --- |
| Podcast coverage | `qloo api search --query "<10 podcasts of varying size>" --type podcast` | #1 |
| Podcast → brand affinity quality | `qloo_recommend target_type=brand signals=[3 podcasts]` | #1 |
| Podcast demographics | `qloo_audience_demographics entity=<podcast>` | #1 |
| Heatmap granularity | `qloo_where_popular entity=<restaurant or artist> within="New York"` | #2 |
| Place metadata richness | `qloo_recommend target_type=place filter_location="Lisbon" signals=[...]` | #2/#3 |
| Cross-domain quality | Artist/film signals → `place` and `brand` outputs | all |

Default lean: **SponsorFit**. It has the clearest "money changes hands" story, the sharpest
"impossible without Qloo" argument, and a deep agent loop. Site Scout is the backup with the better visual demo.

## Architecture (either idea)
- Next.js frontend → **Node backend on a container host** (Fly.io/Railway) running `qloo mcp` over stdio with `QLOO_API_KEY` as a secret.
- An agent loop (Claude tool use) gets the `qloo mcp` tool list. A results cache (SQLite/Redis) keyed by request saves quota.
- Every claim in the UI shows its **Qloo provenance** (which tool, which signals). That is part of the judging rubric.
- An open-source license file and a public repo, as the submission requires.
