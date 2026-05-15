import { callAuthoritativeOperation, type AuthoritativeClientFetch } from "@/features/server/authoritativeClient";
import {
  parseRewardPayload,
  type ServerOperationInputPayload,
  type SupportedAuthoritativeApiOperation,
} from "@/features/server/authoritativeOperations";
import { getSupabaseAccessToken } from "@/features/server/supabaseBrowserSession";
import type { AdventureMapInteractionLootTier, AdventureMapInteractionOpenResult } from "@/features/adventure/mapInteractions";
import type { FrontlineFortressBuildingId, FrontlineFortressState, FrontlineLoadout, Resources, Rewards } from "@/lib/types";

export type AuthoritativeDispatcherMode = "authoritative" | "local";

type AuthoritativeDispatcherOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

type AuthoritativeOperationCallResult =
  | { ok: true; result: unknown }
  | { ok: false; mode: "local"; reason: "missing_session" | "api_disabled" }
  | { ok: false; mode: "authoritative"; reason: string };

export type AuthoritativePurchaseSuccess = {
  ok: true;
  mode: "authoritative";
  resources: Resources;
  requiresSnapshotRefresh: boolean;
};

export type AuthoritativePurchaseFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativePurchaseFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
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

export type LocalSyncSnapshot = {
  account?: {
    name?: string;
    level?: number;
    xp?: number;
  };
  resources?: Partial<Resources>;
  heroes?: Array<{
    heroId: string;
    level?: number;
    stars?: number;
    shards?: number;
    xp?: number;
    skillLevel?: number;
  }>;
  frontlineLoadout?: FrontlineLoadout;
  frontlineCardUnlocks?: Record<string, boolean>;
  frontlineCardLevels?: Record<string, number>;
  adventureProgress?: Record<
    string,
    {
      status?: "locked" | "available" | "current" | "cleared" | "completed" | "claimed" | "hidden";
      cleared?: boolean;
      firstClearTaken?: boolean;
      claimed?: boolean;
    }
  >;
  adventureMapClaims?: Record<
    string,
    {
      claimed?: boolean;
      claimedAt?: string | null;
      resetAvailableAt?: string | null;
    }
  >;
  frontlineFortress?: Pick<
    FrontlineFortressState,
    "buildings" | "integrity" | "garrison" | "lastResolvedAt" | "nextAttackAt" | "raidsResolved"
  >;
};

export type AuthoritativeLocalSnapshotSyncSuccess = {
  ok: true;
  mode: "authoritative";
  profileId: string;
  imported: boolean;
  normalizedSnapshot: LocalSyncSnapshot;
};

export type AuthoritativeLocalSnapshotSyncFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeLocalSnapshotSyncFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeLocalSnapshotSyncResult =
  | AuthoritativeLocalSnapshotSyncSuccess
  | AuthoritativeLocalSnapshotSyncFailure
  | AuthoritativeLocalSnapshotSyncFallback;

