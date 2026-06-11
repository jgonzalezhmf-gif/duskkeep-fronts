import type { CanvasRuntimeViewport } from "@/features/canvas-runtime/runtimeConfig";

export const CANVAS_RUNTIME_MAX_RESOLUTION = 2;

export type CanvasWebglContextType = "webgl2" | "webgl" | "experimental-webgl";

export type CanvasWebglLike = {
  getContext: (
    contextId: CanvasWebglContextType,
    contextAttributes?: WebGLContextAttributes,
  ) => unknown;
};

export type CanvasWebglSupportResult =
  | {
      status: "supported";
      reason: "supported";
      contextType: CanvasWebglContextType;
    }
  | {
      status: "unsupported";
      reason: "no-canvas" | "context-unavailable";
      contextType?: undefined;
    };

export type DetectCanvasWebglSupportOptions = {
  contextAttributes?: WebGLContextAttributes;
  contextTypes?: readonly CanvasWebglContextType[];
};

export type ResolveCanvasPixiInitOptionsInput = {
  viewport: Pick<CanvasRuntimeViewport, "cssWidth" | "cssHeight">;
  devicePixelRatio?: number;
  maxResolution?: number;
};

export type CanvasPixiInitOptions = {
  width: number;
  height: number;
  autoDensity: true;
  resolution: number;
  antialias: false;
  backgroundAlpha: 0;
};

const DEFAULT_CONTEXT_TYPES: readonly CanvasWebglContextType[] = [
  "webgl2",
  "webgl",
  "experimental-webgl",
];

export function detectCanvasWebglSupport(
  canvas: CanvasWebglLike | null | undefined,
  options: DetectCanvasWebglSupportOptions = {},
): CanvasWebglSupportResult {
  if (!canvas) {
    return { status: "unsupported", reason: "no-canvas" };
  }

  for (const contextType of options.contextTypes ?? DEFAULT_CONTEXT_TYPES) {
    try {
      const context = canvas.getContext(contextType, options.contextAttributes);

      if (context) {
        return { status: "supported", reason: "supported", contextType };
      }
    } catch {
      // Continue trying lower capability contexts. Some browsers throw for unsupported names.
    }
  }

  return { status: "unsupported", reason: "context-unavailable" };
}

export function resolveCanvasPixiInitOptions({
  viewport,
  devicePixelRatio = 1,
  maxResolution = CANVAS_RUNTIME_MAX_RESOLUTION,
}: ResolveCanvasPixiInitOptionsInput): CanvasPixiInitOptions {
  const safeDevicePixelRatio = clampResolution(devicePixelRatio);
  const safeMaxResolution = clampResolution(maxResolution);

  return {
    width: clampDimension(viewport.cssWidth),
    height: clampDimension(viewport.cssHeight),
    autoDensity: true,
    resolution: Math.min(safeDevicePixelRatio, safeMaxResolution),
    antialias: false,
    backgroundAlpha: 0,
  };
}

function clampDimension(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.round(value));
}

function clampResolution(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, value);
}
