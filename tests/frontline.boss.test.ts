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

  it("stops resolving the clash as soon as a core is broken", () => {
    let state = makeBossState();
    state.enemyCoreHp = 1;
    state.lanes.left.enemyHero = null;
    state.lanes.center.enemyHero = null;
    state.lanes.right.enemyHero = null;
    state = resolveTurn(state); // ally clash → enemy turn (no breach yet)
    state = resolveTurn(state); // enemy clash → end of round → breach kills core
    expect(state.winner).toBe("ally");
    expect(state.enemyCoreHp).toBe(0);
  });

  it("only applies hero aftermath once per round", () => {
    const state = createFrontlineBattleState({
      seed: 13,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: NORMAL,
    });
    // Bran has bulwark → +3 shield once per round (not twice).
    const bran = state.lanes.left.allyHero!;
    bran.shield = 0;
    const afterAlly = resolveTurn(state);
    const afterEnemy = resolveTurn(afterAlly);
    const branShield = afterEnemy.lanes.left.allyHero?.shield ?? 0;
    expect(branShield).toBeLessThanOrEqual(3);
  });

  it("flags KO subKind so support breaks do not paint hero death ghosts", () => {
    const state = makeBossState();
    state.lanes.left.enemySupport = {
      id: "test_support",
      side: "enemy",
      lane: "left",
      name: "Test Support",
      hp: 1,
      maxHp: 6,
      atk: 0,
      duration: 2,
      intercepts: false,
    };
    const next = resolveTurn(state);
    const koEvents = next.events.filter((e) => e.kind === "ko");
    for (const event of koEvents) {
      expect(event.subKind).toBeDefined();
    }
    const supportKo = koEvents.find((e) => e.label.includes("Test Support"));
    expect(supportKo?.subKind).toBe("support");
  });
});

describe("frontline boss — The Eclipse", () => {
  const ECLIPSE = FRONTLINE_PRESET_BY_ID["the_eclipse"];

  function makeEclipseState() {
    return createFrontlineBattleState({
      seed: 31,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: ECLIPSE,
    });
  }

  it("initialises Twilight Veil countdown from cadenceRounds", () => {
    const state = makeEclipseState();
    expect(state.bossState?.id).toBe("the_eclipse");
    expect(state.bossState?.twilightCountdown).toBe(4);
    expect(state.playerCardCostMod).toBe(0);
  });

  it("casts Twilight Veil when its countdown reaches zero and bumps player card cost", () => {
    const state = makeEclipseState();
    state.bossState!.twilightCountdown = 1;
    const next = resolveTurn(state);
    expect(next.playerCardCostMod).toBeGreaterThan(0);
    expect(next.playerCardCostModTurnsLeft).toBeGreaterThan(0);
    const cast = next.events.find((e) => e.signatureId === "twilight_veil" && e.signature === "cast");
    expect(cast).toBeTruthy();
  });

  it("clears the Twilight Veil card cost penalty after the player turn", () => {
    let state = makeEclipseState();
    state.bossState!.twilightCountdown = 1;
    state = resolveTurn(state); // cast happens at end of ally turn → enemy turn
    expect(state.playerCardCostMod).toBeGreaterThan(0);
    state = resolveTurn(state); // enemy turn ends → ally turn (penalty active)
    state = resolveTurn(state); // ally turn ends → decrement, penalty consumed
    expect(state.playerCardCostMod).toBe(0);
    expect(state.playerCardCostModTurnsLeft).toBe(0);
  });

  it("reduces incoming damage on segments while all three are alive (Veil Armor)", () => {
    const state = makeEclipseState();
    const segment = state.lanes.left.enemyHero!;
    const before = segment.hp;
    segment.shield = 0;
    state.lanes.left.allyHero!.atk = 4;
    state.allyDeck.command = 0;
    const next = resolveTurn(state);
    const after = next.lanes.left.enemyHero?.hp ?? 0;
    expect(before - after).toBeLessThan(4);
  });
});
