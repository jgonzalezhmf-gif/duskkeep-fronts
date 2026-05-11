import { describe, expect, it } from "vitest";
import {
  parseRewardPayload,
  parseServerActionRequest,
  serverOperationTypes,
} from "@/features/server/authoritativeOperations";

describe("server authoritative operation contracts", () => {
  it("registers the documented sensitive operation types", () => {
    expect(serverOperationTypes).toEqual([
      "syncLocalSnapshot",
      "saveLoadout",
      "claimAdventureBattleResult",
      "openAdventureMapInteraction",
      "purchaseShopOffer",
      "claimMission",
      "claimDailyLogin",
      "upgradeFrontlineCard",
      "recordArenaResult",
    ]);
  });

  it("normalizes purchase quantity while requiring idempotency", () => {
    const parsed = parseServerActionRequest("purchaseShopOffer", {
      idempotencyKey: "shop-buy-20260511-0001",
      payload: { offerId: "adventure_key_ring" },
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.request.payload).toEqual({ offerId: "adventure_key_ring", quantity: 1 });
  });

  it("rejects malformed idempotency keys before reaching server logic", () => {
    const parsed = parseServerActionRequest("openAdventureMapInteraction", {
      idempotencyKey: "short",
      payload: { interactionId: "c1-lower-cache" },
    });

    expect(parsed).toMatchObject({
      ok: false,
      code: "invalid_request",
    });
  });

  it("enforces current Frontline loadout shape", () => {
    const parsed = parseServerActionRequest("saveLoadout", {
      idempotencyKey: "loadout-save-20260511-0001",
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
    });

    expect(parsed.ok).toBe(true);
  });

  it("blocks invalid battle result winners for Adventure claims", () => {
    const parsed = parseServerActionRequest("claimAdventureBattleResult", {
      idempotencyKey: "adventure-result-20260511-0001",
      payload: {
        nodeId: "c1l2",
        battleSeed: 123,
        winner: "draw",
        turns: 7,
        battleSummary: { lanes: [] },
      },
    });

    expect(parsed.ok).toBe(false);
  });

  it("accepts reward payloads but rejects negative resources", () => {
    expect(parseRewardPayload({ gold: 25, adventureKeys: 1 }).success).toBe(true);
    expect(parseRewardPayload({ gold: -1 }).success).toBe(false);
  });
});
