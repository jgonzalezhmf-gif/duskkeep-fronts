import { createClient } from "@supabase/supabase-js";
import {
  isSupportedAuthoritativeApiOperation,
  parseServerActionRequest,
  type ServerOperationPayload,
  type SupportedAuthoritativeApiOperation,
} from "@/features/server/authoritativeOperations";
import {
  isAuthoritativeBattleReplayValidationEnabled,
  isFrontlineBattleOperation,
  normalizeFrontlineReplayContext,
  resolveFrontlineBattlePresetForOperation,
  validateFrontlineBattleReplayPayload,
  type FrontlineBattleServerOperation,
} from "@/features/server/authoritativeBattleReplayGuard";
import { AUTHORITATIVE_MAX_AUTHORIZATION_HEADER_CHARS } from "@/features/server/authoritativeRequestGuards";
import { isPublicEnvironmentSafe } from "@/features/server/publicEnvironmentSafety";
import { getSupabasePublicConfig } from "@/features/server/supabasePublicConfig";

export type SupportedAuthoritativeRpcOperation = SupportedAuthoritativeApiOperation;
type AuthoritativeSupabaseClient = ReturnType<typeof createClient<Record<string, never>>>;

type RuntimeEnv = Record<string, string | undefined>;

export type AuthoritativeRpcProxyFailure = {
  ok: false;
  status: number;
  body: {
    ok: false;
    code: string;
    reason: string;
  };
};

export type AuthoritativeRpcProxySuccess = {
  ok: true;
  operationType: SupportedAuthoritativeRpcOperation;
  payload: ServerOperationPayload<SupportedAuthoritativeRpcOperation>;
  rpcName: string;
  rpcArgs: Record<string, unknown>;
  supabaseUrl: string;
  supabaseAnonKey: string;
  authorization: string;
};

export const AUTHORITATIVE_RPC_FAILURE_REASON = "Server operation failed";

export function isAuthoritativeServerApiEnabled(env: RuntimeEnv = process.env) {
  return env.SERVER_AUTHORITATIVE_API_ENABLED === "true";
}

export function isSupportedAuthoritativeRpcOperation(
  operationType: string,
): operationType is SupportedAuthoritativeRpcOperation {
  return isSupportedAuthoritativeApiOperation(operationType);
}

export function getBearerAuthorization(headers: Pick<Headers, "get">) {
  const value = headers.get("authorization");
  if (!value?.startsWith("Bearer ") || value.length <= "Bearer ".length + 12) return null;
  if (value.length > AUTHORITATIVE_MAX_AUTHORIZATION_HEADER_CHARS) return null;
  const token = value.slice("Bearer ".length);
  if (!isSafeBearerTokenValue(token)) return null;
  return value;
}

export function isSafeBearerTokenValue(token: string) {
  return /^[A-Za-z0-9._~+/=-]+$/.test(token);
}

export function prepareAuthoritativeRpcCall({
  body,
  headers,
  env = process.env,
}: {
  body: unknown;
  headers: Pick<Headers, "get">;
  env?: RuntimeEnv;
}): AuthoritativeRpcProxyFailure | AuthoritativeRpcProxySuccess {
  if (!isAuthoritativeServerApiEnabled(env)) {
    return disabled("Server-authoritative API is disabled");
  }

  if (!isPublicEnvironmentSafe(env)) {
    return failure(503, "invalid_state", "Server environment is not configured");
  }

  const publicConfig = getSupabasePublicConfig(env);
  if (!publicConfig.ok) {
    return failure(503, "invalid_state", "Supabase environment is not configured");
  }

  const authorization = getBearerAuthorization(headers);
  if (!authorization) {
    return failure(401, "unauthenticated", "Bearer token required");
  }

  if (!isRecord(body)) {
    return failure(400, "invalid_request", "Invalid request body");
  }

  const operationType = body.operationType;
  if (typeof operationType !== "string" || !isSupportedAuthoritativeRpcOperation(operationType)) {
    return failure(400, "invalid_request", "Unsupported server operation");
  }

  const parsed = parseServerActionRequest(operationType, {
    idempotencyKey: body.idempotencyKey,
    payload: body.payload,
  });
  if (!parsed.ok) {
    return {
      ok: false,
      status: 400,
      body: {
        ok: false,
        code: parsed.code,
        reason: parsed.reason,
      },
    };
  }

  return {
    ok: true,
    operationType,
    payload: parsed.request.payload,
    ...toRpcCall(operationType, parsed.request.idempotencyKey, parsed.request.payload),
    supabaseUrl: publicConfig.config.url,
    supabaseAnonKey: publicConfig.config.anonKey,
    authorization,
  };
}

