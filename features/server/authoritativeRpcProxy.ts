import { createClient } from "@supabase/supabase-js";
import {
  isSupportedAuthoritativeApiOperation,
  parseServerActionRequest,
  type ServerOperationPayload,
  type SupportedAuthoritativeApiOperation,
} from "@/features/server/authoritativeOperations";
import { getSupabasePublicConfig } from "@/features/server/supabasePublicConfig";

export type SupportedAuthoritativeRpcOperation = SupportedAuthoritativeApiOperation;

type RuntimeEnv = Record<string, string | undefined>;

export type AuthoritativeRpcProxyFailure = {
  ok: false;
  status: number;
  body: {
    ok: false;
    code: string;
    reason: string;
    issues?: string[];
  };
};

export type AuthoritativeRpcProxySuccess = {
  ok: true;
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
  return value;
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
        issues: parsed.issues,
      },
    };
  }

  return {
    ok: true,
    ...toRpcCall(operationType, parsed.request.idempotencyKey, parsed.request.payload),
    supabaseUrl: publicConfig.config.url,
    supabaseAnonKey: publicConfig.config.anonKey,
    authorization,
  };
}

export async function executeAuthoritativeRpcCall(call: AuthoritativeRpcProxySuccess) {
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
