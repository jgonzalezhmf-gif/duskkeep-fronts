import { describe, expect, it } from "vitest";
import {
  introBossOpacity,
  introCameraOrigin,
  introCameraScale,
  introCrowOpacity,
  introCrowProgress,
  introLightningOpacity,
  introShake,
} from "@/components/game/intro/introMotion";

describe("intro motion helpers", () => {
  it("keeps reduced-motion camera values stable", () => {
    expect(introCameraScale(12000, true)).toBe(1);
    expect(introCameraOrigin(12000, true)).toEqual({ x: 50, y: 55 });
    expect(introCrowProgress(5200, true)).toBe(0.5);
    expect(introShake(15420, true)).toEqual({ x: 0, y: 0 });
  });

  it("preserves key camera beats", () => {
    expect(introCameraScale(0, false)).toBeCloseTo(1.4);
    expect(introCameraScale(3000, false)).toBeCloseTo(1.18);
    expect(introCameraScale(15000, false)).toBeCloseTo(1.28);
    expect(introCameraScale(22000, false)).toBeCloseTo(1);
  });

  it("limits crows to the eclipse beat", () => {
    expect(introCrowOpacity(3900)).toBe(0);
    expect(introCrowOpacity(5750)).toBeCloseTo(0.85);
    expect(introCrowOpacity(7600)).toBe(0);
  });

  it("keeps lightning flashes short and bounded", () => {
    expect(introLightningOpacity(0)).toBe(0);
    expect(introLightningOpacity(2200)).toBeCloseTo(0.4);
    expect(introLightningOpacity(16200)).toBeCloseTo(0.85);
    expect(introLightningOpacity(16600)).toBe(0);
  });

  it("keeps boss reveal shadow opacity bounded", () => {
    expect(introBossOpacity(14900)).toBe(0);
    expect(introBossOpacity(16000)).toBeCloseTo(0.75);
    expect(introBossOpacity(19050)).toBe(0);
  });
});
