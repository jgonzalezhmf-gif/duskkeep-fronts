import type { AdventureMapInteractionClaim } from "@/features/adventure/mapInteractions";
import type { AdventureProgressEntry } from "@/features/adventure/nodeResolution";
import type { ServerPlayerSnapshot } from "@/features/server/serverPlayerSnapshot";
import { ALL_MISSIONS } from "@/data/missions";
import { defaultInitial } from "@/lib/defaultGameState";
import { getMissionResetAt } from "@/lib/missionProgress";
import { localDayKey } from "@/lib/rewardVisibility";
import type { GameState } from "@/lib/storeTypes";
import type { FrontlineLoadout, MissionProgress, PlayerHero, Resources, Rewards } from "@/lib/types";

export type ServerPlayerSnapshotPatchOptions = {
  announceAccountLevelUp?: boolean;
};

type ServerSnapshotPatch = Pick<GameState, "account" | "resources"> &
  Partial<
    Pick<
      GameState,
      | "pendingUnlockLevel"
      | "heroes"
      | "frontlineCardUnlocks"
      | "frontlineCardLevels"
      | "frontlineLoadout"
      | "adventureProgress"
      | "adventureMapClaims"
      | "frontlineFortress"
      | "missionsProgress"
      | "dailyLogin"
      | "shopPurchases"
      | "dailyShopPurchases"
      | "battlesWon"
      | "arenaWins"
      | "arenaLosses"
      | "ladder"
      | "eventsPlayed"
      | "eventCompletions"
    >
  >;

export function createServerPlayerSnapshotPatch(
  state: GameState,
  serverSnapshot: ServerPlayerSnapshot,
  options: ServerPlayerSnapshotPatchOptions = {},
): ServerSnapshotPatch {
  const snapshot = serverSnapshot.snapshot;
  const heroes = normalizeHeroes(snapshot.heroes);
  const frontlineLoadout = normalizeFrontlineLoadout(snapshot.frontlineLoadout);
  const adventureProgress = normalizeAdventureProgress(snapshot.adventureProgress);
  const adventureMapClaims = normalizeAdventureMapClaims(snapshot.adventureMapClaims);
  const shopPurchases = normalizeShopPurchases(snapshot.shopPurchases);
  const battleStats = snapshot.battleStats ?? { battlesWon: 0, arenaWins: 0, arenaLosses: 0 };
  const nextAccount = {
    ...state.account,
    name: snapshot.account.name,
    level: snapshot.account.level,
    xp: snapshot.account.xp,
    createdAt: snapshot.account.createdAt ?? state.account.createdAt,
  };

  return {
    account: nextAccount,
    resources: normalizeResources(snapshot.resources),
    ...(options.announceAccountLevelUp && nextAccount.level > state.account.level
      ? { pendingUnlockLevel: Math.max(state.pendingUnlockLevel ?? 0, nextAccount.level) }
      : {}),
    ...(heroes.length > 0 ? { heroes } : {}),
    ...(Object.keys(snapshot.frontlineCardUnlocks).length > 0 ? { frontlineCardUnlocks: snapshot.frontlineCardUnlocks } : {}),
    ...(Object.keys(snapshot.frontlineCardLevels).length > 0 ? { frontlineCardLevels: snapshot.frontlineCardLevels } : {}),
    ...(frontlineLoadout ? { frontlineLoadout } : {}),
    ...(snapshot.frontlineFortress ? { frontlineFortress: snapshot.frontlineFortress } : {}),
    adventureProgress,
    adventureMapClaims,
    missionsProgress: normalizeMissionsProgress(state.missionsProgress, snapshot.missionsProgress),
    dailyLogin: normalizeDailyLogin(snapshot.dailyLoginClaims),
    shopPurchases: shopPurchases.total,
    dailyShopPurchases: shopPurchases.today,
    battlesWon: battleStats.battlesWon,
    arenaWins: battleStats.arenaWins,
    arenaLosses: battleStats.arenaLosses,
    ...(snapshot.ladder ? { ladder: snapshot.ladder } : {}),
    eventsPlayed: normalizeEventsPlayed(snapshot.eventsPlayed ?? {}),
    eventCompletions: normalizeEventCompletions(snapshot.eventCompletions ?? {}),
  };
}

