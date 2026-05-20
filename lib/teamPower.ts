import { getHero } from "@/data/heroes";
import { computeUnit } from "@/features/battle/engine";

export type TeamPowerMember = {
  heroId: string;
  level: number;
  stars: number;
};

export function teamPower(team: TeamPowerMember[]): number {
  let power = 0;
  for (let i = 0; i < team.length; i++) {
    const hero = getHero(team[i].heroId);
    const unit = computeUnit(hero, team[i].level, team[i].stars, "ally", i);
    power += unit.power;
  }
  return Math.round(power);
}
