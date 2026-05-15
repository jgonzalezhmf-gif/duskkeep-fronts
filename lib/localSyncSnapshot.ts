import type { LocalSyncSnapshot } from "@/features/server/authoritativeOperationTypes";
import type { GameState } from "@/lib/storeTypes";

export const LOCAL_SYNC_SNAPSHOT_VERSION = "1";

export function createLocalSyncSnapshot(state: GameState): LocalSyncSnapshot {
  return {
    account: {
      name: state.account.name,
      level: state.account.level,
      xp: state.account.xp,
    },
    resources: {
      gold: state.resources.gold,
      dust: state.resources.dust,
      gems: state.resources.gems,
      arenaTickets: state.resources.arenaTickets,
      adventureKeys: state.resources.adventureKeys,
    },
    heroes: state.heroes.map((hero) => ({
      heroId: hero.heroId,
      level: hero.level,
      stars: hero.stars,
      shards: hero.shards,
      xp: hero.xp,
      skillLevel: hero.skillLevel,
    })),
    frontlineLoadout: state.frontlineLoadout,
    frontlineCardUnlocks: state.frontlineCardUnlocks,
    frontlineCardLevels: state.frontlineCardLevels,
    frontlineFortress: {
      buildings: state.frontlineFortress.buildings,
      integrity: state.frontlineFortress.integrity,
      garrison: state.frontlineFortress.garrison,
      lastResolvedAt: state.frontlineFortress.lastResolvedAt,
      nextAttackAt: state.frontlineFortress.nextAttackAt,
      raidsResolved: state.frontlineFortress.raidsResolved,
    },
    adventureProgress: Object.fromEntries(
      Object.entries(state.adventureProgress).map(([nodeId, entry]) => [
        nodeId,
        {
          cleared: entry.cleared,
          firstClearTaken: entry.firstClearTaken,
          claimed: entry.claimed,
          status: entry.claimed ? "claimed" : entry.cleared ? "cleared" : undefined,
        },
      ]),
    ),
    adventureMapClaims: Object.fromEntries(
      Object.entries(state.adventureMapClaims).map(([interactionId, claim]) => [
        interactionId,
        {
          claimed: claim.claimed,
          claimedAt: claim.claimedAt ?? null,
          resetAvailableAt: claim.resetAvailableAt ?? null,
        },
      ]),
    ),
  };
}
