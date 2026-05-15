export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

export type SupabasePublicConfigResult =
  | { ok: true; config: SupabasePublicConfig }
  | { ok: false; reason: SupabasePublicConfigFailure };

export type SupabasePublicConfigFailure =
  | "missing_url"
  | "missing_anon_key"
  | "invalid_url"
  | "insecure_url"
  | "secret_key_not_allowed";

export type SupabasePublicConfigEnv = Record<string, string | undefined>;

const LOCAL_SUPABASE_HOSTS = new Set(["127.0.0.1", "localhost"]);

export function getSupabasePublicConfig(env: SupabasePublicConfigEnv = getDefaultSupabasePublicEnv()): SupabasePublicConfigResult {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) return { ok: false, reason: "missing_url" };
  if (!anonKey) return { ok: false, reason: "missing_anon_key" };

  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return { ok: false, reason: "invalid_url" };
  if (!isAllowedPublicSupabaseUrl(parsedUrl)) return { ok: false, reason: "insecure_url" };
  if (looksLikeSupabaseSecretKey(anonKey)) return { ok: false, reason: "secret_key_not_allowed" };

  return {
    ok: true,
    config: {
      url: parsedUrl.toString().replace(/\/$/, ""),
      anonKey,
    },
  };
}

function getDefaultSupabasePublicEnv(): SupabasePublicConfigEnv {
  return {
    // Keep static property reads so Next can inline public env values in client bundles.
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function isAllowedPublicSupabaseUrl(url: URL) {
  if (url.protocol === "https:") return true;
  if (url.protocol !== "http:") return false;
  return LOCAL_SUPABASE_HOSTS.has(url.hostname);
}

export function looksLikeSupabaseSecretKey(value: string) {
  const key = value.trim();
  if (!key) return false;
  if (key.startsWith("sb_secret_")) return true;
  if (key.toLowerCase().includes("service_role")) return true;

  const payload = decodeJwtPayload(key);
  return payload?.role === "service_role";
}

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function decodeJwtPayload(value: string) {
  const [, payload] = value.split(".");
  if (!payload) return null;

  try {
    const json = decodeBase64(toBase64(payload));
    if (!json) return null;
    return JSON.parse(json) as { role?: string };
  } catch {
    return null;
  }
}

function toBase64(base64Url: string) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
}

function decodeBase64(value: string) {
  if (typeof globalThis.atob === "function") return globalThis.atob(value);
  if (typeof Buffer !== "undefined") return Buffer.from(value, "base64").toString("utf8");
  return null;
}
