import { describe, expect, it } from "vitest";
import { applyHeroLevelUp, applyHeroSkillUp, applyHeroStarUp } from "@/lib/heroUpgrades";
import type { PlayerHero, Resources } from "@/lib/types";

const resources: Resources = {
  gold: 200,
  dust: 300,
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

describe("hero upgrades", () => {
  it("levels up an unlocked hero and spends gold", () => {
    expect(applyHeroLevelUp([hero], resources, "bran")).toEqual({
      ok: true,
      heroes: [{ ...hero, level: 3 }],
      resources: { ...resources, gold: 100 },
    });
  });

  it("blocks level up when gold is insufficient", () => {
    expect(applyHeroLevelUp([hero], { ...resources, gold: 99 }, "bran")).toEqual({
      ok: false,
      reason: "not_enough_gold",
    });
  });

  it("stars up an eligible hero and spends shards", () => {
    expect(applyHeroStarUp([hero], "bran")).toEqual({
      ok: true,
      heroes: [{ ...hero, stars: 2, shards: 0 }],
    });
  });

  it("blocks star up when shards are insufficient", () => {
    expect(applyHeroStarUp([{ ...hero, shards: 9 }], "bran")).toEqual({
      ok: false,
      reason: "not_enough_shards",
    });
  });

  it("enhances a hero skill and spends dust", () => {
    expect(applyHeroSkillUp([hero], resources, "bran")).toEqual({
      ok: true,
      heroes: [{ ...hero, skillLevel: 2 }],
      resources: { ...resources, dust: 200 },
      nextSkillLevel: 2,
    });
  });

  it("blocks skill up at max skill level", () => {
    expect(applyHeroSkillUp([{ ...hero, skillLevel: 5 }], resources, "bran")).toEqual({
      ok: false,
      reason: "max_skill_level",
    });
  });

  it("blocks upgrades for locked heroes", () => {
    const lockedHero = { ...hero, stars: 0 };

    expect(applyHeroLevelUp([lockedHero], resources, "bran")).toEqual({ ok: false, reason: "hero_locked" });
    expect(applyHeroStarUp([lockedHero], "bran")).toEqual({ ok: false, reason: "hero_locked" });
    expect(applyHeroSkillUp([lockedHero], resources, "bran")).toEqual({ ok: false, reason: "hero_locked" });
  });
});
