import { describe, expect, it } from "vitest";
import { FRONTLINE_CARD_BY_ID, FRONTLINE_CARD_POOL, FRONTLINE_PRESETS, FRONTLINE_UNIT_BY_ID } from "@/features/frontline/data";
import {
  activateLeaderPower,
  createDefaultFrontlineLoadout,
  createFrontlineBattleState,
  playCard,
  resolveTurn,
  runEnemyTurn,
  validLeaderPowerTargets,
} from "@/features/frontline/engine";
import { getFrontlineHeroProfileById } from "@/features/frontline/heroProfile";
import { createFrontlineCardProfileMap } from "@/features/frontline/cardProgression";

function makeState() {
  return createFrontlineBattleState({
    seed: 77,
    allyLoadout: createDefaultFrontlineLoadout(),
    enemyPreset: FRONTLINE_PRESETS[0],
  });
}

describe("frontline engine", () => {
  it("starts with 3 command and draws up to 5 cards for the player", () => {
    const state = makeState();

    expect(state.turn).toBe("ally");
    expect(state.allyDeck.command).toBe(3);
    expect(state.allyDeck.hand.length).toBe(5);
  });

  it("plays an instant tactic and spends command immediately", () => {
    const state = makeState();
    const cardId = "tactic_battle_hymn";
    const next = playCard(state, "ally", cardId);

    expect(next.allyDeck.command).toBe(2);
    expect(next.allyDeck.hand.includes(cardId)).toBe(false);
    expect(next.allyDeck.discard).toContain(cardId);
    expect(next.lanes.left.allyHero?.tempAtk).toBeGreaterThan(0);
  });

  it("breaches the core when a front is opened (resolved at end of round)", () => {
    const state = makeState();
    state.lanes.left.enemyHero = null;
    const afterAlly = resolveTurn(state);
    const afterEnemy = resolveTurn(afterAlly);

    expect(afterEnemy.enemyCoreHp).toBeLessThan(afterEnemy.enemyCoreMaxHp);
  });

  it("exposes leader power targets and applies beam damage", () => {
    const state = makeState();
    const targets = validLeaderPowerTargets(state, "ally");

    expect(targets.length).toBeGreaterThan(0);
    const next = activateLeaderPower(state, "ally", targets[0]);

    expect(next.allyDeck.command).toBe(1);
    expect(next.allyDeck.powerCooldown).toBeGreaterThan(0);
    expect(next.events.some((entry) => entry.kind === "power")).toBe(true);
  });

  it("runs the enemy turn and hands initiative back to the player", () => {
    const state = makeState();
    const afterPlayer = resolveTurn(state);
    const afterEnemy = runEnemyTurn(afterPlayer);

    expect(afterEnemy.turn).toBe("ally");
    expect(afterEnemy.round).toBe(2);
  });

  it("uses enemy-only units in rival presets without exposing enemy cards to the player deck pool", () => {
    const preset = FRONTLINE_PRESETS[0];
    const state = makeState();

    expect(preset.squad.every((heroId) => FRONTLINE_UNIT_BY_ID[heroId]?.family === "enemy")).toBe(true);
    expect(state.lanes.left.enemyHero?.heroId).toMatch(/^enemy_/);
    expect(FRONTLINE_CARD_POOL.every((cardId) => !cardId.startsWith("enemy_"))).toBe(true);
  });

  it("uses progressed Frontline stats for player heroes", () => {
    const progressedBran = getFrontlineHeroProfileById("bran", {
      heroId: "bran",
      level: 4,
      stars: 2,
      shards: 0,
      xp: 0,
      skillLevel: 1,
    });

    expect(progressedBran).toBeTruthy();
    expect(progressedBran!.maxHp).toBeGreaterThan(FRONTLINE_UNIT_BY_ID.bran.maxHp);
    expect(progressedBran!.atk).toBeGreaterThan(FRONTLINE_UNIT_BY_ID.bran.atk);

    const state = createFrontlineBattleState({
      seed: 77,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: FRONTLINE_PRESETS[0],
      allyHeroProfiles: { bran: progressedBran! },
    });

    expect(state.lanes.left.allyHero?.maxHp).toBe(progressedBran!.maxHp);
    expect(state.lanes.left.allyHero?.atk).toBe(progressedBran!.atk);
    expect(state.lanes.left.enemyHero?.maxHp).toBe(FRONTLINE_UNIT_BY_ID[FRONTLINE_PRESETS[0].squad[0]].maxHp);
  });

  it("applies encounter modifiers to enemy core and starting command", () => {
    const baseEnemyCore = 24; // leader_morrow.coreHp
    const state = createFrontlineBattleState({
      seed: 77,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: FRONTLINE_PRESETS[0],
      modifiers: { enemyCoreBonus: 5, enemyStartingCommandBonus: 1 },
    });

    expect(state.enemyCoreHp).toBe(baseEnemyCore + 5);
    expect(state.enemyCoreMaxHp).toBe(baseEnemyCore + 5);
    expect(state.allyCoreHp).toBe(state.allyCoreMaxHp);
    expect(state.enemyDeck.command).toBe(0);
    expect(state.enemyStartCommandBonus).toBe(1);

    const afterAllyTurn = resolveTurn(state);
    expect(afterAllyTurn.turn).toBe("enemy");
    expect(afterAllyTurn.enemyDeck.command).toBe(4);
    expect(afterAllyTurn.enemyStartCommandBonus).toBe(0);
  });

  it("uses progressed Frontline card effects for player cards", () => {
    const cardProfiles = createFrontlineCardProfileMap({ order_focus_fire: 3 });
    const state = createFrontlineBattleState({
      seed: 77,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: FRONTLINE_PRESETS[0],
      allyCardProfiles: cardProfiles,
    });
    state.allyDeck.hand = ["order_focus_fire"];
    state.allyDeck.command = 3;
    const before = state.lanes.left.enemyHero!.hp;

    const next = playCard(state, "ally", "order_focus_fire", "left");

    const progressedEffect = cardProfiles.order_focus_fire!.effect;
    const baseEffect = FRONTLINE_CARD_BY_ID.order_focus_fire.effect;
    expect(progressedEffect.type).toBe("front_shot");
    expect(baseEffect.type).toBe("front_shot");
    if (progressedEffect.type !== "front_shot" || baseEffect.type !== "front_shot") return;
    expect(next.lanes.left.enemyHero!.hp).toBe(before - progressedEffect.damage);
    expect(progressedEffect.damage).toBeGreaterThan(baseEffect.damage);
  });
});
