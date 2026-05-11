import { callAuthoritativeOperation, type AuthoritativeClientFetch } from "@/features/server/authoritativeClient";
import { parseRewardPayload } from "@/features/server/authoritativeOperations";
import { getSupabaseAccessToken } from "@/features/server/supabaseBrowserSession";
import type { AdventureMapInteractionLootTier, AdventureMapInteractionOpenResult } from "@/features/adventure/mapInteractions";
import type { Resources, Rewards } from "@/lib/types";

const AUTHORITATIVE_SHOP_OFFERS = new Set(["adventure_key_ring"]);

export type AuthoritativeDispatcherMode = "authoritative" | "local";

export type AuthoritativePurchaseSuccess = {
  ok: true;
  mode: "authoritative";
  resources: Resources;
};

export type AuthoritativePurchaseFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativePurchaseFallback = {
  ok: false;
  mode: "local";
  reason: "unsupported_offer" | "missing_session" | "api_disabled";
};

export type AuthoritativePurchaseResult =
  | AuthoritativePurchaseSuccess
  | AuthoritativePurchaseFailure
  | AuthoritativePurchaseFallback;

export type PurchaseShopOfferAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeMapInteractionSuccess = {
  ok: true;
  mode: "authoritative";
  result: AdventureMapInteractionOpenResult;
  resources: Resources;
  resetAvailableAt: string | null;
};

export type AuthoritativeMapInteractionFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeMapInteractionFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeMapInteractionResult =
  | AuthoritativeMapInteractionSuccess
  | AuthoritativeMapInteractionFailure
  | AuthoritativeMapInteractionFallback;

export type OpenAdventureMapInteractionAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeNodeRewardSuccess = {
  ok: true;
  mode: "authoritative";
  nodeId: string;
  rewards: Rewards;
  resources: Resources;
};

export type AuthoritativeNodeRewardFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeNodeRewardFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeNodeRewardResult =
  | AuthoritativeNodeRewardSuccess
  | AuthoritativeNodeRewardFailure
  | AuthoritativeNodeRewardFallback;

export type ClaimAdventureNodeRewardAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeAdventureBattleWinner = "ally" | "enemy";

export type ClaimAdventureBattleResultInput = {
  nodeId: string;
  battleSeed: number;
  winner: AuthoritativeAdventureBattleWinner;
  turns: number;
  battleSummary: unknown;
};

export type AuthoritativeAdventureBattleResultSuccess = {
  ok: true;
  mode: "authoritative";
  nodeId: string;
  winner: AuthoritativeAdventureBattleWinner;
  firstClear: boolean;
  rewards: Rewards;
  resources: Resources;
  unlockedNodeIds: string[];
};

export type AuthoritativeAdventureBattleResultFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeAdventureBattleResultFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeAdventureBattleResult =
  | AuthoritativeAdventureBattleResultSuccess
  | AuthoritativeAdventureBattleResultFailure
  | AuthoritativeAdventureBattleResultFallback;

export type ClaimAdventureBattleResultAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export async function purchaseShopOfferAuthoritatively(
  offerId: string,
  options: PurchaseShopOfferAuthoritativelyOptions = {},
): Promise<AuthoritativePurchaseResult> {
  if (!AUTHORITATIVE_SHOP_OFFERS.has(offerId)) {
    return { ok: false, mode: "local", reason: "unsupported_offer" };
  }

  const token = await (options.tokenProvider ?? getSupabaseAccessToken)();
  if (!token) {
    return { ok: false, mode: "local", reason: "missing_session" };
  }

  const response = await callAuthoritativeOperation(
    "purchaseShopOffer",
    {
      idempotencyKey: createIdempotencyKey("shop", offerId),
      payload: { offerId, quantity: 1 },
    },
    {
      endpoint: options.endpoint,
      fetcher: options.fetcher,
      token,
    },
  );

  if (!response.body.ok) {
    if (response.status === 404 && response.body.code === "not_found" && response.body.reason.includes("disabled")) {
      return { ok: false, mode: "local", reason: "api_disabled" };
    }
    return { ok: false, mode: "authoritative", reason: response.body.reason };
  }

  const resources = extractResources(response.body.result);
  if (!resources) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }

  return {
    ok: true,
    mode: "authoritative",
    resources,
  };
}

