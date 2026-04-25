// Pure-ish tactical engine. Each action returns a new state (cloned).
// UI calls selectUnit → performMove / performAttack / performAbility / endUnitTurn.
// After enemy side auto-plays via runEnemySide.

import { computeUnit } from "@/features/battle/engine";
import { getHero } from "@/data/heroes";
import { MAX_SKILL_LEVEL, SKILL_COOLDOWN_REDUCTION_AT_MAX, SKILL_MULTIPLIER_BONUS } from "@/lib/constants";
import { getTacticalProfile } from "./heroes";
import type {
  ActionMode,
  Pos,
  TacticalAbility,
  TacticalInit,
  TacticalState,
  TacticalUnit,
} from "./types";
import { posKey } from "./types";

// 4×5 board: enemies in rows 0-1, allies in rows 3-4. Two empty rows between
// sides keeps combat short (reach in 1-2 turns) but still tactical.
export const GRID_W = 4;
export const GRID_H = 5;

function flashTick() {
  return Date.now() + Math.random();
}

export function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

export function manhattan(a: Pos, b: Pos): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function inBounds(p: Pos, w: number, h: number): boolean {
  return p.x >= 0 && p.y >= 0 && p.x < w && p.y < h;
}

export function neighbors4(p: Pos): Pos[] {
  return [
    { x: p.x + 1, y: p.y },
    { x: p.x - 1, y: p.y },
    { x: p.x, y: p.y + 1 },
    { x: p.x, y: p.y - 1 },
  ];
}

// --- init ---------------------------------------------------------------

export function initTactical(input: TacticalInit): TacticalState {
  const allies = input.allies.slice(0, 3);
  const enemies = input.enemies.slice(0, 3);
  const units: TacticalUnit[] = [];

  // 3 columns out of 4: left, center, right.
  const cols = [0, 1, 3];

  allies.forEach((a, i) => units.push(buildUnit(a, "ally", i, { x: cols[i], y: mapAllyRow(a.heroId) })));
  enemies.forEach((e, i) => units.push(buildUnit(e, "enemy", i, { x: cols[i], y: mapEnemyRow(e.heroId) })));

  // Resolve placement collisions (in case cols collide)
  const occupied = new Map<string, TacticalUnit>();
  for (const u of units) {
    while (occupied.has(posKey(u.pos)) || !inBounds(u.pos, GRID_W, GRID_H)) {
      u.pos = { x: (u.pos.x + 1) % GRID_W, y: u.pos.y };
    }
    occupied.set(posKey(u.pos), u);
  }

  return {
    grid: { w: GRID_W, h: GRID_H },
    obstacles: input.obstacles ?? [],
    units,
    round: 1,
    side: "ally",
    selectedUid: null,
    mode: "idle",
    log: ["— Round 1 —"],
    winner: null,
    seed: input.seed,
  };
}

function mapAllyRow(heroId: string): number {
  const p = getTacticalProfile(heroId);
  return p.frontline ? GRID_H - 2 : GRID_H - 1;
}
function mapEnemyRow(heroId: string): number {
  const p = getTacticalProfile(heroId);
  return p.frontline ? 1 : 0;
}

export function buildUnit(
  src: { heroId: string; level: number; stars: number; skillLevel?: number },
  side: "ally" | "enemy",
  idx: number,
  pos: Pos,
): TacticalUnit {
  const hero = getHero(src.heroId);
  const prof = getTacticalProfile(src.heroId);
  const sl = src.skillLevel ?? 1;
  const scaled = computeUnit(hero, src.level, src.stars, side, idx, sl);
  return {
    uid: `${side}_${idx}_${hero.id}`,
    side,
    heroId: hero.id,
    level: src.level,
    stars: src.stars,
    skillLevel: sl,
    name: hero.name,
    emoji: hero.emoji,
    rarity: hero.rarity,
    role: hero.role,
    pos,
    hp: scaled.maxHp,
    maxHp: scaled.maxHp,
    atk: scaled.atk,
    def: scaled.def,
    move: prof.move,
    range: prof.range,
    ability: prof.ability,
    cooldown: side === "enemy" ? Math.ceil(prof.ability.cooldown / 2) : 0,
    buffs: { atkPct: 0, atkTurns: 0, defPct: 0, defTurns: 0, shield: 0, stun: 0 },
    hasMoved: false,
    hasActed: false,
    alive: true,
  };
}

