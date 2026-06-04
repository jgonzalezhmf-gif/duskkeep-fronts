import { describe, expect, it } from "vitest";
import { HEROES } from "@/data/heroes";
import {
  buildRosterCombatSquadSlots,
  buildRosterOverview,
  DEFAULT_ROSTER_OWNED_FILTER,
  FRONTLINE_COMBAT_SLOT_COUNT,
} from "@/app/roster/rosterPageHelpers";
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

  it("defaults the roster grid to usable owned heroes", () => {
    expect(DEFAULT_ROSTER_OWNED_FILTER).toBe("owned");
  });

  it("builds exactly three combat squad slots from the active Frontline loadout", () => {
    const playerHeroes: PlayerHero[] = [
      { heroId: "bran", level: 2, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
      { heroId: "kara", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
      { heroId: "mira", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
      { heroId: "vex", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
    ];

    const slots = buildRosterCombatSquadSlots({
      heroes: HEROES,
      playerByHero: new Map(playerHeroes.map((hero) => [hero.heroId, hero] as const)),
      squad: ["bran", "kara", "mira", "vex"],
    });

    expect(slots).toHaveLength(FRONTLINE_COMBAT_SLOT_COUNT);
    expect(slots.map((slot) => slot.hero?.id)).toEqual(["bran", "kara", "mira"]);
    expect(slots.every((slot) => slot.owned)).toBe(true);
  });

  it("does not expose locked or stale heroes as active combat squad members", () => {
    const slots = buildRosterCombatSquadSlots({
      heroes: HEROES,
      playerByHero: new Map([
        ["bran", { heroId: "bran", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 }],
        ["vex", { heroId: "vex", level: 1, stars: 0, shards: 4, xp: 0, skillLevel: 1 }],
      ]),
      squad: ["bran", "vex", "unknown"],
    });

    expect(slots).toHaveLength(FRONTLINE_COMBAT_SLOT_COUNT);
    expect(slots[0]).toMatchObject({ owned: true, hero: expect.objectContaining({ id: "bran" }) });
    expect(slots[1]).toMatchObject({ owned: false, hero: null });
    expect(slots[2]).toMatchObject({ owned: false, hero: null });
  });
});
