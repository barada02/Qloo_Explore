// A small Gemini agent that can call the Qloo MCP tools, plus a "plain"
// variant with no tools, so the same question can be answered both ways.
import { GoogleGenAI } from "@google/genai";
import { envelopeOf } from "./mcp.mjs";

export const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const MAX_STEPS = 8;

const COMMON = [
  "You are a taste and culture advisor. Answer the user's question concretely: name specific recommendations, say briefly why each fits, keep it under 250 words.",
].join(" ");

const QLOO_RULES = [
  "You have Qloo tools, which return real audience-affinity data from a taste graph of 250M+ entities.",
  "Ground your answer in what the tools return; do not add recommendations from your own memory unless you label them as unverified.",
  "Call tools for every question about taste, audiences, places, brands or popularity. You may call several tools and combine them.",
  "When a tool returns status needs_input, it lists candidates: pick the best match for the user's meaning using the candidate id, then call the tool again with that id as the entity.",
  "Entity ids (UUIDs) are accepted anywhere a name is.",
  "Mention concrete signals from the data (affinity scores, audience skew, locations) so the answer is clearly data-backed.",
].join(" ");

export const PLAIN_RULES = "You have no external tools or data. Answer from your own knowledge.";

// Gemini wants plain JSON schema; MCP adds $schema/additionalProperties.
function declaration(tool) {
  const { $schema, additionalProperties, ...schema } = tool.inputSchema ?? { type: "object", properties: {} };
  return { name: tool.name, description: tool.description, parametersJsonSchema: schema };
}

const NOISY = new Set(["schema_version", "provenance", "query_intent", "execution", "interpretation", "source_contract_version"]);

// Keep tool results small: drop bookkeeping, cap lists and long strings.
export function shrink(value, depth = 0) {
  if (Array.isArray(value)) return value.slice(0, depth === 0 ? 12 : 8).map((v) => shrink(v, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !NOISY.has(key))
        .map(([key, v]) => [key, shrink(v, depth + 1)]),
    );
  }
  return typeof value === "string" && value.length > 260 ? `${value.slice(0, 260)}…` : value;
}

export function compactEnvelope(envelope) {
  const out = shrink(envelope);
  if (Array.isArray(out.series)) {
    for (const s of out.series) if (Array.isArray(s.points)) s.points = s.points.slice(0, 8);
  }
  return out;
}

const plainText = (response) => response.text ?? response.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set (put it in explorer/.env).");
  return new GoogleGenAI({ apiKey });
}

// mcpClient: a connected qloo MCP client, or undefined for the plain answer.
export async function runAgent({ question, mcpClient, model = DEFAULT_MODEL }) {
  const ai = client();
  const started = performance.now();
  const trace = [];
  let tokens = 0;
  const useQloo = Boolean(mcpClient);
  const tools = useQloo ? (await mcpClient.listTools()).tools : [];
  const config = {
    systemInstruction: `${COMMON} ${useQloo ? QLOO_RULES : PLAIN_RULES}`,
    ...(useQloo ? { tools: [{ functionDeclarations: tools.map(declaration) }] } : {}),
  };
  const contents = [{ role: "user", parts: [{ text: question }] }];

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await generate(ai, { model, contents, config });
    tokens += response.usageMetadata?.totalTokenCount ?? 0;
    const calls = response.functionCalls ?? [];
    if (!calls.length) {
      return { answer: plainText(response), trace, ms: Math.round(performance.now() - started), tokens, model };
    }
    contents.push(response.candidates[0].content);
    const parts = [];
    for (const call of calls) {
      const t0 = performance.now();
      let envelope;
      try {
        envelope = envelopeOf(await mcpClient.callTool({ name: call.name, arguments: call.args ?? {} }));
      } catch (error) {
        envelope = { status: "error", summary: error.message };
      }
      const ms = Math.round(performance.now() - t0);
      trace.push({ tool: call.name, args: call.args ?? {}, status: envelope.status, summary: envelope.summary, count: envelope.result_count ?? envelope.results?.length, ms });
      parts.push({ functionResponse: { name: call.name, response: { result: compactEnvelope(envelope) } } });
    }
    contents.push({ role: "user", parts });
  }
  return { answer: "(stopped: too many tool steps)", trace, ms: Math.round(performance.now() - started), tokens, model };
}

// Gemini free tiers rate-limit; retry briefly on 429/503.
async function generate(ai, request) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await ai.models.generateContent(request);
    } catch (error) {
      const retryable = [429, 500, 503].includes(error.status) || /RESOURCE_EXHAUSTED|UNAVAILABLE/.test(error.message ?? "");
      if (!retryable || attempt >= 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
}
