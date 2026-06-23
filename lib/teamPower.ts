import { getHero } from "@/data/heroes";
import { LEVEL_STAT_MULT, STAR_STAT_MULT } from "@/lib/constants";

const STAT_SCALE = 0.1;

export type TeamPowerMember = {
  heroId: string;
  level: number;
  stars: number;
};

function computeUnitPower(heroId: string, level: number, stars: number): number {
  const hero = getHero(heroId);
  const m = LEVEL_STAT_MULT(level) * STAR_STAT_MULT(stars) * STAT_SCALE;
  return Math.max(
    1,
    Math.round(
      hero.baseStats.hp * m * 0.2 +
        hero.baseStats.atk * m * 1.5 +
        hero.baseStats.def * m * 1.0 +
        hero.baseStats.spd * 0.5,
    ),
  );
}

export function teamPower(team: TeamPowerMember[]): number {
  let power = 0;
  for (const member of team) {
    power += computeUnitPower(member.heroId, member.level, member.stars);
  }
  return Math.round(power);
}
