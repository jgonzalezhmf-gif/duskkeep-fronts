import { describe, expect, it, vi } from "vitest";
import { calculateCanvasRuntimeViewport } from "@/features/canvas-runtime/runtimeConfig";
import {
  detectCanvasWebglSupport,
  resolveCanvasPixiInitOptions,
} from "@/features/canvas-runtime/webglSupport";

type ContextMap = Partial<Record<"webgl2" | "webgl" | "experimental-webgl", object | null>>;

function canvasWithContexts(contexts: ContextMap) {
  return {
    getContext: vi.fn((contextId: string) => contexts[contextId as keyof ContextMap] ?? null),
  };
}

describe("Canvas WebGL support detection", () => {
  it("prefers WebGL2 when the provided canvas can acquire it", () => {
    const webgl2Context = { kind: "webgl2" };
    const canvas = canvasWithContexts({ webgl2: webgl2Context, webgl: { kind: "webgl" } });

    expect(detectCanvasWebglSupport(canvas)).toEqual({
      status: "supported",
      reason: "supported",
      contextType: "webgl2",
    });
    expect(canvas.getContext).toHaveBeenCalledWith("webgl2", undefined);
  });

  it("falls back through WebGL1 and experimental WebGL without requiring browser globals", () => {
    const experimentalContext = { kind: "experimental-webgl" };
    const canvas = canvasWithContexts({ webgl2: null, webgl: null, "experimental-webgl": experimentalContext });

    expect(detectCanvasWebglSupport(canvas)).toEqual({
      status: "supported",
      reason: "supported",
      contextType: "experimental-webgl",
    });
    expect(canvas.getContext).toHaveBeenNthCalledWith(1, "webgl2", undefined);
    expect(canvas.getContext).toHaveBeenNthCalledWith(2, "webgl", undefined);
    expect(canvas.getContext).toHaveBeenNthCalledWith(3, "experimental-webgl", undefined);
  });

  it("uses WebGL1 when WebGL2 is unavailable", () => {
    const webglContext = { kind: "webgl" };
    const canvas = canvasWithContexts({ webgl2: null, webgl: webglContext });

    expect(detectCanvasWebglSupport(canvas)).toEqual({
      status: "supported",
      reason: "supported",
      contextType: "webgl",
    });
    expect(canvas.getContext).toHaveBeenNthCalledWith(1, "webgl2", undefined);
    expect(canvas.getContext).toHaveBeenNthCalledWith(2, "webgl", undefined);
  });

  it("continues through thrown context acquisition failures", () => {
    const experimentalContext = { kind: "experimental-webgl" };
    const canvas = {
      getContext: vi.fn((contextId: string) => {
        if (contextId === "webgl2") {
          throw new Error("webgl2 unavailable");
        }

        return contextId === "experimental-webgl" ? experimentalContext : null;
      }),
    };

    expect(detectCanvasWebglSupport(canvas)).toEqual({
      status: "supported",
      reason: "supported",
      contextType: "experimental-webgl",
    });
    expect(canvas.getContext).toHaveBeenNthCalledWith(1, "webgl2", undefined);
    expect(canvas.getContext).toHaveBeenNthCalledWith(2, "webgl", undefined);
    expect(canvas.getContext).toHaveBeenNthCalledWith(3, "experimental-webgl", undefined);
  });

  it("returns structured fallback reasons for missing canvas or failed context acquisition", () => {
    expect(detectCanvasWebglSupport(null)).toEqual({
      status: "unsupported",
      reason: "no-canvas",
    });

    expect(detectCanvasWebglSupport(canvasWithContexts({}))).toEqual({
      status: "unsupported",
      reason: "context-unavailable",
    });
  });
});

describe("Canvas Pixi init option resolution", () => {
  it("keeps CSS dimensions, enables autoDensity, and caps high device resolution", () => {
    const viewport = calculateCanvasRuntimeViewport({ cssWidth: 390, cssHeight: 844 });

    expect(resolveCanvasPixiInitOptions({ viewport, devicePixelRatio: 3, maxResolution: 1.5 })).toEqual({
      width: 390,
      height: 844,
      autoDensity: true,
      resolution: 1.5,
      antialias: false,
    });
  });

  it("normalizes unsafe resolution inputs for low-end or non-browser test environments", () => {
    const viewport = calculateCanvasRuntimeViewport({ cssWidth: 1200, cssHeight: 900 });

    expect(resolveCanvasPixiInitOptions({ viewport, devicePixelRatio: 0 }).resolution).toBe(1);
    expect(resolveCanvasPixiInitOptions({ viewport, devicePixelRatio: Number.NaN }).resolution).toBe(1);
  });
});