function normalizeResources(resources: ServerPlayerSnapshot["snapshot"]["resources"]): Resources {
  return {
    gold: resources.gold,
    dust: resources.dust,
    gems: resources.gems,
    arenaTickets: resources.arenaTickets,
    adventureKeys: resources.adventureKeys,
  };
}

function normalizeHeroes(heroes: Array<Record<string, unknown>>): PlayerHero[] {
  return heroes.flatMap((hero) => {
    if (
      typeof hero.heroId !== "string" ||
      !isFiniteNumber(hero.level) ||
      !isFiniteNumber(hero.stars) ||
      !isFiniteNumber(hero.shards) ||
      !isFiniteNumber(hero.xp) ||
      !isFiniteNumber(hero.skillLevel)
    ) {
      return [];
    }

    return [{
      heroId: hero.heroId,
      level: hero.level,
      stars: hero.stars,
      shards: hero.shards,
      xp: hero.xp,
      skillLevel: hero.skillLevel,
    }];
  });
}

function normalizeFrontlineLoadout(loadout: ServerPlayerSnapshot["snapshot"]["frontlineLoadout"]): FrontlineLoadout | null {
  if (!loadout || loadout.squad.length !== 3 || loadout.deck.length !== 8) return null;

  return {
    leaderId: loadout.leaderId,
    squad: [loadout.squad[0] ?? null, loadout.squad[1] ?? null, loadout.squad[2] ?? null],
    deck: loadout.deck.map((cardId) => cardId ?? null),
  };
}

function normalizeAdventureProgress(progress: Record<string, Record<string, unknown>>): Record<string, AdventureProgressEntry> {
  return Object.fromEntries(
    Object.entries(progress).flatMap(([nodeId, entry]) => {
      const cleared = entry.cleared;
      const firstClearTaken = entry.firstClearTaken;
      if (typeof cleared !== "boolean" || typeof firstClearTaken !== "boolean") return [];

      const normalized: AdventureProgressEntry = {
        cleared,
        firstClearTaken,
        ...(typeof entry.claimed === "boolean" ? { claimed: entry.claimed } : {}),
        ...(typeof entry.clearedAt === "string" ? { lastCompletedAt: entry.clearedAt } : {}),
      };
      return [[nodeId, normalized]];
    }),
  );
}

function normalizeAdventureMapClaims(claims: Record<string, Record<string, unknown>>): Record<string, AdventureMapInteractionClaim> {
  return Object.fromEntries(
    Object.entries(claims).flatMap(([interactionId, claim]) => {
      if (typeof claim.claimed !== "boolean") return [];

      const normalized: AdventureMapInteractionClaim = {
        claimed: claim.claimed,
        ...(typeof claim.claimedAt === "string" ? { claimedAt: claim.claimedAt } : {}),
        ...(typeof claim.lootId === "string" ? { lootId: claim.lootId } : {}),
        ...(isLootTier(claim.lootTier) ? { lootTier: claim.lootTier } : {}),
        ...(typeof claim.lootTitle === "string" ? { lootTitle: claim.lootTitle } : {}),
        ...(isRewards(claim.rewards) ? { rewards: claim.rewards } : {}),
        ...(typeof claim.resetAvailableAt === "string" ? { resetAvailableAt: claim.resetAvailableAt } : {}),
      };
      return [[interactionId, normalized]];
    }),
  );
}

