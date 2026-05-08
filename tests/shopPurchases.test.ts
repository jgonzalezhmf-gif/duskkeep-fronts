import { describe, expect, it } from "vitest";
import { SHOP_OFFERS_BY_ID } from "@/data/shop";
import { applyShopOfferPurchase, getShopOfferRemaining, validateShopOfferPurchase } from "@/lib/shopPurchases";

const emptyCounts = {
  shopPurchases: {},
  dailyShopPurchases: {},
};

describe("shop purchases", () => {
  it("blocks adventure key offers until the key system is unlocked", () => {
    expect(validateShopOfferPurchase(SHOP_OFFERS_BY_ID.adventure_key_ring, emptyCounts, {})).toEqual({
      ok: false,
      reason: "Adventure keys are not unlocked yet",
    });
  });

  it("allows adventure key offers once the unlock level is cleared", () => {
    expect(
      validateShopOfferPurchase(SHOP_OFFERS_BY_ID.adventure_key_ring, emptyCounts, {
        c1l2: { cleared: true, firstClearTaken: true },
      }),
    ).toEqual({ ok: true });
  });

  it("blocks one-time offers after purchase", () => {
    expect(
      validateShopOfferPurchase(
        SHOP_OFFERS_BY_ID.frontline_starter_cache,
        {
          ...emptyCounts,
          shopPurchases: { frontline_starter_cache: 1 },
        },
        {},
      ),
    ).toEqual({
      ok: false,
      reason: "Already purchased",
    });
  });

  it("blocks daily limited offers when the daily limit is reached", () => {
    expect(
      validateShopOfferPurchase(
        SHOP_OFFERS_BY_ID.adventure_key_ring,
        {
          ...emptyCounts,
          dailyShopPurchases: { adventure_key_ring: 1 },
        },
        {
          c1l2: { cleared: true, firstClearTaken: true },
        },
      ),
    ).toEqual({
      ok: false,
      reason: "Daily limit reached",
    });
  });

  it("increments lifetime and daily purchase counters", () => {
    expect(applyShopOfferPurchase(emptyCounts, "daily_gold_cache")).toEqual({
      shopPurchases: { daily_gold_cache: 1 },
      dailyShopPurchases: { daily_gold_cache: 1 },
    });
  });

  it("calculates remaining stock for unknown, one-time, daily and unlimited offers", () => {
    expect(getShopOfferRemaining(undefined, emptyCounts)).toBe(0);
    expect(getShopOfferRemaining(SHOP_OFFERS_BY_ID.frontline_starter_cache, emptyCounts)).toBe(1);
    expect(
      getShopOfferRemaining(SHOP_OFFERS_BY_ID.frontline_starter_cache, {
        ...emptyCounts,
        shopPurchases: { frontline_starter_cache: 1 },
      }),
    ).toBe(0);
    expect(getShopOfferRemaining(SHOP_OFFERS_BY_ID.adventure_key_ring, emptyCounts)).toBe(1);
    expect(getShopOfferRemaining(SHOP_OFFERS_BY_ID.command_spellforge_bundle, emptyCounts)).toBeNull();
  });
});
