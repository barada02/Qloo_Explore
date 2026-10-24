# qloo mcp probe report

- Base URL: `https://hackathon.api.qloo.com`
- Run at: 2026-10-24T17:01:30.202Z
- Tools exposed: `qloo_capabilities`, `qloo_recommend`, `qloo_rank`, `qloo_describe`, `qloo_where_popular`, `qloo_compare_audiences`, `qloo_entity_tags`, `qloo_audience_demographics`, `qloo_trends`, `qloo_find_tags`
- Every exposed tool was exercised.
- Result: **13/14 calls returned ok/partial/degraded**

Full envelopes: `results/mcp/<call>.json`.

| Call | Tool | Status | ms | Count | Summary / sample |
| --- | --- | --- | --- | --- | --- |
| qloo_capabilities | `qloo_capabilities` | ok | 3 |  | credential ready — {"id":"recommend","shared_tool_name":"qloo_recomme · {"id":"rank","shared_tool_name":"qloo_rank","summa · {"id":"describe","shared_tool_name":"qloo_describe · {"id":"where_popular","shared_tool_name":"qloo_whe · {"id":"compare_audiences","shared_tool_name":"qloo |
| qloo_recommend | `qloo_recommend` | ok | 2260 | 5 | Igreja de Santa Luzia · Miradouro de Fatima · Museum of Contemporary Art – MAC/CCB · Rua nova do Carvalho · Church of Saint Mary of Bethlehem |
| qloo_rank | `qloo_rank` | ok | 1278 | 3 | The Grand Budapest Hotel · Amélie · Fast & Furious |
| qloo_describe | `qloo_describe` | ok | 649 | 1 | Radiohead |
| qloo_where_popular | `qloo_where_popular` | ok | 858 | 10 | {"location":{"latitude":40.715332,"longitude":-73. · {"location":{"latitude":40.715332,"longitude":-73. · {"location":{"latitude":41.506348,"longitude":-73. · {"location":{"latitude":40.759277,"longitude":-73. · {"location":{"latitude":42.03369,"longitude":-74.1 |
| qloo_compare_audiences | `qloo_compare_audiences` | ok | 664 |  | United States · Folk · Rock · Rockabilly · Ireland |
| qloo_entity_tags | `qloo_entity_tags` | ok | 673 | 10 | Real-Time Strategy · Role-Playing · Touching · Irish · Story-Driven |
| qloo_audience_demographics | `qloo_audience_demographics` | ok | 334 | 1 | 10E08FC9-04BB-4827-9331-7E9ABE1F7DB6 |
| qloo_trends | `qloo_trends` | ok | 1178 | 1 | Dune |
| qloo_find_tags | `qloo_find_tags` | ok | 357 | 5 | Cozy Mystery · Cozy Mystery · cozy mystery · Cozy Mystery · Cozy Mysteries |
| sponsorfit-podcasts-to-brands | `qloo_recommend` | ok | 1398 | 15 | Futurism · Rivian Automotive · Onnit · Multidisciplinary Association for Psychedelic Studies · Atom Finance |
| sitescout-heatmap-restaurant | `qloo_where_popular` | ok | 1661 | 10 | {"location":{"latitude":37.760696,"longitude":-122 · {"location":{"latitude":37.76207,"longitude":-122. · {"location":{"latitude":37.779922,"longitude":-122 · {"location":{"latitude":37.76207,"longitude":-122. · {"location":{"latitude":37.818375,"longitude":-122 |
| demographic-rank | `qloo_rank` | ok | 1262 | 1 | Patagonia |
| ambiguous-name | `qloo_describe` | needs_input | 350 | 0 | Choose the intended Qloo entity. |
