// Enemy AI: runs a full enemy-side turn. Simple but functional.
// Policy per unit:
// 1) If ability off cooldown and a good use exists → use it.
// 2) Else move toward nearest enemy (ally player unit) as far as we can,
//    then attack if in range.

import {
  abilityAoeTiles,
  clone,
  endUnitTurn,
  getAttackTargets,
  getReachable,
  manhattan,
  performAbility,
  performAttack,
  performMove,
  startNewRound,
  unit,
  unitAt,
} from "./engine";
import type { Pos, TacticalState, TacticalUnit } from "./types";

export function runEnemySide(state: TacticalState): TacticalState {
  if (state.winner) return state;
  if (state.side !== "enemy") return state;
  let s = clone(state);
  const order = s.units.filter((u) => u.side === "enemy" && u.alive).map((u) => u.uid);
  for (const uid of order) {
    if (s.winner) break;
    const u = unit(s, uid);
    if (!u || !u.alive) continue;
    if (u.hasActed) continue;
    if (u.buffs.stun > 0) {
      s = endUnitTurn(s, uid);
      continue;
    }
    s = aiActUnit(s, uid);
  }
  if (!s.winner) s = startNewRound(s);
  return s;
}

function aiActUnit(state: TacticalState, uid: string): TacticalState {
  let s = state;
  const u0 = unit(s, uid);
  if (!u0) return s;

  const enemies = () => s.units.filter((o) => o.alive && o.side !== u0.side);

  // --- 1) Ability opportunity (before moving) --------------------------
  const maybeAb = tryUseAbilityFrom(s, uid, u0.pos);
  if (maybeAb) {
    s = performAbility(s, uid, maybeAb);
    return s;
  }

  // --- 2) Attack from current pos --------------------------------------
  const inRange = getAttackTargets(s, uid, u0.pos);
  if (inRange.length > 0) {
    const t = pickAttackTarget(inRange);
    s = performAttack(s, uid, t.uid);
    return s;
  }

  // --- 3) Move toward nearest enemy ------------------------------------
  const targets = enemies();
  if (targets.length === 0) return endUnitTurn(s, uid);
  const nearest = pickClosest(u0.pos, targets);

  const reach = getReachable(s, uid);
  // include "stay" option
  let bestTile: Pos = u0.pos;
  let bestDist = manhattan(u0.pos, nearest.pos);
  for (const t of reach) {
    const d = manhattan(t, nearest.pos);
    if (d < bestDist) {
      bestDist = d;
      bestTile = t;
    }
  }
  if (bestTile.x !== u0.pos.x || bestTile.y !== u0.pos.y) {
    s = performMove(s, uid, bestTile);
  }

  // --- 4) After moving, try ability, then attack -----------------------
  const u1 = unit(s, uid);
  if (!u1) return s;

  const abPick = tryUseAbilityFrom(s, uid, u1.pos);
  if (abPick) {
    s = performAbility(s, uid, abPick);
    return s;
  }

  const targets2 = getAttackTargets(s, uid, u1.pos);
  if (targets2.length > 0) {
    const t = pickAttackTarget(targets2);
    s = performAttack(s, uid, t.uid);
    return s;
  }

  return endUnitTurn(s, uid);
}

function pickAttackTarget(arr: TacticalUnit[]): TacticalUnit {
  // prefer low hp, then back-line roles
  const order = [...arr].sort((a, b) => {
    if (a.hp !== b.hp) return a.hp - b.hp;
    const w = (u: TacticalUnit) =>
      ["archer", "mage", "support", "summoner"].includes(u.role) ? 0 : 1;
    return w(a) - w(b);
  });
  return order[0];
}

function pickClosest(p: Pos, arr: TacticalUnit[]): TacticalUnit {
  return [...arr].sort((a, b) => manhattan(p, a.pos) - manhattan(p, b.pos))[0];
}

// Returns target position (or null) for best ability use right now from `from`.
function tryUseAbilityFrom(state: TacticalState, uid: string, from: Pos): Pos | null {
  const u = unit(state, uid);
  if (!u) return null;
  if (u.cooldown > 0) return null;
  const ab = u.ability;

  switch (ab.kind) {
    case "buff_atk_self":
    case "shield_self":
      return u.pos;
    case "dmg_single": {
      const enemies = state.units.filter(
        (o) => o.alive && o.side !== u.side && manhattan(from, o.pos) <= ab.range,
      );
      if (enemies.length === 0) return null;
      const pick = pickAttackTarget(enemies);
      return pick.pos;
    }
    case "stun": {
      const enemies = state.units.filter(
        (o) => o.alive && o.side !== u.side && manhattan(from, o.pos) <= ab.range,
      );
      if (enemies.length === 0) return null;
      // prefer high-atk enemies (mages, archers)
      const order = enemies.sort((a, b) => b.atk - a.atk);
      return order[0].pos;
    }
    case "dash_strike": {
      const enemies = state.units.filter(
        (o) => o.alive && o.side !== u.side && manhattan(from, o.pos) <= ab.range,
      );
      if (enemies.length === 0) return null;
      const pick = pickAttackTarget(enemies);
      return pick.pos;
    }
    case "dmg_aoe": {
      // find tile in range that hits most enemies
      let best: { p: Pos; n: number } | null = null;
      for (let x = 0; x < state.grid.w; x++) {
        for (let y = 0; y < state.grid.h; y++) {
          const p = { x, y };
          if (manhattan(from, p) > ab.range) continue;
          const tiles = abilityAoeTiles(state, ab, p);
          const hits = tiles.reduce((n, t) => {
            const ut = unitAt(state, t);
            return n + (ut && ut.alive && ut.side !== u.side ? 1 : 0);
          }, 0);
          if (hits >= 2 && (!best || hits > best.n)) best = { p, n: hits };
          else if (hits === 1 && !best) best = { p, n: hits };
        }
      }
      return best?.p ?? null;
    }
    case "heal_aoe": {
      // find tile hitting most wounded allies
      let best: { p: Pos; score: number } | null = null;
      for (let x = 0; x < state.grid.w; x++) {
        for (let y = 0; y < state.grid.h; y++) {
          const p = { x, y };
          if (manhattan(from, p) > ab.range) continue;
          const tiles = abilityAoeTiles(state, ab, p);
          let score = 0;
          for (const t of tiles) {
            const ut = unitAt(state, t);
            if (!ut || ut.side !== u.side) continue;
            score += ut.maxHp - ut.hp;
          }
          if (score > 200 && (!best || score > best.score)) best = { p, score };
        }
      }
      return best?.p ?? null;
    }
  }
  return null;
}
