import { describe, expect, it } from "vitest";
import { applyTeamXpReward } from "@/lib/heroXp";
import type { PlayerHero } from "@/lib/types";

const heroes: PlayerHero[] = [
  {
    heroId: "bran",
    level: 2,
    stars: 1,
    shards: 0,
    xp: 15,
    skillLevel: 1,
  },
  {
    heroId: "kara",
    level: 2,
    stars: 1,
    shards: 0,
    xp: 4,
    skillLevel: 1,
  },
  {
    heroId: "mira",
    level: 1,
    stars: 1,
    shards: 0,
    xp: 0,
    skillLevel: 1,
  },
];

describe("team XP rewards", () => {
  it("returns null when no XP reward is present", () => {
    expect(applyTeamXpReward(heroes, ["bran", null, "kara"], undefined)).toBeNull();
    expect(applyTeamXpReward(heroes, ["bran", null, "kara"], 0)).toBeNull();
  });

  it("adds XP only to heroes in occupied team slots", () => {
    expect(applyTeamXpReward(heroes, ["bran", null, "kara"], 10)).toEqual([
      { ...heroes[0], xp: 25 },
      { ...heroes[1], xp: 14 },
      heroes[2],
    ]);
  });

  it("ignores team slots that do not match a known hero", () => {
    expect(applyTeamXpReward(heroes, ["bran", "missing"], 10)).toEqual([{ ...heroes[0], xp: 25 }, heroes[1], heroes[2]]);
  });

  it("preserves slot-based XP application when a hero id appears more than once", () => {
    expect(applyTeamXpReward(heroes, ["bran", "bran"], 10)).toEqual([{ ...heroes[0], xp: 35 }, heroes[1], heroes[2]]);
  });
});