export async function openAdventureMapInteractionAuthoritatively(
  interactionId: string,
  options: OpenAdventureMapInteractionAuthoritativelyOptions = {},
): Promise<AuthoritativeMapInteractionResult> {
  const token = await (options.tokenProvider ?? getSupabaseAccessToken)();
  if (!token) {
    return { ok: false, mode: "local", reason: "missing_session" };
  }

  const response = await callAuthoritativeOperation(
    "openAdventureMapInteraction",
    {
      idempotencyKey: createIdempotencyKey("map", interactionId),
      payload: { interactionId },
    },
    {
      endpoint: options.endpoint,
      fetcher: options.fetcher,
      token,
    },
  );

  if (!response.body.ok) {
    if (response.status === 404 && response.body.code === "not_found" && response.body.reason.includes("disabled")) {
      return { ok: false, mode: "local", reason: "api_disabled" };
    }
    return { ok: false, mode: "authoritative", reason: response.body.reason };
  }

  const parsed = extractMapInteractionOpenResult(response.body.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function claimAdventureNodeRewardAuthoritatively(
  nodeId: string,
  options: ClaimAdventureNodeRewardAuthoritativelyOptions = {},
): Promise<AuthoritativeNodeRewardResult> {
  const token = await (options.tokenProvider ?? getSupabaseAccessToken)();
  if (!token) {
    return { ok: false, mode: "local", reason: "missing_session" };
  }

  const response = await callAuthoritativeOperation(
    "claimAdventureNodeReward",
    {
      idempotencyKey: createIdempotencyKey("node", nodeId),
      payload: { nodeId },
    },
    {
      endpoint: options.endpoint,
      fetcher: options.fetcher,
      token,
    },
  );

  if (!response.body.ok) {
    if (response.status === 404 && response.body.code === "not_found" && response.body.reason.includes("disabled")) {
      return { ok: false, mode: "local", reason: "api_disabled" };
    }
    return { ok: false, mode: "authoritative", reason: response.body.reason };
  }

  const parsed = extractNodeRewardResult(response.body.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }
  if (parsed.nodeId !== nodeId) {
    return { ok: false, mode: "authoritative", reason: "Server response node mismatch" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function claimAdventureBattleResultAuthoritatively(
  input: ClaimAdventureBattleResultInput,
  options: ClaimAdventureBattleResultAuthoritativelyOptions = {},
): Promise<AuthoritativeAdventureBattleResult> {
  const token = await (options.tokenProvider ?? getSupabaseAccessToken)();
  if (!token) {
    return { ok: false, mode: "local", reason: "missing_session" };
  }

  const response = await callAuthoritativeOperation(
    "claimAdventureBattleResult",
    {
      idempotencyKey: createIdempotencyKey("battle", `${input.nodeId}:${input.battleSeed}:${input.winner}`),
      payload: input,
    },
    {
      endpoint: options.endpoint,
      fetcher: options.fetcher,
      token,
    },
  );

  if (!response.body.ok) {
    if (response.status === 404 && response.body.code === "not_found" && response.body.reason.includes("disabled")) {
      return { ok: false, mode: "local", reason: "api_disabled" };
    }
    return { ok: false, mode: "authoritative", reason: response.body.reason };
  }

  const parsed = extractAdventureBattleResult(response.body.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }
  if (parsed.nodeId !== input.nodeId) {
    return { ok: false, mode: "authoritative", reason: "Server response node mismatch" };
  }
  if (parsed.winner !== input.winner) {
    return { ok: false, mode: "authoritative", reason: "Server response winner mismatch" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

function createIdempotencyKey(scope: string, id: string) {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${scope}:${id}:${Date.now()}:${suffix}`;
}

function extractResources(result: unknown): Resources | null {
  if (!isRecord(result) || !isRecord(result.resources)) return null;

  const gold = parseResourceValue(result.resources.gold);
  const dust = parseResourceValue(result.resources.dust);
  const gems = parseResourceValue(result.resources.gems);
  const arenaTickets = parseResourceValue(result.resources.arenaTickets);
  const adventureKeys = parseResourceValue(result.resources.adventureKeys);
  if (gold === null || dust === null || gems === null || arenaTickets === null || adventureKeys === null) {
    return null;
  }

  return {
    gold,
    dust,
    gems,
    arenaTickets,
    adventureKeys,
  };
}

function extractMapInteractionOpenResult(
  result: unknown,
): Pick<AuthoritativeMapInteractionSuccess, "result" | "resources" | "resetAvailableAt"> | null {
  if (!isRecord(result)) return null;

  const interactionId = parseString(result.interactionId);
  const lootId = parseString(result.lootId);
  const lootTier = parseLootTier(result.lootTier);
  const lootTitle = parseString(result.lootTitle);
  const rewards = parseRewardPayload(result.rewardsGranted);
  const resources = extractResources(result);
  const resetAvailableAt = result.resetAvailableAt === null ? null : parseString(result.resetAvailableAt);

  if (!interactionId || !lootId || !lootTier || !lootTitle || !rewards.success || !resources || resetAvailableAt === undefined) {
    return null;
  }

  return {
    result: {
      interactionId,
      lootId,
      lootTier,
      lootTitle,
      rewards: rewards.data,
    },
    resources,
    resetAvailableAt,
  };
}

function extractNodeRewardResult(result: unknown): Omit<AuthoritativeNodeRewardSuccess, "ok" | "mode"> | null {
  if (!isRecord(result)) return null;

  const nodeId = parseString(result.nodeId);
  const rewards = parseRewardPayload(result.rewardsGranted);
  const resources = extractResources(result);
  if (!nodeId || !rewards.success || !resources) return null;

  return {
    nodeId,
    rewards: rewards.data,
    resources,
  };
}

function extractAdventureBattleResult(result: unknown): Omit<AuthoritativeAdventureBattleResultSuccess, "ok" | "mode"> | null {
  if (!isRecord(result)) return null;

  const nodeId = parseString(result.nodeId);
  const winner = parseBattleWinner(result.winner);
  const firstClear = parseBoolean(result.firstClear);
  const rewards = parseRewardPayload(result.rewardsGranted);
  const resources = extractResources(result);
  const unlockedNodeIds = parseStringArray(result.unlockedNodeIds);
  if (!nodeId || !winner || firstClear === null || !rewards.success || !resources || !unlockedNodeIds) return null;

  return {
    nodeId,
    winner,
    firstClear,
    rewards: rewards.data,
    resources,
    unlockedNodeIds,
  };
}

function parseResourceValue(value: unknown): number | null {
  if (typeof value !== "number") return null;
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function parseString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function parseLootTier(value: unknown): AdventureMapInteractionLootTier | undefined {
  if (value === "common" || value === "rare" || value === "epic" || value === "legendary") return value;
  return undefined;
}

function parseBattleWinner(value: unknown): AuthoritativeAdventureBattleWinner | undefined {
  if (value === "ally" || value === "enemy") return value;
  return undefined;
}

function parseBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const out: string[] = [];
  for (const item of value) {
    const parsed = parseString(item);
    if (!parsed) return null;
    out.push(parsed);
  }
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
