import type { PlayerHero } from "@/lib/types";

export function applyTeamXpReward(heroes: PlayerHero[], team: (string | null)[], xp: number | undefined): PlayerHero[] | null {
  if (!xp) return null;

  const nextHeroes = heroes.slice();
  const teamHeroIds = team.filter(Boolean) as string[];

  for (const heroId of teamHeroIds) {
    const heroIndex = nextHeroes.findIndex((hero) => hero.heroId === heroId);
    if (heroIndex >= 0) {
      nextHeroes[heroIndex] = {
        ...nextHeroes[heroIndex],
        xp: nextHeroes[heroIndex].xp + xp,
      };
    }
  }

  return nextHeroes;
}
