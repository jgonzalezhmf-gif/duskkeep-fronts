import { describe, expect, it } from "vitest";
import { HEROES } from "@/data/heroes";
import { buildRosterOverview } from "@/app/roster/rosterPageHelpers";
import type { PlayerHero } from "@/lib/types";

describe("roster page helpers", () => {
  it("summarizes owned, locked and frontline-ready heroes", () => {
    const playerHeroes: PlayerHero[] = [
      { heroId: "bran", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
      { heroId: "kara", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
      { heroId: "mira", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
    ];

    const summary = buildRosterOverview({
      heroes: HEROES,
      playerByHero: new Map(playerHeroes.map((hero) => [hero.heroId, hero] as const)),
      isFrontlineReady: (heroId) => ["bran", "kara", "mira", "vex"].includes(heroId),
    });

    expect(summary.ownedCount).toBe(3);
    expect(summary.lockedCount).toBe(HEROES.length - 3);
    expect(summary.frontlineReadyCount).toBe(4);
    expect(summary.frontlineOwnedCount).toBe(3);
    expect(Object.fromEntries(summary.roles.map((entry) => [entry.role, entry.owned]))).toMatchObject({
      tank: 1,
      fighter: 1,
      support: 1,
      archer: 0,
      mage: 0,
      summoner: 0,
    });
  });

  it("keeps role summaries in stable game UI order", () => {
    const summary = buildRosterOverview({
      heroes: HEROES,
      playerByHero: new Map(),
      isFrontlineReady: () => false,
    });

    expect(summary.roles.map((entry) => entry.role)).toEqual(["tank", "fighter", "archer", "mage", "support", "summoner"]);
    expect(summary.roles.reduce((total, entry) => total + entry.total, 0)).toBe(HEROES.length);
  });
});
