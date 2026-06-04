import { describe, expect, it } from "vitest";
import { createDefaultFrontlineCardUnlocks } from "@/features/frontline/cardProgression";
import {
  applyAuthoritativeRewardsToGameState,
  applyRewardsToGameState,
  type RewardApplicationState,
} from "@/lib/rewardApplication";

const baseState: RewardApplicationState = {
  account: {
    name: "Commander",
    level: 2,
    xp: 40,
    createdAt: "2026-05-08T00:00:00.000Z",
  },
  resources: {
    gold: 100,
    dust: 20,
    gems: 5,
    arenaTickets: 1,
    adventureKeys: 0,
  },
  heroes: [
    {
      heroId: "bran",
      level: 2,
      stars: 1,
      shards: 0,
      xp: 10,
      skillLevel: 1,
    },
  ],
  team: ["bran", "lyria"],
  frontlineCardUnlocks: createDefaultFrontlineCardUnlocks(),
  pendingUnlockLevel: null,
};

describe("reward application", () => {
  it("always applies resource rewards", () => {
    expect(applyRewardsToGameState(baseState, { gold: 30, adventureKeys: 1 })).toMatchObject({
      resources: {
        gold: 130,
        dust: 20,
        gems: 5,
        arenaTickets: 1,
        adventureKeys: 1,
      },
    });
  });

  it("applies hero shards before team XP so newly created team heroes can receive XP", () => {
    expect(
      applyRewardsToGameState(baseState, {
        shards: [{ heroId: "lyria", amount: 10 }],
        xp: 5,
      }).heroes,
    ).toEqual([
      { ...baseState.heroes[0], xp: 15 },
      {
        heroId: "lyria",
        level: 1,
        stars: 1,
        shards: 0,
        xp: 5,
        skillLevel: 1,
      },
    ]);
  });

  it("applies account XP and frontline card rewards in the same patch", () => {
    expect(
      applyRewardsToGameState(baseState, {
        accountXp: 180,
        frontlineCards: [{ cardId: "order_shadow_dive" }],
      }),
    ).toMatchObject({
      account: {
        ...baseState.account,
        level: 3,
        xp: 20,
      },
      pendingUnlockLevel: 3,
      frontlineCardUnlocks: {
        ...baseState.frontlineCardUnlocks,
        order_shadow_dive: true,
      },
    });
  });

  it("uses authoritative resources without projecting server-owned progression", () => {
    expect(
      applyAuthoritativeRewardsToGameState(
        baseState,
        {
          gold: 999,
          accountXp: 180,
          frontlineCards: [{ cardId: "order_shadow_dive" }],
        },
        { gold: 120, dust: 25, gems: 7, arenaTickets: 2, adventureKeys: 1 },
      ),
    ).toEqual({
      resources: { gold: 120, dust: 25, gems: 7, arenaTickets: 2, adventureKeys: 1 },
    });
  });
});
