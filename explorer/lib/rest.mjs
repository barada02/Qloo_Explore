// Minimal Qloo REST client: GET only, X-Api-Key header, arrays comma-joined
// (same serialization as the official harness).
export function buildUrl(baseUrl, path, params = {}) {
  const url = new URL(baseUrl + path);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  return url;
}

export async function qlooGet(config, path, params = {}, { timeoutMs = 30000 } = {}) {
  const url = buildUrl(config.baseUrl, path, params);
  const started = performance.now();
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "X-Api-Key": config.apiKey },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await response.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { non_json_body: text.slice(0, 2000) };
    }
    return {
      ok: response.ok,
      status: response.status,
      ms: Math.round(performance.now() - started),
      url: url.pathname + url.search,
      requestId: response.headers.get("x-qloo-request-id") ?? response.headers.get("x-request-id") ?? undefined,
      rateLimit: pickHeaders(response.headers, /ratelimit|retry-after/i),
      body,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      ms: Math.round(performance.now() - started),
      url: url.pathname + url.search,
      error: error.cause?.message ?? error.message,
      body: null,
    };
  }
}

function pickHeaders(headers, pattern) {
  const picked = {};
  for (const [key, value] of headers) if (pattern.test(key)) picked[key] = value;
  return Object.keys(picked).length ? picked : undefined;
}

// Qloo responses nest lists under `results.<kind>` (entities, tags, heatmap,
// demographics, trending...). Return the first array found, for summaries.
export function firstList(body) {
  const results = body?.results ?? body;
  if (Array.isArray(results)) return { kind: "results", items: results };
  if (results && typeof results === "object") {
    for (const [kind, value] of Object.entries(results)) {
      if (Array.isArray(value)) return { kind, items: value };
    }
  }
  return { kind: undefined, items: [] };
}

export function label(item) {
  if (!item || typeof item !== "object") return String(item);
  return item.name ?? item.title ?? item.tag_id ?? item.id ?? item.entity_id ??
    (item.location ? `${item.location.latitude},${item.location.longitude}` : JSON.stringify(item).slice(0, 60));
}
