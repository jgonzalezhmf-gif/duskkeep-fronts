import type { Hero, PlayerHero, Role } from "@/lib/types";

export const FRONTLINE_COMBAT_SLOT_COUNT = 3;
export const DEFAULT_ROSTER_OWNED_FILTER = "owned";

export type RosterRoleSummary = {
  role: Role;
  total: number;
  owned: number;
};

export type RosterCombatSquadSlot = {
  slot: number;
  hero: Hero | null;
  playerHero: PlayerHero | null;
  owned: boolean;
};

export const ROSTER_ROLE_ORDER: Role[] = ["tank", "fighter", "archer", "mage", "support", "summoner"];

export function isRosterHeroOwned(playerHero: PlayerHero | undefined | null) {
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
  const ownedCount = heroes.filter((hero) => isRosterHeroOwned(playerByHero.get(hero.id))).length;
  const frontlineHeroes = heroes.filter((hero) => isFrontlineReady(hero.id));
  const frontlineOwnedCount = frontlineHeroes.filter((hero) => isRosterHeroOwned(playerByHero.get(hero.id))).length;

  const roles = ROSTER_ROLE_ORDER.map((role) => {
    const roleHeroes = heroes.filter((hero) => hero.role === role);
    return {
      role,
      total: roleHeroes.length,
      owned: roleHeroes.filter((hero) => isRosterHeroOwned(playerByHero.get(hero.id))).length,
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

export function buildRosterCombatSquadSlots({
  heroes,
  playerByHero,
  squad,
}: {
  heroes: Hero[];
  playerByHero: Map<string, PlayerHero>;
  squad: readonly (string | null)[];
}): RosterCombatSquadSlot[] {
  const heroById = new Map(heroes.map((hero) => [hero.id, hero] as const));

  return Array.from({ length: FRONTLINE_COMBAT_SLOT_COUNT }).map((_, slot) => {
    const heroId = squad[slot] ?? null;
    const hero = heroId ? heroById.get(heroId) ?? null : null;
    const playerHero = heroId ? playerByHero.get(heroId) ?? null : null;
    const owned = isRosterHeroOwned(playerHero);

    return {
      slot,
      hero: hero && owned ? hero : null,
      playerHero: owned ? playerHero : null,
      owned,
    };
  });
}
