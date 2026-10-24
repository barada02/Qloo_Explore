// Runs every question in lib/questions.mjs through plain Gemini and Gemini+Qloo,
// writes results/agent/<id>.json and results/AGENT_REPORT.md.
// Usage: node --env-file=.env battery.mjs [--only <id-substring>]
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig, redact, RESULTS_DIR } from "./lib/config.mjs";
import { connectQlooMcp } from "./lib/mcp.mjs";
import { runAgent, DEFAULT_MODEL } from "./lib/agent.mjs";
import { QUESTIONS } from "./lib/questions.mjs";

const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : undefined;
const config = loadConfig();
const dir = join(RESULTS_DIR, "agent");
await mkdir(dir, { recursive: true });
const mcp = await connectQlooMcp(config);
const sections = [];
try {
  for (const item of QUESTIONS.filter((x) => !only || x.id.includes(only))) {
    const [plain, qloo] = await Promise.all([
      runAgent({ question: item.q }).catch((e) => ({ answer: `ERROR: ${e.message}`, trace: [], ms: 0, tokens: 0 })),
      runAgent({ question: item.q, mcpClient: mcp }).catch((e) => ({ answer: `ERROR: ${e.message}`, trace: [], ms: 0, tokens: 0 })),
    ]);
    await writeFile(join(dir, `${item.id}.json`), redact({ ...item, model: DEFAULT_MODEL, plain, qloo }, config.apiKey));
    console.error(`${item.id}: plain ${plain.ms}ms/${plain.tokens}tok, qloo ${qloo.ms}ms/${qloo.tokens}tok, ${qloo.trace.length} calls (${qloo.trace.map((t) => t.status).join(",")})`);
    sections.push([
      `## ${item.id}`, "", `**Question:** ${item.q}`, "", `**Where Qloo should help:** ${item.why}`, "",
      `### Plain Gemini (${plain.ms} ms, ${plain.tokens} tokens)`, "", plain.answer, "",
      `### Gemini + Qloo (${qloo.ms} ms, ${qloo.tokens} tokens)`, "", qloo.answer, "",
      "Qloo calls: " + (qloo.trace.map((t) => `\`${t.tool}\` ${t.status} ${t.ms}ms`).join(" → ") || "none"), "",
    ].join("\n"));
  }
} finally {
  await mcp.close();
}
await writeFile(join(RESULTS_DIR, "AGENT_REPORT.md"), redact(`# Plain Gemini vs Gemini + Qloo\n\nModel: \`${DEFAULT_MODEL}\`. Run at ${new Date().toISOString()}.\n\n${sections.join("\n---\n\n")}`, config.apiKey));
console.error("Report: results/AGENT_REPORT.md");
