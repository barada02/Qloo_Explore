# Qloo REST probe report

- Base URL: `https://hackathon.api.qloo.com`
- Run at: 2026-10-24T17:00:51.228Z
- Result: **53/53 steps returned 2xx/3xx**

Raw responses: `results/rest/<step>.json`.

| Step | Endpoint | HTTP | ms | Result |
| --- | --- | --- | --- | --- |
| api-root | `/` | 200 | 935 | 0 items:  |
| tags-types | `/v2/tags/types` | 200 | 318 | 20 tag_types: {"parents":[{"type":"urn:entity:actor"}],"type":"urn:tag:aes · {"parents":[{"type":"urn:entity:actor"}],"type":"urn:tag:arc · {"parents":[{"type":"urn:entity:actor"}],"type":"urn:tag:aud · {"parents":[{"type":"urn:entity:actor"}],"type":"urn:tag:cat · {"parents":[{"type":"urn:entity:ac |
| audiences-types | `/v2/audiences/types` | 200 | 290 | 10 audience_types: {"parents":[{"type":"urn:audience:communities"}],"type":"urn · {"parents":[{"type":"urn:audience:global_issues"}],"type":"u · {"parents":[{"type":"urn:audience:hobbies_and_interests"}]," · {"parents":[{"type":"urn:audience:investing_interests"}],"ty · {"parents":[{"type":"urn:audi |
| audiences-list | `/v2/audiences` | 200 | 292 | 4 audiences: AAPI · Latino · LGBTQ · Black |
| tags-semantic-cozy-mystery | `/v2/tags` | 200 | 342 | 10 tags: Cozy Mystery · Cozy Mystery · cozy mystery · Cozy Mystery · Cozy Mysteries |
| tags-semantic-natural-wine | `/v2/tags` | 200 | 333 | 10 tags: Natural Wine Bar · Natural Wine · Natural Wine · Natural Wines · Natural Wine Bar Cuisine |
| tags-semantic-outdoor | `/v2/tags` | 200 | 322 | 10 tags: Outdoor Adventure · Outdoor Adventure · Outdoor Adventures · Outdoor Adventure · Outdoor Exploration |
| tags-plain-jazz | `/v2/tags` | 200 | 362 | 10 tags: Jazz · Jazz · Jazz · Jazz Musician · Jazz Fusion |
| search-artist | `/search` | 200 | 303 | 5 results: Radiohead · Radiohead Tribute · Dub Tribute To Radiohead · The Bluegrass Tribute to Radiohead · Thom Yorke and Johnny Greenwood (Radiohead) |
| search-artist2 | `/search` | 200 | 311 | 5 results: Taylor Swift · Taylor Swift, Bon Iver · Taylor Swift & Seeb · Taylor Swift, Gary Lightbody · Taylor Swift & BloodPop® |
| search-movie | `/search` | 200 | 590 | 5 results: The Grand Budapest Hotel · Grand Hotel · Grand Hotel Excelsior · Week-End at the Waldorf · Hotel |
| search-movie2 | `/search` | 200 | 589 | 5 results: Fast & Furious · The Fast and the Furious · Fast & Furious 6 · Fast & Furious Presents: Hobbs & Shaw · Furious 7 |
| search-tv_show | `/search` | 200 | 317 | 5 results: Breaking Bad · Breaking Bad: Original Minisodes · The Bad Guys: Breaking In · Star Wars: The Bad Batch · Bad Sisters |
| search-book | `/search` | 200 | 311 | 5 results: Dune (Dune, #1) · Dune Messiah (Dune #2) · Everything, Everything · House Corrino (Prelude to Dune, #3) · House Harkonnen (Prelude to Dune, #2) |
| search-author | `/search` | 200 | 349 | 5 results: Agatha Christie · Gritte Agatha · Jonatan Christie · Agatha Chelsea · Agatha Moreira |
| search-podcast | `/search` | 200 | 295 | 5 results: The Joe Rogan Experience · Joe Rogan Experience Review podcast · The Joe Rogan AI Experience · Dr. Joe Dispenza Audio Experience · Pat Mayo Experience |
| search-podcast2 | `/search` | 200 | 298 | 5 results: Huberman Lab · The Happiness Lab with Dr. Laurie Santos · Omnic Lab: A Strategic Overwatch Podcast · The Speaker Lab Podcast · Comic Lab |
| search-podcast3 | `/search` | 200 | 302 | 5 results: Lex Fridman Podcast · The LexG Movie Podcast · Investing In Real Estate With Lex Levinrad · Lala Land with Lex · @lexie |
| search-brand | `/search` | 200 | 295 | 2 results: Patagonia · Cerveza Patagonia |
| search-brand2 | `/search` | 200 | 304 | 5 results: Nike · Nike Training Club · Air Jordan Product Line · Nike Swim · Nornickel |
| search-videogame | `/search` | 200 | 299 | 5 results: Elden Ring · Elden Ring Nightreign · Elden Ring: Shadow of the Erdtree · Elden Ring: Shadow of the Erdtree Edition · Solo's Soul Ring - Divinity Chapter |
| search-place | `/search` | 200 | 337 | 5 results: Tartine Bakery · Tartine Bakery Seoul Hannam · TARTINE Bakery & Cafe · Tartine Bakery Dosan · Tartine Bakery |
| search-locality | `/search` | 200 | 320 | 5 results: Lisboa · Lisbon · Lisbon · Lisbon · Lisbon |
| search-destination | `/search` | 200 | 304 | 1 results: Kyoto |
| search-untyped-amelie | `/search` | 200 | 432 | 5 results: Amélie · Amélie · Amelie · Amélie · Amelie |
| entities-by-id | `/entities` | 200 | 309 | 3 results: Radiohead · The Grand Budapest Hotel · The Joe Rogan Experience |
| insights-recommend-artist | `/v2/insights` | 200 | 3445 | 10 entities: Beck · The Smashing Pumpkins · Jeff Buckley · Thom Yorke · John Frusciante |
| insights-recommend-movie | `/v2/insights` | 200 | 1786 | 10 entities: Eternal Sunshine of the Spotless Mind · Her · Trainspotting · Birdman or (The Unexpected Virtue of Ignorance) · Donnie Darko |
| insights-recommend-tv_show | `/v2/insights` | 200 | 736 | 10 entities: Black Mirror · Humans · Here and Now · Are You Human Too? · Electric Dreams |
| insights-recommend-book | `/v2/insights` | 200 | 771 | 10 entities: Brave New World · Scar Tissue · Moab Is My Washpot · I Met the Walrus: How One Day with John Lennon Changed My Life Forever · Flowers for Algernon |
| insights-recommend-person | `/v2/insights` | 200 | 757 | 10 entities: Beck · Jack White · Arcade Fire · Santigold · David Bowie |
| insights-recommend-podcast | `/v2/insights` | 200 | 638 | 10 entities: Radiolab · Hidden Brain · Invisibilia · 99% Invisible · This American Life |
| insights-recommend-brand | `/v2/insights` | 200 | 423 | 10 entities: GoPro · The North Face · Rolex · Patagonia · Omega |
| insights-recommend-videogame | `/v2/insights` | 200 | 396 | 10 entities: Bastion · BioShock Infinite · BioShock · Mass Effect 2 · System Shock 2 |
| insights-recommend-destination | `/v2/insights` | 200 | 325 | 10 entities: Hastings · Ensenada · Oaxaca City · Canterbury · Aviemore |
| insights-places-in-lisbon | `/v2/insights` | 200 | 1037 | 10 entities: Igreja de Santa Luzia · Miradouro de Fatima · Museum of Contemporary Art – MAC/CCB · Rua nova do Carvalho · Church of Saint Mary of Bethlehem |
| insights-places-nyc-with-tag | `/v2/insights` | 200 | 492 | 1 entities: Have & Meyer |
| insights-explainability | `/v2/insights` | 200 | 1596 | 5 entities: Eternal Sunshine of the Spotless Mind · Her · Trainspotting · Birdman or (The Unexpected Virtue of Ignorance) · Donnie Darko |
| insights-tag-signal-books | `/v2/insights` | 200 | 624 | 10 entities: The Stinky Cheese Man and Other Fairly Stupid Tales · Murder on the Orient Express (Hercule Poirot, #10) · And Then There Were None · Wyrd Sisters (Discworld, #6; Witches, #2) · Going Postal (Discworld, #33; Moist von Lipwig, #1) |
| insights-demographic-signal | `/v2/insights` | 200 | 877 | 10 entities: Sunday Girl · Whinnie Williams · Nina Nesbitt · Mae Muller · Jesse Jo Stark |
| insights-exclude-tags | `/v2/insights` | 200 | 1451 | 10 entities: Brave New World · Scar Tissue · Moab Is My Washpot · I Met the Walrus: How One Day with John Lennon Changed My Life Forever · Flowers for Algernon |
| insights-rank-shortlist | `/v2/insights` | 200 | 323 | 2 entities: The Grand Budapest Hotel · Fast & Furious |
| insights-tags-for-entities | `/v2/insights` | 200 | 964 | 20 tags: Inexpensive · Identifies as women-owned · Bar · Os A Moelle · VISA |
| insights-demographics-of-artist | `/v2/insights` | 200 | 307 | 1 demographics: 70CAE5BF-2F4C-445C-A3E5-4EDACFC3591C |
| insights-heatmap-nyc | `/v2/insights` | 200 | 912 | 1806 heatmap: 40.715332,-73.93799 · 40.715332,-73.98193 · 41.506348,-73.98193 · 40.759277,-73.98193 · 42.03369,-74.11377 |
| insights-heatmap-usa | `/v2/insights` | 200 | 4004 | 11864 heatmap: 48.07617,-123.57422 · 48.603516,-122.87109 · 48.603516,-122.51953 · 48.07617,-122.87109 · 48.07617,-123.22266 |
| idea-podcasts-to-brands | `/v2/insights` | 200 | 456 | 20 entities: Onnit · Whoop · Atom Finance · Rivian Automotive · Multidisciplinary Association for Psychedelic Studies |
| idea-podcast-demographics | `/v2/insights` | 200 | 286 | 1 demographics: 10E08FC9-04BB-4827-9331-7E9ABE1F7DB6 |
| idea-podcast-tags | `/v2/insights` | 200 | 320 | 20 tags: Real-Time Strategy · Role-Playing · Touching · Irish · Story-Driven |
| compare-two-audiences | `/v2/analysis/compare` | 200 | 293 | 44 tags: United States · Folk · Rock · Rockabilly · Ireland |
| compare-podcast-vs-brand | `/v2/analysis/compare` | 200 | 297 | 0 tags:  |
| trending-movie-series | `/v2/trending` | 200 | 826 | 20 trending: {"date":"2026-09-24","population_percentile":0.9934077072066 · {"date":"2026-09-17","population_percentile":0.9934077072066 · {"date":"2026-09-10","population_percentile":0.9934077072066 · {"date":"2026-09-03","population_percentile":0.9934077072066 · {"date":"2026-08-27","population_pe |
| trending-artists-like-radiohead | `/v2/trending` | 200 | 292 | 10 trending: {"date":"2026-09-24","population_percentile":0.1130274467721 · {"date":"2026-09-17","population_percentile":0.1130274467721 · {"date":"2026-09-10","population_percentile":0.1130274467721 · {"date":"2026-09-03","population_percentile":0.1130274467721 · {"date":"2026-08-27","population_pe |

## Resolved seed entities

- artist: Radiohead (`70CAE5BF-2F4C-445C-A3E5-4EDACFC3591C`)
- artist2: Taylor Swift (`4BBEF799-A0C4-4110-AB01-39216993C312`)
- movie: The Grand Budapest Hotel (`DF788007-B5EA-4F29-872B-96BCB8EEC42F`)
- movie2: Fast & Furious (`F01AC034-179A-47F3-8ADF-7A4D77559DCF`)
- tv_show: Breaking Bad (`D03D0913-A7B9-4C46-BFEB-958C1B3FA387`)
- book: Dune (Dune, #1) (`9BA85467-2189-46DC-BB98-4B25EE182A9D`)
- author: Agatha Christie (`108EAC12-CFB7-41EE-B2D7-52AF8CF62B1A`)
- podcast: The Joe Rogan Experience (`2BBC8913-13CA-47A3-BCD0-B48E70D6B005`)
- podcast2: Huberman Lab (`10E08FC9-04BB-4827-9331-7E9ABE1F7DB6`)
- podcast3: Lex Fridman Podcast (`CC4ADED4-65CD-4019-ADAE-97E467FCD8D8`)
- brand: Patagonia (`DB4CE34E-3A63-4947-946F-9D52502C5762`)
- brand2: Nike (`C70CE2B8-0AD1-4150-BF18-5A6347F2E860`)
- videogame: Elden Ring (`46CBADC5-F4A6-4E97-93B2-959066C9F608`)
- place: Tartine Bakery (`FBBAF1EE-BC5A-4A9C-A971-2910A2214F27`)
- locality: Lisboa (`0A6150D0-E4CE-4CA6-A67B-78F9C9CD7405`)
- destination: Kyoto (`95E19B2C-553A-46A6-AD73-5562AF7124E5`)

## Resolved seed tags

- cozy: Cozy Mystery (`urn:tag:subgenre:qloo:cozy_mystery`)
- wine: Natural Wine Bar (`urn:tag:cuisine:qloo:natural_wine_bar`)
- outdoor: Outdoor Adventure (`urn:tag:lifestyle:qloo:outdoor_adventure`)
