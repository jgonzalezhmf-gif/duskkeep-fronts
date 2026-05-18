import { parseRewardPayload } from "@/features/server/authoritativeOperations";
import type { AdventureMapInteractionLootTier, AdventureMapInteractionOpenResult } from "@/features/adventure/mapInteractions";
import type { FrontlineFortressBuildingId, FrontlineFortressState, FrontlineLoadout, LadderState, Resources, Rewards } from "@/lib/types";

export type ParsedMapInteractionOpenResult = {
  result: AdventureMapInteractionOpenResult;
  resources: Resources;
  resetAvailableAt: string | null;
};

export type ParsedNodeRewardResult = {
  nodeId: string;
  rewards: Rewards;
  resources: Resources;
};

export type ParsedAdventureBattleResult = {
  nodeId: string;
  winner: "ally" | "enemy";
  firstClear: boolean;
  rewards: Rewards;
  resources: Resources;
  unlockedNodeIds: string[];
};

export type ParsedArenaResult = {
  opponentId: string;
  winner: "ally" | "enemy" | "draw";
  rewards: Rewards;
  resources: Resources;
  arenaWins: number;
  arenaLosses: number;
};

export type ParsedLadderResult = {
  opponentId: string;
  winner: "ally" | "enemy" | "draw";
  rewards: Rewards;
  resources: Resources;
  ladder: LadderState;
  pointsDelta: number;
  keyProgressDelta: number;
  adventureKeysGranted: number;
  rewardMode: "normal" | "reduced" | "draw" | "loss";
};

export type ParsedEventResult = {
  eventId: string;
  winner: "ally" | "enemy" | "draw";
  firstClear: boolean;
  rewards: Rewards;
  resources: Resources;
};

export type ParsedLoadoutSaveResult = {
  loadout: FrontlineLoadout;
  updatedAt: string;
};

export type ParsedDailyLoginResult = {
  dayKey: string;
  streak: number;
  rewards: Rewards;
  resources: Resources;
};

export type ParsedMissionClaimResult = {
  missionId: string;
  cycleKey: string;
  rewards: Rewards;
  resources: Resources;
};

export type ParsedFrontlineCardUpgradeResult = {
  cardId: string;
  level: number;
  costPaid: { gold: number; dust: number };
  resources: Resources;
};

export type ParsedFrontlineFortressUpgradeResult = {
  buildingId: FrontlineFortressBuildingId;
  level: number;
  costPaid: { gold: number; dust: number };
  resources: Resources;
  frontlineFortress: FrontlineFortressState;
};

export type ParsedFrontlineFortressRaidResult = {
  report: NonNullable<FrontlineFortressState["lastReport"]>;
  resources: Resources;
  frontlineFortress: FrontlineFortressState;
};

export type ParsedHeroLevelUpResult = {
  heroId: string;
  level: number;
  costPaid: { gold: number };
  resources: Resources;
};

export type ParsedHeroStarUpResult = {
  heroId: string;
  stars: number;
  shards: number;
  shardsSpent: number;
  resources: Resources;
};

export type ParsedHeroSkillUpResult = {
  heroId: string;
  skillLevel: number;
  costPaid: { dust: number };
  resources: Resources;
};

export type ParsedLocalSnapshotSyncResult<TSnapshot> = {
  profileId: string;
  imported: boolean;
  normalizedSnapshot: TSnapshot;
};

