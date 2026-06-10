import { describe, expect, it } from "vitest";
import {
  CANVAS_RUNTIME_ZOOM_EQUIVALENT,
  calculateCanvasRuntimeViewport,
  resolveAdventureCanvasRuntimeMode,
} from "@/features/canvas-runtime/runtimeConfig";

describe("Canvas runtime viewport calibration", () => {
  it("uses a 75% zoom-equivalent logical viewport while preserving CSS dimensions", () => {
    const viewport = calculateCanvasRuntimeViewport({ cssWidth: 1200, cssHeight: 900 });

    expect(CANVAS_RUNTIME_ZOOM_EQUIVALENT).toBe(0.75);
    expect(viewport).toMatchObject({
      cssWidth: 1200,
      cssHeight: 900,
      logicalWidth: 1600,
      logicalHeight: 1200,
      stageScale: 0.75,
    });
    expect(viewport.worldScale).toBeCloseTo(1200 / 1080, 6);
    expect(viewport.worldDisplayScale).toBeCloseTo(0.75 * (1200 / 1080), 6);
  });

  it("rounds fractional logical pixels and preserves portrait cover-scale semantics", () => {
    const viewport = calculateCanvasRuntimeViewport({ cssWidth: 375, cssHeight: 667 });

    expect(viewport.logicalWidth).toBe(500);
    expect(viewport.logicalHeight).toBe(889);
    expect(viewport.worldScale).toBeCloseTo(889 / 1080, 6);
    expect(viewport.worldDisplayScale).toBeCloseTo(0.75 * (889 / 1080), 6);
  });

  it("clamps invalid CSS dimensions before calibration", () => {
    const viewport = calculateCanvasRuntimeViewport({ cssWidth: 0, cssHeight: -20 });

    expect(viewport.cssWidth).toBe(1);
    expect(viewport.cssHeight).toBe(1);
    expect(viewport.logicalWidth).toBe(1);
    expect(viewport.logicalHeight).toBe(1);
  });
});

describe("Adventure canvas runtime flag resolution", () => {
  it("keeps DOM Adventure as the default unless canvas is explicitly enabled", () => {
    expect(resolveAdventureCanvasRuntimeMode({ query: "" })).toEqual({ enabled: false, source: "default" });
    expect(resolveAdventureCanvasRuntimeMode({ query: "?chapter=1" })).toEqual({
      enabled: false,
      source: "default",
    });
  });

  it("enables canvas mode from the supported query parameter", () => {
    expect(resolveAdventureCanvasRuntimeMode({ query: "?canvas=1" })).toEqual({
      enabled: true,
      source: "query",
    });
  });

  it("lets an explicit query disable override an enabled environment flag", () => {
    expect(
      resolveAdventureCanvasRuntimeMode({
        query: "?canvas=0",
        envValue: "true",
      }),
    ).toEqual({ enabled: false, source: "query" });
  });

  it("supports an explicit environment enable without making it the default", () => {
    expect(resolveAdventureCanvasRuntimeMode({ query: "", envValue: "1" })).toEqual({
      enabled: true,
      source: "env",
    });
    expect(resolveAdventureCanvasRuntimeMode({ query: "", envValue: "false" })).toEqual({
      enabled: false,
      source: "env",
    });
  });
});