function normalizeMissionsProgress(
  current: GameState["missionsProgress"],
  progress: Record<string, Record<string, unknown>>,
): Record<string, MissionProgress> {
  const byMission = new Map<string, { cycleKey: string; updatedAt: string; progress: MissionProgress }>();

  for (const entry of Object.values(progress)) {
    const missionId = typeof entry.missionId === "string" ? entry.missionId : null;
    if (!missionId) continue;

    const mission = ALL_MISSIONS.find((item) => item.id === missionId);
    if (!mission) continue;

    const progressValue = isFiniteNumber(entry.progress) ? Math.max(0, Math.min(mission.goal, entry.progress)) : null;
    const claimed = entry.claimed;
    if (progressValue === null || typeof claimed !== "boolean") continue;

    const cycleKey = typeof entry.cycleKey === "string" ? entry.cycleKey : "";
    const normalized: MissionProgress = {
      progress: progressValue,
      claimed,
      resetAt: getMissionResetAtFromCycle(cycleKey, mission.kind) ?? current[missionId]?.resetAt ?? getMissionResetAt(mission.kind),
    };
    const updatedAt = typeof entry.updatedAt === "string" ? entry.updatedAt : typeof entry.claimedAt === "string" ? entry.claimedAt : "";
    const previous = byMission.get(missionId);
    if (!previous || isNewerMissionEntry({ cycleKey, updatedAt }, previous)) {
      byMission.set(missionId, { cycleKey, updatedAt, progress: normalized });
    }
  }

  return Object.fromEntries(Array.from(byMission.entries()).map(([missionId, entry]) => [missionId, entry.progress]));
}

function isNewerMissionEntry(
  candidate: { cycleKey: string; updatedAt: string },
  current: { cycleKey: string; updatedAt: string },
) {
  if (candidate.cycleKey !== current.cycleKey) return candidate.cycleKey > current.cycleKey;
  return candidate.updatedAt > current.updatedAt;
}

function getMissionResetAtFromCycle(cycleKey: string, kind: "daily" | "weekly") {
  const [, rawDate] = cycleKey.split(":");
  if (!rawDate) return null;

  if (kind === "daily" && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    const reset = new Date(`${rawDate}T00:00:00.000Z`);
    if (!Number.isFinite(reset.getTime())) return null;
    reset.setUTCDate(reset.getUTCDate() + 1);
    return reset.toISOString();
  }

  return null;
}

function normalizeDailyLogin(claims: Record<string, Record<string, unknown>>): GameState["dailyLogin"] {
  const latest = Object.values(claims).reduce<{ dayKey: string; streak: number } | null>((best, claim) => {
    const dayKey = typeof claim.dayKey === "string" ? claim.dayKey : null;
    const streak = isFiniteNumber(claim.streak) ? claim.streak : null;
    if (!dayKey || streak === null) return best;
    if (!best || dayKey > best.dayKey) return { dayKey, streak };
    return best;
  }, null);

  return latest ? { streak: latest.streak, lastClaim: latest.dayKey } : { ...defaultInitial().dailyLogin };
}

function normalizeShopPurchases(purchases: Array<Record<string, unknown>>): {
  total: GameState["shopPurchases"];
  today: GameState["dailyShopPurchases"];
} {
  const total: GameState["shopPurchases"] = {};
  const today: GameState["dailyShopPurchases"] = {};
  const currentDay = localDayKey();

  for (const purchase of purchases) {
    const offerId = typeof purchase.offerId === "string" ? purchase.offerId : null;
    const quantity = isFiniteNumber(purchase.quantity) ? Math.max(0, Math.floor(purchase.quantity)) : null;
    if (!offerId || quantity === null) continue;

    total[offerId] = (total[offerId] ?? 0) + quantity;
    if (purchase.purchaseDay === currentDay) {
      today[offerId] = (today[offerId] ?? 0) + quantity;
    }
  }

  return { total, today };
}

function normalizeEventsPlayed(eventsPlayed: Record<string, number>): GameState["eventsPlayed"] {
  return Object.fromEntries(
    Object.entries(eventsPlayed).filter((entry): entry is [string, number] => typeof entry[0] === "string" && isFiniteNumber(entry[1])),
  );
}

function normalizeEventCompletions(eventCompletions: Record<string, string>): GameState["eventCompletions"] {
  return Object.fromEntries(
    Object.entries(eventCompletions).filter((entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string"),
  );
}

function isRewards(value: unknown): value is Rewards {
  if (!isRecord(value)) return false;

  return Object.values(value).every((entry) => typeof entry === "number" || Array.isArray(entry));
}

function isLootTier(value: unknown): value is NonNullable<AdventureMapInteractionClaim["lootTier"]> {
  return value === "common" || value === "rare" || value === "epic" || value === "legendary";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