export function extractResources(result: unknown): Resources | null {
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

export function extractMapInteractionOpenResult(result: unknown): ParsedMapInteractionOpenResult | null {
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

export function extractNodeRewardResult(result: unknown): ParsedNodeRewardResult | null {
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

export function extractAdventureBattleResult(result: unknown): ParsedAdventureBattleResult | null {
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

export function extractArenaResult(result: unknown): ParsedArenaResult | null {
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

export function extractLadderResult(result: unknown): ParsedLadderResult | null {
  if (!isRecord(result)) return null;

  const opponentId = parseString(result.opponentId);
  const winner = parseArenaWinner(result.winner);
  const rewards = parseRewardPayload(result.rewardsGranted);
  const resources = extractResources(result);
  const ladder = parseLadderState(result.ladder);
  const pointsDelta = parseIntegerRange(result.pointsDelta, -1000, 1000);
  const keyProgressDelta = parseIntegerRange(result.keyProgressDelta, 0, 1000);
  const adventureKeysGranted = parseIntegerRange(result.adventureKeysGranted, 0, 99);
  const rewardMode = parseRewardMode(result.rewardMode);
  if (
    !opponentId ||
    !winner ||
    !rewards.success ||
    !resources ||
    !ladder ||
    pointsDelta === null ||
    keyProgressDelta === null ||
    adventureKeysGranted === null ||
    !rewardMode
  ) {
    return null;
  }

  return {
    opponentId,
    winner,
    rewards: rewards.data,
    resources,
    ladder,
    pointsDelta,
    keyProgressDelta,
    adventureKeysGranted,
    rewardMode,
  };
}

export function extractEventResult(result: unknown): ParsedEventResult | null {
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

export function extractLoadoutSaveResult(result: unknown): ParsedLoadoutSaveResult | null {
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

export function extractDailyLoginResult(result: unknown): ParsedDailyLoginResult | null {
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

export function extractMissionClaimResult(result: unknown): ParsedMissionClaimResult | null {
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

export function extractFrontlineCardUpgradeResult(result: unknown): ParsedFrontlineCardUpgradeResult | null {
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

export function extractFrontlineFortressUpgradeResult(result: unknown): ParsedFrontlineFortressUpgradeResult | null {
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

export function extractFrontlineFortressRaidResult(result: unknown): ParsedFrontlineFortressRaidResult | null {
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

export function extractHeroLevelUpResult(result: unknown): ParsedHeroLevelUpResult | null {
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

export function extractHeroStarUpResult(result: unknown): ParsedHeroStarUpResult | null {
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

export function extractHeroSkillUpResult(result: unknown): ParsedHeroSkillUpResult | null {
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

export function extractLocalSnapshotSyncResult<TSnapshot>(result: unknown): ParsedLocalSnapshotSyncResult<TSnapshot> | null {
  if (!isRecord(result)) return null;

  const profileId = parseString(result.profileId);
  const imported = parseBoolean(result.imported);
  if (!profileId || imported === null || !isRecord(result.normalizedSnapshot)) return null;

  return {
    profileId,
    imported,
    normalizedSnapshot: result.normalizedSnapshot as TSnapshot,
  };
}

export function parseBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
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

function parseBattleWinner(value: unknown): "ally" | "enemy" | undefined {
  if (value === "ally" || value === "enemy") return value;
  return undefined;
}

function parseArenaWinner(value: unknown): "ally" | "enemy" | "draw" | undefined {
  if (value === "ally" || value === "enemy" || value === "draw") return value;
  return undefined;
}

function parseRewardMode(value: unknown): ParsedLadderResult["rewardMode"] | undefined {
  if (value === "normal" || value === "reduced" || value === "draw" || value === "loss") return value;
  return undefined;
}

function parseLadderState(value: unknown): LadderState | null {
  if (!isRecord(value)) return null;
  const seasonId = parseString(value.seasonId);
  const points = parseIntegerRange(value.points, 0, 1000000);
  const league = parseLadderLeague(value.league);
  const division = parseLadderDivision(value.division);
  const keyProgress = parseIntegerRange(value.keyProgress, 0, 99);
  const dailyRewardedWins = parseIntegerRange(value.dailyRewardedWins, 0, 1000);
  const dailyCycleKey = value.dailyCycleKey === null ? null : parseString(value.dailyCycleKey);
  if (!seasonId || points === null || !league || !division || keyProgress === null || dailyRewardedWins === null || dailyCycleKey === undefined) {
    return null;
  }
  return { seasonId, points, league, division, keyProgress, dailyRewardedWins, dailyCycleKey };
}

function parseLadderLeague(value: unknown): LadderState["league"] | undefined {
  if (
    value === "bronze" ||
    value === "silver" ||
    value === "gold" ||
    value === "platinum" ||
    value === "diamond" ||
    value === "master" ||
    value === "grandmaster"
  ) {
    return value;
  }
  return undefined;
}

function parseLadderDivision(value: unknown): LadderState["division"] | undefined {
  if (value === "iii" || value === "ii" || value === "i") return value;
  return undefined;
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
