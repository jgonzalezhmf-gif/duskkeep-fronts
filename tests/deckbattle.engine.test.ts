import { describe, expect, it } from "vitest";
import { buildUnit, performAttack } from "@/features/tactical/engine";
import {
  castSpellCard,
  createInitialDeckBattleState,
  finalizeDeckBattleState,
  getLeaderCore,
  summonHeroCard,
  validSummonTiles,
  validLeaderPowerTargets,
} from "@/features/deckbattle/engine";
import { getCard } from "@/data/cards";
import { getLeader } from "@/data/leaders";
import type { FortressState } from "@/lib/types";

const fortress: FortressState = {
  level: 1,
  style: "dawnkeep",
  buildings: {
    bastion_walls: 1,
    war_academy: 1,
    treasury: 1,
    arcane_spire: 1,
    market_square: 1,
  },
  lastCollectedAt: null,
};

describe("deckbattle engine", () => {
  it("applies attack damage to the enemy leader core", () => {
    const state = createInitialDeckBattleState("leader_aurora", "leader_morrow", 7, fortress);
    const enemyCore = getLeaderCore(state, "enemy");
    expect(enemyCore).toBeTruthy();

    const striker = buildUnit(
      { heroId: "bran", level: 9, stars: 3, skillLevel: 3 },
      "ally",
      99,
      { x: enemyCore!.pos.x - 1, y: enemyCore!.pos.y },
    );

    state.units.push(striker);
    state.side = "ally";

    const next = performAttack(state, striker.uid, enemyCore!.uid);
    const damagedCore = getLeaderCore(next, "enemy");

    expect(damagedCore).toBeTruthy();
    expect(damagedCore!.hp).toBeLessThan(enemyCore!.hp);
  });

  it("declares victory when the enemy leader core is destroyed even if enemy units remain", () => {
    const state = createInitialDeckBattleState("leader_aurora", "leader_morrow", 11, fortress);
    const enemyCore = getLeaderCore(state, "enemy");
    expect(enemyCore).toBeTruthy();

    const finisher = buildUnit(
      { heroId: "vex", level: 40, stars: 6, skillLevel: 5 },
      "ally",
      100,
      { x: enemyCore!.pos.x - 1, y: enemyCore!.pos.y },
    );
    finisher.atk = 999;

    const survivingEnemy = buildUnit(
      { heroId: "kara", level: 10, stars: 2, skillLevel: 2 },
      "enemy",
      101,
      { x: 3, y: 0 },
    );

    state.units.push(finisher, survivingEnemy);
    state.side = "ally";

    const attacked = performAttack(state, finisher.uid, enemyCore!.uid);
    const finalized = finalizeDeckBattleState(attacked);

    expect(getLeaderCore(finalized, "enemy")?.alive).toBe(false);
    expect(finalized.units.some((unit) => unit.side === "enemy" && unit.alive && unit.role !== "leader")).toBe(true);
    expect(finalized.winner).toBe("ally");
  });

  it("refreshes leader shields instead of stacking them infinitely", () => {
    const state = createInitialDeckBattleState("leader_aurora", "leader_morrow", 13, fortress);
    const aegis = getCard("spell_guardian_aegis");
    if (aegis.kind !== "spell") {
      throw new Error("Guardian Aegis must remain a spell card.");
    }

    const first = castSpellCard(state, "enemy", aegis, { x: 0, y: 0 });
    const second = castSpellCard(first, "enemy", aegis, { x: 0, y: 0 });

    const firstShield = getLeaderCore(first, "enemy")?.buffs.shield ?? 0;
    const secondShield = getLeaderCore(second, "enemy")?.buffs.shield ?? 0;

    expect(firstShield).toBe(20);
    expect(secondShield).toBe(20);
  });

  it("still allows killing a shielded enemy core", () => {
    const state = createInitialDeckBattleState("leader_aurora", "leader_morrow", 17, fortress);
    const aegis = getCard("spell_guardian_aegis");
    if (aegis.kind !== "spell") {
      throw new Error("Guardian Aegis must remain a spell card.");
    }

    const shielded = castSpellCard(state, "enemy", aegis, { x: 0, y: 0 });
    const enemyCore = getLeaderCore(shielded, "enemy");
    expect(enemyCore?.buffs.shield).toBe(20);

    const finisher = buildUnit(
      { heroId: "vex", level: 40, stars: 6, skillLevel: 5 },
      "ally",
      102,
      { x: enemyCore!.pos.x - 1, y: enemyCore!.pos.y },
    );
    finisher.atk = 999;

    shielded.units.push(finisher);
    shielded.side = "ally";

    const attacked = performAttack(shielded, finisher.uid, enemyCore!.uid);
    const finalized = finalizeDeckBattleState(attacked);
    const resolvedCore = getLeaderCore(finalized, "enemy");

    expect(resolvedCore?.hp).toBe(0);
    expect(resolvedCore?.alive).toBe(false);
    expect(finalized.winner).toBe("ally");
  });

  it("applies shield before hp on the enemy core and then leaks damage through", () => {
    const state = createInitialDeckBattleState("leader_aurora", "leader_morrow", 19, fortress);
    const aegis = getCard("spell_guardian_aegis");
    if (aegis.kind !== "spell") {
      throw new Error("Guardian Aegis must remain a spell card.");
    }

    const shielded = castSpellCard(state, "enemy", aegis, { x: 0, y: 0 });
    const enemyCore = getLeaderCore(shielded, "enemy");
    expect(enemyCore?.buffs.shield).toBe(20);

    const striker = buildUnit(
      { heroId: "bran", level: 12, stars: 4, skillLevel: 4 },
      "ally",
      103,
      { x: enemyCore!.pos.x - 1, y: enemyCore!.pos.y },
    );
    striker.atk = 115;

    shielded.units.push(striker);
    shielded.side = "ally";

    const attacked = performAttack(shielded, striker.uid, enemyCore!.uid);
    const resolvedCore = getLeaderCore(attacked, "enemy");

    expect(resolvedCore?.buffs.shield).toBe(0);
    expect(resolvedCore?.hp).toBeLessThan(enemyCore!.hp);
    expect(resolvedCore?.alive).toBe(true);
  });

  it("prioritizes front-center summon cells to accelerate contact", () => {
    const state = createInitialDeckBattleState("leader_aurora", "leader_morrow", 23, fortress);
    const allyTiles = validSummonTiles(state, "ally");
    const enemyTiles = validSummonTiles(state, "enemy");

    expect(allyTiles[0]).toEqual({ x: 2, y: 1 });
    expect(enemyTiles[0]).toEqual({ x: 3, y: 1 });
  });

  it("summoned heroes now enter ready to pressure instead of fully exhausted", () => {
    const state = createInitialDeckBattleState("leader_aurora", "leader_morrow", 29, fortress);
    const next = summonHeroCard(state, "ally", "card_kara", { x: 2, y: 1 }, []);
    const kara = next.units.find((unit) => unit.heroId === "kara" && unit.side === "ally");

    expect(kara).toBeTruthy();
    expect(kara?.hasMoved).toBe(true);
    expect(kara?.hasActed).toBe(false);
    expect(kara?.cooldown).toBe(1);
    expect(next.selectedUid).toBe(kara?.uid ?? null);
  });

  it("applies hero summon effects immediately for early-game tempo", () => {
    const state = createInitialDeckBattleState("leader_aurora", "leader_morrow", 31, fortress);
    const enemyCoreBefore = getLeaderCore(state, "enemy");
    const afterVex = summonHeroCard(state, "ally", "card_vex", { x: 2, y: 1 }, []);
    const enemyCoreAfter = getLeaderCore(afterVex, "enemy");

    expect(enemyCoreAfter?.hp).toBeLessThan(enemyCoreBefore!.hp);

    const branState = createInitialDeckBattleState("leader_aurora", "leader_morrow", 37, fortress);
    const allyCoreBefore = getLeaderCore(branState, "ally");
    const afterBran = summonHeroCard(branState, "ally", "card_bran", { x: 2, y: 2 }, []);
    const allyCoreAfter = getLeaderCore(afterBran, "ally");
    const bran = afterBran.units.find((unit) => unit.heroId === "bran" && unit.side === "ally");

    expect(allyCoreAfter?.buffs.shield).toBeGreaterThan(allyCoreBefore?.buffs.shield ?? 0);
    expect(bran?.buffs.shield).toBeGreaterThan(0);
  });

  it("exposes valid targets for rally leader powers instead of leaving them unusable", () => {
    const state = createInitialDeckBattleState("leader_morrow", "leader_elowen", 41, fortress);
    const morrow = getLeader("leader_morrow");
    const targets = validLeaderPowerTargets(state, morrow, "ally");

    expect(targets.length).toBeGreaterThan(0);
    expect(targets).toContainEqual({ x: 0, y: 2 });
  });
});
