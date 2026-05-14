import { describe, expect, it } from "vitest";
import {
  AUTHORITATIVE_RATE_LIMIT_REASON,
  checkAuthoritativeRateLimit,
  createAuthoritativeRateLimitFailure,
  createAuthoritativeRateLimitKey,
  type AuthoritativeRateLimitStore,
} from "@/features/server/authoritativeRateLimit";

function headers(values: Record<string, string | undefined>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    },
  };
}

describe("authoritative API rate limiting", () => {
  it("uses a hashed bearer token key without storing the raw token", () => {
    const token = "Bearer sensitive-token-value-12345";
    const key = createAuthoritativeRateLimitKey(headers({ authorization: token }));

    expect(key).toMatch(/^auth:[a-f0-9]{32}$/);
    expect(key).not.toContain("sensitive-token");
    expect(createAuthoritativeRateLimitKey(headers({ authorization: token }))).toBe(key);
  });

  it("falls back to a hashed forwarded IP key when no bearer token is available", () => {
    const key = createAuthoritativeRateLimitKey(headers({ "x-forwarded-for": "203.0.113.10, 10.0.0.1" }));

    expect(key).toMatch(/^ip:[a-f0-9]{32}$/);
    expect(key).not.toContain("203.0.113.10");
  });

  it("blocks requests after the configured window quota is exhausted", () => {
    const store: AuthoritativeRateLimitStore = new Map();
    const first = checkAuthoritativeRateLimit({ key: "auth:test", store, now: 1_000, maxRequests: 2, windowMs: 10_000 });
    const second = checkAuthoritativeRateLimit({ key: "auth:test", store, now: 1_500, maxRequests: 2, windowMs: 10_000 });
    const third = checkAuthoritativeRateLimit({ key: "auth:test", store, now: 2_000, maxRequests: 2, windowMs: 10_000 });

    expect(first).toMatchObject({ ok: true, remaining: 1, resetAt: 11_000 });
    expect(second).toMatchObject({ ok: true, remaining: 0, resetAt: 11_000 });
    expect(third).toEqual({
      ok: false,
      status: 429,
      headers: { "Retry-After": "9" },
      body: { ok: false, code: "rate_limited", reason: AUTHORITATIVE_RATE_LIMIT_REASON },
    });
  });

  it("allows new requests after the rate limit window resets", () => {
    const store: AuthoritativeRateLimitStore = new Map();
    checkAuthoritativeRateLimit({ key: "auth:test", store, now: 1_000, maxRequests: 1, windowMs: 1_000 });

    expect(checkAuthoritativeRateLimit({ key: "auth:test", store, now: 2_000, maxRequests: 1, windowMs: 1_000 })).toMatchObject({
      ok: true,
      remaining: 0,
      resetAt: 3_000,
    });
  });

  it("creates generic failure responses with retry metadata", () => {
    expect(createAuthoritativeRateLimitFailure(10_000, 9_100)).toEqual({
      ok: false,
      status: 429,
      headers: { "Retry-After": "1" },
      body: { ok: false, code: "rate_limited", reason: AUTHORITATIVE_RATE_LIMIT_REASON },
    });
  });
});
