import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnvFile(".env");
loadEnvFile(".env.local");

const args = parseArgs(process.argv.slice(2));
const remoteMode = args.remote !== false;
const requirePersistence = args["require-persistence"] !== false;
const issues = [];
const warnings = [];

const supabaseUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const persistence = cleanEnvValue(process.env.NEXT_PUBLIC_PERSISTENCE) || "local";
const authoritativeApiEnabled = cleanEnvValue(process.env.SERVER_AUTHORITATIVE_API_ENABLED) || "false";
const rateLimitBackend = cleanEnvValue(process.env.AUTHORITATIVE_RATE_LIMIT_BACKEND) || "memory";
const securityEventSink = cleanEnvValue(process.env.AUTHORITATIVE_SECURITY_EVENT_SINK) || "console";
const securityWebhookUrl = cleanEnvValue(process.env.AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_URL);

validatePublicEnvironment();
validateSupabasePublicConfig();
validatePersistenceConfig();
validateAuthoritativeConfig();
validateSecurityEventConfig();

if (warnings.length > 0) {
  console.warn("Supabase remote readiness warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (issues.length > 0) {
  console.error("Supabase remote readiness failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Supabase remote readiness check passed.");
console.log(`Supabase URL: ${redactUrl(supabaseUrl)}`);
console.log(`Persistence: ${persistence}`);
console.log(`Authoritative API enabled: ${authoritativeApiEnabled}`);
console.log(`Rate limit backend: ${rateLimitBackend}`);
console.log(`Security event sink: ${securityEventSink}`);

function validatePublicEnvironment() {
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith("NEXT_PUBLIC_")) continue;
    if (looksLikeDangerousPublicName(key)) {
      issues.push(`${key} looks like a secret name and must not be public.`);
    }
    if (value && looksLikePublicSecretValue(value)) {
      issues.push(`${key} looks like it contains a server secret.`);
    }
  }
}

function validateSupabasePublicConfig() {
  if (!supabaseUrl) issues.push("NEXT_PUBLIC_SUPABASE_URL is required for remote validation.");
  if (!supabaseAnonKey) issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is required for remote validation.");
  if (!supabaseUrl || !supabaseAnonKey) return;

  let parsedUrl;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    issues.push("NEXT_PUBLIC_SUPABASE_URL is not a valid URL.");
    return;
  }

  if (remoteMode && parsedUrl.protocol !== "https:") {
    issues.push("Remote Supabase URL must use https.");
  }
  if (remoteMode && isLocalSupabaseHost(parsedUrl.hostname)) {
    issues.push("Remote Supabase URL must not point to localhost or 127.0.0.1.");
  }
  if (!remoteMode && parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    issues.push("Supabase URL must use http or https.");
  }
  if (looksLikeSupabaseSecretKey(supabaseAnonKey)) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a service-role/secret key.");
  }
}

function validatePersistenceConfig() {
  if (!["local", "supabase"].includes(persistence)) {
    issues.push('NEXT_PUBLIC_PERSISTENCE must be "local" or "supabase".');
  }
  if (requirePersistence && persistence !== "supabase") {
    warnings.push('NEXT_PUBLIC_PERSISTENCE is not "supabase"; remote backend can be checked but the app will keep local persistence.');
  }
}

function validateAuthoritativeConfig() {
  if (!["true", "false"].includes(authoritativeApiEnabled)) {
    issues.push('SERVER_AUTHORITATIVE_API_ENABLED must be "true" or "false".');
  }
  if (persistence === "supabase" && authoritativeApiEnabled !== "true") {
    issues.push('SERVER_AUTHORITATIVE_API_ENABLED must be "true" when NEXT_PUBLIC_PERSISTENCE is "supabase".');
  }
  if (rateLimitBackend !== "memory") {
    issues.push("Unsupported AUTHORITATIVE_RATE_LIMIT_BACKEND. Supported value in this alpha: memory.");
  }
  if (remoteMode && authoritativeApiEnabled === "true" && rateLimitBackend === "memory") {
    warnings.push("Authoritative API uses in-memory rate limit. This is acceptable for alpha/single instance, not for public monetized traffic.");
  }
}

function validateSecurityEventConfig() {
  if (!["console", "disabled", "webhook"].includes(securityEventSink)) {
    issues.push('AUTHORITATIVE_SECURITY_EVENT_SINK must be "console", "disabled" or "webhook".');
  }
  if (securityEventSink === "webhook") {
    if (!securityWebhookUrl) {
      issues.push("AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_URL is required when sink is webhook.");
      return;
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(securityWebhookUrl);
    } catch {
      issues.push("AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_URL is not a valid URL.");
      return;
    }
    if (remoteMode && parsedUrl.protocol !== "https:") {
      issues.push("AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_URL must use https in remote mode.");
    }
  }
}

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (const arg of rawArgs) {
    if (arg === "--local") parsed.remote = false;
    if (arg === "--remote") parsed.remote = true;
    if (arg === "--no-require-persistence") parsed["require-persistence"] = false;
  }
  return parsed;
}

function cleanEnvValue(value) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

function looksLikeDangerousPublicName(key) {
  return /(^|_)secret($|_)|(^|_)service_?role($|_)|(^|_)password($|_)|(^|_)private_?key($|_)/i.test(key);
}

function looksLikePublicSecretValue(value) {
  const normalized = value.trim();
  if (!normalized) return false;
  if (looksLikeSupabaseSecretKey(normalized)) return true;
  if (/^sk_(live|test)_/i.test(normalized)) return true;
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(normalized)) return true;
  return false;
}

function looksLikeSupabaseSecretKey(value) {
  const key = value.trim();
  if (!key) return false;
  if (key.startsWith("sb_secret_")) return true;
  if (key.toLowerCase().includes("service_role")) return true;

  const payload = decodeJwtPayload(key);
  return payload?.role === "service_role";
}

function decodeJwtPayload(value) {
  const [, payload] = value.split(".");
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isLocalSupabaseHost(hostname) {
  return hostname === "127.0.0.1" || hostname === "localhost";
}

function redactUrl(value) {
  if (!value) return "(missing)";
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return "(invalid)";
  }
}
