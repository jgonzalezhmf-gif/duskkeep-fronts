import { describe, expect, it } from "vitest";
import { applyHeroAuthoritativeProgressionState } from "@/lib/heroAuthoritativeProgressionState";
import type { PlayerHero, Resources } from "@/lib/types";

const resources: Resources = {
  gold: 75,
  dust: 25,
  gems: 5,
  arenaTickets: 1,
  adventureKeys: 0,
};

const bran: PlayerHero = {
  heroId: "bran",
  level: 2,
  stars: 1,
  shards: 3,
  xp: 0,
  skillLevel: 1,
};

const kara: PlayerHero = {
  heroId: "kara",
  level: 4,
  stars: 2,
  shards: 7,
  xp: 12,
  skillLevel: 2,
};

describe("hero authoritative progression state", () => {
  it("applies authoritative level updates and resources", () => {
    expect(
      applyHeroAuthoritativeProgressionState(
        { resources, heroes: [bran, kara], heroesUpgraded: 4 },
        { resources: { ...resources, gold: 10 }, heroId: "bran", level: 3 },
      ),
    ).toEqual({
      resources: { ...resources, gold: 10 },
      heroes: [{ ...bran, level: 3 }, kara],
      heroesUpgraded: 5,
    });
  });

  it("applies authoritative star and shard updates together", () => {
    expect(
      applyHeroAuthoritativeProgressionState(
        { resources, heroes: [bran, kara], heroesUpgraded: 4 },
        { resources, heroId: "kara", stars: 3, shards: 1 },
      ).heroes,
    ).toEqual([bran, { ...kara, stars: 3, shards: 1 }]);
  });

  it("applies authoritative skill updates without changing unrelated hero fields", () => {
    expect(
      applyHeroAuthoritativeProgressionState(
        { resources, heroes: [bran], heroesUpgraded: 0 },
        { resources, heroId: "bran", skillLevel: 2 },
      ).heroes,
    ).toEqual([{ ...bran, skillLevel: 2 }]);
  });
});