export type SyncLocalSnapshotAuthoritativelyOptions = {
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

export type AuthoritativeArenaWinner = "ally" | "enemy" | "draw";

export type RecordArenaResultInput = {
  opponentId: string;
  battleSeed: number;
  winner: AuthoritativeArenaWinner;
  turns: number;
  battleSummary: unknown;
};

export type AuthoritativeArenaResultSuccess = {
  ok: true;
  mode: "authoritative";
  opponentId: string;
  winner: AuthoritativeArenaWinner;
  rewards: Rewards;
  resources: Resources;
  arenaWins: number;
  arenaLosses: number;
};

export type AuthoritativeArenaResultFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeArenaResultFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeArenaResult =
  | AuthoritativeArenaResultSuccess
  | AuthoritativeArenaResultFailure
  | AuthoritativeArenaResultFallback;

export type RecordArenaResultAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type RecordEventResultInput = {
  eventId: string;
  battleSeed: number;
  winner: AuthoritativeArenaWinner;
  turns: number;
  battleSummary: unknown;
};

export type AuthoritativeEventResultSuccess = {
  ok: true;
  mode: "authoritative";
  eventId: string;
  winner: AuthoritativeArenaWinner;
  firstClear: boolean;
  rewards: Rewards;
  resources: Resources;
};

export type AuthoritativeEventResultFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeEventResultFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeEventResult =
  | AuthoritativeEventResultSuccess
  | AuthoritativeEventResultFailure
  | AuthoritativeEventResultFallback;

export type RecordEventResultAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeLoadoutSaveSuccess = {
  ok: true;
  mode: "authoritative";
  loadout: FrontlineLoadout;
  updatedAt: string;
};

export type AuthoritativeLoadoutSaveFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeLoadoutSaveFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeLoadoutSaveResult =
  | AuthoritativeLoadoutSaveSuccess
  | AuthoritativeLoadoutSaveFailure
  | AuthoritativeLoadoutSaveFallback;

export type SaveFrontlineLoadoutAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeDailyLoginSuccess = {
  ok: true;
  mode: "authoritative";
  dayKey: string;
  streak: number;
  rewards: Rewards;
  resources: Resources;
};

export type AuthoritativeDailyLoginFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeDailyLoginFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeDailyLoginResult =
  | AuthoritativeDailyLoginSuccess
  | AuthoritativeDailyLoginFailure
  | AuthoritativeDailyLoginFallback;

export type ClaimDailyLoginAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeMissionClaimSuccess = {
  ok: true;
  mode: "authoritative";
  missionId: string;
  cycleKey: string;
  rewards: Rewards;
  resources: Resources;
};

export type AuthoritativeMissionClaimFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeMissionClaimFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeMissionClaimResult =
  | AuthoritativeMissionClaimSuccess
  | AuthoritativeMissionClaimFailure
  | AuthoritativeMissionClaimFallback;

export type ClaimMissionAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeFrontlineCardUpgradeSuccess = {
  ok: true;
  mode: "authoritative";
  cardId: string;
  level: number;
  costPaid: {
    gold: number;
    dust: number;
  };
  resources: Resources;
};

export type AuthoritativeFrontlineCardUpgradeFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeFrontlineCardUpgradeFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeFrontlineCardUpgradeResult =
  | AuthoritativeFrontlineCardUpgradeSuccess
  | AuthoritativeFrontlineCardUpgradeFailure
  | AuthoritativeFrontlineCardUpgradeFallback;

export type UpgradeFrontlineCardAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeFrontlineFortressUpgradeSuccess = {
  ok: true;
  mode: "authoritative";
  buildingId: FrontlineFortressBuildingId;
  level: number;
  costPaid: {
    gold: number;
    dust: number;
  };
  resources: Resources;
  frontlineFortress: FrontlineFortressState;
};

export type AuthoritativeFrontlineFortressUpgradeFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeFrontlineFortressUpgradeFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeFrontlineFortressUpgradeResult =
  | AuthoritativeFrontlineFortressUpgradeSuccess
  | AuthoritativeFrontlineFortressUpgradeFailure
  | AuthoritativeFrontlineFortressUpgradeFallback;

export type UpgradeFrontlineFortressAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeFrontlineFortressRaidSuccess = {
  ok: true;
  mode: "authoritative";
  report: NonNullable<FrontlineFortressState["lastReport"]>;
  resources: Resources;
  frontlineFortress: FrontlineFortressState;
};

export type AuthoritativeFrontlineFortressRaidFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeFrontlineFortressRaidFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeFrontlineFortressRaidResult =
  | AuthoritativeFrontlineFortressRaidSuccess
  | AuthoritativeFrontlineFortressRaidFailure
  | AuthoritativeFrontlineFortressRaidFallback;

export type ResolveFrontlineFortressRaidAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeHeroLevelUpSuccess = {
  ok: true;
  mode: "authoritative";
  heroId: string;
  level: number;
  costPaid: {
    gold: number;
  };
  resources: Resources;
};

export type AuthoritativeHeroLevelUpFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeHeroLevelUpFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeHeroLevelUpResult =
  | AuthoritativeHeroLevelUpSuccess
  | AuthoritativeHeroLevelUpFailure
  | AuthoritativeHeroLevelUpFallback;

export type LevelUpHeroAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeHeroStarUpSuccess = {
  ok: true;
  mode: "authoritative";
  heroId: string;
  stars: number;
  shards: number;
  shardsSpent: number;
  resources: Resources;
};

export type AuthoritativeHeroStarUpFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeHeroStarUpFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeHeroStarUpResult =
  | AuthoritativeHeroStarUpSuccess
  | AuthoritativeHeroStarUpFailure
  | AuthoritativeHeroStarUpFallback;

export type StarUpHeroAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeHeroSkillUpSuccess = {
  ok: true;
  mode: "authoritative";
  heroId: string;
  skillLevel: number;
  costPaid: {
    dust: number;
  };
  resources: Resources;
};

export type AuthoritativeHeroSkillUpFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeHeroSkillUpFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeHeroSkillUpResult =
  | AuthoritativeHeroSkillUpSuccess
  | AuthoritativeHeroSkillUpFailure
  | AuthoritativeHeroSkillUpFallback;

export type SkillUpHeroAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export async function syncLocalSnapshotAuthoritatively(
  localVersion: string,
  snapshot: LocalSyncSnapshot,
  options: SyncLocalSnapshotAuthoritativelyOptions = {},
): Promise<AuthoritativeLocalSnapshotSyncResult> {
  const response = await callOperationWithSession(
    "syncLocalSnapshot",
    {
      idempotencyKey: createIdempotencyKey("sync", localVersion),
      payload: { localVersion, snapshot },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractLocalSnapshotSyncResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function skillUpHeroAuthoritatively(
  heroId: string,
  options: SkillUpHeroAuthoritativelyOptions = {},
): Promise<AuthoritativeHeroSkillUpResult> {
  const response = await callOperationWithSession(
    "skillUpHero",
    {
      idempotencyKey: createIdempotencyKey("hero-skill", heroId),
      payload: { heroId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractHeroSkillUpResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }
  if (parsed.heroId !== heroId) {
    return { ok: false, mode: "authoritative", reason: "Server response hero mismatch" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function starUpHeroAuthoritatively(
  heroId: string,
  options: StarUpHeroAuthoritativelyOptions = {},
): Promise<AuthoritativeHeroStarUpResult> {
  const response = await callOperationWithSession(
    "starUpHero",
    {
      idempotencyKey: createIdempotencyKey("hero-star", heroId),
      payload: { heroId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractHeroStarUpResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }
  if (parsed.heroId !== heroId) {
    return { ok: false, mode: "authoritative", reason: "Server response hero mismatch" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function levelUpHeroAuthoritatively(
  heroId: string,
  options: LevelUpHeroAuthoritativelyOptions = {},
): Promise<AuthoritativeHeroLevelUpResult> {
  const response = await callOperationWithSession(
    "levelUpHero",
    {
      idempotencyKey: createIdempotencyKey("hero", heroId),
      payload: { heroId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractHeroLevelUpResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }
  if (parsed.heroId !== heroId) {
    return { ok: false, mode: "authoritative", reason: "Server response hero mismatch" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function upgradeFrontlineCardAuthoritatively(
  cardId: string,
  options: UpgradeFrontlineCardAuthoritativelyOptions = {},
): Promise<AuthoritativeFrontlineCardUpgradeResult> {
  const response = await callOperationWithSession(
    "upgradeFrontlineCard",
    {
      idempotencyKey: createIdempotencyKey("card", cardId),
      payload: { cardId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractFrontlineCardUpgradeResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }
  if (parsed.cardId !== cardId) {
    return { ok: false, mode: "authoritative", reason: "Server response card mismatch" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function upgradeFrontlineFortressAuthoritatively(
  buildingId: FrontlineFortressBuildingId,
  options: UpgradeFrontlineFortressAuthoritativelyOptions = {},
): Promise<AuthoritativeFrontlineFortressUpgradeResult> {
  const response = await callOperationWithSession(
    "upgradeFrontlineFortress",
    {
      idempotencyKey: createIdempotencyKey("frontline-fortress", buildingId),
      payload: { buildingId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractFrontlineFortressUpgradeResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }
  if (parsed.buildingId !== buildingId) {
    return { ok: false, mode: "authoritative", reason: "Server response building mismatch" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function resolveFrontlineFortressRaidAuthoritatively(
  options: ResolveFrontlineFortressRaidAuthoritativelyOptions = {},
): Promise<AuthoritativeFrontlineFortressRaidResult> {
  const response = await callOperationWithSession(
    "resolveFrontlineFortressRaid",
    {
      idempotencyKey: createIdempotencyKey("frontline-fortress-raid", "resolve"),
      payload: {},
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractFrontlineFortressRaidResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function purchaseShopOfferAuthoritatively(
  offerId: string,
  options: PurchaseShopOfferAuthoritativelyOptions = {},
): Promise<AuthoritativePurchaseResult> {
  const response = await callOperationWithSession(
    "purchaseShopOffer",
    {
      idempotencyKey: createIdempotencyKey("shop", offerId),
      payload: { offerId, quantity: 1 },
    },
    options,
  );

  if (!response.ok) return response;

  const resources = extractResources(response.result);
  if (!resources) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }

  return {
    ok: true,
    mode: "authoritative",
    resources,
    requiresSnapshotRefresh: isRecord(response.result) ? parseBoolean(response.result.requiresSnapshotRefresh) ?? false : false,
  };
}

export async function claimMissionAuthoritatively(
  missionId: string,
  cycleKey: string,
  options: ClaimMissionAuthoritativelyOptions = {},
): Promise<AuthoritativeMissionClaimResult> {
  const response = await callOperationWithSession(
    "claimMission",
    {
      idempotencyKey: createIdempotencyKey("mission", `${missionId}:${cycleKey}`),
      payload: { missionId, cycleKey },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractMissionClaimResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }
  if (parsed.missionId !== missionId || parsed.cycleKey !== cycleKey) {
    return { ok: false, mode: "authoritative", reason: "Server response mission mismatch" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function claimDailyLoginAuthoritatively(
  localDayKey: string,
  options: ClaimDailyLoginAuthoritativelyOptions = {},
): Promise<AuthoritativeDailyLoginResult> {
  const response = await callOperationWithSession(
    "claimDailyLogin",
    {
      idempotencyKey: createIdempotencyKey("daily", localDayKey),
      payload: { localDayKey },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractDailyLoginResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function saveFrontlineLoadoutAuthoritatively(
  loadout: FrontlineLoadout,
  options: SaveFrontlineLoadoutAuthoritativelyOptions = {},
): Promise<AuthoritativeLoadoutSaveResult> {
  const response = await callOperationWithSession(
    "saveLoadout",
    {
      idempotencyKey: createIdempotencyKey("loadout", loadout.leaderId),
      payload: loadout,
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractLoadoutSaveResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function openAdventureMapInteractionAuthoritatively(
  interactionId: string,
  options: OpenAdventureMapInteractionAuthoritativelyOptions = {},
): Promise<AuthoritativeMapInteractionResult> {
  const response = await callOperationWithSession(
    "openAdventureMapInteraction",
    {
      idempotencyKey: createIdempotencyKey("map", interactionId),
      payload: { interactionId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractMapInteractionOpenResult(response.result);
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
  const response = await callOperationWithSession(
    "claimAdventureNodeReward",
    {
      idempotencyKey: createIdempotencyKey("node", nodeId),
      payload: { nodeId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractNodeRewardResult(response.result);
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
  const response = await callOperationWithSession(
    "claimAdventureBattleResult",
    {
      idempotencyKey: createIdempotencyKey("battle", `${input.nodeId}:${input.battleSeed}:${input.winner}`),
      payload: input,
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractAdventureBattleResult(response.result);
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

export async function recordArenaResultAuthoritatively(
  input: RecordArenaResultInput,
  options: RecordArenaResultAuthoritativelyOptions = {},
): Promise<AuthoritativeArenaResult> {
  const response = await callOperationWithSession(
    "recordArenaResult",
    {
      idempotencyKey: createIdempotencyKey("arena", `${input.opponentId}:${input.battleSeed}:${input.winner}`),
      payload: input,
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractArenaResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }
  if (parsed.opponentId !== input.opponentId) {
    return { ok: false, mode: "authoritative", reason: "Server response opponent mismatch" };
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

export async function recordEventResultAuthoritatively(
  input: RecordEventResultInput,
  options: RecordEventResultAuthoritativelyOptions = {},
): Promise<AuthoritativeEventResult> {
  const response = await callOperationWithSession(
    "recordEventResult",
    {
      idempotencyKey: createIdempotencyKey("event", `${input.eventId}:${input.battleSeed}:${input.winner}`),
      payload: input,
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractEventResult(response.result);
  if (!parsed) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }
  if (parsed.eventId !== input.eventId) {
    return { ok: false, mode: "authoritative", reason: "Server response event mismatch" };
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

async function callOperationWithSession<TType extends SupportedAuthoritativeApiOperation>(
  operationType: TType,
  request: {
    idempotencyKey: string;
    payload: ServerOperationInputPayload<TType>;
  },
  options: AuthoritativeDispatcherOptions,
): Promise<AuthoritativeOperationCallResult> {
  const token = await (options.tokenProvider ?? getSupabaseAccessToken)();
  if (!token) {
    return { ok: false, mode: "local", reason: "missing_session" };
  }

  const response = await callAuthoritativeOperation(operationType, request, {
    endpoint: options.endpoint,
    fetcher: options.fetcher,
    token,
  });

  if (!response.body.ok) {
    if (response.status === 404 && response.body.code === "not_found" && response.body.reason.includes("disabled")) {
      return { ok: false, mode: "local", reason: "api_disabled" };
    }

    return { ok: false, mode: "authoritative", reason: response.body.reason };
  }

  return { ok: true, result: response.body.result };
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

function extractArenaResult(result: unknown): Omit<AuthoritativeArenaResultSuccess, "ok" | "mode"> | null {
  if (!isRecord(result)) return null;

  const opponentId = parseString(result.opponentId);
  const winner = parseArenaWinner(result.winner);
  const rewards = parseRewardPayload(result.rewardsGranted);
  const resources = extractResources(result);
  const arenaWins = parseIntegerRange(result.arenaWins, 0, 1000000);
  const arenaLosses = parseIntegerRange(result.arenaLosses, 0, 1000000);
  if (!opponentId || !winner || !rewards.success || !resources || arenaWins === null || arenaLosses === null) return null;

  return {
    opponentId,
    winner,
    rewards: rewards.data,
    resources,
    arenaWins,
    arenaLosses,
  };
}

function extractEventResult(result: unknown): Omit<AuthoritativeEventResultSuccess, "ok" | "mode"> | null {
  if (!isRecord(result)) return null;

  const eventId = parseString(result.eventId);
  const winner = parseArenaWinner(result.winner);
  const firstClear = parseBoolean(result.firstClear);
  const rewards = parseRewardPayload(result.rewardsGranted);
  const resources = extractResources(result);
  if (!eventId || !winner || firstClear === null || !rewards.success || !resources) return null;

  return {
    eventId,
    winner,
    firstClear,
    rewards: rewards.data,
    resources,
  };
}

function extractLoadoutSaveResult(result: unknown): Omit<AuthoritativeLoadoutSaveSuccess, "ok" | "mode"> | null {
  if (!isRecord(result)) return null;

  const leaderId = parseString(result.leaderId);
  const squad = parseNullableStringArray(result.squad, 3);
  const deck = parseNullableStringArray(result.deck, 8);
  const updatedAt = parseString(result.updatedAt);
  if (!leaderId || !squad || !deck || !updatedAt) return null;

  return {
    loadout: {
      leaderId,
      squad: [squad[0] ?? null, squad[1] ?? null, squad[2] ?? null],
      deck,
    },
    updatedAt,
  };
}

function extractDailyLoginResult(result: unknown): Omit<AuthoritativeDailyLoginSuccess, "ok" | "mode"> | null {
  if (!isRecord(result)) return null;

  const dayKey = parseString(result.dayKey);
  const streak = parseIntegerRange(result.streak, 1, 7);
  const rewards = parseRewardPayload(result.rewardsGranted);
  const resources = extractResources(result);
  if (!dayKey || streak === null || !rewards.success || !resources) return null;

  return {
    dayKey,
    streak,
    rewards: rewards.data,
    resources,
  };
}

function extractMissionClaimResult(result: unknown): Omit<AuthoritativeMissionClaimSuccess, "ok" | "mode"> | null {
  if (!isRecord(result)) return null;

  const missionId = parseString(result.missionId);
  const cycleKey = parseString(result.cycleKey);
  const rewards = parseRewardPayload(result.rewardsGranted);
  const resources = extractResources(result);
  if (!missionId || !cycleKey || !rewards.success || !resources) return null;

  return {
    missionId,
    cycleKey,
    rewards: rewards.data,
    resources,
  };
}

function extractFrontlineCardUpgradeResult(
  result: unknown,
): Omit<AuthoritativeFrontlineCardUpgradeSuccess, "ok" | "mode"> | null {
  if (!isRecord(result) || !isRecord(result.costPaid)) return null;

  const cardId = parseString(result.cardId);
  const level = parseIntegerRange(result.level, 1, 5);
  const gold = parseResourceValue(result.costPaid.gold);
  const dust = parseResourceValue(result.costPaid.dust);
  const resources = extractResources(result);
  if (!cardId || level === null || gold === null || dust === null || !resources) return null;

  return {
    cardId,
    level,
    costPaid: { gold, dust },
    resources,
  };
}

function extractFrontlineFortressUpgradeResult(
  result: unknown,
): Omit<AuthoritativeFrontlineFortressUpgradeSuccess, "ok" | "mode"> | null {
  if (!isRecord(result) || !isRecord(result.costPaid) || !isRecord(result.frontlineFortress)) return null;

  const buildingId = parseFrontlineFortressBuildingId(result.buildingId);
  const level = parseIntegerRange(result.level, 1, 60);
  const gold = parseResourceValue(result.costPaid.gold);
  const dust = parseResourceValue(result.costPaid.dust);
  const resources = extractResources(result);
  const frontlineFortress = parseFrontlineFortressState(result.frontlineFortress);
  if (!buildingId || level === null || gold === null || dust === null || !resources || !frontlineFortress) return null;

  return {
    buildingId,
    level,
    costPaid: { gold, dust },
    resources,
    frontlineFortress,
  };
}

function extractFrontlineFortressRaidResult(
  result: unknown,
): Omit<AuthoritativeFrontlineFortressRaidSuccess, "ok" | "mode"> | null {
  if (!isRecord(result) || !isRecord(result.report) || !isRecord(result.frontlineFortress)) return null;

  const report = parseFrontlineFortressReport(result.report);
  const resources = extractResources(result);
  const frontlineFortress = parseFrontlineFortressState(result.frontlineFortress);
  if (!report || !resources || !frontlineFortress) return null;

  return {
    report,
    resources,
    frontlineFortress: {
      ...frontlineFortress,
      lastReport: report,
    },
  };
}

function parseFrontlineFortressReport(value: Record<string, unknown>): NonNullable<FrontlineFortressState["lastReport"]> | null {
  const resolvedAt = parseString(value.resolvedAt);
  const outcome = parseFrontlineFortressOutcome(value.outcome);
  const attackPower = parseIntegerRange(value.attackPower, 0, 100000);
  const defensePower = parseIntegerRange(value.defensePower, 0, 100000);
  const integrityDelta = parseIntegerRange(value.integrityDelta, -100, 100);
  const rewards = parseRewardPayload(value.rewards);

  if (resolvedAt === undefined || !outcome || attackPower === null || defensePower === null || integrityDelta === null || !rewards.success) {
    return null;
  }

  return {
    resolvedAt,
    outcome,
    attackPower,
    defensePower,
    integrityDelta,
    rewards: rewards.data,
  };
}

function parseFrontlineFortressState(value: Record<string, unknown>): FrontlineFortressState | null {
  if (!isRecord(value.buildings)) return null;
  const keep = parseIntegerRange(value.buildings.keep, 1, 60);
  const treasury = parseIntegerRange(value.buildings.treasury, 1, 60);
  const barracks = parseIntegerRange(value.buildings.barracks, 1, 60);
  const integrity = parseIntegerRange(value.integrity, 0, 100);
  const garrison = parseNullableStringArray(value.garrison, 3);
  const lastResolvedAt = value.lastResolvedAt === null ? null : parseOptionalString(value.lastResolvedAt);
  const nextAttackAt = value.nextAttackAt === null ? null : parseOptionalString(value.nextAttackAt);
  const raidsResolved = parseIntegerRange(value.raidsResolved, 0, 100000);

  if (
    keep === null ||
    treasury === null ||
    barracks === null ||
    integrity === null ||
    !garrison ||
    lastResolvedAt === undefined ||
    nextAttackAt === undefined ||
    raidsResolved === null
  ) {
    return null;
  }

  return {
    buildings: { keep, treasury, barracks },
    integrity,
    garrison: [garrison[0] ?? null, garrison[1] ?? null, garrison[2] ?? null],
    lastResolvedAt,
    nextAttackAt,
    raidsResolved,
    lastReport: isRecord(value.lastReport) ? parseFrontlineFortressReport(value.lastReport) : null,
  };
}

function extractHeroLevelUpResult(result: unknown): Omit<AuthoritativeHeroLevelUpSuccess, "ok" | "mode"> | null {
  if (!isRecord(result) || !isRecord(result.costPaid)) return null;

  const heroId = parseString(result.heroId);
  const level = parseIntegerRange(result.level, 1, 60);
  const gold = parseResourceValue(result.costPaid.gold);
  const resources = extractResources(result);
  if (!heroId || level === null || gold === null || !resources) return null;

  return {
    heroId,
    level,
    costPaid: { gold },
    resources,
  };
}

function extractHeroStarUpResult(result: unknown): Omit<AuthoritativeHeroStarUpSuccess, "ok" | "mode"> | null {
  if (!isRecord(result)) return null;

  const heroId = parseString(result.heroId);
  const stars = parseIntegerRange(result.stars, 1, 6);
  const shards = parseResourceValue(result.shards);
  const shardsSpent = parseResourceValue(result.shardsSpent);
  const resources = extractResources(result);
  if (!heroId || stars === null || shards === null || shardsSpent === null || !resources) return null;

  return {
    heroId,
    stars,
    shards,
    shardsSpent,
    resources,
  };
}

function extractHeroSkillUpResult(result: unknown): Omit<AuthoritativeHeroSkillUpSuccess, "ok" | "mode"> | null {
  if (!isRecord(result) || !isRecord(result.costPaid)) return null;

  const heroId = parseString(result.heroId);
  const skillLevel = parseIntegerRange(result.skillLevel, 1, 5);
  const dust = parseResourceValue(result.costPaid.dust);
  const resources = extractResources(result);
  if (!heroId || skillLevel === null || dust === null || !resources) return null;

  return {
    heroId,
    skillLevel,
    costPaid: { dust },
    resources,
  };
}

function extractLocalSnapshotSyncResult(result: unknown): Omit<AuthoritativeLocalSnapshotSyncSuccess, "ok" | "mode"> | null {
  if (!isRecord(result)) return null;

  const profileId = parseString(result.profileId);
  const imported = parseBoolean(result.imported);
  if (!profileId || imported === null || !isRecord(result.normalizedSnapshot)) return null;

  return {
    profileId,
    imported,
    normalizedSnapshot: result.normalizedSnapshot as LocalSyncSnapshot,
  };
}

function parseResourceValue(value: unknown): number | null {
  if (typeof value !== "number") return null;
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function parseString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function parseOptionalString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return parseString(value);
}

function parseFrontlineFortressBuildingId(value: unknown): FrontlineFortressBuildingId | undefined {
  if (value === "keep" || value === "treasury" || value === "barracks") return value;
  return undefined;
}

function parseFrontlineFortressOutcome(value: unknown): NonNullable<FrontlineFortressState["lastReport"]>["outcome"] | undefined {
  if (value === "full_repel" || value === "partial_hold" || value === "breach") return value;
  return undefined;
}

function parseLootTier(value: unknown): AdventureMapInteractionLootTier | undefined {
  if (value === "common" || value === "rare" || value === "epic" || value === "legendary") return value;
  return undefined;
}

function parseBattleWinner(value: unknown): AuthoritativeAdventureBattleWinner | undefined {
  if (value === "ally" || value === "enemy") return value;
  return undefined;
}

function parseArenaWinner(value: unknown): AuthoritativeArenaWinner | undefined {
  if (value === "ally" || value === "enemy" || value === "draw") return value;
  return undefined;
}

function parseBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function parseIntegerRange(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isInteger(value) || value < min || value > max) return null;
  return value;
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

function parseNullableStringArray(value: unknown, expectedLength: number): (string | null)[] | null {
  if (!Array.isArray(value) || value.length !== expectedLength) return null;
  const out: (string | null)[] = [];
  for (const item of value) {
    if (item === null) {
      out.push(null);
      continue;
    }
    const parsed = parseString(item);
    if (!parsed) return null;
    out.push(parsed);
  }
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
