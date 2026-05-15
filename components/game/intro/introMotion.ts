type Point = { x: number; y: number };

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const interp = (from: Point, to: Point, t: number): Point => ({
  x: lerp(from.x, to.x, t),
  y: lerp(from.y, to.y, t),
});

export function introCameraScale(elapsedMs: number, reducedMotion: boolean): number {
  if (reducedMotion) return 1;
  if (elapsedMs < 3000) return lerp(1.4, 1.18, elapsedMs / 3000);
  if (elapsedMs < 7000) return lerp(1.18, 1.05, (elapsedMs - 3000) / 4000);
  if (elapsedMs < 11000) return lerp(1.05, 1.12, (elapsedMs - 7000) / 4000);
  if (elapsedMs < 15000) return lerp(1.12, 1.28, (elapsedMs - 11000) / 4000);
  if (elapsedMs < 19000) return lerp(1.28, 0.98, (elapsedMs - 15000) / 4000);
  if (elapsedMs < 22000) return lerp(0.98, 1.0, (elapsedMs - 19000) / 3000);
  return 1;
}

export function introCameraOrigin(elapsedMs: number, reducedMotion: boolean): Point {
  if (reducedMotion) return { x: 50, y: 55 };
  if (elapsedMs < 3000) return { x: 30, y: 30 };
  if (elapsedMs < 7000) return interp({ x: 30, y: 30 }, { x: 25, y: 28 }, (elapsedMs - 3000) / 4000);
  if (elapsedMs < 11000) return interp({ x: 25, y: 28 }, { x: 50, y: 68 }, (elapsedMs - 7000) / 4000);
  if (elapsedMs < 15000) return interp({ x: 50, y: 68 }, { x: 78, y: 56 }, (elapsedMs - 11000) / 4000);
  if (elapsedMs < 19000) return interp({ x: 78, y: 56 }, { x: 50, y: 78 }, (elapsedMs - 15000) / 4000);
  return interp({ x: 50, y: 78 }, { x: 50, y: 55 }, Math.min(1, (elapsedMs - 19000) / 3000));
}

export function introCameraDriftX(elapsedMs: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  if (elapsedMs < 3000) return -20;
  if (elapsedMs < 7000) return lerp(-20, -36, (elapsedMs - 3000) / 4000);
  if (elapsedMs < 11000) return lerp(-36, 48, (elapsedMs - 7000) / 4000);
  if (elapsedMs < 15000) return lerp(48, 30, (elapsedMs - 11000) / 4000);
  if (elapsedMs < 19000) return lerp(30, 0, (elapsedMs - 15000) / 4000);
  return 0;
}

export function introCameraDriftY(elapsedMs: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  if (elapsedMs < 3000) return -28;
  if (elapsedMs < 7000) return lerp(-28, -8, (elapsedMs - 3000) / 4000);
  if (elapsedMs < 11000) return lerp(-8, 18, (elapsedMs - 7000) / 4000);
  if (elapsedMs < 15000) return lerp(18, 4, (elapsedMs - 11000) / 4000);
  return 0;
}

export function introFogOpacity(elapsedMs: number): number {
  if (elapsedMs < 1500) return Math.max(0, (elapsedMs - 500) / 1000) * 0.1;
  if (elapsedMs > 21500) return Math.max(0, 0.1 * (1 - (elapsedMs - 21500) / 1500));
  return 0.1;
}

export function introCrowOpacity(elapsedMs: number): number {
  if (elapsedMs < 4000 || elapsedMs > 7500) return 0;
  const local = (elapsedMs - 4000) / 3500;
  return 0.85 * Math.sin(Math.PI * Math.min(1, local));
}

export function introCrowProgress(elapsedMs: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0.5;
  if (elapsedMs < 4000) return 0;
  if (elapsedMs > 7500) return 1;
  return (elapsedMs - 4000) / 3500;
}

export function introKeepGlow(elapsedMs: number): number {
  if (elapsedMs < 11000) return 0;
  if (elapsedMs > 15500) return Math.max(0, 1 - (elapsedMs - 15500) / 800);
  if (elapsedMs > 13500) return 1;
  return (elapsedMs - 11000) / 2500;
}

export function introBossOpacity(elapsedMs: number): number {
  if (elapsedMs < 15000 || elapsedMs > 19000) return 0;
  const local = (elapsedMs - 15000) / 4000;
  if (local < 0.25) return (local / 0.25) * 0.75;
  if (local < 0.7) return 0.75;
  return Math.max(0, 0.75 * (1 - (local - 0.7) / 0.3));
}

export function introBossScale(elapsedMs: number, reducedMotion: boolean): number {
  if (reducedMotion) return 1;
  if (elapsedMs < 15000 || elapsedMs > 19000) return 1.05;
  const local = (elapsedMs - 15000) / 4000;
  return 1.05 - 0.05 * Math.min(1, local);
}

export function introShake(elapsedMs: number, reducedMotion: boolean): Point {
  if (reducedMotion) return { x: 0, y: 0 };
  const hits = [
    { peakMs: 15400, decayMs: 360 },
    { peakMs: 16400, decayMs: 320 },
  ];
  let amp = 0;
  for (const hit of hits) {
    if (elapsedMs < hit.peakMs || elapsedMs > hit.peakMs + hit.decayMs) continue;
    const local = (elapsedMs - hit.peakMs) / hit.decayMs;
    amp = Math.max(amp, 1 - local);
  }
  if (amp <= 0) return { x: 0, y: 0 };
  return {
    x: Math.sin(elapsedMs / 24) * 2 * amp,
    y: Math.cos(elapsedMs / 31) * 1.5 * amp,
  };
}

export function introCrestOpacity(elapsedMs: number): number {
  if (elapsedMs < 21000) return 0;
  return Math.min(1, (elapsedMs - 21000) / 800);
}

export function introCrestScale(elapsedMs: number, reducedMotion: boolean): number {
  if (reducedMotion) return 1;
  if (elapsedMs < 21000) return 1.18;
  const local = elapsedMs - 21000;
  if (local >= 700) return 1;
  return 1.18 - 0.18 * (local / 700);
}

export function introGoldShineOpacity(elapsedMs: number): number {
  if (elapsedMs < 21000) return 0;
  const local = elapsedMs - 21000;
  const ramp = Math.min(1, local / 800);
  const pulse = 0.82 + 0.18 * Math.sin(local / 360);
  return ramp * pulse;
}

export function introLightningOpacity(ms: number): number {
  const flashes = [
    { peakMs: 2200, attackMs: 70, decayMs: 200, scale: 0.4 },
    { peakMs: 9500, attackMs: 60, decayMs: 220, scale: 0.6 },
    { peakMs: 16200, attackMs: 60, decayMs: 220, scale: 0.85 },
  ];
  let opacity = 0;
  for (const flash of flashes) {
    if (ms < flash.peakMs - flash.attackMs) continue;
    if (ms > flash.peakMs + flash.decayMs) continue;
    const local = ms - flash.peakMs;
    const value = local <= 0 ? 1 + local / flash.attackMs : 1 - local / flash.decayMs;
    opacity = Math.max(opacity, Math.max(0, Math.min(1, value)) * flash.scale);
  }
  return opacity;
}