// --- queries ------------------------------------------------------------

export function unitAt(state: TacticalState, p: Pos): TacticalUnit | undefined {
  return state.units.find((u) => u.alive && u.pos.x === p.x && u.pos.y === p.y);
}

export function unit(state: TacticalState, uid: string | null | undefined): TacticalUnit | undefined {
  if (!uid) return undefined;
  return state.units.find((u) => u.uid === uid);
}

export function getReachable(state: TacticalState, uid: string): Pos[] {
  const u = unit(state, uid);
  if (!u || !u.alive) return [];
  if (u.hasMoved) return [];
  if (u.buffs.stun > 0) return [];

  const blocked = new Set<string>();
  for (const o of state.units) {
    if (o.alive && o.uid !== u.uid) blocked.add(posKey(o.pos));
  }
  for (const o of state.obstacles) blocked.add(posKey(o));

  const visited = new Map<string, number>();
  visited.set(posKey(u.pos), 0);
  const queue: Pos[] = [u.pos];
  while (queue.length) {
    const cur = queue.shift()!;
    const d = visited.get(posKey(cur))!;
    if (d >= u.move) continue;
    for (const n of neighbors4(cur)) {
      if (!inBounds(n, state.grid.w, state.grid.h)) continue;
      if (blocked.has(posKey(n))) continue;
      if (visited.has(posKey(n))) continue;
      visited.set(posKey(n), d + 1);
      queue.push(n);
    }
  }
  const out: Pos[] = [];
  for (const [k, d] of visited) {
    if (d === 0) continue;
    const [x, y] = k.split(",").map(Number);
    out.push({ x, y });
  }
  return out;
}

export function getAttackTargets(state: TacticalState, uid: string, from?: Pos): TacticalUnit[] {
  const u = unit(state, uid);
  if (!u || !u.alive || u.hasActed) return [];
  if (u.buffs.stun > 0) return [];
  const origin = from ?? u.pos;
  return state.units.filter(
    (o) => o.alive && o.side !== u.side && manhattan(origin, o.pos) <= u.range,
  );
}

export function getAbilityTiles(state: TacticalState, uid: string): Pos[] {
  const u = unit(state, uid);
  if (!u || !u.alive || u.hasActed || u.cooldown > 0 || u.buffs.stun > 0) return [];
  const ab = u.ability;
  if (ab.kind === "buff_atk_self" || ab.kind === "shield_self") return [u.pos];
  const tiles: Pos[] = [];
  for (let x = 0; x < state.grid.w; x++) {
    for (let y = 0; y < state.grid.h; y++) {
      if (manhattan(u.pos, { x, y }) <= ab.range) tiles.push({ x, y });
    }
  }
  return tiles;
}

export function abilityAoeTiles(state: TacticalState, ab: TacticalAbility, target: Pos): Pos[] {
  const r = ab.radius ?? 0;
  if (r === 0 || (ab.kind !== "dmg_aoe" && ab.kind !== "heal_aoe")) return [target];
  const tiles: Pos[] = [];
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      if (Math.abs(dx) + Math.abs(dy) > r) continue;
      const p = { x: target.x + dx, y: target.y + dy };
      if (inBounds(p, state.grid.w, state.grid.h)) tiles.push(p);
    }
  }
  return tiles;
}

// --- actions ------------------------------------------------------------

export function selectUnit(state: TacticalState, uid: string | null, mode: ActionMode = "idle"): TacticalState {
  const next = clone(state);
  next.selectedUid = uid;
  next.mode = uid ? (mode === "idle" ? "move" : mode) : "idle";
  return next;
}

export function setMode(state: TacticalState, mode: ActionMode): TacticalState {
  const next = clone(state);
  next.mode = mode;
  return next;
}

