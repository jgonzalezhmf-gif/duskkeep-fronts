import { describe, expect, it } from "vitest";
import { getHero } from "@/data/heroes";
import { computeUnit } from "@/features/battle/engine";
import { teamPower } from "@/lib/teamPower";

describe("teamPower", () => {
  it("matches the summed battle unit power for display squads", () => {
    const team = [
      { heroId: "bran", level: 3, stars: 1 },
      { heroId: "kara", level: 2, stars: 1 },
      { heroId: "mira", level: 2, stars: 2 },
    ];

    const expected = Math.round(
      team.reduce((sum, member, index) => {
        const hero = getHero(member.heroId);
        return sum + computeUnit(hero, member.level, member.stars, "ally", index).power;
      }, 0),
    );

    expect(teamPower(team)).toBe(expected);
  });
});
