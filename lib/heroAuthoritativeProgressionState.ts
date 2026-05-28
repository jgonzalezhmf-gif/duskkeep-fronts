import type { PlayerHero, Resources } from "@/lib/types";

export type HeroAuthoritativeProgressionState = {
  resources: Resources;
  heroes: PlayerHero[];
  heroesUpgraded: number;
};

export type HeroAuthoritativeProgressionPatch = {
  resources: Resources;
  heroId: string;
  level?: number;
  stars?: number;
  shards?: number;
  skillLevel?: number;
};

export function applyHeroAuthoritativeProgressionState(
  state: HeroAuthoritativeProgressionState,
  patch: HeroAuthoritativeProgressionPatch,
): HeroAuthoritativeProgressionState {
  return {
    resources: patch.resources,
    heroes: state.heroes.map((hero) =>
      hero.heroId === patch.heroId
        ? {
            ...hero,
            ...(patch.level !== undefined ? { level: patch.level } : {}),
            ...(patch.stars !== undefined ? { stars: patch.stars } : {}),
            ...(patch.shards !== undefined ? { shards: patch.shards } : {}),
            ...(patch.skillLevel !== undefined ? { skillLevel: patch.skillLevel } : {}),
          }
        : hero,
    ),
    heroesUpgraded: state.heroesUpgraded + 1,
  };
}