export function performMove(state: TacticalState, uid: string, to: Pos): TacticalState {
  const next = clone(state);
  const u = unit(next, uid);
  if (!u || !u.alive || u.hasMoved || u.side !== next.side) return state;
  const reachable = getReachable(state, uid);
  if (!reachable.some((p) => p.x === to.x && p.y === to.y)) return state;
  u.pos = to;
  u.hasMoved = true;
  next.log.push(`${u.name} moves.`);
  next.mode = "attack"; // after moving, suggest next action
  return next;
}

export function performAttack(state: TacticalState, attackerUid: string, targetUid: string): TacticalState {
  const next = clone(state);
  const att = unit(next, attackerUid);
  const tgt = unit(next, targetUid);
  if (!att || !tgt || !att.alive || !tgt.alive) return state;
  if (att.side !== next.side) return state;
  if (att.hasActed) return state;
  if (manhattan(att.pos, tgt.pos) > att.range) return state;

  // Basic attacks bite harder now so the early game resolves faster.
  const dmg = computeDamage(att, tgt, 1.35);
  applyDamageTo(next, tgt, dmg);
  att.hasActed = true;
  att.hasMoved = true;
  next.log.push(`${att.name} → ${tgt.name} ${dmg} dmg`);
  if (!tgt.alive) next.log.push(`${tgt.name} falls.`);
  next.flash = {
    uid: tgt.uid,
    kind: tgt.alive ? "hit" : "death",
    amount: dmg,
    label: tgt.alive ? "Strike" : "KO",
    t: flashTick(),
  };
  autoEndIfDone(next);
  return next;
}

export function performAbility(state: TacticalState, uid: string, target: Pos): TacticalState {
  const next = clone(state);
  const u = unit(next, uid);
  if (!u || !u.alive || u.hasActed || u.cooldown > 0 || u.buffs.stun > 0) return state;
  if (u.side !== next.side) return state;
  const ab = u.ability;
  if (manhattan(u.pos, target) > ab.range && ab.range > 0) return state;
  applyAbility(next, u, target);
  // Skill enhancement at max level: reduce cooldown by 1
  let cd = ab.cooldown;
  if (u.skillLevel >= MAX_SKILL_LEVEL && cd > 1) cd -= SKILL_COOLDOWN_REDUCTION_AT_MAX;
  u.cooldown = cd;
  u.hasActed = true;
  u.hasMoved = true;
  next.mode = "idle";
  next.selectedUid = null;
  autoEndIfDone(next);
  return next;
}

export function endUnitTurn(state: TacticalState, uid: string): TacticalState {
  const next = clone(state);
  const u = unit(next, uid);
  if (!u) return state;
  u.hasActed = true;
  u.hasMoved = true;
  next.selectedUid = null;
  next.mode = "idle";
  autoEndIfDone(next);
  return next;
}

// End whole ally side turn — used to trigger enemy AI synchronously on demand
export function endSideTurn(state: TacticalState): TacticalState {
  if (state.side !== "ally") return state;
  const next = clone(state);
  for (const u of next.units) {
    if (u.side === "ally" && u.alive) {
      u.hasActed = true;
      u.hasMoved = true;
    }
  }
  next.selectedUid = null;
  next.mode = "idle";
  return advanceToEnemySide(next);
}

// If all ally units are done, switch to enemy side automatically.
function autoEndIfDone(state: TacticalState): void {
  if (state.winner) return;
  if (state.side !== "ally") return;
  const anyAlly = state.units.some((u) => u.side === "ally" && u.alive && !u.hasActed && u.buffs.stun === 0);
  if (!anyAlly) {
    Object.assign(state, advanceToEnemySide(state));
  }
}

function advanceToEnemySide(state: TacticalState): TacticalState {
  const next = clone(state);
  next.side = "enemy";
  next.selectedUid = null;
  next.mode = "idle";
  next.log.push("Enemy's turn.");
  return next;
}