export async function executeAuthoritativeRpcCall(call: AuthoritativeRpcProxySuccess, env: RuntimeEnv = process.env) {
  const supabase = createClient(call.supabaseUrl, call.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: call.authorization,
      },
    },
  });

  if (isAuthoritativeBattleReplayValidationEnabled(env) && isFrontlineBattleOperation(call.operationType)) {
    const validation = await validateBattleReplayBeforeRpc(
      supabase,
      call as AuthoritativeRpcProxySuccess & { operationType: FrontlineBattleServerOperation },
    );
    if (!validation.ok) {
      return failure(400, validation.code, validation.reason);
    }
  }

  const { data, error } = await supabase.rpc(call.rpcName, call.rpcArgs);
  if (error) {
    return createAuthoritativeRpcFailureResponse();
  }

  return {
    ok: true as const,
    status: 200,
    body: data,
  };
}

async function validateBattleReplayBeforeRpc(
  supabase: AuthoritativeSupabaseClient,
  call: AuthoritativeRpcProxySuccess & { operationType: FrontlineBattleServerOperation },
) {
  const payload = call.payload as ServerOperationPayload<typeof call.operationType>;
  const enemyPreset = resolveFrontlineBattlePresetForOperation(call.operationType, payload);
  const [loadout, heroes, cards] = await Promise.all([
    supabase.from("frontline_loadouts").select("leader_id,squad,deck").maybeSingle(),
    supabase.from("player_heroes").select("hero_id,level,stars,shards,xp,skill_level,unlocked").eq("unlocked", true),
    supabase.from("player_frontline_cards").select("card_id,level,unlocked").eq("unlocked", true),
  ]);

  if (loadout.error || heroes.error || cards.error) {
    return { ok: false as const, code: "invalid_state" as const, reason: "Battle replay context could not be loaded." };
  }

  const context = normalizeFrontlineReplayContext({
    loadoutRow: loadout.data,
    heroRows: heroes.data,
    cardRows: cards.data,
    enemyPreset,
  });
  if (!context) {
    return { ok: false as const, code: "invalid_state" as const, reason: "Battle replay context is incomplete." };
  }

  return validateFrontlineBattleReplayPayload(call.operationType, payload, context);
}

export function createAuthoritativeRpcFailureResponse(): AuthoritativeRpcProxyFailure {
  return failure(502, "invalid_state", AUTHORITATIVE_RPC_FAILURE_REASON);
}

