import { describe, expect, it } from "vitest";
import {
  AUTHORITATIVE_RPC_FAILURE_REASON,
  createAuthoritativeRpcFailureResponse,
  getBearerAuthorization,
  prepareAuthoritativeRpcCall,
} from "@/features/server/authoritativeRpcProxy";

function headers(authorization?: string) {
  return {
    get(name: string) {
      return name.toLowerCase() === "authorization" ? authorization ?? null : null;
    },
  };
}

const enabledEnv = {
  SERVER_AUTHORITATIVE_API_ENABLED: "true",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
};

describe("authoritative RPC proxy", () => {
  it("stays hidden unless the server flag is enabled", () => {
    expect(
      prepareAuthoritativeRpcCall({
        body: {},
        headers: headers("Bearer valid-token-value"),
        env: {},
      }),
    ).toMatchObject({
      ok: false,
      status: 404,
      body: { code: "not_found" },
    });
  });

  it("requires a bearer token", () => {
    expect(
      prepareAuthoritativeRpcCall({
        body: { operationType: "claimAdventureNodeReward", idempotencyKey: "node-claim-20260511", payload: { nodeId: "c1l3" } },
        headers: headers(),
        env: enabledEnv,
      }),
    ).toMatchObject({
      ok: false,
      status: 401,
      body: { code: "unauthenticated" },
    });
  });

  it("rejects unsafe Supabase public configuration before preparing RPC calls", () => {
    expect(
      prepareAuthoritativeRpcCall({
        body: { operationType: "claimAdventureNodeReward", idempotencyKey: "node-claim-20260511", payload: { nodeId: "c1l3" } },
        headers: headers("Bearer valid-token-value"),
        env: {
          SERVER_AUTHORITATIVE_API_ENABLED: "true",
          NEXT_PUBLIC_SUPABASE_URL: "http://example.com",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        },
      }),
    ).toMatchObject({
      ok: false,
      status: 503,
      body: { code: "invalid_state" },
    });
  });

  it("maps Adventure node claims to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "claimAdventureNodeReward",
        idempotencyKey: "node-claim-20260511",
        payload: { nodeId: "c1l3" },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "claim_adventure_node_reward",
      rpcArgs: {
        p_idempotency_key: "node-claim-20260511",
        p_node_id: "c1l3",
      },
    });
  });

  it("maps Frontline loadout saves to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "saveLoadout",
        idempotencyKey: "loadout-save-20260511",
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
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "save_frontline_loadout",
      rpcArgs: {
        p_idempotency_key: "loadout-save-20260511",
        p_leader_id: "leader_aurora",
        p_squad: ["bran", "kara", "mira"],
        p_deck: [
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
  });

  it("maps local snapshot sync to the correct RPC call", () => {
    const snapshot = {
      resources: { gold: 1200, dust: 200, gems: 40, arenaTickets: 5, adventureKeys: 1 },
    };
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "syncLocalSnapshot",
        idempotencyKey: "sync-local-20260514-0001",
        payload: { localVersion: "1", snapshot },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "sync_local_snapshot",
      rpcArgs: {
        p_idempotency_key: "sync-local-20260514-0001",
        p_local_version: "1",
        p_snapshot: snapshot,
      },
    });
  });

  it("normalizes purchase quantity before mapping to RPC", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "purchaseShopOffer",
        idempotencyKey: "shop-buy-20260511",
        payload: { offerId: "adventure_key_ring" },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "purchase_shop_offer",
      rpcArgs: {
        p_quantity: 1,
      },
    });
  });

  it("maps daily login claims to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "claimDailyLogin",
        idempotencyKey: "daily-login-20260511",
        payload: { localDayKey: "2026-05-11" },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "claim_daily_login",
      rpcArgs: {
        p_idempotency_key: "daily-login-20260511",
        p_local_day_key: "2026-05-11",
      },
    });
  });

  it("maps mission reward claims to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "claimMission",
        idempotencyKey: "mission-claim-20260511",
        payload: { missionId: "d_battles_3", cycleKey: "daily:2026-05-11" },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "claim_mission_reward",
      rpcArgs: {
        p_idempotency_key: "mission-claim-20260511",
        p_mission_id: "d_battles_3",
        p_cycle_key: "daily:2026-05-11",
      },
    });
  });

  it("maps Frontline card upgrades to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "upgradeFrontlineCard",
        idempotencyKey: "card-upgrade-20260514",
        payload: { cardId: "order_guard_wall" },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "upgrade_frontline_card",
      rpcArgs: {
        p_idempotency_key: "card-upgrade-20260514",
        p_card_id: "order_guard_wall",
      },
    });
  });

  it("maps Frontline fortress upgrades to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "upgradeFrontlineFortress",
        idempotencyKey: "frontline-fortress-20260514",
        payload: { buildingId: "keep" },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "upgrade_frontline_fortress",
      rpcArgs: {
        p_idempotency_key: "frontline-fortress-20260514",
        p_building_id: "keep",
      },
    });
  });

  it("maps Frontline fortress raid resolution to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "resolveFrontlineFortressRaid",
        idempotencyKey: "frontline-fortress-raid-20260515",
        payload: {},
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "resolve_frontline_fortress_raid",
      rpcArgs: {
        p_idempotency_key: "frontline-fortress-raid-20260515",
      },
    });
  });

  it("maps Arena results to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "recordArenaResult",
        idempotencyKey: "arena-result-20260515",
        payload: {
          opponentId: "arena_bonewood",
          battleSeed: 123,
          winner: "draw",
          turns: 9,
          battleSummary: { allyCoreHp: 0, enemyCoreHp: 0 },
        },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "record_arena_result",
      rpcArgs: {
        p_idempotency_key: "arena-result-20260515",
        p_opponent_id: "arena_bonewood",
        p_battle_seed: 123,
        p_winner: "draw",
        p_turns: 9,
      },
    });
  });

  it("maps Event results to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "recordEventResult",
        idempotencyKey: "event-result-20260515",
        payload: {
          eventId: "gold_rush",
          battleSeed: 123,
          winner: "ally",
          turns: 7,
          battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
        },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "record_event_result",
      rpcArgs: {
        p_idempotency_key: "event-result-20260515",
        p_event_id: "gold_rush",
        p_battle_seed: 123,
        p_winner: "ally",
        p_turns: 7,
      },
    });
  });

  it("maps hero level ups to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "levelUpHero",
        idempotencyKey: "hero-level-20260514",
        payload: { heroId: "bran" },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "level_up_hero",
      rpcArgs: {
        p_idempotency_key: "hero-level-20260514",
        p_hero_id: "bran",
      },
    });
  });

  it("maps hero star ups to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "starUpHero",
        idempotencyKey: "hero-star-20260514",
        payload: { heroId: "bran" },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "star_up_hero",
      rpcArgs: {
        p_idempotency_key: "hero-star-20260514",
        p_hero_id: "bran",
      },
    });
  });

  it("maps hero skill ups to the correct RPC call", () => {
    const prepared = prepareAuthoritativeRpcCall({
      body: {
        operationType: "skillUpHero",
        idempotencyKey: "hero-skill-20260514",
        payload: { heroId: "bran" },
      },
      headers: headers("Bearer valid-token-value"),
      env: enabledEnv,
    });

    expect(prepared).toMatchObject({
      ok: true,
      rpcName: "skill_up_hero",
      rpcArgs: {
        p_idempotency_key: "hero-skill-20260514",
        p_hero_id: "bran",
      },
    });
  });

  it("extracts only valid bearer authorization", () => {
    expect(getBearerAuthorization(headers("Bearer valid-token-value"))).toBe("Bearer valid-token-value");
    expect(getBearerAuthorization(headers("Basic value"))).toBeNull();
  });

  it("returns generic RPC failure responses without leaking database details", () => {
    const response = createAuthoritativeRpcFailureResponse();

    expect(response).toEqual({
      ok: false,
      status: 502,
      body: {
        ok: false,
        code: "invalid_state",
        reason: AUTHORITATIVE_RPC_FAILURE_REASON,
      },
    });
    expect(response.body.reason).not.toContain("relation");
    expect(response.body.reason).not.toContain("JWT");
    expect(response.body.reason).not.toContain("SQLSTATE");
  });
});
