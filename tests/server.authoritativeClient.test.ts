import { describe, expect, it, vi } from "vitest";
import { callAuthoritativeOperation } from "@/features/server/authoritativeClient";

describe("authoritative API client", () => {
  it("validates requests before calling the network", async () => {
    const fetcher = vi.fn();

    const result = await callAuthoritativeOperation(
      "openAdventureMapInteraction",
      {
        idempotencyKey: "short",
        payload: { interactionId: "c1-lower-cache" },
      },
      { token: "valid-token-value", fetcher },
    );

    expect(result).toMatchObject({
      status: 400,
      body: { ok: false, code: "invalid_request" },
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("requires a bearer token before calling the network", async () => {
    const fetcher = vi.fn();

    const result = await callAuthoritativeOperation(
      "purchaseShopOffer",
      {
        idempotencyKey: "shop-buy-20260511-0001",
        payload: { offerId: "adventure_key_ring", quantity: 1 },
      },
      { token: "  ", fetcher },
    );

    expect(result).toMatchObject({
      status: 401,
      body: { ok: false, code: "unauthenticated" },
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("posts a validated operation to the authoritative endpoint", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, authoritative: true, result: { offerId: "adventure_key_ring" } }),
    });

    const result = await callAuthoritativeOperation(
      "purchaseShopOffer",
      {
        idempotencyKey: "shop-buy-20260511-0001",
        payload: { offerId: "adventure_key_ring" },
      },
      { token: "valid-token-value", fetcher },
    );

    expect(fetcher).toHaveBeenCalledWith("/api/server/authoritative", {
      method: "POST",
      headers: {
        Authorization: "Bearer valid-token-value",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operationType: "purchaseShopOffer",
        idempotencyKey: "shop-buy-20260511-0001",
        payload: { offerId: "adventure_key_ring", quantity: 1 },
      }),
    });
    expect(result).toMatchObject({
      status: 200,
      body: { ok: true, authoritative: true },
    });
  });

  it("keeps unsupported contracts away from the exposed API client", async () => {
    const fetcher = vi.fn();

    const result = await callAuthoritativeOperation(
      "upgradeFrontlineCard" as never,
      {
        idempotencyKey: "card-upgrade-20260511-0001",
        payload: { cardId: "guard_break" } as never,
      },
      { token: "valid-token-value", fetcher },
    );

    expect(result).toMatchObject({
      status: 400,
      body: { ok: false, code: "invalid_request" },
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("returns server failures without throwing", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ ok: false, code: "forbidden", reason: "Not allowed" }),
    });

    const result = await callAuthoritativeOperation(
      "claimAdventureNodeReward",
      {
        idempotencyKey: "node-claim-20260511-0001",
        payload: { nodeId: "c1l3" },
      },
      { token: "valid-token-value", fetcher },
    );

    expect(result).toEqual({
      status: 403,
      body: { ok: false, code: "forbidden", reason: "Not allowed" },
    });
  });
});
