// Ask one question twice: plain Gemini vs Gemini with the Qloo tools.
// Usage: node --env-file=.env ask.mjs "Where should a Radiohead fan eat in Lisbon?"
import { loadConfig } from "./lib/config.mjs";
import { connectQlooMcp } from "./lib/mcp.mjs";
import { runAgent } from "./lib/agent.mjs";

const question = process.argv.slice(2).join(" ");
if (!question) {
  console.error('Usage: node ask.mjs "your question"');
  process.exit(2);
}
const config = loadConfig();
const mcp = await connectQlooMcp(config);
try {
  const [plain, qloo] = await Promise.all([runAgent({ question }), runAgent({ question, mcpClient: mcp })]);
  console.log(`\n=== PLAIN GEMINI (${plain.ms} ms, ${plain.tokens} tokens) ===\n${plain.answer}`);
  console.log(`\n=== GEMINI + QLOO (${qloo.ms} ms, ${qloo.tokens} tokens) ===\n${qloo.answer}`);
  console.log("\n--- Qloo calls ---");
  for (const t of qloo.trace) console.log(`${t.status.padEnd(11)} ${String(t.ms).padStart(5)}ms ${t.tool} ${JSON.stringify(t.args)}`);
} finally {
  await mcp.close();
}
