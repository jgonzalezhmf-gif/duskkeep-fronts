import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildSmokeAdventureBattleRequest,
  parseSmokeAuthoritativeApiArgs,
  resolveSmokeAuthMode,
} from "./smoke-authoritative-api-options.mjs";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const DEFAULT_EMAIL = "api-smoke@duskkeep.local";
const DEFAULT_PASSWORD = "Duskkeep-smoke-2026!";

loadEnvFile(".env");
loadEnvFile(".env.local");
loadSupabaseCliEnvIfMissing();

const args = parseSmokeAuthoritativeApiArgs(process.argv.slice(2));
const authMode = resolveSmokeAuthMode(args);
const baseUrl = args["base-url"] ?? DEFAULT_BASE_URL;
const email = args.email ?? DEFAULT_EMAIL;
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

const session = await getSession({ authMode, email, password });
const token = session.access_token;
const idempotencyKey = `api-smoke-${Date.now()}`;
const endpoint = new URL("/api/server/authoritative", baseUrl).toString();
const loadoutRequestBody = {
  operationType: "saveLoadout",
  idempotencyKey: `${idempotencyKey}-loadout`,
  payload: {
    leaderId: "leader_aurora",
    squad: ["bran", "kara", "mira"],
    deck: [
      "order_guard_wall",
      "order_twin_slash",
      "order_focus_fire",
      "tactic_battle_hymn",
      "tactic_sanctuary",
      "tactic_smokescreen",
      "summon_wolf",
      "summon_barrier",
    ],
  },
};
const battleRequestBody = buildSmokeAdventureBattleRequest({
  idempotencyKey: `${idempotencyKey}-battle`,
  battleSeed: Date.now(),
});

const loadoutFirst = await postAuthoritative(endpoint, token, loadoutRequestBody);
assertOk(loadoutFirst, "loadout save");

const loadoutReplay = await postAuthoritative(endpoint, token, loadoutRequestBody);
assertOk(loadoutReplay, "loadout idempotent replay");

if (JSON.stringify(loadoutFirst.body) !== JSON.stringify(loadoutReplay.body)) {
  fail("Loadout idempotent replay returned a different body.");
}

const battleFirst = await postAuthoritative(endpoint, token, battleRequestBody);
assertOk(battleFirst, "first battle claim");

const battleReplay = await postAuthoritative(endpoint, token, battleRequestBody);
assertOk(battleReplay, "battle idempotent replay");

if (JSON.stringify(battleFirst.body) !== JSON.stringify(battleReplay.body)) {
  fail("Battle idempotent replay returned a different body.");
}

console.log("Authoritative API smoke passed.");
console.log(`Endpoint: ${endpoint}`);
console.log(`Auth mode: ${authMode}`);
console.log(`Operations: ${loadoutRequestBody.operationType}, ${battleRequestBody.operationType}`);
console.log(`User: ${authMode === "anonymous" ? "anonymous" : email}`);

async function getSession({ authMode, email, password }) {
  if (authMode === "anonymous") {
    const anonymous = await supabase.auth.signInAnonymously();
    if (anonymous.error) {
      fail(`Supabase anonymous sign-in failed: ${anonymous.error.message}`);
    }
    if (!anonymous.data.session) {
      fail("Supabase anonymous sign-in did not return a session. Check that Anonymous Sign-Ins are enabled.");
    }
    return anonymous.data.session;
  }

  const signUp = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { displayName: "API Smoke" },
    },
  });

  if (signUp.data.session) return signUp.data.session;

  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error) {
    fail(`Supabase Auth sign-in failed: ${signIn.error.message}`);
  }

  if (!signIn.data.session) {
    fail("Supabase Auth did not return a session. Check local email confirmation settings.");
  }

  return signIn.data.session;
}

async function postAuthoritative(endpoint, token, body) {
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    fail(`Could not reach ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const responseBody = await response.json().catch(() => null);
  return {
    status: response.status,
    body: responseBody,
  };
}

function assertOk(response, label) {
  if (response.status !== 200 || response.body?.ok !== true) {
    fail(`${label} failed with HTTP ${response.status}: ${JSON.stringify(response.body)}`);
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

function cleanEnvValue(value) {
  return value?.trim().replace(/^["']|["']$/g, "");
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

function fail(message) {
  console.error(message);
  process.exit(1);
}
