// Fake Qloo API for offline plumbing tests ONLY. Responses are synthetic and
// say nothing about real Qloo data. Records every request it receives.
import { createServer } from "node:http";

const fakeEntity = (n, type) => ({
  entity_id: `00000000-0000-4000-8000-00000000000${n}`,
  name: `Stub ${type} ${n}`,
  types: [type],
  query: { affinity: 0.9 - n / 10 },
});

export function startStub({ apiKey = "test-key" } = {}) {
  const requests = [];
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://stub");
    const q = Object.fromEntries(url.searchParams);
    requests.push({ path: url.pathname, query: q, key: req.headers["x-api-key"] });
    const send = (status, body) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (req.headers["x-api-key"] !== apiKey) return send(401, { error: { message: "bad key" } });
    const type = q["filter.type"] ?? q.types ?? "urn:entity:artist";
    switch (url.pathname) {
      case "/":
        return send(200, { name: "stub" });
      case "/search": {
        // Mimic an exact match so the harness resolver accepts the name.
        const e = fakeEntity(1, q.types ?? "urn:entity:artist");
        e.name = q.query;
        return send(200, { results: [e] });
      }
      case "/entities":
        return send(200, { results: { entities: q.entity_ids.split(",").map((id, i) => ({ ...fakeEntity(i, "urn:entity:artist"), entity_id: id })) } });
      case "/v2/tags":
        return send(200, { results: { tags: [{ id: "urn:tag:genre:stub", name: q["filter.query"] ?? "stub", types: ["urn:entity:book"] }] } });
      case "/v2/tags/types":
      case "/v2/audiences/types":
        return send(200, { results: { types: ["urn:stub"] } });
      case "/v2/audiences":
        return send(200, { results: { audiences: [{ id: "urn:audience:stub", name: "Stub audience" }] } });
      case "/v2/insights":
        if (type === "urn:heatmap") return send(200, { results: { heatmap: [{ location: { latitude: 1, longitude: 2 }, query: { affinity: 0.5 } }] } });
        if (type === "urn:demographics") return send(200, { results: { demographics: [{ entity_id: q["signal.interests.entities"], query: { age: {}, gender: {} } }] } });
        if (type === "urn:tag") return send(200, { results: { tags: [{ id: "urn:tag:stub", name: "Stub tag" }] } });
        return send(200, { results: { entities: [1, 2, 3].map((n) => fakeEntity(n, type)) } });
      case "/v2/analysis/compare":
        return send(200, { results: { tags: [{ id: "urn:tag:stub", name: "Stub diff" }] } });
      case "/v2/trending":
        return send(200, { results: { trending: [{ date: "2026-01-01", population_percentile: 50 }] } });
      default:
        return send(404, { error: { message: "unknown path" } });
    }
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve({ url: `http://127.0.0.1:${server.address().port}`, requests, close: () => server.close() })),
  );
}
