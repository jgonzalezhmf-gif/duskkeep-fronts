import {
  callOperationWithSession,
  createIdempotencyKey,
} from "@/features/server/authoritativeOperationCaller";
import {
  authoritativeResponseMismatch,
  invalidAuthoritativeServerResponse,
} from "@/features/server/authoritativeDispatcherErrors";
import {
  extractAdventureBattleResult,
  extractArenaResult,
  extractDailyLoginResult,
  extractEventResult,
  extractFrontlineCardUpgradeResult,
  extractFrontlineFortressRaidResult,
  extractFrontlineFortressUpgradeResult,
  extractHeroLevelUpResult,
  extractHeroSkillUpResult,
  extractHeroStarUpResult,
  extractLoadoutSaveResult,
  extractLocalSnapshotSyncResult,
  extractMapInteractionOpenResult,
  extractMissionClaimResult,
  extractNodeRewardResult,
  extractResources,
  isRecord,
  parseBoolean,
} from "@/features/server/authoritativeOperationParsers";
import type {
  AuthoritativeAdventureBattleResult,
  AuthoritativeArenaResult,
  AuthoritativeDailyLoginResult,
  AuthoritativeDispatcherOptions,
  AuthoritativeEventResult,
  AuthoritativeFrontlineCardUpgradeResult,
  AuthoritativeFrontlineFortressRaidResult,
  AuthoritativeFrontlineFortressUpgradeResult,
  AuthoritativeHeroLevelUpResult,
  AuthoritativeHeroSkillUpResult,
  AuthoritativeHeroStarUpResult,
  AuthoritativeLoadoutSaveResult,
  AuthoritativeLocalSnapshotSyncResult,
  AuthoritativeMapInteractionResult,
  AuthoritativeMissionClaimResult,
  AuthoritativeNodeRewardResult,
  AuthoritativePurchaseResult,
  ClaimAdventureBattleResultAuthoritativelyOptions,
  ClaimAdventureBattleResultInput,
  ClaimAdventureNodeRewardAuthoritativelyOptions,
  ClaimDailyLoginAuthoritativelyOptions,
  ClaimMissionAuthoritativelyOptions,
  LevelUpHeroAuthoritativelyOptions,
  LocalSyncSnapshot,
  OpenAdventureMapInteractionAuthoritativelyOptions,
  PurchaseShopOfferAuthoritativelyOptions,
  RecordArenaResultAuthoritativelyOptions,
  RecordArenaResultInput,
  RecordEventResultAuthoritativelyOptions,
  RecordEventResultInput,
  ResolveFrontlineFortressRaidAuthoritativelyOptions,
  SaveFrontlineLoadoutAuthoritativelyOptions,
  SkillUpHeroAuthoritativelyOptions,
  StarUpHeroAuthoritativelyOptions,
  SyncLocalSnapshotAuthoritativelyOptions,
  UpgradeFrontlineCardAuthoritativelyOptions,
  UpgradeFrontlineFortressAuthoritativelyOptions,
} from "@/features/server/authoritativeOperationTypes";
import type { FrontlineFortressBuildingId, FrontlineLoadout } from "@/lib/types";

export type * from "@/features/server/authoritativeOperationTypes";

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

  const parsed = extractLocalSnapshotSyncResult<LocalSyncSnapshot>(response.result);
  if (!parsed) {
    return invalidAuthoritativeServerResponse();
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
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.heroId !== heroId) {
    return authoritativeResponseMismatch("hero");
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
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.heroId !== heroId) {
    return authoritativeResponseMismatch("hero");
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
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.heroId !== heroId) {
    return authoritativeResponseMismatch("hero");
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
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.cardId !== cardId) {
    return authoritativeResponseMismatch("card");
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
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.buildingId !== buildingId) {
    return authoritativeResponseMismatch("building");
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
    return invalidAuthoritativeServerResponse();
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
    return invalidAuthoritativeServerResponse();
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
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.missionId !== missionId || parsed.cycleKey !== cycleKey) {
    return authoritativeResponseMismatch("mission");
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
    return invalidAuthoritativeServerResponse();
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
    return invalidAuthoritativeServerResponse();
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
    return invalidAuthoritativeServerResponse();
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
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.nodeId !== nodeId) {
    return authoritativeResponseMismatch("node");
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
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.nodeId !== input.nodeId) {
    return authoritativeResponseMismatch("node");
  }
  if (parsed.winner !== input.winner) {
    return authoritativeResponseMismatch("winner");
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
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.opponentId !== input.opponentId) {
    return authoritativeResponseMismatch("opponent");
  }
  if (parsed.winner !== input.winner) {
    return authoritativeResponseMismatch("winner");
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
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.eventId !== input.eventId) {
    return authoritativeResponseMismatch("event");
  }
  if (parsed.winner !== input.winner) {
    return authoritativeResponseMismatch("winner");
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}
