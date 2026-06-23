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
        frontlineFortress: null,
        adventureProgress: {},
        adventureMapClaims: {},
        missionsProgress: {},
        dailyLoginClaims: {},
        shopPurchases: [],
        battleStats: { battlesWon: 0, arenaWins: 0, arenaLosses: 0 },
        eventsPlayed: {},
        eventCompletions: {},
      },
    });

    expect(patch.account).toEqual({
      ...state.account,
      name: "Server Commander",
      level: 7,
      xp: 900,
    });
    expect(patch.resources).toEqual({ gold: 900, dust: 120, gems: 60, arenaTickets: 3, adventureKeys: 2 });
    expect(patch).not.toHaveProperty("pendingUnlockLevel");
  });

  it("announces account level-ups only when an authoritative mutation refresh confirms the level increase", () => {
    const state = {
      ...currentState(),
      account: { ...currentState().account, level: 1, xp: 90 },
    };

    const patch = createServerPlayerSnapshotPatch(
      state,
      {
        profileId: "profile-1",
        snapshot: {
          account: { name: "Commander", level: 2, xp: 5 },
          resources: { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
          heroes: [],
          frontlineCardUnlocks: {},
          frontlineCardLevels: {},
          frontlineLoadout: null,
          frontlineFortress: null,
          adventureProgress: {},
          adventureMapClaims: {},
          missionsProgress: {},
          dailyLoginClaims: {},
          shopPurchases: [],
          battleStats: { battlesWon: 0, arenaWins: 0, arenaLosses: 0 },
          eventsPlayed: {},
          eventCompletions: {},
        },
      },
      { announceAccountLevelUp: true },
    );

    expect(patch.account.level).toBe(2);
    expect(patch.account.xp).toBe(5);
    expect(patch.pendingUnlockLevel).toBe(2);
  });

  it("does not re-announce the same account level from an authoritative snapshot", () => {
    const state = {
      ...currentState(),
      account: { ...currentState().account, level: 2, xp: 5 },
      pendingUnlockLevel: null,
    };

    const patch = createServerPlayerSnapshotPatch(
      state,
      {
        profileId: "profile-1",
        snapshot: {
          account: { name: "Commander", level: 2, xp: 20 },
          resources: { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
          heroes: [],
          frontlineCardUnlocks: {},
          frontlineCardLevels: {},
          frontlineLoadout: null,
          frontlineFortress: null,
          adventureProgress: {},
          adventureMapClaims: {},
          missionsProgress: {},
          dailyLoginClaims: {},
          shopPurchases: [],
          battleStats: { battlesWon: 0, arenaWins: 0, arenaLosses: 0 },
          eventsPlayed: {},
          eventCompletions: {},
        },
      },
      { announceAccountLevelUp: true },
    );

    expect(patch.account.level).toBe(2);
    expect(patch).not.toHaveProperty("pendingUnlockLevel");
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
        frontlineFortress: null,
        adventureProgress: {},
        adventureMapClaims: {},
        missionsProgress: {},
        dailyLoginClaims: {},
        shopPurchases: [],
        battleStats: { battlesWon: 0, arenaWins: 0, arenaLosses: 0 },
        eventsPlayed: {},
        eventCompletions: {},
      },
    });

    expect(patch).not.toHaveProperty("heroes");
    expect(patch).not.toHaveProperty("frontlineLoadout");
  });

  it("clears local Adventure progress when the authoritative server snapshot is empty", () => {
    const state = {
      ...currentState(),
      adventureProgress: { c1l4: { cleared: true, firstClearTaken: true } },
      adventureMapClaims: { "c1-lower-cache": { claimed: true } },
    };

    const patch = createServerPlayerSnapshotPatch(state, {
      profileId: "profile-1",
      snapshot: {
        account: { name: "Commander", level: 1, xp: 0 },
        resources: { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
        heroes: [],
        frontlineCardUnlocks: {},
        frontlineCardLevels: {},
        frontlineLoadout: null,
        frontlineFortress: null,
        adventureProgress: {},
        adventureMapClaims: {},
        missionsProgress: {},
        dailyLoginClaims: {},
        shopPurchases: [],
        battleStats: { battlesWon: 0, arenaWins: 0, arenaLosses: 0 },
        eventsPlayed: {},
        eventCompletions: {},
      },
    });

    expect(patch.adventureProgress).toEqual({});
    expect(patch.adventureMapClaims).toEqual({});
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
        frontlineFortress: {
          buildings: { keep: 3, treasury: 2, barracks: 1 },
          integrity: 88,
          garrison: ["bran", "kara", "mira"],
          lastResolvedAt: null,
          nextAttackAt: "2026-05-14T20:00:00.000Z",
          raidsResolved: 2,
          lastReport: null,
        },
        adventureProgress: { c1l2: { cleared: true, firstClearTaken: true, claimed: false } },
        adventureMapClaims: { "c1-lower-cache": { claimed: true, lootTier: "rare", rewards: { gold: 300 } } },
        missionsProgress: {},
        dailyLoginClaims: {},
        shopPurchases: [],
        battleStats: { battlesWon: 5, arenaWins: 2, arenaLosses: 1 },
        eventsPlayed: { gold_rush: 3 },
        eventCompletions: { gold_rush: "2026-05-16" },
      },
    });

    expect(patch.heroes).toEqual([{ heroId: "bran", level: 4, stars: 2, shards: 12, xp: 80, skillLevel: 2, unlocked: true }]);
    expect(patch.frontlineCardUnlocks).toEqual({ order_guard_wall: true });
    expect(patch.frontlineCardLevels).toEqual({ order_guard_wall: 3 });
    expect(patch.frontlineLoadout?.squad).toEqual(["bran", "kara", "mira"]);
    expect(patch.frontlineFortress?.buildings).toEqual({ keep: 3, treasury: 2, barracks: 1 });
    expect(patch.adventureProgress).toEqual({ c1l2: { cleared: true, firstClearTaken: true, claimed: false } });
    expect(patch.adventureMapClaims).toEqual({ "c1-lower-cache": { claimed: true, lootTier: "rare", rewards: { gold: 300 } } });
    expect(patch.battlesWon).toBe(5);
    expect(patch.arenaWins).toBe(2);
    expect(patch.arenaLosses).toBe(1);
    expect(patch.eventsPlayed).toEqual({ gold_rush: 3 });
    expect(patch.eventCompletions).toEqual({ gold_rush: "2026-05-16" });
  });

  it("preserves server hero ownership so locked shard rows are not shown as owned", () => {
    const patch = createServerPlayerSnapshotPatch(currentState(), {
      profileId: "profile-1",
      snapshot: {
        account: { name: "Commander", level: 1, xp: 0 },
        resources: { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
        heroes: [{ heroId: "ursa", level: 1, stars: 1, shards: 4, xp: 0, skillLevel: 1, unlocked: false }],
        frontlineCardUnlocks: {},
        frontlineCardLevels: {},
        frontlineLoadout: null,
        frontlineFortress: null,
        adventureProgress: {},
        adventureMapClaims: {},
        missionsProgress: {},
        dailyLoginClaims: {},
        shopPurchases: [],
        battleStats: { battlesWon: 0, arenaWins: 0, arenaLosses: 0 },
        eventsPlayed: {},
        eventCompletions: {},
      },
    });

    expect(patch.heroes).toEqual([{ heroId: "ursa", level: 1, stars: 1, shards: 4, xp: 0, skillLevel: 1, unlocked: false }]);
  });

  it("applies server-owned missions, daily login and shop purchase state", () => {
    const patch = createServerPlayerSnapshotPatch(currentState(), {
      profileId: "profile-1",
      snapshot: {
        account: { name: "Commander", level: 1, xp: 0 },
        resources: { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
        heroes: [],
        frontlineCardUnlocks: {},
        frontlineCardLevels: {},
        frontlineLoadout: null,
        frontlineFortress: null,
        adventureProgress: {},
        adventureMapClaims: {},
        missionsProgress: {
          "d_arena_1:daily:2026-05-15": {
            missionId: "d_arena_1",
            cycleKey: "daily:2026-05-15",
            progress: 1,
            target: 1,
            claimed: true,
            updatedAt: "2026-05-15T12:00:00.000Z",
          },
          "d_arena_1:daily:2026-05-16": {
            missionId: "d_arena_1",
            cycleKey: "daily:2026-05-16",
            progress: 0,
            target: 1,
            claimed: false,
            updatedAt: "2026-05-16T08:00:00.000Z",
          },
          "unknown:daily:2026-05-16": {
            missionId: "unknown",
            cycleKey: "daily:2026-05-16",
            progress: 1,
            target: 1,
            claimed: false,
          },
        },
        dailyLoginClaims: {
          "2026-05-15": { dayKey: "2026-05-15", streak: 2 },
          "2026-05-16": { dayKey: "2026-05-16", streak: 3 },
        },
        shopPurchases: [
          { offerId: "starter_cache", purchaseDay: "2026-05-15", quantity: 1 },
          { offerId: "daily_command_drill", purchaseDay: "2026-05-16", quantity: 2 },
        ],
        battleStats: { battlesWon: 0, arenaWins: 0, arenaLosses: 0 },
        eventsPlayed: {},
        eventCompletions: {},
      },
    });

    expect(patch.missionsProgress).toMatchObject({
      d_arena_1: {
        progress: 0,
        claimed: false,
        resetAt: "2026-05-17T00:00:00.000Z",
      },
    });
    expect(patch.missionsProgress).not.toHaveProperty("unknown");
    expect(patch.dailyLogin).toEqual({ streak: 3, lastClaim: "2026-05-16" });
    expect(patch.shopPurchases).toMatchObject({ starter_cache: 1, daily_command_drill: 2 });
  });
});
