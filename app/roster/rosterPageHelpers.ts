import type { Hero, PlayerHero, Role } from "@/lib/types";

export type RosterRoleSummary = {
  role: Role;
  total: number;
  owned: number;
};

export const ROSTER_ROLE_ORDER: Role[] = ["tank", "fighter", "archer", "mage", "support", "summoner"];

function isOwned(playerHero: PlayerHero | undefined) {
  return Boolean(playerHero && playerHero.stars > 0);
}

export function buildRosterOverview({
  heroes,
  playerByHero,
  isFrontlineReady,
}: {
  heroes: Hero[];
  playerByHero: Map<string, PlayerHero>;
  isFrontlineReady: (heroId: string) => boolean;
}) {
  const ownedCount = heroes.filter((hero) => isOwned(playerByHero.get(hero.id))).length;
  const frontlineHeroes = heroes.filter((hero) => isFrontlineReady(hero.id));
  const frontlineOwnedCount = frontlineHeroes.filter((hero) => isOwned(playerByHero.get(hero.id))).length;

  const roles = ROSTER_ROLE_ORDER.map((role) => {
    const roleHeroes = heroes.filter((hero) => hero.role === role);
    return {
      role,
      total: roleHeroes.length,
      owned: roleHeroes.filter((hero) => isOwned(playerByHero.get(hero.id))).length,
    };
  });

  return {
    total: heroes.length,
    ownedCount,
    lockedCount: Math.max(0, heroes.length - ownedCount),
    frontlineReadyCount: frontlineHeroes.length,
    frontlineOwnedCount,
    roles,
  };
}
