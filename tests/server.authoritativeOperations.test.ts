import { describe, expect, it } from "vitest";
import {
  isSupportedAuthoritativeApiOperation,
  MAX_SYNC_ADVENTURE_CLAIM_RECORDS,
  MAX_SYNC_ADVENTURE_PROGRESS_RECORDS,
  MAX_SYNC_FRONTLINE_CARD_RECORDS,
  parseRewardPayload,
  parseServerActionRequest,
  serverOperationTypes,
  supportedAuthoritativeApiOperations,
} from "@/features/server/authoritativeOperations";

describe("server authoritative operation contracts", () => {
  it("registers the documented sensitive operation types", () => {
    expect(serverOperationTypes).toEqual([
      "syncLocalSnapshot",
      "saveLoadout",
      "claimAdventureBattleResult",
      "openAdventureMapInteraction",
      "claimAdventureNodeReward",
      "purchaseShopOffer",
      "claimMission",
      "claimDailyLogin",
      "levelUpHero",
      "starUpHero",
      "upgradeFrontlineCard",
      "recordArenaResult",
    ]);
  });

  it("keeps the public authoritative API limited to RPC-backed operations", () => {
    expect(supportedAuthoritativeApiOperations).toEqual([
      "syncLocalSnapshot",
      "saveLoadout",
      "claimAdventureBattleResult",
      "claimAdventureNodeReward",
      "openAdventureMapInteraction",
      "purchaseShopOffer",
      "claimMission",
      "claimDailyLogin",
      "levelUpHero",
      "starUpHero",
      "upgradeFrontlineCard",
    ]);
    expect(isSupportedAuthoritativeApiOperation("purchaseShopOffer")).toBe(true);
    expect(isSupportedAuthoritativeApiOperation("syncLocalSnapshot")).toBe(true);
    expect(isSupportedAuthoritativeApiOperation("claimDailyLogin")).toBe(true);
    expect(isSupportedAuthoritativeApiOperation("claimMission")).toBe(true);
    expect(isSupportedAuthoritativeApiOperation("levelUpHero")).toBe(true);
    expect(isSupportedAuthoritativeApiOperation("starUpHero")).toBe(true);
    expect(isSupportedAuthoritativeApiOperation("upgradeFrontlineCard")).toBe(true);
  });

  it("accepts a capped local snapshot sync payload", () => {
    const parsed = parseServerActionRequest("syncLocalSnapshot", {
      idempotencyKey: "sync-local-20260514-0001",
      payload: {
        localVersion: "1",
        snapshot: {
          account: { name: "Commander", level: 12, xp: 1200 },
          resources: { gold: 1200, dust: 250, gems: 30, arenaTickets: 5, adventureKeys: 2 },
          heroes: [{ heroId: "bran", level: 4, stars: 2, shards: 12, xp: 40, skillLevel: 2 }],
          frontlineLoadout: {
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
          frontlineCardUnlocks: { order_guard_wall: true },
          frontlineCardLevels: { order_guard_wall: 2 },
          adventureProgress: { c1l1: { status: "cleared", cleared: true, firstClearTaken: true } },
          adventureMapClaims: { "c1-lower-cache": { claimed: true } },
        },
      },
    });

    expect(parsed.ok).toBe(true);
  });

  it("rejects local snapshot sync payloads with non-whitelisted root fields", () => {
    const parsed = parseServerActionRequest("syncLocalSnapshot", {
      idempotencyKey: "sync-local-20260514-extra",
      payload: {
        localVersion: "1",
        snapshot: {
          resources: { gold: 1200 },
          serviceRoleKey: "never-accepted",
        },
      },
    });

    expect(parsed).toMatchObject({
      ok: false,
      code: "invalid_request",
    });
  });

  it("rejects oversized local snapshot maps before reaching server persistence", () => {
    const parsedCards = parseServerActionRequest("syncLocalSnapshot", {
      idempotencyKey: "sync-local-20260514-cards",
      payload: {
        localVersion: "1",
        snapshot: {
          frontlineCardUnlocks: numberedRecord(MAX_SYNC_FRONTLINE_CARD_RECORDS + 1, true),
        },
      },
    });
    const parsedProgress = parseServerActionRequest("syncLocalSnapshot", {
      idempotencyKey: "sync-local-20260514-progress",
      payload: {
        localVersion: "1",
        snapshot: {
          adventureProgress: numberedRecord(MAX_SYNC_ADVENTURE_PROGRESS_RECORDS + 1, { cleared: true }),
        },
      },
    });
    const parsedClaims = parseServerActionRequest("syncLocalSnapshot", {
      idempotencyKey: "sync-local-20260514-claims",
      payload: {
        localVersion: "1",
        snapshot: {
          adventureMapClaims: numberedRecord(MAX_SYNC_ADVENTURE_CLAIM_RECORDS + 1, { claimed: true }),
        },
      },
    });

    expect(parsedCards).toMatchObject({ ok: false, code: "invalid_request" });
    expect(parsedProgress).toMatchObject({ ok: false, code: "invalid_request" });
    expect(parsedClaims).toMatchObject({ ok: false, code: "invalid_request" });
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

  it("accepts Adventure node reward claim payloads", () => {
    const parsed = parseServerActionRequest("claimAdventureNodeReward", {
      idempotencyKey: "adventure-node-20260511-0001",
      payload: { nodeId: "c1l3" },
    });

    expect(parsed.ok).toBe(true);
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

function numberedRecord<TValue>(count: number, value: TValue) {
  return Object.fromEntries(
    Array.from({ length: count }, (_, index) => [`entry_${index}`, value]),
  );
}
