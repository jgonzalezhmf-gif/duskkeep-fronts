import { describe, expect, it } from "vitest";
import { FRONTLINE_CARD_BY_ID, FRONTLINE_CARD_POOL, FRONTLINE_PRESETS, FRONTLINE_UNIT_BY_ID } from "@/features/frontline/data";
import {
  activateLeaderPower,
  createDefaultFrontlineLoadout,
  createFrontlineBattleState,
  playCard,
  resolveTurn,
  resolveTurnTraced,
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

  it("resolves the full round and hands initiative back to the player", () => {
    const state = makeState();
    const afterRound = resolveTurn(state);

    expect(afterRound.turn).toBe("ally");
    expect(afterRound.round).toBe(2);
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

    // After resolving the round the bonus has been consumed and turn returns to ally.
    const afterRound = resolveTurn(state);
    expect(afterRound.turn).toBe("ally");
    expect(afterRound.enemyStartCommandBonus).toBe(0);
    expect(afterRound.round).toBe(2);
  });

  it("exhausts limited-use cards: every copy disappears from deck/hand once the cap is reached", () => {
    const state = makeState();
    state.allyDeck.hand = ["summon_wolf", "summon_wolf", "tactic_battle_hymn"];
    state.allyDeck.deck = ["summon_wolf", "tactic_battle_hymn"];
    state.allyDeck.discard = ["summon_wolf"];
    state.allyDeck.command = 5;
    state.lanes.left.allySupport = null;

    const next = playCard(state, "ally", "summon_wolf", "left");

    expect(next.allyDeck.exhaustedCardIds).toContain("summon_wolf");
    expect(next.allyDeck.hand).not.toContain("summon_wolf");
    expect(next.allyDeck.deck).not.toContain("summon_wolf");
    expect(next.allyDeck.discard).not.toContain("summon_wolf");
    expect(next.allyDeck.cardUseCounts.summon_wolf).toBe(1);
    // The non-limited card stays in deck/discard untouched.
    expect(next.allyDeck.hand).toContain("tactic_battle_hymn");
  });

  it("does not freeze the enemy turn when a heal-only hand has no valid target", () => {
    const state = makeState();
    state.enemyDeck.hand = ["enemy_tactic_blood_rite"];
    state.enemyDeck.command = 3;
    for (const lane of ["left", "center", "right"] as const) {
      const hero = state.lanes[lane].enemyHero;
      if (hero) hero.hp = hero.maxHp;
    }
    state.turn = "enemy";

    const start = Date.now();
    const next = runEnemyTurn(state);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
    expect(next).toBeDefined();
  });

  it("emits per-event snapshots from resolveTurnTraced for UI sync", () => {
    const state = makeState();
    const { final, snapshots } = resolveTurnTraced(state);
    expect(snapshots.length).toBeGreaterThan(0);
    for (const snap of snapshots) {
      expect(snap.eventId).toBeTruthy();
      expect(snap.state).toBeTruthy();
      expect(snap.state).not.toBe(final);
    }
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
