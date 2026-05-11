import { describe, expect, it } from "vitest";
import {
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

  it("rejects unsupported operations even if they have contracts", () => {
    expect(
      prepareAuthoritativeRpcCall({
        body: {
          operationType: "claimMission",
          idempotencyKey: "mission-claim-20260511",
          payload: { missionId: "daily-win", cycleKey: "2026-05-11" },
        },
        headers: headers("Bearer valid-token-value"),
        env: enabledEnv,
      }),
    ).toMatchObject({
      ok: false,
      status: 400,
      body: { code: "invalid_request" },
    });
  });

  it("extracts only valid bearer authorization", () => {
    expect(getBearerAuthorization(headers("Bearer valid-token-value"))).toBe("Bearer valid-token-value");
    expect(getBearerAuthorization(headers("Basic value"))).toBeNull();
  });
});
