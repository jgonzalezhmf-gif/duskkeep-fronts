import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_EMAIL_PREFIX = "guest-upgrade-smoke";
const DEFAULT_PASSWORD = "Duskkeep-guest-upgrade-2026!";

loadEnvFile(".env");
loadEnvFile(".env.local");
loadSupabaseCliEnvIfMissing();

const args = parseArgs(process.argv.slice(2));
const email = args.email ?? `${DEFAULT_EMAIL_PREFIX}-${Date.now()}@duskkeep.local`;
const password = args.password ?? DEFAULT_PASSWORD;
const supabaseUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  fail("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const anonymous = await supabase.auth.signInAnonymously();
if (anonymous.error || !anonymous.data.session) {
  fail("Anonymous sign-in failed. Check that Supabase Anonymous Auth is enabled.");
}

const anonymousUserId = anonymous.data.session.user.id;
const firstSnapshot = await loadPlayerSnapshot("anonymous snapshot");
const firstProfileId = firstSnapshot.result.profileId;
assertStarterSnapshot(firstSnapshot, "anonymous snapshot");

const upgrade = await supabase.auth.updateUser({ email, password });
if (upgrade.error) {
  fail(`Anonymous upgrade failed: ${classifySafeAuthError(upgrade.error.message)}`);
}

const upgradedSession = await supabase.auth.getSession();
if (upgradedSession.error || !upgradedSession.data.session) {
  fail("Could not read upgraded session.");
}

const upgradedUser = upgradedSession.data.session.user;
if (upgradedUser.id !== anonymousUserId) {
  fail("Anonymous upgrade changed the user id.");
}

const secondSnapshot = await loadPlayerSnapshot("upgraded snapshot");
assertStarterSnapshot(secondSnapshot, "upgraded snapshot");

if (secondSnapshot.result.profileId !== firstProfileId) {
  fail("Anonymous upgrade did not preserve the server profile id.");
}

console.log("Anonymous guest upgrade smoke passed.");
console.log(`User id preserved: ${anonymousUserId}`);
console.log(`Profile id preserved: ${firstProfileId}`);
console.log(`Email used: ${email}`);

async function loadPlayerSnapshot(label) {
  const { data, error } = await supabase.rpc("get_player_snapshot");
  if (error) fail(`${label} failed.`);
  if (!data || data.ok !== true || data.authoritative !== true || !data.result?.profileId || !data.result?.snapshot) {
    fail(`${label} returned an invalid response.`);
  }
  return data;
}

function assertStarterSnapshot(snapshotResult, label) {
  const snapshot = snapshotResult.result.snapshot;
  if (snapshot.resources?.gold !== 500 || snapshot.resources?.dust !== 50 || snapshot.resources?.gems !== 50) {
    fail(`${label} did not include starter resources.`);
  }
  if (!Array.isArray(snapshot.heroes) || snapshot.heroes.length < 6) {
    fail(`${label} did not include starter heroes.`);
  }
  if (snapshot.frontlineCardUnlocks?.order_guard_wall !== true || snapshot.frontlineCardUnlocks?.summon_barrier !== true) {
    fail(`${label} did not include starter Frontline cards.`);
  }
  if (
    snapshot.frontlineLoadout?.leaderId !== "leader_aurora" ||
    !Array.isArray(snapshot.frontlineLoadout?.squad) ||
    snapshot.frontlineLoadout.squad.length !== 3 ||
    !Array.isArray(snapshot.frontlineLoadout?.deck) ||
    snapshot.frontlineLoadout.deck.length !== 8
  ) {
    fail(`${label} did not include the starter Frontline loadout.`);
  }
}

function classifySafeAuthError(message) {
  const normalized = message.toLowerCase();
  if (normalized.includes("rate") || normalized.includes("too many")) return "rate_limited";
  if (normalized.includes("anonymous")) return "anonymous_auth_unavailable";
  return "auth_error";
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

function loadSupabaseCliEnvIfMissing() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;

  let output;
  try {
    output = execFileSync("cmd.exe", ["/d", "/s", "/c", "npx.cmd supabase status -o env"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return;
  }

  const values = parseEnvLines(output);
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && values.API_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = values.API_URL;
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && values.ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = values.ANON_KEY;
  }
}

function parseEnvLines(raw) {
  const values = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    values[trimmed.slice(0, separator)] = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) continue;

    const [key, inlineValue] = arg.slice(2).split("=", 2);
    parsed[key] = inlineValue ?? rawArgs[index + 1];
    if (!inlineValue) index += 1;
  }
  return parsed;
}

function cleanEnvValue(value) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