export function startNewRound(state: TacticalState): TacticalState {
  const next = clone(state);
  for (const u of next.units) {
    if (!u.alive) continue;
    u.hasActed = false;
    u.hasMoved = false;
    if (u.cooldown > 0) u.cooldown -= 1;
    if (u.buffs.atkTurns > 0) {
      u.buffs.atkTurns -= 1;
      if (u.buffs.atkTurns === 0) u.buffs.atkPct = 0;
    }
    if (u.buffs.defTurns > 0) {
      u.buffs.defTurns -= 1;
      if (u.buffs.defTurns === 0) u.buffs.defPct = 0;
    }
    if (u.buffs.stun > 0) u.buffs.stun -= 1;
    if (u.buffs.shield > 0) {
      const decayed = Math.floor(u.buffs.shield * 0.55);
      u.buffs.shield = decayed <= 6 ? 0 : decayed;
    }
  }
  next.round += 1;
  next.side = "ally";
  next.log.push(`— Round ${next.round} —`);
  return next;
}

// --- damage / effects ---------------------------------------------------

function computeDamage(att: TacticalUnit, tgt: TacticalUnit, multiplier: number): number {
  const eatk = att.atk * (1 + att.buffs.atkPct);
  const edef = tgt.def * (1 + tgt.buffs.defPct) * 0.72;
  const skillBonus = (att.skillLevel - 1) * SKILL_MULTIPLIER_BONUS;
  return Math.max(1, Math.round(eatk * (multiplier + skillBonus) * (12 / (12 + edef))));
}

export function grantShield(tgt: TacticalUnit, raw: number, mode: "refresh" | "stack" = "refresh") {
  const amount = Math.max(0, Math.round(raw));
  if (amount <= 0) return 0;
  const before = tgt.buffs.shield;
  const cap = Math.max(10, Math.round(tgt.maxHp * 0.28));
  const nextShield = mode === "stack" ? before + amount : Math.max(before, amount);
  tgt.buffs.shield = Math.min(cap, nextShield);
  return tgt.buffs.shield - before;
}

function applyDamageTo(state: TacticalState, tgt: TacticalUnit, raw: number) {
  let dmg = raw;
  if (tgt.buffs.shield > 0) {
    const abs = Math.min(tgt.buffs.shield, dmg);
    tgt.buffs.shield -= abs;
    dmg -= abs;
  }
  tgt.hp = Math.max(0, tgt.hp - dmg);
  if (tgt.hp === 0) tgt.alive = false;
  recomputeWinner(state);
}

function applyHealTo(state: TacticalState, tgt: TacticalUnit, amount: number): number {
  if (!tgt.alive) return 0;
  const before = tgt.hp;
  tgt.hp = Math.min(tgt.maxHp, tgt.hp + amount);
  return tgt.hp - before;
}

