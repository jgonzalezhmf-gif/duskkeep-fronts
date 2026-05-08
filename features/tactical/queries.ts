import type { Pos, TacticalAbility, TacticalState, TacticalUnit } from "./types";
import { posKey } from "./types";
import { inBounds, manhattan, neighbors4 } from "./tacticalGrid";

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
