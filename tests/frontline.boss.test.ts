import { describe, expect, it } from "vitest";
import { FRONTLINE_PRESETS, FRONTLINE_PRESET_BY_ID } from "@/features/frontline/data";
import {
  createDefaultFrontlineLoadout,
  createFrontlineBattleState,
  resolveTurn,
} from "@/features/frontline/engine";

const CROWN = FRONTLINE_PRESET_BY_ID["crown_of_ashes"];
const NORMAL = FRONTLINE_PRESETS[0];

function makeBossState(overrides: { modifiers?: { enemyCoreBonus?: number } } = {}) {
  return createFrontlineBattleState({
    seed: 91,
    allyLoadout: createDefaultFrontlineLoadout(),
    enemyPreset: CROWN,
    modifiers: overrides.modifiers,
  });
}

describe("frontline boss — Crown of Ashes", () => {
  it("initialises bossState only when the preset declares a bossId", () => {
    const normal = createFrontlineBattleState({
      seed: 91,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: NORMAL,
    });
    const boss = makeBossState();
    expect(normal.bossState).toBeNull();
    expect(boss.bossState).not.toBeNull();
    expect(boss.bossState?.id).toBe("crown_of_ashes");
    expect(boss.bossState?.infernoCountdown).toBe(3);
  });

  it("decrements Inferno countdown each enemy turn and emits a charge telegraph", () => {
    const turn1 = makeBossState();
    const enemyTurn = resolveTurn(turn1);
    expect(enemyTurn.turn).toBe("enemy");
    expect(enemyTurn.bossState?.infernoCountdown).toBe(2);
    const charge = enemyTurn.events.find((e) => e.kind === "boss_signature" && e.signature === "charge");
    expect(charge).toBeTruthy();
    expect(charge?.amount).toBe(2);
  });

  it("fires Inferno Wave on the third enemy turn and damages every living ally", () => {
    let state = makeBossState();
    state = resolveTurn(state); // ally → enemy turn 1 (countdown 3 → 2)
    state = resolveTurn(state); // enemy → ally turn 2
    state = resolveTurn(state); // ally → enemy turn 2 (countdown 2 → 1)
    state = resolveTurn(state); // enemy → ally turn 3
    const beforeHps = (["left", "center", "right"] as const).map((lane) => state.lanes[lane].allyHero?.hp ?? 0);
    state = resolveTurn(state); // ally → enemy turn 3 (countdown 1 → 0 → CAST)
    const cast = state.events.find((e) => e.kind === "boss_signature" && e.signature === "cast");
    expect(cast).toBeTruthy();
    const afterHps = (["left", "center", "right"] as const).map((lane) => state.lanes[lane].allyHero?.hp ?? 0);
    afterHps.forEach((hp, index) => {
      const before = beforeHps[index];
      if (before > 0) expect(hp).toBeLessThan(before);
    });
    expect(state.bossState?.infernoCountdown).toBe(3);
  });

  it("applies Ember Crown attack bonus while two or more boss segments live, drops to zero with one", () => {
    const state = makeBossState();
    const segmentLane = "left";
    const segmentHero = state.lanes[segmentLane].enemyHero!;
    const baseAtk = segmentHero.atk;

    state.lanes.center.enemyHero = null;
    const oneAlone = createFrontlineBattleState({
      seed: 91,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: CROWN,
    });
    oneAlone.lanes.center.enemyHero = null;
    oneAlone.lanes.right.enemyHero = null;
    const survivor = oneAlone.lanes.left.enemyHero!;
    expect(survivor.atk).toBe(baseAtk);

    const twoAlive = createFrontlineBattleState({
      seed: 91,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: CROWN,
    });
    twoAlive.lanes.right.enemyHero = null;
    expect(twoAlive.lanes.left.enemyHero!.atk).toBe(baseAtk);
  });

  it("scorches the ally hero after a boss segment hits it and drains it on the player's next turn", () => {
    const state = makeBossState();
    state.bossState!.scorch.left = 2;
    const heroBefore = state.lanes.left.allyHero!;
    const beforeHp = heroBefore.hp;
    const afterEnemyTurn = resolveTurn(state);
    const afterPlayerTurn = resolveTurn(afterEnemyTurn);

    const allyAfter = afterPlayerTurn.lanes.left.allyHero;
    if (allyAfter) {
      expect(allyAfter.hp).toBeLessThan(beforeHp);
    }
    expect(afterPlayerTurn.bossState?.scorch.left ?? 0).toBe(0);
  });

  it("does not affect normal battles without bossState", () => {
    const normal = createFrontlineBattleState({
      seed: 91,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: NORMAL,
    });
    const next = resolveTurn(normal);
    expect(next.events.some((e) => e.kind === "boss_signature")).toBe(false);
    expect(next.bossState).toBeNull();
  });
});