function toRpcCall<TType extends SupportedAuthoritativeRpcOperation>(
  operationType: TType,
  idempotencyKey: string,
  payload: ServerOperationPayload<TType>,
) {
  if (operationType === "saveLoadout") {
    const loadoutPayload = payload as ServerOperationPayload<"saveLoadout">;
    return {
      rpcName: "save_frontline_loadout",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_leader_id: loadoutPayload.leaderId,
        p_squad: loadoutPayload.squad,
        p_deck: loadoutPayload.deck,
      },
    };
  }

  if (operationType === "syncLocalSnapshot") {
    const syncPayload = payload as ServerOperationPayload<"syncLocalSnapshot">;
    return {
      rpcName: "sync_local_snapshot",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_local_version: syncPayload.localVersion,
        p_snapshot: syncPayload.snapshot,
      },
    };
  }

  if (operationType === "claimAdventureBattleResult") {
    const battlePayload = payload as ServerOperationPayload<"claimAdventureBattleResult">;
    return {
      rpcName: "claim_adventure_battle_result",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_node_id: battlePayload.nodeId,
        p_battle_seed: battlePayload.battleSeed,
        p_winner: battlePayload.winner,
        p_turns: battlePayload.turns,
        p_battle_summary: battlePayload.battleSummary,
      },
    };
  }

  if (operationType === "claimAdventureNodeReward") {
    const nodePayload = payload as ServerOperationPayload<"claimAdventureNodeReward">;
    return {
      rpcName: "claim_adventure_node_reward",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_node_id: nodePayload.nodeId,
      },
    };
  }

  if (operationType === "openAdventureMapInteraction") {
    const interactionPayload = payload as ServerOperationPayload<"openAdventureMapInteraction">;
    return {
      rpcName: "open_adventure_map_interaction",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_interaction_id: interactionPayload.interactionId,
      },
    };
  }

  if (operationType === "claimDailyLogin") {
    const dailyPayload = payload as ServerOperationPayload<"claimDailyLogin">;
    return {
      rpcName: "claim_daily_login",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_local_day_key: dailyPayload.localDayKey,
      },
    };
  }

  if (operationType === "claimMission") {
    const missionPayload = payload as ServerOperationPayload<"claimMission">;
    return {
      rpcName: "claim_mission_reward",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_mission_id: missionPayload.missionId,
        p_cycle_key: missionPayload.cycleKey,
      },
    };
  }

  if (operationType === "upgradeFrontlineCard") {
    const cardPayload = payload as ServerOperationPayload<"upgradeFrontlineCard">;
    return {
      rpcName: "upgrade_frontline_card",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_card_id: cardPayload.cardId,
      },
    };
  }

  if (operationType === "upgradeFrontlineFortress") {
    const fortressPayload = payload as ServerOperationPayload<"upgradeFrontlineFortress">;
    return {
      rpcName: "upgrade_frontline_fortress",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_building_id: fortressPayload.buildingId,
      },
    };
  }

  if (operationType === "resolveFrontlineFortressRaid") {
    return {
      rpcName: "resolve_frontline_fortress_raid",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
      },
    };
  }

  if (operationType === "claimFrontlineFortressDefense") {
    const defensePayload = payload as ServerOperationPayload<"claimFrontlineFortressDefense">;
    return {
      rpcName: "claim_frontline_fortress_defense",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_battle_seed: defensePayload.battleSeed,
        p_outcome: defensePayload.outcome,
        p_turns: defensePayload.turns,
        p_castle_hp: defensePayload.castleHp,
        p_max_castle_hp: defensePayload.maxCastleHp,
        p_enemies_defeated: defensePayload.enemiesDefeated,
        p_defense_summary: defensePayload.defenseSummary,
      },
    };
  }

  if (operationType === "recordArenaResult") {
    const arenaPayload = payload as ServerOperationPayload<"recordArenaResult">;
    return {
      rpcName: "record_arena_result",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_opponent_id: arenaPayload.opponentId,
        p_battle_seed: arenaPayload.battleSeed,
        p_winner: arenaPayload.winner,
        p_turns: arenaPayload.turns,
        p_battle_summary: arenaPayload.battleSummary,
      },
    };
  }

  if (operationType === "recordLadderResult") {
    const ladderPayload = payload as ServerOperationPayload<"recordLadderResult">;
    return {
      rpcName: "record_ladder_result",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_opponent_id: ladderPayload.opponentId,
        p_battle_seed: ladderPayload.battleSeed,
        p_winner: ladderPayload.winner,
        p_turns: ladderPayload.turns,
        p_battle_summary: ladderPayload.battleSummary,
      },
    };
  }

  if (operationType === "recordEventResult") {
    const eventPayload = payload as ServerOperationPayload<"recordEventResult">;
    return {
      rpcName: "record_event_result",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_event_id: eventPayload.eventId,
        p_battle_seed: eventPayload.battleSeed,
        p_winner: eventPayload.winner,
        p_turns: eventPayload.turns,
        p_battle_summary: eventPayload.battleSummary,
      },
    };
  }

  if (operationType === "levelUpHero") {
    const heroPayload = payload as ServerOperationPayload<"levelUpHero">;
    return {
      rpcName: "level_up_hero",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_hero_id: heroPayload.heroId,
      },
    };
  }

  if (operationType === "starUpHero") {
    const heroPayload = payload as ServerOperationPayload<"starUpHero">;
    return {
      rpcName: "star_up_hero",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_hero_id: heroPayload.heroId,
      },
    };
  }

  if (operationType === "skillUpHero") {
    const heroPayload = payload as ServerOperationPayload<"skillUpHero">;
    return {
      rpcName: "skill_up_hero",
      rpcArgs: {
        p_idempotency_key: idempotencyKey,
        p_hero_id: heroPayload.heroId,
      },
    };
  }

  const purchasePayload = payload as ServerOperationPayload<"purchaseShopOffer">;
  return {
    rpcName: "purchase_shop_offer",
    rpcArgs: {
      p_idempotency_key: idempotencyKey,
      p_offer_id: purchasePayload.offerId,
      p_quantity: purchasePayload.quantity,
    },
  };
}

function disabled(reason: string): AuthoritativeRpcProxyFailure {
  return failure(404, "not_found", reason);
}

function failure(status: number, code: string, reason: string): AuthoritativeRpcProxyFailure {
  return {
    ok: false,
    status,
    body: {
      ok: false,
      code,
      reason,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
