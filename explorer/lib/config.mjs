// Reads Qloo settings from the environment. Accepts both the harness names
// (QLOO_API_KEY, QLOO_BASE_URL) and the names used in this repo's cloud env
// (API_Key, Server_URL / API_Server_URL).
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const RESULTS_DIR = join(ROOT, "results");

export function loadConfig(env = process.env) {
  const apiKey = (env.QLOO_API_KEY || env.API_Key || "").trim();
  const baseUrl = (env.QLOO_BASE_URL || env.API_Server_URL || env.Server_URL || "https://hackathon.api.qloo.com")
    .trim()
    .replace(/\/+$/, "");
  return { apiKey, baseUrl };
}

// Environment for a `qloo mcp` child process: the harness only trusts a
// non-production base URL when QLOO_TRUSTED_BASE_URL names the same URL.
export function harnessEnv(config, env = process.env) {
  return {
    ...env,
    QLOO_API_KEY: config.apiKey,
    QLOO_BASE_URL: config.baseUrl,
    QLOO_TRUSTED_BASE_URL: config.baseUrl,
  };
}

// Never let the key reach a file, log, or browser.
export function redact(value, apiKey) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return apiKey?.length >= 8 ? text.split(apiKey).join("[REDACTED]") : text;
}
