import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import { FRONTLINE_LANES, FRONTLINE_LEADER_BY_ID, FRONTLINE_UNIT_BY_ID } from "./data";
import type {
  FrontlineBattleState,
  FrontlineHeroDef,
  FrontlineHeroState,
  FrontlineHeroTrait,
  FrontlineLeaderDef,
} from "./types";
import type { FrontlineHeroProfileMap } from "./heroProfile";
import { getHeroInLane } from "./frontlineBattleAccessors";

export function heroDefinition(hero: FrontlineHeroState) {
  const definition = FRONTLINE_UNIT_BY_ID[hero.heroId];
  if (!definition) {
    throw new Error(`Unknown frontline combatant in lane ${hero.lane}: ${hero.heroId}`);
  }
  return definition as FrontlineHeroDef;
}

export function leaderDefinition(leaderId: string) {
  const leader = FRONTLINE_LEADER_BY_ID[leaderId];
  if (!leader) throw new Error(`Unknown frontline leader ${leaderId}`);
  return leader as FrontlineLeaderDef;
}

export function breachBonus(hero: FrontlineHeroState | null) {
  if (!hero) return 0;
  const trait = heroDefinition(hero).trait;
  return trait.type === "breach" ? trait.extra : 0;
}

export function initiativeForHero(hero: FrontlineHeroState) {
  return (hero.strikeFirst ? 100 : 0) + hero.speed;
}

export function livingAllyWithTrait(
  state: FrontlineBattleState,
  side: FrontlineSide,
  traitType: Exclude<FrontlineHeroTrait["type"], "none">,
): boolean {
  return FRONTLINE_LANES.some((lane: FrontlineLane) => {
    const hero = getHeroInLane(state, side, lane);
    if (!hero?.alive) return false;
    return heroDefinition(hero).trait.type === traitType;
  });
}

export function ralliedAllyCount(state: FrontlineBattleState, side: FrontlineSide): number {
  return FRONTLINE_LANES.reduce((count, lane) => {
    const hero = getHeroInLane(state, side, lane);
    return count + (hero?.alive && hero.tempAtk > 0 ? 1 : 0);
  }, 0);
}

export function frontPresenceScore(heroId: string, heroProfiles?: FrontlineHeroProfileMap) {
  const hero = heroProfiles?.[heroId] ?? FRONTLINE_UNIT_BY_ID[heroId];
  if (!hero) return 0;
  return hero.maxHp + hero.atk * 2 + hero.def * 2 + hero.speed;
}
