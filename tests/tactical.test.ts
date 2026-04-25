import { describe, it, expect } from "vitest";
import {
  GRID_H,
  GRID_W,
  getAttackTargets,
  getReachable,
  initTactical,
  performAttack,
  performMove,
  performAbility,
  endSideTurn,
  startNewRound,
  manhattan,
  unit,
  unitAt,
} from "@/features/tactical/engine";
import { runEnemySide } from "@/features/tactical/ai";

function baseInit() {
  return initTactical({
    allies: [
      { heroId: "bran", level: 5, stars: 2 },
      { heroId: "kara", level: 5, stars: 2 },
      { heroId: "mira", level: 5, stars: 2 },
    ],
    enemies: [
      { heroId: "ren", level: 5, stars: 1 },
      { heroId: "kara", level: 5, stars: 1 },
      { heroId: "ursa", level: 5, stars: 1 },
    ],
    seed: 42,
  });
}

describe("tactical engine", () => {
  it("initializes grid and places units on opposite rows", () => {
    const s = baseInit();
    expect(s.grid.w).toBe(GRID_W);
    expect(s.grid.h).toBe(GRID_H);
    const allies = s.units.filter((u) => u.side === "ally");
    const enemies = s.units.filter((u) => u.side === "enemy");
    expect(allies.length).toBe(3);
    expect(enemies.length).toBe(3);
    expect(allies.every((u) => u.pos.y >= GRID_H - 2)).toBe(true);
    expect(enemies.every((u) => u.pos.y <= 1)).toBe(true);
  });

  it("computes reachable tiles within move range (Manhattan)", () => {
    const s = baseInit();
    const ally = s.units.find((u) => u.side === "ally")!;
    const reach = getReachable(s, ally.uid);
    expect(reach.length).toBeGreaterThan(0);
    for (const p of reach) {
      expect(manhattan(p, ally.pos)).toBeLessThanOrEqual(ally.move);
    }
  });

  it("blocks movement through other units", () => {
    const s = baseInit();
    const ally = s.units.find((u) => u.side === "ally")!;
    const reach = getReachable(s, ally.uid);
    for (const p of reach) {
      const u = unitAt(s, p);
      expect(u === undefined || u.uid === ally.uid).toBe(true);
    }
  });

  it("performMove moves and sets hasMoved", () => {
    const s = baseInit();
    const ally = s.units.find((u) => u.side === "ally")!;
    const reach = getReachable(s, ally.uid);
    const target = reach[0];
    const s2 = performMove(s, ally.uid, target);
    const moved = unit(s2, ally.uid)!;
    expect(moved.pos).toEqual(target);
    expect(moved.hasMoved).toBe(true);
  });

  it("rejects attack out of range", () => {
    const s = baseInit();
    const ally = s.units.find((u) => u.side === "ally")!;
    const enemy = s.units.find((u) => u.side === "enemy")!;
    // At init, ally in bottom rows, enemy in top rows — out of range for range 1.
    const targets = getAttackTargets(s, ally.uid);
    if (ally.range < manhattan(ally.pos, enemy.pos)) {
      expect(targets.length).toBe(0);
    }
  });

  it("AI runs and produces a new state", () => {
    let s = baseInit();
    // Force side switch to enemy by ending ally turn.
    s = endSideTurn(s);
    expect(s.side).toBe("enemy");
    const after = runEnemySide(s);
    // After enemy side, either we have a winner or we're back to ally side.
    expect(after.winner || after.side === "ally").toBeTruthy();
  });

  it("full game terminates with a winner", () => {
    let s = baseInit();
    let safety = 200;
    while (!s.winner && safety-- > 0) {
      // ally skips: end ally side
      s = endSideTurn(s);
      if (s.winner) break;
      s = runEnemySide(s);
    }
    expect(s.winner).toBeTruthy();
  });

  it("shield_self increases shield buff", () => {
    const s = baseInit();
    const bran = s.units.find((u) => u.heroId === "bran")!;
    const s2 = performAbility(s, bran.uid, bran.pos);
    const after = unit(s2, bran.uid)!;
    expect(after.buffs.shield).toBeGreaterThan(0);
    expect(after.cooldown).toBe(bran.ability.cooldown);
  });

  it("shields decay sharply at the start of a new round to reduce stalling", () => {
    const s = baseInit();
    const bran = s.units.find((u) => u.heroId === "bran")!;
    const shielded = performAbility(s, bran.uid, bran.pos);
    const before = unit(shielded, bran.uid)!;
    const afterRound = startNewRound(shielded);
    const after = unit(afterRound, bran.uid)!;

    expect(before.buffs.shield).toBeGreaterThan(0);
    expect(after.buffs.shield).toBeLessThan(before.buffs.shield);
  });
});
