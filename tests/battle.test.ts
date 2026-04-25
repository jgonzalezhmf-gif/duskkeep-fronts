import { describe, it, expect } from "vitest";
import { simulateBattle, computeUnit, computeTeamPower } from "@/features/battle/engine";
import { getHero } from "@/data/heroes";
import type { BattleInput } from "@/features/battle/types";

function run(input: BattleInput) {
  return simulateBattle(input);
}

describe("battle engine", () => {
  it("is deterministic for the same input", () => {
    const input: BattleInput = {
      allies: [
        { heroId: "bran", level: 5, stars: 2 },
        { heroId: "kara", level: 5, stars: 2 },
        { heroId: "mira", level: 5, stars: 2 },
        { heroId: "vex", level: 5, stars: 2 },
      ],
      enemies: [
        { heroId: "ren", level: 5, stars: 1 },
        { heroId: "kara", level: 5, stars: 1 },
        { heroId: "tovi", level: 5, stars: 1 },
        { heroId: "ursa", level: 5, stars: 1 },
      ],
      seed: 12345,
    };
    const a = run(input);
    const b = run(input);
    expect(a.winner).toEqual(b.winner);
    expect(a.turns).toEqual(b.turns);
    expect(a.events.length).toEqual(b.events.length);
  });

  it("terminates within MAX_TURNS", () => {
    const input: BattleInput = {
      allies: [{ heroId: "tovi", level: 1, stars: 1 }],
      enemies: [{ heroId: "tovi", level: 1, stars: 1 }],
      seed: 1,
    };
    const res = run(input);
    expect(res.turns).toBeLessThanOrEqual(40);
    expect(["ally", "enemy", "draw"]).toContain(res.winner);
  });

  it("a much stronger team usually wins", () => {
    const input: BattleInput = {
      allies: [
        { heroId: "noct", level: 12, stars: 4 },
        { heroId: "sol", level: 12, stars: 4 },
        { heroId: "drak", level: 12, stars: 4 },
        { heroId: "grom", level: 12, stars: 4 },
      ],
      enemies: [
        { heroId: "ren", level: 1, stars: 1 },
        { heroId: "tovi", level: 1, stars: 1 },
      ],
      seed: 99,
    };
    const res = run(input);
    expect(res.winner).toBe("ally");
  });

  it("emits battle_start and battle_end", () => {
    const input: BattleInput = {
      allies: [{ heroId: "bran", level: 1, stars: 1 }],
      enemies: [{ heroId: "kara", level: 1, stars: 1 }],
      seed: 3,
    };
    const res = run(input);
    expect(res.events[0].type).toBe("battle_start");
    expect(res.events[res.events.length - 1].type).toBe("battle_end");
  });

  it("computeUnit scales with level and stars", () => {
    const h = getHero("bran");
    const u1 = computeUnit(h, 1, 1, "ally", 0);
    const u2 = computeUnit(h, 10, 3, "ally", 0);
    expect(u2.maxHp).toBeGreaterThan(u1.maxHp);
    expect(u2.atk).toBeGreaterThan(u1.atk);
  });

  it("computeTeamPower aggregates heroes", () => {
    const p = computeTeamPower([
      { heroId: "bran", level: 1, stars: 1 },
      { heroId: "kara", level: 1, stars: 1 },
    ]);
    expect(p).toBeGreaterThan(0);
  });
});
