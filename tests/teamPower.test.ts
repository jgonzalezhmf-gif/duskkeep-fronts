import { describe, expect, it } from "vitest";
import { getHero } from "@/data/heroes";
import { LEVEL_STAT_MULT, STAR_STAT_MULT } from "@/lib/constants";
import { teamPower } from "@/lib/teamPower";

const STAT_SCALE = 0.1;

function expectedPower(heroId: string, level: number, stars: number): number {
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

describe("teamPower", () => {
  it("sums unit power for a display squad", () => {
    const team = [
      { heroId: "bran", level: 3, stars: 1 },
      { heroId: "kara", level: 2, stars: 1 },
      { heroId: "mira", level: 2, stars: 2 },
    ];

    const expected = Math.round(
      team.reduce((sum, member) => sum + expectedPower(member.heroId, member.level, member.stars), 0),
    );

    expect(teamPower(team)).toBe(expected);
  });
});
