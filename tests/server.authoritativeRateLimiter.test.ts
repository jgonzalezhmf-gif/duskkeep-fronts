import { describe, expect, it } from "vitest";
import {
  createInMemoryAuthoritativeRateLimiter,
  resolveAuthoritativeRateLimiterBackend,
} from "@/features/server/authoritativeRateLimiter";

describe("authoritative rate limiter adapter", () => {
  it("keeps global and operation quotas in separate stores", async () => {
    const limiter = createInMemoryAuthoritativeRateLimiter();

    await expect(limiter.checkGlobal({ identityKey: "auth:test", now: 1_000 })).resolves.toMatchObject({
      ok: true,
    });

    for (let index = 0; index < 20; index += 1) {
      await expect(
        limiter.checkOperation({
          identityKey: "auth:test",
          operationType: "purchaseShopOffer",
          now: 1_000 + index,
        }),
      ).resolves.toMatchObject({ ok: true });
    }

    await expect(
      limiter.checkOperation({
        identityKey: "auth:test",
        operationType: "purchaseShopOffer",
        now: 2_000,
      }),
    ).resolves.toMatchObject({
      ok: false,
      status: 429,
      body: { code: "rate_limited" },
    });

    await expect(limiter.checkGlobal({ identityKey: "auth:test", now: 2_000 })).resolves.toMatchObject({
      ok: true,
    });
  });

  it("accepts only the explicit memory backend until a distributed adapter is added", () => {
    expect(resolveAuthoritativeRateLimiterBackend({ AUTHORITATIVE_RATE_LIMIT_BACKEND: "memory" })).toBe("memory");
    expect(resolveAuthoritativeRateLimiterBackend({})).toBe("memory");
    expect(() => resolveAuthoritativeRateLimiterBackend({ AUTHORITATIVE_RATE_LIMIT_BACKEND: "redis" })).toThrow(
      "Unsupported AUTHORITATIVE_RATE_LIMIT_BACKEND",
    );
  });
});
