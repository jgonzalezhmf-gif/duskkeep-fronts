import { LEVEL_UP_GOLD, MAX_SKILL_LEVEL, MAX_STARS, SHARDS_FOR_STAR, SKILL_UP_DUST } from "@/lib/constants";
import type { PlayerHero, Resources } from "@/lib/types";

type HeroUpgradeFailureReason =
  | "hero_not_found"
  | "hero_locked"
  | "not_enough_gold"
  | "max_stars"
  | "not_enough_shards"
  | "max_skill_level"
  | "not_enough_dust";

type HeroUpgradeFailure = {
  ok: false;
  reason: HeroUpgradeFailureReason;
};

type HeroUpgradeSuccess = {
  ok: true;
  heroes: PlayerHero[];
  resources?: Resources;
  nextSkillLevel?: number;
};

export type HeroUpgradeResult = HeroUpgradeFailure | HeroUpgradeSuccess;

function findHeroIndex(heroes: PlayerHero[], heroId: string) {
  return heroes.findIndex((hero) => hero.heroId === heroId);
}

export function applyHeroLevelUp(heroes: PlayerHero[], resources: Resources, heroId: string): HeroUpgradeResult {
  const heroIndex = findHeroIndex(heroes, heroId);
  if (heroIndex < 0) return { ok: false, reason: "hero_not_found" };

  const hero = heroes[heroIndex];
  if (hero.stars === 0) return { ok: false, reason: "hero_locked" };

  const cost = LEVEL_UP_GOLD(hero.level);
  if (resources.gold < cost) return { ok: false, reason: "not_enough_gold" };

  const nextHeroes = heroes.slice();
  nextHeroes[heroIndex] = {
    ...nextHeroes[heroIndex],
    level: nextHeroes[heroIndex].level + 1,
  };

  return {
    ok: true,
    heroes: nextHeroes,
    resources: {
      ...resources,
      gold: resources.gold - cost,
    },
  };
}

export function applyHeroStarUp(heroes: PlayerHero[], heroId: string): HeroUpgradeResult {
  const heroIndex = findHeroIndex(heroes, heroId);
  if (heroIndex < 0) return { ok: false, reason: "hero_not_found" };

  const hero = heroes[heroIndex];
  if (hero.stars === 0) return { ok: false, reason: "hero_locked" };
  if (hero.stars >= MAX_STARS) return { ok: false, reason: "max_stars" };

  const neededShards = SHARDS_FOR_STAR[hero.stars] ?? 0;
  if (hero.shards < neededShards) return { ok: false, reason: "not_enough_shards" };

  const nextHeroes = heroes.slice();
  nextHeroes[heroIndex] = {
    ...nextHeroes[heroIndex],
    stars: nextHeroes[heroIndex].stars + 1,
    shards: nextHeroes[heroIndex].shards - neededShards,
  };

  return {
    ok: true,
    heroes: nextHeroes,
  };
}

export function applyHeroSkillUp(heroes: PlayerHero[], resources: Resources, heroId: string): HeroUpgradeResult {
  const heroIndex = findHeroIndex(heroes, heroId);
  if (heroIndex < 0) return { ok: false, reason: "hero_not_found" };

  const hero = heroes[heroIndex];
  if (hero.stars === 0) return { ok: false, reason: "hero_locked" };

  const currentSkillLevel = hero.skillLevel ?? 1;
  if (currentSkillLevel >= MAX_SKILL_LEVEL) return { ok: false, reason: "max_skill_level" };

  const cost = SKILL_UP_DUST[currentSkillLevel] ?? 0;
  if (resources.dust < cost) return { ok: false, reason: "not_enough_dust" };

  const nextHeroes = heroes.slice();
  nextHeroes[heroIndex] = {
    ...nextHeroes[heroIndex],
    skillLevel: (nextHeroes[heroIndex].skillLevel ?? 1) + 1,
  };

  return {
    ok: true,
    heroes: nextHeroes,
    resources: {
      ...resources,
      dust: resources.dust - cost,
    },
    nextSkillLevel: currentSkillLevel + 1,
  };
}
