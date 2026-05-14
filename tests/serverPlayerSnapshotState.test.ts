import { describe, expect, it } from "vitest";
import { createServerPlayerSnapshotPatch } from "@/lib/serverPlayerSnapshotState";
import { defaultInitial } from "@/lib/defaultGameState";
import type { GameState } from "@/lib/storeTypes";

function currentState(): GameState {
  return {
    ...defaultInitial(),
    hydrated: true,
    notifications: [],
  };
}

describe("server player snapshot state patch", () => {
  it("applies authoritative account and resources from the server snapshot", () => {
    const state = currentState();

    const patch = createServerPlayerSnapshotPatch(state, {
      profileId: "profile-1",
      snapshot: {
        account: { name: "Server Commander", level: 7, xp: 900 },
        resources: { gold: 900, dust: 120, gems: 60, arenaTickets: 3, adventureKeys: 2 },
        heroes: [],
        frontlineCardUnlocks: {},
        frontlineCardLevels: {},
        frontlineLoadout: null,
        adventureProgress: {},
        adventureMapClaims: {},
        missionsProgress: {},
        dailyLoginClaims: {},
        shopPurchases: [],
      },
    });

    expect(patch.account).toEqual({
      ...state.account,
      name: "Server Commander",
      level: 7,
      xp: 900,
    });
    expect(patch.resources).toEqual({ gold: 900, dust: 120, gems: 60, arenaTickets: 3, adventureKeys: 2 });
  });

  it("does not wipe starter heroes or loadout when the server has not provisioned those rows yet", () => {
    const patch = createServerPlayerSnapshotPatch(currentState(), {
      profileId: "profile-1",
      snapshot: {
        account: { name: "Commander", level: 1, xp: 0 },
        resources: { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
        heroes: [],
        frontlineCardUnlocks: {},
        frontlineCardLevels: {},
        frontlineLoadout: null,
        adventureProgress: {},
        adventureMapClaims: {},
        missionsProgress: {},
        dailyLoginClaims: {},
        shopPurchases: [],
      },
    });

    expect(patch).not.toHaveProperty("heroes");
    expect(patch).not.toHaveProperty("frontlineLoadout");
  });

  it("normalizes server-owned collections when they exist", () => {
    const patch = createServerPlayerSnapshotPatch(currentState(), {
      profileId: "profile-1",
      snapshot: {
        account: { name: "Commander", level: 1, xp: 0 },
        resources: { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
        heroes: [{ heroId: "bran", level: 4, stars: 2, shards: 12, xp: 80, skillLevel: 2 }],
        frontlineCardUnlocks: { order_guard_wall: true },
        frontlineCardLevels: { order_guard_wall: 3 },
        frontlineLoadout: {
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
        adventureProgress: { c1l2: { cleared: true, firstClearTaken: true, claimed: false } },
        adventureMapClaims: { "c1-lower-cache": { claimed: true, lootTier: "rare", rewards: { gold: 300 } } },
        missionsProgress: {},
        dailyLoginClaims: {},
        shopPurchases: [],
      },
    });

    expect(patch.heroes).toEqual([{ heroId: "bran", level: 4, stars: 2, shards: 12, xp: 80, skillLevel: 2 }]);
    expect(patch.frontlineCardUnlocks).toEqual({ order_guard_wall: true });
    expect(patch.frontlineCardLevels).toEqual({ order_guard_wall: 3 });
    expect(patch.frontlineLoadout?.squad).toEqual(["bran", "kara", "mira"]);
    expect(patch.adventureProgress).toEqual({ c1l2: { cleared: true, firstClearTaken: true, claimed: false } });
    expect(patch.adventureMapClaims).toEqual({ "c1-lower-cache": { claimed: true, lootTier: "rare", rewards: { gold: 300 } } });
  });
});
