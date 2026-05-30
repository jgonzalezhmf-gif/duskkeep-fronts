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
  runEnemyTurnTraced,
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

  it("emits enemy intent snapshots for readable enemy-turn playback", () => {
    const state = makeState();
    state.enemyDeck.hand = ["enemy_tactic_war_howl"];
    state.enemyDeck.command = 3;
    state.turn = "enemy";

    const { final, snapshots } = runEnemyTurnTraced(state);
    const enemyIntentIds = final.events
      .filter((entry) => entry.side === "enemy" && (entry.kind === "card" || entry.kind === "power"))
      .map((entry) => entry.id);

    expect(enemyIntentIds.length).toBeGreaterThan(0);
    expect(snapshots.map((entry) => entry.eventId)).toEqual(expect.arrayContaining(enemyIntentIds));
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

  it("AI plays execute_front on an open ally lane to grab core damage", () => {
    const state = makeState();
    state.lanes.center.allyHero = null;
    state.lanes.center.allySupport = null;
    state.enemyDeck.hand = ["enemy_order_infernal_cleave"];
    state.enemyDeck.command = 5;
    state.turn = "enemy";

    const next = runEnemyTurn(state);

    const cleavePlay = next.events.find(
      (entry) => entry.kind === "card" && entry.label.includes("Infernal Cleave"),
    );
    expect(cleavePlay).toBeTruthy();
    expect(cleavePlay?.lane).toBe("center");
  });

  it("AI stuns the highest-ATK ally hero when stun_front is available", () => {
    const state = makeState();
    state.lanes.left.allyHero!.atk = 4;
    state.lanes.center.allyHero!.atk = 9;
    state.lanes.right.allyHero!.atk = 3;
    state.enemyDeck.hand = ["enemy_tactic_plague_spit"];
    state.enemyDeck.command = 5;
    state.turn = "enemy";

    const next = runEnemyTurn(state);

    const stunPlay = next.events.find(
      (entry) => entry.kind === "card" && entry.label.includes("Plague Spit"),
    );
    expect(stunPlay).toBeTruthy();
    expect(stunPlay?.lane).toBe("center");
  });

  it("AI plays a rally buff before a damage card so the strike benefits", () => {
    const state = makeState();
    state.enemyDeck.hand = ["enemy_order_bone_arrow", "enemy_tactic_war_howl"];
    state.enemyDeck.command = 5;
    state.turn = "enemy";

    const next = runEnemyTurn(state);

    const cardPlays = next.events.filter((entry) => entry.kind === "card");
    // Events are stored newest-first (events.unshift), so reverse for chronological order.
    const chronological = [...cardPlays].reverse();
    const howlIndex = chronological.findIndex((entry) => entry.label.includes("War Howl"));
    const arrowIndex = chronological.findIndex((entry) => entry.label.includes("Bone Arrow"));
    expect(howlIndex).toBeGreaterThanOrEqual(0);
    expect(arrowIndex).toBeGreaterThanOrEqual(0);
    expect(howlIndex).toBeLessThan(arrowIndex);
  });

  it("Bulwark Cohesion synergy: Battle Hymn rallies +1 extra ATK when a bulwark ally is alive", () => {
    const state = makeState();
    // Default loadout includes Bran (bulwark) in the left lane.
    const hasBulwark = (["left", "center", "right"] as const).some((lane) => {
      const hero = state.lanes[lane].allyHero;
      return hero ? FRONTLINE_UNIT_BY_ID[hero.heroId]?.trait.type === "bulwark" : false;
    });
    expect(hasBulwark).toBe(true);

    const baseAtks = (["left", "center", "right"] as const).map(
      (lane) => state.lanes[lane].allyHero?.tempAtk ?? 0,
    );
    state.allyDeck.hand = ["tactic_battle_hymn"];
    state.allyDeck.command = 3;

    const next = playCard(state, "ally", "tactic_battle_hymn");

    const lanes = ["left", "center", "right"] as const;
    for (let i = 0; i < 3; i++) {
      const hero = next.lanes[lanes[i]].allyHero;
      if (!hero) continue;
      expect((hero.tempAtk ?? 0) - baseAtks[i]).toBe(3);
    }
    expect(next.events.some((e) => e.signature === "synergy" && e.signatureId === "bulwark_cohesion")).toBe(true);
  });

  it("Sanctified Healing synergy: Sanctuary on a mend hero spreads heal to side lanes", () => {
    const state = makeState();
    // Drop Mira (mend) into center lane to guarantee a healer target.
    const miraDef = FRONTLINE_UNIT_BY_ID.mira;
    expect(miraDef?.trait.type).toBe("mend");
    state.lanes.center.allyHero = {
      heroId: "mira",
      side: "ally",
      lane: "center",
      name: miraDef!.name,
      role: miraDef!.role,
      hp: miraDef!.maxHp - 4,
      maxHp: miraDef!.maxHp,
      atk: miraDef!.atk,
      def: miraDef!.def,
      speed: miraDef!.speed,
      shield: 0,
      alive: true,
      stun: 0,
      tempAtk: 0,
      tempShield: 0,
      strikeFirst: false,
    };
    // Wound the side lanes so the spread heal has something to do.
    for (const lane of ["left", "right"] as const) {
      const hero = state.lanes[lane].allyHero;
      if (hero) hero.hp = Math.max(1, hero.maxHp - 5);
    }
    state.allyDeck.hand = ["tactic_sanctuary"];
    state.allyDeck.command = 3;

    const before = (["left", "center", "right"] as const).map(
      (lane) => state.lanes[lane].allyHero?.hp ?? 0,
    );
    const next = playCard(state, "ally", "tactic_sanctuary", "center");
    const after = (["left", "center", "right"] as const).map(
      (lane) => next.lanes[lane].allyHero?.hp ?? 0,
    );

    expect(after[0] - before[0]).toBeGreaterThan(0);
    expect(after[2] - before[2]).toBeGreaterThan(0);
    expect(next.events.some((e) => e.signature === "synergy" && e.signatureId === "sanctified_healing")).toBe(true);
  });

  it("Sanctuary on a non-mend hero does NOT trigger Sanctified Healing", () => {
    const state = makeState();
    // Default left lane is Bran (bulwark) — should not trigger spread heal.
    const branLane = "left" as const;
    const bran = state.lanes[branLane].allyHero!;
    expect(FRONTLINE_UNIT_BY_ID[bran.heroId].trait.type).toBe("bulwark");
    bran.hp = bran.maxHp - 4;
    for (const lane of ["center", "right"] as const) {
      const hero = state.lanes[lane].allyHero;
      if (hero) hero.hp = hero.maxHp - 5;
    }
    state.allyDeck.hand = ["tactic_sanctuary"];
    state.allyDeck.command = 3;

    const before = (["center", "right"] as const).map(
      (lane) => state.lanes[lane].allyHero?.hp ?? 0,
    );
    const next = playCard(state, "ally", "tactic_sanctuary", branLane);
    const after = (["center", "right"] as const).map(
      (lane) => next.lanes[lane].allyHero?.hp ?? 0,
    );

    // Side lanes stay wounded — no spread heal.
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
    expect(next.events.some((e) => e.signature === "synergy" && e.signatureId === "sanctified_healing")).toBe(false);
  });

  it("Shadow Strike synergy: Shadow Dive deals +3 to a stunned enemy hero", () => {
    const state = makeState();
    state.lanes.left.enemyHero!.stun = 1;
    state.lanes.left.enemyHero!.hp = state.lanes.left.enemyHero!.maxHp;
    state.allyDeck.hand = ["order_shadow_dive"];
    state.allyDeck.command = 3;

    const before = state.lanes.left.enemyHero!.hp;
    const next = playCard(state, "ally", "order_shadow_dive", "left");
    const after = next.lanes.left.enemyHero!.hp;

    expect(before - after).toBeGreaterThanOrEqual(6);
    expect(next.events.some((e) => e.signature === "synergy" && e.signatureId === "shadow_strike")).toBe(true);
  });

  it("Howling Pack (forward) synergy: Wolf summon with rally active enters with bonus stats", () => {
    const baselineState = makeState();
    baselineState.lanes.left.allySupport = null;
    baselineState.allyDeck.hand = ["summon_wolf"];
    baselineState.allyDeck.command = 3;
    const baselineNext = playCard(baselineState, "ally", "summon_wolf", "left");
    const baselineWolf = baselineNext.lanes.left.allySupport!;

    const ralliedState = makeState();
    ralliedState.lanes.left.allyHero!.tempAtk = 2;
    ralliedState.lanes.center.allyHero!.tempAtk = 2;
    ralliedState.lanes.left.allySupport = null;
    ralliedState.allyDeck.hand = ["summon_wolf"];
    ralliedState.allyDeck.command = 3;
    const ralliedNext = playCard(ralliedState, "ally", "summon_wolf", "left");
    const ralliedWolf = ralliedNext.lanes.left.allySupport!;

    expect(ralliedWolf.maxHp).toBe(baselineWolf.maxHp + 2);
    expect(ralliedWolf.atk).toBe(baselineWolf.atk + 1);
    expect(ralliedNext.events.some((e) => e.signature === "synergy" && e.signatureId === "howling_pack")).toBe(true);
  });

  it("Howling Pack (echo) synergy: Battle Hymn buffs ATK of allied supports already in play", () => {
    const state = makeState();
    state.lanes.left.allySupport = {
      id: "wolf",
      side: "ally",
      lane: "left",
      name: "Wolf",
      hp: 5,
      maxHp: 5,
      atk: 2,
      duration: 2,
      intercepts: true,
    };
    const supportAtkBefore = state.lanes.left.allySupport.atk;
    state.allyDeck.hand = ["tactic_battle_hymn"];
    state.allyDeck.command = 3;

    const next = playCard(state, "ally", "tactic_battle_hymn");

    expect(next.lanes.left.allySupport?.atk).toBe(supportAtkBefore + 1);
    expect(next.events.some((e) => e.signature === "synergy" && e.signatureId === "howling_echo")).toBe(true);
  });

  it("Affinity — Twin Slash + Blade Striker: target with flurry trait gets +2 extra ATK", () => {
    const state = makeState();
    // Drop Kara (flurry) into center lane.
    const karaDef = FRONTLINE_UNIT_BY_ID.kara;
    expect(karaDef?.trait.type).toBe("flurry");
    state.lanes.center.allyHero = {
      heroId: "kara",
      side: "ally",
      lane: "center",
      name: karaDef!.name,
      role: karaDef!.role,
      hp: karaDef!.maxHp,
      maxHp: karaDef!.maxHp,
      atk: karaDef!.atk,
      def: karaDef!.def,
      speed: karaDef!.speed,
      shield: 0,
      alive: true,
      stun: 0,
      tempAtk: 0,
      tempShield: 0,
      strikeFirst: false,
    };
    state.allyDeck.hand = ["order_twin_slash"];
    state.allyDeck.command = 3;

    const next = playCard(state, "ally", "order_twin_slash", "center");
    // Twin Slash base atk = 3; with affinity +2 → tempAtk +5.
    expect(next.lanes.center.allyHero?.tempAtk).toBe(5);
    expect(next.events.some((e) => e.signature === "synergy" && e.signatureId === "blade_strike_affinity")).toBe(true);
  });

  it("Archer's Focus presence synergy: Focus Fire deals +2 with a breach ally alive", () => {
    const baselineState = makeState();
    // Replace any breach allies with non-breach to disable the synergy.
    for (const lane of ["left", "center", "right"] as const) {
      const hero = baselineState.lanes[lane].allyHero;
      if (hero && FRONTLINE_UNIT_BY_ID[hero.heroId].trait.type === "breach") {
        baselineState.lanes[lane].allyHero = null;
      }
    }
    baselineState.allyDeck.hand = ["order_focus_fire"];
    baselineState.allyDeck.command = 3;
    const targetLane = (["left", "center", "right"] as const).find(
      (l) => baselineState.lanes[l].enemyHero,
    )!;
    const baselineHpBefore = baselineState.lanes[targetLane].enemyHero!.hp;
    const baselineNext = playCard(baselineState, "ally", "order_focus_fire", targetLane);
    const baselineDamage = baselineHpBefore - baselineNext.lanes[targetLane].enemyHero!.hp;

    const archerState = makeState();
    // Drop Vex (breach) into right lane to guarantee presence.
    const vexDef = FRONTLINE_UNIT_BY_ID.vex;
    expect(vexDef?.trait.type).toBe("breach");
    archerState.lanes.right.allyHero = {
      heroId: "vex",
      side: "ally",
      lane: "right",
      name: vexDef!.name,
      role: vexDef!.role,
      hp: vexDef!.maxHp,
      maxHp: vexDef!.maxHp,
      atk: vexDef!.atk,
      def: vexDef!.def,
      speed: vexDef!.speed,
      shield: 0,
      alive: true,
      stun: 0,
      tempAtk: 0,
      tempShield: 0,
      strikeFirst: false,
    };
    archerState.allyDeck.hand = ["order_focus_fire"];
    archerState.allyDeck.command = 3;
    const archerHpBefore = archerState.lanes[targetLane].enemyHero!.hp;
    const archerNext = playCard(archerState, "ally", "order_focus_fire", targetLane);
    const archerDamage = archerHpBefore - archerNext.lanes[targetLane].enemyHero!.hp;

    expect(archerDamage - baselineDamage).toBe(2);
    expect(archerNext.events.some((e) => e.signature === "synergy" && e.signatureId === "archers_focus")).toBe(true);
  });
});
