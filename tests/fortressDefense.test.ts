import { describe, expect, it } from "vitest";
import {
  createFortressDefenseClaimPayload,
  createFortressDefenseState,
  getFortressDefenseActions,
  resolveFortressDefenseTurn,
  type FortressDefenseActionId,
  type FortressDefenseEnemy,
  type FortressDefenseGuard,
  type FortressDefenseState,
  type FortressDefenseTrap,
} from "@/features/fortress-defense/engine";
import { createDefaultFrontlineFortress } from "@/features/frontline/fortress";
import { createFrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import type { PlayerHero } from "@/lib/types";

const heroes: PlayerHero[] = [
  { heroId: "bran", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
  { heroId: "kara", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
  { heroId: "vex", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
  { heroId: "mira", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
  { heroId: "drak", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
  { heroId: "tovi", level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 },
];

function testEnemy(overrides: Partial<FortressDefenseEnemy> = {}): FortressDefenseEnemy {
  return {
    id: "enemy-1",
    name: "Ash raider",
    maxHp: 30,
    hp: 30,
    armor: 0,
    range: 5,
    moveSpeed: 1,
    attackRange: 1,
    attackDamage: 8,
    archetype: "raider",
    lane: "middle",
    slowedTurns: 0,
    stunnedTurns: 0,
    wave: 1,
    kind: "skirmisher",
    ...overrides,
  };
}

function testGuard(overrides: Partial<FortressDefenseGuard> = {}): FortressDefenseGuard {
  return {
    id: "guard-1",
    name: "Garrison guard",
    unitType: "guard",
    maxHp: 24,
    hp: 24,
    shield: 0,
    inspiredTurns: 0,
    lane: "middle",
    range: 1,
    deployedTurn: 0,
    ...overrides,
  };
}

function testTrap(overrides: Partial<FortressDefenseTrap> = {}): FortressDefenseTrap {
  return {
    id: "trap-1",
    name: "Shadow trap",
    lane: "middle",
    range: 3,
    damage: 22,
    slow: 1,
    stun: 2,
    deployedTurn: 0,
    ...overrides,
  };
}

function testState(enemies: FortressDefenseEnemy[], actionIds: FortressDefenseActionId[] = ["war_chant"]): FortressDefenseState {
  const base = createFortressDefenseState({
    fortress: createDefaultFrontlineFortress(),
    accountLevel: 1,
    heroProfiles: createFrontlineHeroProfileMap(heroes),
    now: new Date("2026-05-21T10:05:00.000Z"),
  });
  return {
    ...base,
    status: "active",
    turn: 0,
    wave: 1,
    castleHp: 80,
    maxCastleHp: 100,
    shield: 0,
    morale: 0,
    enemies,
    traps: [],
    defeated: 0,
    actionIds,
    log: [],
  };
}

function actionState(state: FortressDefenseState, actionId: FortressDefenseActionId) {
  const action = getFortressDefenseActions(state).find((entry) => entry.id === actionId);
  if (!action) throw new Error(`Missing action ${actionId}`);
  return action;
}

describe("fortress defense engine", () => {
  it("creates a wave defense with castle life and garrison-derived actions", () => {
    const fortress = {
      ...createDefaultFrontlineFortress(),
      nextAttackAt: "2026-05-21T10:00:00.000Z",
      garrison: ["bran", "vex", "mira"] as [string, string, string],
    };
    const state = createFortressDefenseState({
      fortress,
      accountLevel: 1,
      heroProfiles: createFrontlineHeroProfileMap(heroes),
      now: new Date("2026-05-21T10:05:00.000Z"),
    });

    expect(state.status).toBe("active");
    expect(state.enemies.length).toBeGreaterThan(0);
    expect(state.enemies.every((enemy) => enemy.range >= 1 && enemy.range <= 5)).toBe(true);
    expect(state.enemies.every((enemy) => enemy.moveSpeed <= 1)).toBe(true);
    expect(state.enemies.every((enemy) => enemy.moveSpeed >= 0 && enemy.attackRange >= 1 && enemy.attackDamage > 0)).toBe(true);
    expect(getFortressDefenseActions(state).map((action) => action.id)).toEqual(
      expect.arrayContaining(["castle_shot", "deploy_guard", "deploy_archer", "bulwark", "volley", "mend"]),
    );
    expect(getFortressDefenseActions(state).find((action) => action.id === "castle_shot")?.targetType).toBe("enemy");
    expect(getFortressDefenseActions(state).find((action) => action.id === "deploy_guard")?.targetType).toBe("slot");
    expect(getFortressDefenseActions(state).find((action) => action.id === "deploy_guard")?.charges).toBe(2);
    expect(getFortressDefenseActions(state).find((action) => action.id === "deploy_archer")?.targetType).toBe("slot");
    expect(getFortressDefenseActions(state).find((action) => action.id === "deploy_archer")?.charges).toBe(2);
    expect(getFortressDefenseActions(state).find((action) => action.id === "volley")?.targetType).toBe("allEnemies");
    expect(getFortressDefenseActions(state).find((action) => action.id === "mend")?.charges).toBe(2);
    expect(getFortressDefenseActions(state).every((action) => action.currentCooldown === 0)).toBe(true);
  });

  it("keeps fortress defense to base orders when no heroes are assigned", () => {
    const state = createFortressDefenseState({
      fortress: {
        ...createDefaultFrontlineFortress(),
        buildings: { keep: 3, treasury: 1, barracks: 1 },
        garrison: [null, null, null],
      },
      accountLevel: 1,
      heroProfiles: createFrontlineHeroProfileMap(heroes),
      now: new Date("2026-05-21T10:05:00.000Z"),
    });

    expect(getFortressDefenseActions(state).map((action) => action.id)).toEqual(["castle_shot", "deploy_guard", "deploy_archer"]);
  });

  it("maps assigned heroes to distinct fortress skills", () => {
    const actionIdsFor = (garrison: [string | null, string | null, string | null]) => getFortressDefenseActions(createFortressDefenseState({
      fortress: { ...createDefaultFrontlineFortress(), garrison },
      accountLevel: 1,
      heroProfiles: createFrontlineHeroProfileMap(heroes),
      now: new Date("2026-05-21T10:05:00.000Z"),
    })).map((action) => action.id);

    expect(actionIdsFor(["bran", null, null])).toEqual(["castle_shot", "deploy_guard", "deploy_archer", "bulwark"]);
    expect(actionIdsFor(["kara", null, null])).toEqual(["castle_shot", "deploy_guard", "deploy_archer", "blade_rush"]);
    expect(actionIdsFor(["vex", null, null])).toEqual(["castle_shot", "deploy_guard", "deploy_archer", "volley"]);
    expect(actionIdsFor(["mira", null, null])).toEqual(["castle_shot", "deploy_guard", "deploy_archer", "mend"]);
    expect(actionIdsFor(["drak", null, null])).toEqual(["castle_shot", "deploy_guard", "deploy_archer", "traps"]);
    expect(actionIdsFor(["tovi", null, null])).toEqual(["castle_shot", "deploy_guard", "deploy_archer", "war_chant"]);
  });

  it("resolves every living enemy after the player order", () => {
    const state = testState([
      testEnemy({ id: "raider", range: 3, moveSpeed: 1, attackRange: 1, attackDamage: 8 }),
      testEnemy({ id: "scout", range: 5, moveSpeed: 2, attackRange: 1, attackDamage: 5, archetype: "scout" }),
      testEnemy({ id: "archer", range: 3, moveSpeed: 1, attackRange: 3, attackDamage: 7, archetype: "archer", kind: "acolyte" }),
    ]);

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.enemies.find((enemy) => enemy.id === "raider")?.range).toBe(2);
    expect(next.enemies.find((enemy) => enemy.id === "scout")?.range).toBe(3);
    expect(next.enemies.find((enemy) => enemy.id === "archer")?.range).toBe(3);
    expect(next.castleHp).toBe(state.castleHp - 7);
    expect(next.log.filter((entry) => entry.turn === 1 && entry.title === "Enemy advance")).toHaveLength(2);
    expect(next.log.filter((entry) => entry.turn === 1 && entry.title === "Enemy attack")).toHaveLength(1);
  });

  it("moves melee enemies toward the gate when they are outside attack range", () => {
    const state = testState([testEnemy({ range: 3, moveSpeed: 1, attackRange: 1 })]);

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.enemies[0].range).toBe(2);
    expect(next.castleHp).toBe(state.castleHp);
  });

  it("lets melee enemies attack at range 1 without disappearing", () => {
    const state = testState([testEnemy({ id: "melee", range: 1, attackRange: 1, attackDamage: 9 })]);

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.castleHp).toBe(state.castleHp - 9);
    expect(next.enemies.some((enemy) => enemy.id === "melee")).toBe(true);
    expect(next.enemies[0].range).toBe(1);
  });

  it("makes a guard absorb melee attacks before the castle", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "melee", lane: "middle", range: 1, attackRange: 1, attackDamage: 9 })], ["war_chant"]),
      guards: [testGuard({ id: "guard-mid", lane: "middle", range: 1, hp: 24 })],
    };

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.castleHp).toBe(state.castleHp);
    expect(next.guards.find((guard) => guard.id === "guard-mid")?.hp).toBe(15);
    expect(next.enemies.some((enemy) => enemy.id === "melee")).toBe(true);
  });

  it("lets dead guards stop blocking melee attacks", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "melee", lane: "middle", range: 1, attackRange: 1, attackDamage: 9 })], ["war_chant"]),
      guards: [testGuard({ id: "dead-guard", lane: "middle", range: 1, hp: 0 })],
    };

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.castleHp).toBe(state.castleHp - 9);
    expect(next.guards).toHaveLength(0);
  });

  it("lets a guard block melee advance at its slot", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "raider", lane: "top", range: 3, moveSpeed: 1, attackRange: 1 })], ["war_chant"]),
      guards: [testGuard({ id: "guard-top", lane: "top", range: 2 })],
    };

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.castleHp).toBe(state.castleHp);
    expect(next.enemies[0].range).toBe(2);
    expect(next.guards[0].hp).toBe(24);
    expect(next.log.some((entry) => entry.title === "Guard block")).toBe(true);
  });

  it("lets guards counterattack close enemies in the same lane", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "raider", lane: "top", range: 3, moveSpeed: 0, hp: 30, maxHp: 30 })], ["bulwark"]),
      guards: [testGuard({ id: "guard-top", lane: "top", range: 2 })],
    };

    const next = resolveFortressDefenseTurn(state, "bulwark");

    expect(next.enemies.find((enemy) => enemy.id === "raider")?.hp).toBe(20);
    expect(next.log.some((entry) => entry.title === "Guard strike")).toBe(true);
  });

  it("keeps guards from counterattacking enemies beyond adjacent range", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "far-raider", lane: "top", range: 4, moveSpeed: 0, hp: 30, maxHp: 30 })], ["bulwark"]),
      guards: [testGuard({ id: "guard-top", lane: "top", range: 2 })],
    };

    const next = resolveFortressDefenseTurn(state, "bulwark");

    expect(next.enemies.find((enemy) => enemy.id === "far-raider")?.hp).toBe(30);
    expect(next.log.some((entry) => entry.title === "Guard strike")).toBe(false);
  });

  it("removes a guard killed by melee without damaging the castle that turn", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "brute", lane: "middle", range: 1, attackRange: 1, attackDamage: 14 })], ["war_chant"]),
      guards: [testGuard({ id: "low-guard", lane: "middle", range: 1, hp: 6, maxHp: 24 })],
    };

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.castleHp).toBe(state.castleHp);
    expect(next.guards).toHaveLength(0);
    expect(next.log.some((entry) => entry.title === "Guard down")).toBe(true);
  });

  it("lets archers attack from range 3", () => {
    const state = testState([
      testEnemy({ id: "archer", name: "Bone archer", range: 3, attackRange: 3, attackDamage: 7, archetype: "archer", kind: "acolyte" }),
    ]);

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.castleHp).toBe(state.castleHp - 7);
    expect(next.enemies[0].range).toBe(3);
  });

  it("lets ranged enemies ignore deployed guards", () => {
    const state: FortressDefenseState = {
      ...testState([
        testEnemy({ id: "archer", name: "Bone archer", lane: "top", range: 3, attackRange: 3, attackDamage: 7, archetype: "archer", kind: "acolyte" }),
      ], ["war_chant"]),
      guards: [testGuard({ id: "guard-top", lane: "top", range: 2 })],
    };

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.castleHp).toBe(state.castleHp - 7);
    expect(next.guards[0].hp).toBe(24);
  });

  it("moves speed 2 enemies two ranges without passing range 1", () => {
    const state = testState([
      testEnemy({ id: "scout", range: 2, moveSpeed: 2, attackRange: 1, attackDamage: 5, archetype: "scout" }),
    ]);

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.castleHp).toBe(state.castleHp);
    expect(next.enemies[0].range).toBe(1);
  });

  it("damages the selected Castle Shot target", () => {
    const front = testEnemy({ id: "front", hp: 30, maxHp: 30, range: 5, moveSpeed: 0 });
    const target = testEnemy({ id: "target", hp: 40, maxHp: 40, range: 5, moveSpeed: 0, kind: "brute", archetype: "brute" });
    const state = testState([front, target], ["castle_shot"]);

    const next = resolveFortressDefenseTurn(state, "castle_shot", "target");

    expect(next.enemies.find((enemy) => enemy.id === "target")?.hp).toBe(6);
    expect(next.enemies.find((enemy) => enemy.id === "front")?.hp).toBe(30);
  });

  it("gives Castle Shot a close-range damage bonus", () => {
    const target = testEnemy({ id: "target", hp: 50, maxHp: 50, range: 2, moveSpeed: 0, armor: 1 });
    const state = testState([target], ["castle_shot"]);

    const next = resolveFortressDefenseTurn(state, "castle_shot", "target");

    expect(next.enemies.find((enemy) => enemy.id === "target")?.hp).toBe(11);
  });

  it("makes Blade Rush a targeted Kara combo instead of another Volley", () => {
    const close = testEnemy({ id: "close", hp: 50, maxHp: 50, range: 2, moveSpeed: 0, armor: 1 });
    const far = testEnemy({ id: "far", hp: 50, maxHp: 50, range: 5, moveSpeed: 0, armor: 1 });
    const state = testState([close, far], ["blade_rush", "volley"]);

    const afterRush = resolveFortressDefenseTurn(state, "blade_rush", "close");

    expect(afterRush.enemies.find((enemy) => enemy.id === "close")).toBeUndefined();
    expect(afterRush.enemies.find((enemy) => enemy.id === "far")?.hp).toBe(34);
    expect(actionState(afterRush, "blade_rush").currentCooldown).toBe(2);
  });

  it("lets Blade Rush follow through on the same target when no lane target remains", () => {
    const target = testEnemy({ id: "target", hp: 80, maxHp: 80, range: 2, moveSpeed: 0, armor: 1 });
    const state = testState([target], ["blade_rush"]);

    const next = resolveFortressDefenseTurn(state, "blade_rush", "target");

    expect(next.enemies.find((enemy) => enemy.id === "target")?.hp).toBe(9);
  });

  it("puts used orders on cooldown and blocks them until another turn passes", () => {
    const state = testState([
      testEnemy({ id: "target", hp: 50, maxHp: 50, range: 5, moveSpeed: 0 }),
      testEnemy({ id: "other", hp: 50, maxHp: 50, range: 5, moveSpeed: 0 }),
    ], ["castle_shot", "volley"]);

    const afterShot = resolveFortressDefenseTurn(state, "castle_shot", "target");
    const blockedShot = resolveFortressDefenseTurn(afterShot, "castle_shot", "other");
    const afterVolley = resolveFortressDefenseTurn(afterShot, "volley");

    expect(actionState(afterShot, "castle_shot").currentCooldown).toBe(1);
    expect(actionState(afterShot, "castle_shot").disabledReason).toBe("cooldown");
    expect(blockedShot).toBe(afterShot);
    expect(actionState(afterVolley, "castle_shot").currentCooldown).toBe(0);
    expect(actionState(afterVolley, "volley").currentCooldown).toBe(2);
  });

  it("deploys a guard to a valid close slot, consumes a charge, and starts cooldown", () => {
    const state = testState([testEnemy({ id: "far", lane: "bottom", range: 5, moveSpeed: 0 })], ["deploy_guard"]);

    const next = resolveFortressDefenseTurn(state, "deploy_guard", "top:2");

    expect(next.guards).toHaveLength(1);
    expect(next.guards[0]).toMatchObject({ lane: "top", range: 2, hp: 24, maxHp: 24 });
    expect(actionState(next, "deploy_guard").charges).toBe(1);
    expect(actionState(next, "deploy_guard").currentCooldown).toBe(4);
  });

  it("does not deploy a guard without charges", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ range: 5, moveSpeed: 0 })], ["deploy_guard"]),
      actionStates: { deploy_guard: { currentCooldown: 0, charges: 0, maxCharges: 2 } },
    };

    const next = resolveFortressDefenseTurn(state, "deploy_guard", "top:1");

    expect(actionState(state, "deploy_guard").disabledReason).toBe("charges");
    expect(next).toBe(state);
  });

  it("does not exceed six active deployed defenders", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ range: 5, moveSpeed: 0 })], ["deploy_guard"]),
      guards: [
        testGuard({ id: "guard-top-1", lane: "top", range: 1 }),
        testGuard({ id: "guard-top-2", lane: "top", range: 2 }),
        testGuard({ id: "guard-mid-1", lane: "middle", range: 1 }),
        testGuard({ id: "guard-mid-2", lane: "middle", range: 2 }),
        testGuard({ id: "guard-bottom-1", lane: "bottom", range: 1 }),
        testGuard({ id: "guard-bottom-2", lane: "bottom", range: 2 }),
      ],
    };

    const next = resolveFortressDefenseTurn(state, "deploy_guard", "bottom:1");

    expect(actionState(state, "deploy_guard").disabledReason).toBe("maxGuards");
    expect(next).toBe(state);
  });

  it("deploys an archer that can counterattack any range in its lane", () => {
    const state = testState([testEnemy({ id: "far", lane: "top", range: 5, moveSpeed: 0, hp: 30, maxHp: 30 })], ["deploy_archer"]);

    const next = resolveFortressDefenseTurn(state, "deploy_archer", "top:2");

    expect(next.guards).toHaveLength(1);
    expect(next.guards[0]).toMatchObject({ unitType: "archer", lane: "top", range: 2, hp: 16, maxHp: 16 });
    expect(next.enemies.find((enemy) => enemy.id === "far")?.hp).toBe(22);
    expect(actionState(next, "deploy_archer").charges).toBe(1);
    expect(actionState(next, "deploy_archer").currentCooldown).toBe(4);
    expect(next.log.some((entry) => entry.title === "Deploy archer")).toBe(true);
    expect(next.log.some((entry) => entry.title === "Guard strike")).toBe(true);
  });

  it("lets archer defenders counterattack far enemies that melee guards cannot reach", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "far-raider", lane: "top", range: 5, moveSpeed: 0, hp: 30, maxHp: 30 })], ["bulwark"]),
      guards: [testGuard({ id: "archer-top", name: "Garrison archer", unitType: "archer", lane: "top", range: 2, hp: 16, maxHp: 16 })],
    };

    const next = resolveFortressDefenseTurn(state, "bulwark");

    expect(next.enemies.find((enemy) => enemy.id === "far-raider")?.hp).toBe(22);
    expect(next.log.some((entry) => entry.title === "Guard strike" && entry.detail.includes("fires at"))).toBe(true);
  });

  it("allows two deployed defenders in the same lane when their slots differ", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ range: 5, moveSpeed: 0 })], ["deploy_guard"]),
      guards: [testGuard({ id: "guard-top", lane: "top", range: 1 })],
    };

    const next = resolveFortressDefenseTurn(state, "deploy_guard", "top:2");

    expect(next.guards).toHaveLength(2);
    expect(next.guards.map((guard) => `${guard.lane}:${guard.range}`)).toEqual(["top:1", "top:2"]);
  });

  it("does not deploy two defenders in the same slot", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ range: 5, moveSpeed: 0 })], ["deploy_guard"]),
      guards: [testGuard({ id: "guard-top", lane: "top", range: 1 })],
    };

    const next = resolveFortressDefenseTurn(state, "deploy_guard", "top:1");

    expect(next).toBe(state);
  });

  it("requires Shadow Trap to target a valid R2-R4 slot", () => {
    const state = testState([testEnemy({ id: "far", lane: "top", range: 5, moveSpeed: 0 })], ["traps"]);

    const noTarget = resolveFortressDefenseTurn(state, "traps");
    const badRange = resolveFortressDefenseTurn(state, "traps", "top:1");
    const next = resolveFortressDefenseTurn(state, "traps", "top:3");

    expect(noTarget).toBe(state);
    expect(badRange).toBe(state);
    expect(next.traps).toHaveLength(1);
    expect(next.traps[0]).toMatchObject({ lane: "top", range: 3, damage: 22, slow: 1, stun: 2 });
    expect(next.enemies[0].hp).toBe(30);
    expect(next.log.some((entry) => entry.title === "Shadow trap")).toBe(true);
  });

  it("keeps traps separate from enemies and guards until a matching slot triggers", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "raider", lane: "top", range: 5, moveSpeed: 1 })], ["traps"]),
      guards: [testGuard({ id: "guard-mid", lane: "middle", range: 1 })],
    };

    const next = resolveFortressDefenseTurn(state, "traps", "top:4");

    expect(next.traps).toHaveLength(0);
    expect(next.guards).toHaveLength(1);
    expect(next.enemies).toHaveLength(1);
    expect(next.enemies[0]).toMatchObject({ lane: "top", range: 4, hp: 8, slowedTurns: 1, stunnedTurns: 2 });
    expect(next.log.some((entry) => entry.title === "Shadow trap sprung")).toBe(true);
  });

  it("lets existing traps spring during later enemy movement", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "raider", lane: "bottom", range: 5, moveSpeed: 1 })], ["war_chant"]),
      traps: [testTrap({ id: "trap-bottom", lane: "bottom", range: 4 })],
    };

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.traps).toHaveLength(0);
    expect(next.enemies[0]).toMatchObject({ range: 4, hp: 8, slowedTurns: 1, stunnedTurns: 2 });
  });

  it("prevents stunned enemies from moving or attacking while control remains", () => {
    const state = testState([testEnemy({ id: "stunned", range: 1, attackRange: 1, attackDamage: 12, stunnedTurns: 2 })], ["war_chant"]);

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.castleHp).toBe(state.castleHp);
    expect(next.enemies[0]).toMatchObject({ range: 1, stunnedTurns: 1 });
    expect(next.log.some((entry) => entry.detail.includes("is stunned"))).toBe(true);
  });

  it("does not resolve Castle Shot without a valid manual target", () => {
    const state = testState([testEnemy({ id: "front", hp: 30, maxHp: 30, range: 5, moveSpeed: 0 })], ["castle_shot"]);

    const noTarget = resolveFortressDefenseTurn(state, "castle_shot");
    const badTarget = resolveFortressDefenseTurn(state, "castle_shot", "missing");

    expect(noTarget).toBe(state);
    expect(badTarget).toBe(state);
  });

  it("makes Volley damage multiple enemies and then all survivors advance", () => {
    const state = testState([
      testEnemy({ id: "a", hp: 30, maxHp: 30, range: 5, moveSpeed: 1 }),
      testEnemy({ id: "b", hp: 28, maxHp: 28, range: 4, moveSpeed: 1, armor: 1 }),
    ], ["volley"]);

    const next = resolveFortressDefenseTurn(state, "volley");

    expect(next.enemies.find((enemy) => enemy.id === "a")?.hp).toBe(18);
    expect(next.enemies.find((enemy) => enemy.id === "b")?.hp).toBe(17);
    expect(next.enemies.find((enemy) => enemy.id === "a")?.range).toBe(4);
    expect(next.enemies.find((enemy) => enemy.id === "b")?.range).toBe(3);
    expect(next.log.filter((entry) => entry.title === "Enemy advance")).toHaveLength(2);
  });

  it("advances all lanes consistently after target and area orders", () => {
    const lanes: FortressDefenseEnemy["lane"][] = ["top", "middle", "bottom"];
    const enemies = lanes.map((lane, index) => testEnemy({ id: lane, lane, range: 5, moveSpeed: 1, hp: 40, maxHp: 40 }));
    const targetState = testState(enemies, ["castle_shot"]);
    const areaState = testState(enemies, ["volley"]);

    const afterTarget = resolveFortressDefenseTurn(targetState, "castle_shot", "top");
    const afterArea = resolveFortressDefenseTurn(areaState, "volley");

    expect(afterTarget.enemies.map((enemy) => [enemy.id, enemy.range])).toEqual([
      ["top", 4],
      ["middle", 4],
      ["bottom", 4],
    ]);
    expect(afterArea.enemies.map((enemy) => [enemy.id, enemy.range])).toEqual([
      ["top", 4],
      ["middle", 4],
      ["bottom", 4],
    ]);
  });

  it("lets Bulwark absorb incoming damage", () => {
    const state = testState([testEnemy({ range: 1, attackDamage: 12 })], ["bulwark"]);

    const next = resolveFortressDefenseTurn(state, "bulwark");

    expect(next.castleHp).toBe(state.castleHp);
    expect(next.shield).toBe(28);
  });

  it("lets Bulwark absorb multiple attacks from the shield pool", () => {
    const state = testState([
      testEnemy({ id: "a", range: 1, attackDamage: 12 }),
      testEnemy({ id: "b", range: 1, attackDamage: 14 }),
    ], ["bulwark"]);

    const next = resolveFortressDefenseTurn(state, "bulwark");

    expect(next.castleHp).toBe(state.castleHp);
    expect(next.shield).toBe(14);
  });

  it("lets Bulwark shield deployed defenders for a smaller amount", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "raider", range: 1, attackRange: 1, attackDamage: 12, moveSpeed: 0 })], ["bulwark"]),
      guards: [testGuard({ id: "guard-middle", lane: "middle", range: 1 })],
    };

    const next = resolveFortressDefenseTurn(state, "bulwark");

    expect(next.castleHp).toBe(state.castleHp);
    expect(next.shield).toBe(40);
    expect(next.guards[0].hp).toBe(24);
    expect(next.guards[0].shield).toBe(2);
  });

  it("lets overflow damage pass through shield after the pool is spent", () => {
    const state = { ...testState([testEnemy({ range: 1, attackDamage: 12 })], ["war_chant"]), shield: 5 };

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.shield).toBe(0);
    expect(next.castleHp).toBe(state.castleHp - 7);
  });

  it("lets Mend heal without exceeding max castle life", () => {
    const state = { ...testState([testEnemy({ range: 5, moveSpeed: 0 })], ["mend"]), castleHp: 95, maxCastleHp: 100 };

    const next = resolveFortressDefenseTurn(state, "mend");

    expect(next.castleHp).toBe(100);
  });

  it("lets Mend heal deployed defenders even when castle life is full", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ range: 5, moveSpeed: 0 })], ["mend"]),
      castleHp: 100,
      maxCastleHp: 100,
      guards: [testGuard({ id: "wounded", hp: 8, maxHp: 24 })],
    };

    const next = resolveFortressDefenseTurn(state, "mend");

    expect(next.guards.find((guard) => guard.id === "wounded")?.hp).toBe(22);
    expect(actionState(next, "mend").charges).toBe(1);
  });

  it("makes War Chant inspire deployed defenders for stronger strikes", () => {
    const state: FortressDefenseState = {
      ...testState([testEnemy({ id: "far-raider", lane: "top", range: 3, moveSpeed: 0, hp: 30, maxHp: 30 })], ["war_chant"]),
      guards: [testGuard({ id: "guard-top", lane: "top", range: 2 })],
    };

    const next = resolveFortressDefenseTurn(state, "war_chant");

    expect(next.morale).toBe(6);
    expect(next.enemies.find((enemy) => enemy.id === "far-raider")?.hp).toBe(14);
    expect(next.guards.find((guard) => guard.id === "guard-top")?.inspiredTurns).toBe(1);
  });

  it("makes Mend consume charges and refuse use when empty", () => {
    const state = { ...testState([testEnemy({ range: 5, moveSpeed: 0 })], ["mend", "war_chant"]), castleHp: 50, maxCastleHp: 100 };

    const afterMend = resolveFortressDefenseTurn(state, "mend");
    const noChargesState: FortressDefenseState = {
      ...afterMend,
      actionStates: {
        ...afterMend.actionStates,
        mend: { currentCooldown: 0, charges: 0, maxCharges: 2 },
      },
    };
    const blockedMend = resolveFortressDefenseTurn(noChargesState, "mend");

    expect(afterMend.castleHp).toBe(80);
    expect(actionState(afterMend, "mend").charges).toBe(1);
    expect(actionState(afterMend, "mend").currentCooldown).toBe(4);
    expect(actionState(noChargesState, "mend").disabledReason).toBe("charges");
    expect(blockedMend).toBe(noChargesState);
  });

  it("does not let defeated enemies advance or attack", () => {
    const state = testState([
      testEnemy({ id: "doomed", hp: 5, maxHp: 5, range: 1, attackDamage: 99 }),
      testEnemy({ id: "backline", range: 5, moveSpeed: 0 }),
    ], ["castle_shot"]);

    const next = resolveFortressDefenseTurn(state, "castle_shot", "doomed");

    expect(next.enemies.some((enemy) => enemy.id === "doomed")).toBe(false);
    expect(next.defeated).toBe(1);
    expect(next.castleHp).toBe(state.castleHp);
  });

  it("resolves turns without mutating the previous state", () => {
    const fortress = createDefaultFrontlineFortress();
    const state = createFortressDefenseState({
      fortress,
      accountLevel: 1,
      heroProfiles: createFrontlineHeroProfileMap(heroes),
      now: new Date("2026-05-21T10:05:00.000Z"),
    });

    const next = resolveFortressDefenseTurn({ ...state, castleHp: state.maxCastleHp - 10 }, "mend");

    expect(next.turn).toBe(1);
    expect(state.turn).toBe(0);
    expect(next.defeated).toBeGreaterThanOrEqual(0);
    expect(next.castleHp).toBeLessThanOrEqual(next.maxCastleHp);
    expect(state.enemies[0].range).toBeGreaterThanOrEqual(4);
  });

  it("produces a bounded claim payload after the defense finishes", () => {
    const state = resolveFortressDefenseTurn({
      ...testState([testEnemy({ id: "last-raider", hp: 5, maxHp: 5, range: 5, moveSpeed: 0 })], ["castle_shot"]),
      wave: 3,
      maxWaves: 3,
    }, "castle_shot", "last-raider");

    expect(state.status).not.toBe("active");
    const payload = createFortressDefenseClaimPayload(state);
    expect(payload.defenseSummary.seed).toBe(payload.battleSeed);
    expect(payload.defenseSummary.outcome).toBe(payload.outcome);
    expect(payload.turns).toBeGreaterThan(0);
    expect(payload.defenseSummary.actionLog.length).toBeLessThanOrEqual(40);
  });
});
