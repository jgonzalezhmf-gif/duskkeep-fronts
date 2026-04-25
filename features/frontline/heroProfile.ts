import { HEROES_BY_ID } from "@/data/heroes";
import type { Hero, PlayerHero } from "@/lib/types";
import { FRONTLINE_UNIT_BY_ID } from "./data";
import type { FrontlineHeroDef } from "./types";

export type FrontlineHeroProfileMap = Partial<Record<string, FrontlineHeroDef>>;

function fallbackFrontlineProfile(hero: Hero): FrontlineHeroDef {
  return {
    heroId: hero.id,
    name: hero.name,
    role: `${hero.role} reserve`,
    family: "hero",
    tier: 1,
    rarity: hero.rarity,
    maxHp: Math.max(10, Math.round(hero.baseStats.hp / 80)),
    atk: Math.max(3, Math.round(hero.baseStats.atk / 28)),
    def: Math.max(0, Math.round(hero.baseStats.def / 38)),
    speed: Math.max(1, Math.round(hero.baseStats.spd / 25)),
    trait: { type: "none" },
  };
}

export function applyFrontlineHeroProgression(
  profile: FrontlineHeroDef,
  playerHero?: PlayerHero | null,
): FrontlineHeroDef {
  if (!playerHero || playerHero.stars <= 0 || profile.family !== "hero") return profile;

  const levelBonus = Math.max(0, playerHero.level - 1);
  const starBonus = Math.max(0, playerHero.stars - 1);
  if (levelBonus === 0 && starBonus === 0) return profile;

  return {
    ...profile,
    maxHp: profile.maxHp + levelBonus + starBonus * 3,
    atk: profile.atk + Math.floor((levelBonus + 1) / 3) + starBonus,
    def: profile.def + Math.floor(levelBonus / 4) + Math.floor((starBonus + 1) / 2),
    speed: profile.speed + Math.floor(starBonus / 3),
  };
}

export function getFrontlineHeroProfile(hero: Hero, playerHero?: PlayerHero | null): FrontlineHeroDef {
  const frontlineProfile = FRONTLINE_UNIT_BY_ID[hero.id];
  return applyFrontlineHeroProgression(frontlineProfile ?? fallbackFrontlineProfile(hero), playerHero);
}

export function getFrontlineHeroProfileById(heroId: string, playerHero?: PlayerHero | null) {
  const frontlineProfile = FRONTLINE_UNIT_BY_ID[heroId];
  if (frontlineProfile) return applyFrontlineHeroProgression(frontlineProfile, playerHero);

  const hero = HEROES_BY_ID[heroId] as Hero | undefined;
  return hero ? getFrontlineHeroProfile(hero, playerHero) : null;
}

export function createFrontlineHeroProfileMap(playerHeroes: PlayerHero[]): FrontlineHeroProfileMap {
  return Object.fromEntries(
    playerHeroes
      .map((playerHero) => {
        const profile = getFrontlineHeroProfileById(playerHero.heroId, playerHero);
        return profile ? ([playerHero.heroId, profile] as const) : null;
      })
      .filter((entry): entry is readonly [string, FrontlineHeroDef] => Boolean(entry)),
  );
}

export function isFrontlineReadyHero(heroId: string) {
  return Boolean(FRONTLINE_UNIT_BY_ID[heroId]);
}
