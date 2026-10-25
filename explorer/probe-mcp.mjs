// Starts `qloo mcp`, lists its tools, and calls every tool once with the
// example arguments in lib/mcp.mjs (plus a few idea-validation calls).
// Writes results/mcp/<tool>.json and results/MCP_REPORT.md.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig, redact, RESULTS_DIR } from "./lib/config.mjs";
import { firstList } from "./lib/rest.mjs";
import { connectQlooMcp, envelopeOf, EXAMPLES } from "./lib/mcp.mjs";

const EXTRA_CALLS = [
  ["sponsorfit-podcasts-to-brands", "qloo_recommend", {
    target_type: "brand",
    signals: ["Huberman Lab", "Lex Fridman Podcast"],
    limit: 15,
  }],
  ["sitescout-heatmap-restaurant", "qloo_where_popular", { entity: "FBBAF1EE-BC5A-4A9C-A971-2910A2214F27", entity_type: "place", within: "San Francisco" }],
  ["demographic-rank", "qloo_rank", {
    options: ["Patagonia", "Nike", "Gucci"],
    option_type: "brand",
    demographic: "women 25-34",
    signal_location: "Chicago",
  }],
  // Expected to return `needs_input`: documents how the harness handles ambiguity.
  ["ambiguous-name", "qloo_describe", { entity: "Mercury" }],
];

async function main() {
  const config = loadConfig();
  if (!config.apiKey) {
    console.error("No Qloo key. Set QLOO_API_KEY (or API_Key) in the environment.");
    return 2;
  }
  const outDir = join(RESULTS_DIR, "mcp");
  await mkdir(outDir, { recursive: true });

  const client = await connectQlooMcp(config);
  const rows = [];
  try {
    const { tools } = await client.listTools();
    console.error(`qloo mcp exposes ${tools.length} tools: ${tools.map((t) => t.name).join(", ")}\n`);
    await writeFile(join(outDir, "_tools.json"), JSON.stringify(tools, null, 2));

    const calls = [
      ...tools.filter((t) => t.name in EXAMPLES).map((t) => [t.name, t.name, EXAMPLES[t.name]]),
      ...EXTRA_CALLS,
    ];
    const untested = tools.filter((t) => !(t.name in EXAMPLES)).map((t) => t.name);

    for (const [name, tool, args] of calls) {
      const started = performance.now();
      let envelope;
      try {
        envelope = envelopeOf(await client.callTool({ name: tool, arguments: args }));
      } catch (error) {
        envelope = { status: "error", summary: error.message };
      }
      const ms = Math.round(performance.now() - started);
      const count = envelope.result_count ?? envelope.results?.length;
      const list = Array.isArray(envelope.results) ? envelope.results : (Array.isArray(envelope.series) ? envelope.series : firstList(envelope).items);
      const sample = list
        .slice(0, 5)
        .map((r) => r?.name ?? r?.entity?.name ?? r?.entity_id ?? JSON.stringify(r).slice(0, 50))
        .join(" · ");
      const note = [envelope.summary, envelope.error?.code, sample].filter(Boolean).join(" — ");
      rows.push({ name, tool, status: envelope.status, ms, count, note });
      console.error(`${String(envelope.status).padEnd(11)} ${String(ms).padStart(5)}ms ${name} — ${note.slice(0, 160)}`);
      await writeFile(join(outDir, `${name}.json`), redact({ tool, arguments: args, envelope }, config.apiKey));
    }

    const ok = rows.filter((r) => ["ok", "partial", "degraded"].includes(r.status)).length;
    const report = [
      "# qloo mcp probe report",
      "",
      `- Base URL: \`${config.baseUrl}\``,
      `- Run at: ${new Date().toISOString()}`,
      `- Tools exposed: ${tools.map((t) => `\`${t.name}\``).join(", ")}`,
      untested.length ? `- Not exercised (no example args): ${untested.map((n) => `\`${n}\``).join(", ")}` : "- Every exposed tool was exercised.",
      `- Result: **${ok}/${rows.length} calls returned ok/partial/degraded**`,
      "",
      "Full envelopes: `results/mcp/<call>.json`.",
      "",
      "| Call | Tool | Status | ms | Count | Summary / sample |",
      "| --- | --- | --- | --- | --- | --- |",
      ...rows.map((r) => `| ${r.name} | \`${r.tool}\` | ${r.status} | ${r.ms} | ${r.count ?? ""} | ${md(r.note)} |`),
      "",
    ].join("\n");
    await writeFile(join(RESULTS_DIR, "MCP_REPORT.md"), redact(report, config.apiKey));
    console.error(`\n${ok}/${rows.length} ok. Report: results/MCP_REPORT.md`);
    return ok === rows.length ? 0 : 1;
  } finally {
    await client.close();
  }
}

const md = (text = "") => String(text).replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 300);

process.exitCode = await main().catch((error) => {
  console.error(error.message);
  return 1;
});
