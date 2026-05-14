import type { AdventureMapInteractionClaim } from "@/features/adventure/mapInteractions";
import type { AdventureProgressEntry } from "@/features/adventure/nodeResolution";
import type { ServerPlayerSnapshot } from "@/features/server/serverPlayerSnapshot";
import type { GameState } from "@/lib/storeTypes";
import type { FrontlineLoadout, PlayerHero, Resources, Rewards } from "@/lib/types";

type ServerSnapshotPatch = Pick<GameState, "account" | "resources"> &
  Partial<
    Pick<
      GameState,
      "heroes" | "frontlineCardUnlocks" | "frontlineCardLevels" | "frontlineLoadout" | "adventureProgress" | "adventureMapClaims"
    >
  >;

export function createServerPlayerSnapshotPatch(state: GameState, serverSnapshot: ServerPlayerSnapshot): ServerSnapshotPatch {
  const snapshot = serverSnapshot.snapshot;
  const heroes = normalizeHeroes(snapshot.heroes);
  const frontlineLoadout = normalizeFrontlineLoadout(snapshot.frontlineLoadout);
  const adventureProgress = normalizeAdventureProgress(snapshot.adventureProgress);
  const adventureMapClaims = normalizeAdventureMapClaims(snapshot.adventureMapClaims);

  return {
    account: {
      ...state.account,
      name: snapshot.account.name,
      level: snapshot.account.level,
      xp: snapshot.account.xp,
      createdAt: snapshot.account.createdAt ?? state.account.createdAt,
    },
    resources: normalizeResources(snapshot.resources),
    ...(heroes.length > 0 ? { heroes } : {}),
    ...(Object.keys(snapshot.frontlineCardUnlocks).length > 0 ? { frontlineCardUnlocks: snapshot.frontlineCardUnlocks } : {}),
    ...(Object.keys(snapshot.frontlineCardLevels).length > 0 ? { frontlineCardLevels: snapshot.frontlineCardLevels } : {}),
    ...(frontlineLoadout ? { frontlineLoadout } : {}),
    ...(Object.keys(adventureProgress).length > 0 ? { adventureProgress } : {}),
    ...(Object.keys(adventureMapClaims).length > 0 ? { adventureMapClaims } : {}),
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
