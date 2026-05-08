import type { Pos } from "./types";

// 4x5 board: enemies in rows 0-1, allies in rows 3-4. Two empty rows between
// sides keeps combat short (reach in 1-2 turns) but still tactical.
export const GRID_W = 4;
export const GRID_H = 5;

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
