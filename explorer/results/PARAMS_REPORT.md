# Parameter probe report

- Base URL: `https://hackathon.api.qloo.com`
- Run at: 2026-10-24T17:45:05.591Z
- Result: **105/107 steps returned 2xx**. A 400 is useful information: it means the parameter is not valid in that combination (see Result column).

Raw responses: `results/rest/param-<step>.json` (also browsable in the web UI).

| Step | Endpoint | Parameters exercised | HTTP | ms | vs baseline | Result |
| --- | --- | --- | --- | --- | --- | --- |
| bias-trends-high | `/v2/insights` | bias.trends | 200 | 1878 | same as baseline | 10 entities: Whiplash · Birdman or (The Unexpected Virtue of Ignorance) · The Wolf of Wall Street · Boyhood |
| bias-trends-off | `/v2/insights` | bias.trends | 200 | 1548 | same as baseline | 10 entities: Whiplash · Birdman or (The Unexpected Virtue of Ignorance) · The Wolf of Wall Street · Boyhood |
| bias-content-based-0 | `/v2/insights` | bias.content_based | 200 | 854 | differs (9/10 items shared) | 10 entities: Beck · Thom Yorke · Arcade Fire · Interpol |
| bias-content-based-1 | `/v2/insights` | bias.content_based | 200 | 906 | differs (1/10 items shared) | 10 entities: On a Friday · No-Man · Oceansize · Steven Wilson |
| bias-quality-high | `/v2/insights` | bias.quality | 200 | 748 | differs (4/10 items shared) | 10 entities: b. patisserie · Arsicault Bakery · Outerlands · Neighbor Bakehouse |
| sort-by-rating | `/v2/insights` | sort_by | 200 | 679 | same as baseline | 10 entities: b. patisserie · Over The Moon Creamery · Cassava San Francisco · Souvla |
| sort-by-quality | `/v2/insights` | sort_by | 200 | 647 | differs (0/10 items shared) | 10 entities: San Francisco Flower Delivery by Rossi & Rovetti · Hotel Drisco Pacific Heights · Sonder HQ · Golden Gate View Point |
| sort-by-distance | `/v2/insights` | sort_by, filter.location | 200 | 721 | differs (0/10 items shared) | 10 entities: Baker Beach · Alcatraz Island · Mission Dolores Park · SFMOMA Museum Store |
| diversify-city | `/v2/insights` | diversify.by, diversify.take | 200 | 20547 | differs (2/10 items shared) | 10 entities: b. patisserie · Over The Moon Creamery · Dad's Luncheonette · Salsalito Taco Shop |
| diversify-metro | `/v2/insights` | diversify.by, diversify.take | 200 | 20331 | differs (2/10 items shared) | 8 entities: b. patisserie · Over The Moon Creamery · Rolling-Out · Sqirl |
| diversify-subtype | `/v2/insights` | diversify.by, diversify.take | 200 | 437 | same as baseline | 10 entities: Onnit · Whoop · The Ready State · Vivobarefoot |
| backfill-cross-domain | `/v2/insights` | backfill.cross_domain.take | 200 | 419 | differs (0/10 items shared) | 10 entities: Rocky Road to Berlin · Fyre Rises · Parthenope · Ambajipeta Marriage Band |
| backfill-content-based | `/v2/insights` | backfill.content_based.take | 200 | 421 | differs (0/10 items shared) | 10 entities: Rocky Road to Berlin · Fyre Rises · Parthenope · Ambajipeta Marriage Band |
| weight-entities-low | `/v2/insights` | signal.interests.entities.weight | 200 | 7800 | differs (0/10 items shared) | 10 entities: Fiona Apple · I Love You But I've Chosen Darkness · Zwan · The Bravery |
| weight-age | `/v2/insights` | signal.demographics.age.weight | 200 | 7350 | differs (0/10 items shared) | 10 entities: Modest Mouse · John Frusciante · Bloc Party · Arctic Monkeys |
| weight-gender | `/v2/insights` | signal.demographics.gender.weight | 200 | 7921 | differs (2/10 items shared) | 10 entities: Arctic Monkeys · Death Cab for Cutie · The Bravery · Fiona Apple |
| weight-tags | `/v2/insights` | signal.interests.tags.weight | 200 | 1900 | differs (9/10 items shared) | 10 entities: Paul McCartney: The Life · John Lennon 1980: The Last Days in the Life · The John Lennon Letters · Tune In (The Beatles: All These Years, #1) |
| operator-signal-tags-intersection | `/v2/insights` | operator.signal.interests.tags | 200 | 9973 | differs (8/10 items shared) | 10 entities: Paul McCartney: The Life · The John Lennon Letters · Tune In (The Beatles: All These Years, #1) · Conversations with McCartney |
| signal-audience | `/v2/insights` | signal.demographics.audiences | 200 | 3173 | differs (5/10 items shared) | 10 entities: Onnit · Zen Planner · Multidisciplinary Association for Psychedelic Studies · Crossfit |
| signal-audience-weight | `/v2/insights` | signal.demographics.audiences, signal.demographics.audiences.weight | 200 | 629 | differs (2/10 items shared) | 10 entities: Zen Planner · Onnit · Multidisciplinary Association for Psychedelic Studies · Red Rock Deli |
| signal-location-wkt | `/v2/insights` | signal.location, signal.location.radius, signal.location.weight, signal.interests.entities | 200 | 12347 | differs (2/10 items shared) | 10 entities: Over The Moon Creamery · Cassava San Francisco · Zazie · Jane The Bakery |
| signal-interests-include | `/v2/insights` | signal.interests.entities.include | 200 | 3445 | differs (9/10 items shared) | 10 entities: Radiohead · Thom Yorke · Beck · Arcade Fire |
| filter-address | `/v2/insights` | filter.address | 200 | 527 | differs (0/10 items shared) | 10 entities: SPARK Social SF · Emmy's Spaghetti Shack · Foreign Cinema · La Oaxaqueña |
| filter-geocode-name | `/v2/insights` | filter.geocode.name, filter.geocode.country_code, filter.geocode.admin1_region | 200 | 1461 | differs (0/10 items shared) | 0 entities:  |
| filter-geocode-admin2 | `/v2/insights` | filter.geocode.admin2_region | 200 | 4791 | differs (0/10 items shared) | 0 entities:  |
| filter-location-metro | `/v2/insights` | filter.location.metro | 200 | 4733 | differs (0/10 items shared) | 0 entities:  |
| filter-location-wkt-radius | `/v2/insights` | filter.location, filter.location.radius | 200 | 392 | differs (3/10 items shared) | 10 entities: Souvla · Farm : Table · Elephant Sushi · Jane on Larkin |
| filter-location-geohash | `/v2/insights` | filter.location.geohash | 200 | 655 | differs (7/10 items shared) | 10 entities: b. patisserie · Souvla · Fillmore Bakeshop · Farm : Table |
| filter-exclude-location-query | `/v2/insights` | filter.exclude.location.query | 200 | 8949 | differs (0/10 items shared) | 10 entities: Dad's Luncheonette · Hog Island Oyster General Store · El Sur Empanadas · The Marshall Store |
| filter-exclude-location-wkt | `/v2/insights` | filter.exclude.location, filter.exclude.location.radius | 200 | 8698 | differs (0/10 items shared) | 10 entities: Dad's Luncheonette · Hog Island Oyster General Store · El Sur Empanadas · The Marshall Store |
| filter-exclude-location-geohash | `/v2/insights` | filter.exclude.location.geohash | 200 | 9075 | differs (4/10 items shared) | 10 entities: Over The Moon Creamery · Cassava San Francisco · Gamine · Cassava San Francisco |
| filter-hours-monday | `/v2/insights` | filter.hours | 200 | 608 | differs (6/10 items shared) | 10 entities: Over The Moon Creamery · Cassava San Francisco · Souvla · Farm : Table |
| filter-popularity-range | `/v2/insights` | filter.popularity.min, filter.popularity.max | 200 | 590 | differs (3/10 items shared) | 10 entities: Over The Moon Creamery · Fillmore Bakeshop · Gamine · Gioia Pizzeria |
| filter-price-level | `/v2/insights` | filter.price_level.min, filter.price_level.max | 200 | 596 | differs (10/10 items shared) | 10 entities: b. patisserie · Over The Moon Creamery · Cassava San Francisco · Souvla |
| filter-business-rating | `/v2/insights` | filter.properties.business_rating.min, filter.properties.business_rating.max | 200 | 655 | same as baseline | 10 entities: b. patisserie · Over The Moon Creamery · Cassava San Francisco · Souvla |
| filter-qloo-rating | `/v2/insights` | filter.rating.min, filter.rating.max | 200 | 700 | same as baseline | 10 entities: b. patisserie · Over The Moon Creamery · Cassava San Francisco · Souvla |
| filter-hotel-class | `/v2/insights` | filter.hotel_class.min, filter.hotel_class.max | 200 | 541 | differs (0/10 items shared) | 10 entities: Wyndham Garden Chinatown · The Marlton Hotel · Park Terrace Hotel · NobleDen Hotel |
| filter-price-range-hotel | `/v2/insights` | filter.price_range.from, filter.price_range.to | 200 | 590 | differs (0/10 items shared) | 10 entities: The Marlton Hotel · Park Terrace Hotel · NobleDen Hotel · citizenM New York Bowery |
| filter-external-resy | `/v2/insights` | filter.external.exists | 200 | 577 | differs (1/10 items shared) | 10 entities: Causwells · Violet's · Lovejoy's Tea Room · Aliment |
| filter-external-resy-rating | `/v2/insights` | filter.external.exists, operator.filter.external.exists, filter.external.resy.rating.min, filter.external.resy.rating.max, filter.external.resy.count.min, filter.external.resy.count.max, filter.external.resy.party_size.min, filter.external.resy.party_size.max | 200 | 513 | differs (0/10 items shared) | 10 entities: Causwells · Lovejoy's Tea Room · Aliment · The Front Porch |
| filter-external-tripadvisor | `/v2/insights` | filter.external.tripadvisor.rating.min, filter.external.tripadvisor.rating.max, filter.external.tripadvisor.rating.count.min, filter.external.tripadvisor.rating.count.max | 200 | 535 | differs (3/10 items shared) | 10 entities: b. patisserie · Souvla · Farm : Table · Sweet Maple |
| filter-exists-image | `/v2/insights` | filter.exists | 200 | 664 | same as baseline | 10 entities: b. patisserie · Over The Moon Creamery · Cassava San Francisco · Souvla |
| filter-references-brand | `/v2/insights` | filter.references_brand, operator.filter.references_brand | 200 | 483 | differs (0/10 items shared) | 1 entities: Patagonia |
| filter-content-rating | `/v2/insights` | filter.content_rating | 200 | 664 | differs (8/10 items shared) | 10 entities: Whiplash · Birdman or (The Unexpected Virtue of Ignorance) · The Wolf of Wall Street · Boyhood |
| filter-release-year | `/v2/insights` | filter.release_year.min, filter.release_year.max | 200 | 992 | differs (0/10 items shared) | 10 entities: Inside Out · Mad Max: Fury Road · Youth · Room |
| filter-release-date | `/v2/insights` | filter.release_date.min, filter.release_date.max | 200 | 1559 | same as baseline | 10 entities: Whiplash · Birdman or (The Unexpected Virtue of Ignorance) · The Wolf of Wall Street · Boyhood |
| filter-release-country | `/v2/insights` | filter.release_country, operator.filter.release_country | 200 | 540 | differs (0/10 items shared) | 0 entities:  |
| filter-latest-known-year | `/v2/insights` | filter.latest_known_year.min, filter.latest_known_year.max | 200 | 576 | differs (6/10 items shared) | 10 entities: The Great · Belgravia · The Pursuit of Love · The Cook of Castamar |
| filter-finale-year | `/v2/insights` | filter.finale_year.min, filter.finale_year.max | 200 | 562 | differs (4/10 items shared) | 10 entities: Belgravia · Vanity Fair · Versailles · The Bonfire of Destiny |
| filter-publication-year | `/v2/insights` | filter.publication_year.min, filter.publication_year.max | 200 | 643 | differs (2/10 items shared) | 10 entities: Lennon: The Man, the Myth, the Music - The Definitive Life · I Met the Walrus: How One Day with John Lennon Changed My Life Forever · Paul McCartney · Dark Star: The Roy Orbison Story |
| filter-date-of-birth | `/v2/insights` | filter.date_of_birth.min, filter.date_of_birth.max | 200 | 445 | differs (3/10 items shared) | 10 entities: Beck · Jack White · Jeff Buckley · Cat Power |
| filter-date-of-death | `/v2/insights` | filter.date_of_death.min, filter.date_of_death.max | 200 | 349 | differs (1/10 items shared) | 10 entities: Jeff Buckley · Lou Reed · David Bowie · Elliott Smith |
| filter-gender | `/v2/insights` | filter.gender | 200 | 3344 | same as baseline | 10 entities: Thom Yorke · Beck · Arcade Fire · The Smashing Pumpkins |
| filter-tags-union | `/v2/insights` | filter.tags, operator.filter.tags | 200 | 361 | differs (0/10 items shared) | 10 entities: Five Go Parenting · Sea of Trees · Rodney Stone · The Raven |
| filter-tags-intersection | `/v2/insights` | filter.tags, operator.filter.tags | 200 | 318 | differs (0/10 items shared) | 0 entities:  |
| filter-exclude-tags-intersection | `/v2/insights` | filter.exclude.tags, operator.filter.exclude.tags | 200 | 1488 | same as baseline | 10 entities: Paul McCartney: The Life · John Lennon 1980: The Last Days in the Life · The John Lennon Letters · Tune In (The Beatles: All These Years, #1) |
| filter-results-tags | `/v2/insights` | filter.results.tags | 200 | 784 | same as baseline | 10 entities: Paul McCartney: The Life · John Lennon 1980: The Last Days in the Life · The John Lennon Letters · Tune In (The Beatles: All These Years, #1) |
| filter-tag-types | `/v2/insights` | filter.tag.types | 200 | 608 | differs (0/10 items shared) | 10 tags: Art · Novels · Italian Literature · Graphic Novels |
| filter-query | `/v2/insights` | filter.query | 200 | 3492 | same as baseline | 10 entities: Thom Yorke · Beck · Arcade Fire · The Smashing Pumpkins |
| filter-entities-query | `/v2/insights` | filter.entities.query | 400 | 308 |  | error: the entities.query parameter can only be used in a POST request |
| filter-results-entities-query | `/v2/insights` | filter.results.entities.query | 400 | 301 |  | error: the entities.query parameter can only be used in a POST request |
| filter-exclude-entities | `/v2/insights` | filter.exclude.entities | 200 | 3502 | differs (9/10 items shared) | 10 entities: Beck · Arcade Fire · The Smashing Pumpkins · The Strokes |
| paging-offset | `/v2/insights` | offset | 200 | 3565 | differs (5/10 items shared) | 10 entities: Interpol · Death Cab for Cutie · Pixies · Weezer |
| paging-page-2 | `/v2/insights` | page | 200 | 3435 | differs (0/10 items shared) | 10 entities: MGMT · The Killers · Muse · Modest Mouse |
| heatmap-boundary-locality | `/v2/insights` | output.heatmap.boundary | 200 | 3424 | differs (0/2158 items shared) | 39 entities: San Francisco · Contiguous United States · Western Addition · Financial District |
| heatmap-boundary-geohash | `/v2/insights` | output.heatmap.boundary | 200 | 1149 | same as baseline | 2158 heatmap: 37.760696,-122.42409 · 37.76207,-122.42546 · 37.779922,-122.418594 · 37.76207,-122.41173 |
| heatmap-dimensions | `/v2/insights` | heatmap.dimensions | 200 | 1263 | differs (2158/3094 items shared) | 3094 heatmap: 37.806015,-122.45018 · 37.755203,-122.45293 · 37.810135,-122.477646 · 37.792282,-122.42821 |
| heatmap-dimension-price-filter | `/v2/insights` | heatmap.dimensions, filter.dimensions.price_level | 200 | 1237 | differs (2158/2329 items shared) | 2329 heatmap: 37.760696,-122.42409 · 37.76207,-122.42546 · 37.779922,-122.418594 · 37.76207,-122.41173 |
| heatmap-dimension-hotel-filter | `/v2/insights` | heatmap.dimensions, filter.dimensions.hotel_class | 200 | 1141 | differs (2158/2165 items shared) | 2165 heatmap: 37.785416,-122.40074 · 37.806015,-122.422714 · 37.792282,-122.410355 · 37.785416,-122.42958 |
| search-place-geo | `/search` | filter.location, filter.radius, sort_by | 200 | 364 |  | 10 results: Blue Bottle Coffee · Progeny Coffee · Blue Bottle Coffee · Peet's Coffee |
| search-place-filters | `/search` | filter.rating, filter.popularity, filter.address, filter.exists | 200 | 520 |  | 7 results: Restaurante Liverpool · Restaurante La Corte de Pelayo · Restaurante Mirador Las Cortes · Basil Thai Restaurant & Bar |
| search-sort-popularity-page2 | `/search` | sort_by, page | 200 | 381 |  | 5 results: Pizza Cala · Home Slice Pizza · Pizza Bar · Boizão Churrascaria e Pizzaria Santa Amélia |
| search-tags-operator | `/search` | operator.filter.tags | 200 | 382 |  | 5 results: Bar del Pla · Bar Mut · Bar 8 · Bar All'Arco |
| entities-external-musicbrainz | `/entities` | external.musicbrainz.ids | 200 | 354 |  | 2 results: On a Friday · Radiohead |
| entities-external-wikidata | `/entities` | external.wikidata.ids | 200 | 354 |  | 0 results:  |
| entities-external-imdb | `/entities` | external.imdb.ids | 200 | 312 |  | 1 results: The Grand Budapest Hotel |
| entities-external-spotify | `/entities` | external.spotify.ids | 200 | 355 |  | 2 results: On a Friday · Radiohead |
| tags-typo-tolerance | `/v2/tags` | feature.typo_tolerance | 200 | 1905 |  | 5 tags: Mediterranean · Mediterranean · Mediterranean · Mediterranean |
| tags-no-typo-tolerance | `/v2/tags` |  | 200 | 315 |  | 4 tags: Mediteranean Sampler Platter · Grilled Mediteranean Octopus · Mediteranean Mixed Grill Platter · Mediteranean Salad |
| tags-by-type | `/v2/tags` | filter.tag.types | 200 | 332 |  | 4 tags: Popular science · Pop culture · Pope Urban Ii · Pope |
| tags-popularity | `/v2/tags` | filter.popularity.min, filter.popularity.max | 200 | 314 |  | 5 tags: Pop · Pop · Popular science · Pop culture |
| tags-page-2 | `/v2/tags` | page | 200 | 308 |  | 5 tags: Jazz club · Jazz club · Jazz - Hop · Jazz Rock |
| tags-results-tags | `/v2/tags` | filter.results.tags | 200 | 343 |  | 0 tags:  |
| tag-types-page-2 | `/v2/tags/types` | page | 200 | 327 |  | 5 tag_types: {"parents":[{"type":"urn:entity:actor"}],"type":"urn:tag:cha · {"parents":[{"type":"urn:entity:actor"}],"type":"urn:tag:con · {"parents":[{"type":"urn:entity:actor"}],"type":"urn:tag:cul · {"parents":[{"type":"urn:entity:actor"}],"type":"urn:tag:e |
| audiences-by-type | `/v2/audiences` | filter.audience.types | 200 | 314 |  | 4 audiences: AAPI · Latino · LGBTQ · Black |
| audiences-by-id | `/v2/audiences` | filter.results.audiences | 200 | 303 |  | 2 audiences: AAPI · Latino |
| audiences-popularity | `/v2/audiences` | filter.popularity.min, filter.popularity.max | 200 | 309 |  | 0 audiences:  |
| audiences-page-2 | `/v2/audiences` | page | 200 | 303 |  | 1 audiences: Black |
| audience-types-page-2 | `/v2/audiences/types` | page | 200 | 341 |  | 3 audience_types: {"parents":[{"type":"urn:audience:investing_interests"}],"ty · {"parents":[{"type":"urn:audience:leisure"}],"type":"urn:aud · {"parents":[{"type":"urn:audience:life_stage"}],"type":"urn: |
| compare-base | `/v2/analysis/compare` |  | 200 | 313 |  | 44 tags: United States · Folk · Rock · Rockabilly |
| compare-model-descriptive | `/v2/analysis/compare` | model | 200 | 335 | same as baseline | 44 tags: United States · Folk · Rock · Rockabilly |
| compare-model-predictive | `/v2/analysis/compare` | model | 200 | 348 | same as baseline | 44 tags: United States · Folk · Rock · Rockabilly |
| compare-subtype-genre | `/v2/analysis/compare` | filter.subtype | 200 | 318 | same as baseline | 44 tags: United States · Folk · Rock · Rockabilly |
| compare-paging | `/v2/analysis/compare` | offset, page | 200 | 331 | same as baseline | 44 tags: United States · Folk · Rock · Rockabilly |
| compare-location-radius | `/v2/analysis/compare` | filter.location.radius, filter.exclude.location.query, filter.exclude.location.radius | 200 | 328 | same as baseline | 44 tags: United States · Folk · Rock · Rockabilly |
| compare-entities-query | `/v2/analysis/compare` | filter.entities.query | 200 | 314 | same as baseline | 44 tags: United States · Folk · Rock · Rockabilly |
| trending-base | `/v2/trending` |  | 200 | 309 |  | 5 trending: {"date":"2026-09-24","population_percentile":0.1130274467721 · {"date":"2026-09-17","population_percentile":0.1130274467721 · {"date":"2026-09-10","population_percentile":0.1130274467721 · {"date":"2026-09-03","population_percentile":0.113027446772 |
| trending-offset | `/v2/trending` | offset | 200 | 305 | differs (2/5 items shared) | 5 trending: {"date":"2026-09-03","population_percentile":0.1130274467721 · {"date":"2026-08-27","population_percentile":0.1130274467721 · {"date":"2026-08-20","population_percentile":0.1130274467721 · {"date":"2026-08-13","population_percentile":0.113027446772 |
| trending-page-2 | `/v2/trending` | page | 200 | 307 | same as baseline | 5 trending: {"date":"2026-09-24","population_percentile":0.1130274467721 · {"date":"2026-09-17","population_percentile":0.1130274467721 · {"date":"2026-09-10","population_percentile":0.1130274467721 · {"date":"2026-09-03","population_percentile":0.113027446772 |

## Parameter coverage (from reference/endpoints.json)

| Endpoint | Parameters | Worked | Rejected (400) | Never exercised |
| --- | --- | --- | --- | --- |
| `/` | 0 | 0 | 0 | 0 |
| `/search` | 13 | 13 | 0 | 0 |
| `/entities` | 23 | 5 | 0 | external.facebook.ids, external.goodreads.ids, external.goodreads_author.ids, external.igdb.ids, external.instagram.ids, external.isbn10.ids, external.isbn13.ids, external.itunes.ids, external.lastfm.ids, external.library_of_congress.ids, external.metacritic.ids, external.michelin.ids, external.rottentomatoes.ids, external.soundcloud.ids, external.tablet.ids, external.twitch.ids, external.twitter.ids, external.resy.ids |
| `/v2/tags` | 10 | 10 | 0 | 0 |
| `/v2/tags/types` | 3 | 3 | 0 | 0 |
| `/v2/audiences` | 8 | 8 | 0 | 0 |
| `/v2/audiences/types` | 3 | 3 | 0 | 0 |
| `/v2/insights` | 105 | 101 | filter.results.entities.query, filter.entities.query | filter.exclude.entities.query, signal.interests.entities.query |
| `/v2/analysis/compare` | 14 | 13 | 0 | filter.exclude.entities.query |
| `/v2/trending` | 7 | 7 | 0 | 0 |
