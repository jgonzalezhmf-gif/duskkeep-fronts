import { describe, expect, it } from "vitest";
import { createDefaultFrontlineCardUnlocks } from "@/features/frontline/cardProgression";
import { createDefaultFrontlineFortress } from "@/features/frontline/fortress";
import { defaultFortress } from "@/lib/defaultGameState";
import {
  createFortressBuildingUpgradeCommand,
  createFrontlineCardUpgradeCommand,
  createFrontlineFortressUpgradeCommand,
  createHeroLevelUpCommand,
  createHeroSkillUpCommand,
  createHeroStarUpCommand,
} from "@/lib/progressionCommands";
import type { PlayerHero, Resources } from "@/lib/types";

const resources: Resources = {
  gold: 500,
  dust: 500,
  gems: 0,
  arenaTickets: 0,
  adventureKeys: 0,
};

const hero: PlayerHero = {
  heroId: "bran",
  level: 2,
  stars: 1,
  shards: 10,
  xp: 0,
  skillLevel: 1,
};

describe("progression commands", () => {
  it("wraps hero level-up as a patch plus mission progress effect", () => {
    expect(createHeroLevelUpCommand([hero], resources, "bran")).toEqual({
      ok: true,
      kind: "hero.levelUp",
      patch: {
        heroes: [{ ...hero, level: 3 }],
        resources: { ...resources, gold: 400 },
      },
      effects: [{ missionProgress: { metric: "heroes_upgraded", amount: 1 } }],
    });
  });

  it("keeps star and skill upgrades open as separate commands", () => {
    expect(createHeroStarUpCommand([hero], "bran")).toMatchObject({
      ok: true,
      kind: "hero.starUp",
      patch: { heroes: [{ ...hero, stars: 2, shards: 0 }] },
      effects: [{ missionProgress: { metric: "heroes_upgraded", amount: 1 } }],
    });

    expect(createHeroSkillUpCommand([hero], resources, "bran")).toMatchObject({
      ok: true,
      kind: "hero.skillUp",
      patch: {
        heroes: [{ ...hero, skillLevel: 2 }],
        resources: { ...resources, dust: 400 },
      },
      effects: [
        { missionProgress: { metric: "heroes_upgraded", amount: 1 } },
        { notification: { kind: "success", message: "Skill enhanced to level 2!" } },
      ],
    });
  });

  it("reports existing failure feedback without mutating state", () => {
    expect(createHeroLevelUpCommand([hero], { ...resources, gold: 99 }, "bran")).toEqual({
      ok: false,
      kind: "hero.levelUp",
      effects: [{ notification: { kind: "error", message: "Not enough gold" } }],
    });
  });

  it("wraps Frontline card upgrades without changing card balance", () => {
    const unlocks = { ...createDefaultFrontlineCardUnlocks(), order_shadow_dive: true };

    expect(
      createFrontlineCardUpgradeCommand({
        unlocks,
        levels: { order_shadow_dive: 2 },
        resources,
        cardId: "order_shadow_dive",
      }),
    ).toEqual({
      ok: true,
      kind: "frontlineCard.upgrade",
      patch: {
        resources: { ...resources, gold: 320, dust: 472 },
        frontlineCardLevels: { order_shadow_dive: 3 },
      },
      effects: [{ notification: { kind: "success", message: "Frontline card upgraded" } }],
    });
  });

  it("wraps Fortress upgrades as progression commands", () => {
    expect(createFortressBuildingUpgradeCommand(defaultFortress(), resources, "treasury")).toEqual({
      ok: true,
      kind: "fortress.upgradeBuilding",
      patch: {
        resources: { ...resources, gold: 112 },
        fortress: {
          ...defaultFortress(),
          level: 2,
          buildings: { ...defaultFortress().buildings, treasury: 2 },
        },
      },
      effects: [{ notification: { kind: "success", message: "Royal Treasury upgraded" } }],
    });
  });

  it("blocks unaffordable Frontline Fortress upgrades through the same command shape", () => {
    expect(createFrontlineFortressUpgradeCommand(createDefaultFrontlineFortress(), { ...resources, gold: 100 }, "keep")).toEqual({
      ok: false,
      kind: "frontlineFortress.upgradeBuilding",
      effects: [{ notification: { kind: "error", message: "Not enough resources" } }],
    });

    expect(createDefaultFrontlineFortress().buildings.keep).toBe(1);
  });
});
