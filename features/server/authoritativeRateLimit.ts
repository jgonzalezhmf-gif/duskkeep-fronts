import { createHash } from "node:crypto";

export const AUTHORITATIVE_RATE_LIMIT_WINDOW_MS = 60_000;
export const AUTHORITATIVE_RATE_LIMIT_MAX_REQUESTS = 90;
export const AUTHORITATIVE_RATE_LIMIT_MAX_KEYS = 5_000;
export const AUTHORITATIVE_OPERATION_RATE_LIMIT_WINDOW_MS = 60_000;
export const AUTHORITATIVE_OPERATION_RATE_LIMIT_MAX_KEYS = 10_000;
export const AUTHORITATIVE_RATE_LIMIT_REASON = "Too many requests";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type AuthoritativeRateLimitStore = Map<string, RateLimitEntry>;

export type AuthoritativeRateLimitResult =
  | {
      ok: true;
      remaining: number;
      resetAt: number;
    }
  | {
      ok: false;
      status: 429;
      headers: Record<string, string>;
      body: {
        ok: false;
        code: "rate_limited";
        reason: typeof AUTHORITATIVE_RATE_LIMIT_REASON;
      };
    };

export function createAuthoritativeRateLimitKey(headers: Pick<Headers, "get">) {
  const authorization = headers.get("authorization");
  if (authorization?.startsWith("Bearer ") && authorization.length > "Bearer ".length + 12) {
    return `auth:${hashRateLimitIdentity(authorization)}`;
  }

  return `ip:${hashRateLimitIdentity(getForwardedClientIp(headers))}`;
}

export function createAuthoritativeOperationRateLimitKey(identityKey: string, operationType: string) {
  return `op:${sanitizeIdentity(operationType)}:${identityKey}`;
}

export function getAuthoritativeOperationRateLimitMaxRequests(operationType: string) {
  if (operationType === "syncLocalSnapshot") return 6;
  if (operationType === "purchaseShopOffer") return 20;
  if (operationType === "openAdventureMapInteraction") return 20;
  if (operationType === "claimDailyLogin") return 10;
  if (operationType === "claimMission") return 30;
  if (operationType === "saveLoadout") return 30;
  if (operationType.startsWith("upgrade") || operationType.endsWith("Hero")) return 30;
  if (operationType.includes("Battle") || operationType.includes("Result") || operationType.includes("Raid")) return 45;
  return 60;
}

export function checkAuthoritativeRateLimit({
  key,
  store,
  now,
  maxRequests = AUTHORITATIVE_RATE_LIMIT_MAX_REQUESTS,
  windowMs = AUTHORITATIVE_RATE_LIMIT_WINDOW_MS,
  maxKeys = AUTHORITATIVE_RATE_LIMIT_MAX_KEYS,
}: {
  key: string;
  store: AuthoritativeRateLimitStore;
  now: number;
  maxRequests?: number;
  windowMs?: number;
  maxKeys?: number;
}): AuthoritativeRateLimitResult {
  pruneExpiredEntries(store, now, maxKeys);

  const existing = store.get(key);
  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, maxRequests - 1), resetAt };
  }

  if (existing.count >= maxRequests) {
    return rateLimited(existing.resetAt, now);
  }

  existing.count += 1;
  return { ok: true, remaining: Math.max(0, maxRequests - existing.count), resetAt: existing.resetAt };
}

function pruneExpiredEntries(store: AuthoritativeRateLimitStore, now: number, maxKeys: number) {
  if (store.size <= maxKeys) return;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
  if (store.size <= maxKeys) return;

  const overflow = store.size - maxKeys;
  let deleted = 0;
  for (const key of store.keys()) {
    store.delete(key);
    deleted += 1;
    if (deleted >= overflow) return;
  }
}

export function createAuthoritativeRateLimitFailure(resetAt: number, now: number): Extract<AuthoritativeRateLimitResult, { ok: false }> {
  return rateLimited(resetAt, now);
}

function rateLimited(resetAt: number, now: number): Extract<AuthoritativeRateLimitResult, { ok: false }> {
  return {
    ok: false,
    status: 429,
    headers: {
      "Retry-After": String(Math.max(1, Math.ceil((resetAt - now) / 1000))),
    },
    body: {
      ok: false,
      code: "rate_limited",
      reason: AUTHORITATIVE_RATE_LIMIT_REASON,
    },
  };
}

function hashRateLimitIdentity(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function getForwardedClientIp(headers: Pick<Headers, "get">) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  return sanitizeIdentity(forwardedFor || realIp || "unknown");
}

function sanitizeIdentity(value: string) {
  return value.slice(0, 96).replace(/[^a-zA-Z0-9:.[\]_-]/g, "_");
}