function applyAbility(state: TacticalState, caster: TacticalUnit, target: Pos) {
  const ab = caster.ability;
  state.log.push(`${caster.name} uses ${ab.name}.`);

  switch (ab.kind) {
    case "dmg_single": {
      const t = unitAt(state, target);
      if (!t || t.side === caster.side) return;
      const dmg = computeDamage(caster, t, ab.power ?? 2);
      applyDamageTo(state, t, dmg);
      state.log.push(`→ ${dmg} to ${t.name}`);
      state.flash = {
        uid: t.uid,
        kind: t.alive ? "ability" : "death",
        amount: dmg,
        label: t.alive ? ab.name : "KO",
        t: flashTick(),
      };
      break;
    }
    case "dmg_aoe": {
      const tiles = abilityAoeTiles(state, ab, target);
      let totalDmg = 0;
      let lastUid: string | undefined;
      for (const p of tiles) {
        const t = unitAt(state, p);
        if (!t || t.side === caster.side) continue;
        const dmg = computeDamage(caster, t, ab.power ?? 1.2);
        applyDamageTo(state, t, dmg);
        state.log.push(`→ ${dmg} to ${t.name}`);
        totalDmg += dmg;
        lastUid = t.uid;
      }
      if (lastUid) {
        const lastTarget = unit(state, lastUid);
        state.flash = {
          uid: lastUid,
          kind: lastTarget?.alive === false ? "death" : "ability",
          amount: totalDmg,
          label: lastTarget?.alive === false ? "KO" : ab.name,
          t: flashTick(),
        };
      }
      break;
    }
    case "heal_aoe": {
      const tiles = abilityAoeTiles(state, ab, target);
      const amount = Math.round(caster.atk * (ab.power ?? 2));
      let totalGained = 0;
      let lastUid: string | undefined;
      for (const p of tiles) {
        const t = unitAt(state, p);
        if (!t || t.side !== caster.side) continue;
        const gained = applyHealTo(state, t, amount);
        if (gained > 0) {
          state.log.push(`+${gained} HP → ${t.name}`);
          totalGained += gained;
          lastUid = t.uid;
        }
      }
      if (lastUid) {
        state.flash = { uid: lastUid, kind: "heal", amount: totalGained, label: ab.name, t: flashTick() };
      }
      break;
    }
    case "buff_atk_self": {
      caster.buffs.atkPct = Math.max(caster.buffs.atkPct, ab.power ?? 0.4);
      caster.buffs.atkTurns = Math.max(caster.buffs.atkTurns, ab.turns ?? 2);
      state.log.push(`${caster.name} +ATK`);
      state.flash = {
        uid: caster.uid,
        kind: "buff",
        amount: Math.round((ab.power ?? 0.4) * 100),
        label: ab.name,
        t: flashTick(),
      };
      break;
    }
    case "shield_self": {
      const amt = Math.round(caster.maxHp * (ab.power ?? 0.4));
      const gained = grantShield(caster, amt);
      state.log.push(`${caster.name} shielded (${amt}).`);
      if (gained > 0) {
        state.flash = { uid: caster.uid, kind: "shield", amount: gained, label: ab.name, t: flashTick() };
      }
      break;
    }
    case "stun": {
      const t = unitAt(state, target);
      if (!t || t.side === caster.side) return;
      t.buffs.stun = Math.max(t.buffs.stun, ab.turns ?? 1);
      const dmg = computeDamage(caster, t, ab.power ?? 0.8);
      applyDamageTo(state, t, dmg);
      state.log.push(`${t.name} stunned (${dmg} dmg).`);
      state.flash = {
        uid: t.uid,
        kind: t.alive ? "ability" : "death",
        amount: dmg,
        label: t.alive ? ab.name : "KO",
        t: flashTick(),
      };
      break;
    }
    case "dash_strike": {
      const t = unitAt(state, target);
      if (!t || t.side === caster.side) return;
      // Teleport to a free adjacent tile next to target (not on obstacles)
      const blocked = new Set(state.obstacles.map((o) => `${o.x},${o.y}`));
      const spots = neighbors4(t.pos)
        .filter((p) => inBounds(p, state.grid.w, state.grid.h))
        .filter((p) => !unitAt(state, p))
        .filter((p) => !blocked.has(`${p.x},${p.y}`));
      if (spots.length > 0) {
        // prefer the tile closest to the caster's origin, stable
        spots.sort((a, b) => manhattan(a, caster.pos) - manhattan(b, caster.pos));
        caster.pos = spots[0];
      }
      const dmg = computeDamage(caster, t, ab.power ?? 2.5);
      applyDamageTo(state, t, dmg);
      state.log.push(`Dash → ${t.name} ${dmg} dmg`);
      state.flash = {
        uid: t.uid,
        kind: t.alive ? "ability" : "death",
        amount: dmg,
        label: t.alive ? ab.name : "KO",
        t: flashTick(),
      };
      break;
    }
  }
}

export function recomputeWinner(state: TacticalState) {
  const anyAlly = state.units.some((u) => u.side === "ally" && u.alive);
  const anyEnemy = state.units.some((u) => u.side === "enemy" && u.alive);
  if (!anyAlly && !anyEnemy) state.winner = "draw";
  else if (!anyAlly) state.winner = "enemy";
  else if (!anyEnemy) state.winner = "ally";
}

// --- team power (for match-making displays) -----------------------------

export function teamPower(team: { heroId: string; level: number; stars: number }[]): number {
  let p = 0;
  for (let i = 0; i < team.length; i++) {
    const h = getHero(team[i].heroId);
    const u = computeUnit(h, team[i].level, team[i].stars, "ally", i);
    p += u.power;
  }
  return Math.round(p);
}
