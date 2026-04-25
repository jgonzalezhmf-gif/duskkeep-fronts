// Ultra-light tower-defense engine.
// Lane-based: player units sit on column 0 (the wall) per lane.
// Enemies spawn on the last column and step left each tick.
// Units auto-attack the nearest enemy in their own lane.
// If an enemy reaches column 0, it deals damage to the castle and vanishes.
// The run ends when all waves are defeated (win) or the castle falls (loss).

import { getHero } from "@/data/heroes";
import { computeUnit } from "@/features/battle/engine";
import type { TDEventDef } from "@/data/towerDefense";
import type { Hero } from "@/lib/types";

export type TDUnit = {
  uid: string;
  hero: Hero;
  lane: number;
  // For player units, lane position is fixed at column 0.
  // For enemies, col is the current column along the lane (0 = wall).
  col: number;
  maxHp: number;
  hp: number;
  atk: number;
  spd: number;
  cooldown: number;
  isEnemy: boolean;
};

export type TDState = {
  def: TDEventDef;
  lanes: number;
  laneLength: number;
  units: TDUnit[]; // both players and enemies
  castleHp: number;
  maxCastleHp: number;
  tick: number;
  waveIdx: number;
  spawnQueue: { heroId: string; level: number; lane: number; tickToSpawn: number }[];
  phase: "prep" | "wave" | "won" | "lost";
  log: string[];
};

type TeamEntry = { heroId: string; level: number; stars: number };

let uidCounter = 0;
const mkUid = () => `u${++uidCounter}`;

export function initTD(def: TDEventDef, allies: TeamEntry[]): TDState {
  uidCounter = 0;
  const players: TDUnit[] = allies.slice(0, def.lanes).map((a, idx) => {
    const base = computeUnit(getHero(a.heroId), a.level, a.stars, "ally", idx);
    return {
      uid: mkUid(),
      hero: getHero(a.heroId),
      lane: idx,
      col: 0,
      maxHp: base.maxHp,
      hp: base.maxHp,
      atk: base.atk,
      spd: base.spd,
      cooldown: 0,
      isEnemy: false,
    };
  });
  const spawnQueue = buildWaveSpawns(def, 0);
  return {
    def,
    lanes: def.lanes,
    laneLength: def.laneLength,
    units: players,
    castleHp: def.castleHp,
    maxCastleHp: def.castleHp,
    tick: 0,
    waveIdx: 0,
    spawnQueue,
    phase: "prep",
    log: [`Wave 1 incoming…`],
  };
}

function buildWaveSpawns(def: TDEventDef, waveIdx: number) {
  const w = def.waves[waveIdx];
  if (!w) return [];
  return w.enemies.map((e, i) => ({
    heroId: e.heroId,
    level: e.level,
    lane: i % def.lanes,
    tickToSpawn: e.delay + def.waves[waveIdx].preparationTicks,
  }));
}

function spawnEnemy(
  state: TDState,
  heroId: string,
  level: number,
  lane: number,
): TDUnit {
  const hero = getHero(heroId);
  const base = computeUnit(hero, level, 1, "enemy", state.units.length);
  // Reduce enemy HP a touch so TD feels fair.
  const hp = Math.round(base.maxHp * 0.65);
  const u: TDUnit = {
    uid: mkUid(),
    hero,
    lane,
    col: state.laneLength - 1,
    maxHp: hp,
    hp,
    atk: Math.round(base.atk * 0.6),
    spd: base.spd,
    cooldown: 0,
    isEnemy: true,
  };
  state.units.push(u);
  return u;
}

export function stepTD(prev: TDState): TDState {
  if (prev.phase === "won" || prev.phase === "lost") return prev;

  const state: TDState = {
    ...prev,
    units: prev.units.map((u) => ({ ...u })),
    log: [...prev.log],
    spawnQueue: prev.spawnQueue.map((s) => ({ ...s })),
  };
  state.tick += 1;

  // 1) spawn scheduled enemies
  const remaining: typeof state.spawnQueue = [];
  for (const s of state.spawnQueue) {
    if (s.tickToSpawn <= state.tick) spawnEnemy(state, s.heroId, s.level, s.lane);
    else remaining.push(s);
  }
  state.spawnQueue = remaining;
  if (state.spawnQueue.length > 0 || state.units.some((u) => u.isEnemy && u.hp > 0)) {
    state.phase = "wave";
  }

  // 2) move enemies toward wall
  for (const u of state.units) {
    if (!u.isEnemy || u.hp <= 0) continue;
    // Is there a player unit to fight in col 1? If adjacent to wall (col 1 or 0), attack instead of moving
    const defender = state.units.find(
      (p) => !p.isEnemy && p.hp > 0 && p.lane === u.lane && p.col === 0,
    );
    if (defender && u.col <= 1) {
      const dmg = Math.max(1, u.atk - Math.round(defender.hp * 0.01));
      defender.hp = Math.max(0, defender.hp - dmg);
      state.log.push(`Enemy hits ${defender.hero.name} (-${dmg})`);
      if (defender.hp === 0) state.log.push(`${defender.hero.name} falls!`);
      continue;
    }
    // no defender adjacent — march
    if (u.col > 0) {
      u.col -= 1;
    } else {
      // reached the castle
      const dmg = Math.max(5, u.atk);
      state.castleHp = Math.max(0, state.castleHp - dmg);
      u.hp = 0;
      state.log.push(`Castle struck (-${dmg})`);
    }
  }

  // 3) player units attack nearest enemy in lane
  for (const p of state.units) {
    if (p.isEnemy || p.hp <= 0) continue;
    if (p.cooldown > 0) {
      p.cooldown -= 1;
      continue;
    }
    const enemies = state.units.filter(
      (e) => e.isEnemy && e.hp > 0 && e.lane === p.lane,
    );
    if (enemies.length === 0) continue;
    enemies.sort((a, b) => a.col - b.col); // closest (smallest col) first
    const target = enemies[0];
    const dmg = Math.max(1, p.atk);
    target.hp = Math.max(0, target.hp - dmg);
    state.log.push(`${p.hero.name} → ${target.hero.name} (-${dmg})`);
    // AOE mages hit the next enemy lightly
    if (p.hero.role === "mage" && enemies[1]) {
      const splash = Math.round(dmg * 0.5);
      enemies[1].hp = Math.max(0, enemies[1].hp - splash);
    }
    // Simple cooldown after attack based on speed — fast heroes fire every tick
    p.cooldown = p.spd >= 110 ? 0 : 1;
  }

  // 4) cull dead for size
  state.units = state.units.filter((u) => u.hp > 0 || !u.isEnemy);

  // 5) evaluate state
  if (state.castleHp <= 0) {
    state.phase = "lost";
    state.log.push(`Castle has fallen.`);
    return state;
  }

  const waveCleared =
    state.spawnQueue.length === 0 && !state.units.some((u) => u.isEnemy && u.hp > 0);
  if (waveCleared) {
    const next = state.waveIdx + 1;
    if (next >= state.def.waves.length) {
      state.phase = "won";
      state.log.push(`All waves cleared!`);
    } else {
      state.waveIdx = next;
      state.spawnQueue = buildWaveSpawns(state.def, next);
      state.phase = "prep";
      state.log.push(`Wave ${next + 1} incoming…`);
    }
  }

  // keep log short
  if (state.log.length > 12) state.log = state.log.slice(-12);

  return state;
}
