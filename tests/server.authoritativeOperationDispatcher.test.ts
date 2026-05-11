import { describe, expect, it, vi } from "vitest";
import { purchaseShopOfferAuthoritatively } from "@/features/server/authoritativeOperationDispatcher";

describe("authoritative operation dispatcher", () => {
  it("keeps unsupported shop offers on the local path", async () => {
    const result = await purchaseShopOfferAuthoritatively("daily_raid_payout", {
      tokenProvider: async () => "valid-token-value",
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "unsupported_offer" });
  });

  it("falls back to local mode when there is no Supabase session", async () => {
    const result = await purchaseShopOfferAuthoritatively("adventure_key_ring", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("falls back to local mode when the authoritative API is disabled", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ ok: false, code: "not_found", reason: "Server-authoritative API is disabled" }),
    });

    const result = await purchaseShopOfferAuthoritatively("adventure_key_ring", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "api_disabled" });
  });

  it("returns authoritative resources after a server-backed purchase", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          offerId: "adventure_key_ring",
          resources: {
            gold: 500,
            dust: 50,
            gems: 5,
            arenaTickets: 5,
            adventureKeys: 1,
          },
        },
      }),
    });

    const result = await purchaseShopOfferAuthoritatively("adventure_key_ring", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      resources: {
        gold: 500,
        dust: 50,
        gems: 5,
        arenaTickets: 5,
        adventureKeys: 1,
      },
    });
  });

  it("does not fallback when the server rejects a connected purchase", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "daily_limit_reached", reason: "Daily limit reached" }),
    });

    const result = await purchaseShopOfferAuthoritatively("adventure_key_ring", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Daily limit reached",
    });
  });

  it("does not fallback on generic server not-found responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ ok: false, code: "not_found", reason: "Shop offer is not supported by the server yet" }),
    });

    const result = await purchaseShopOfferAuthoritatively("adventure_key_ring", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Shop offer is not supported by the server yet",
    });
  });
});
