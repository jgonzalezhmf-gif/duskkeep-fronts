export const CANVAS_RUNTIME_ZOOM_EQUIVALENT = 0.75;
export const CANVAS_RUNTIME_DESIGN_WIDTH = 1920;
export const CANVAS_RUNTIME_DESIGN_HEIGHT = 1080;

type CanvasRuntimeBooleanSource = "query" | "env" | "default";

export type CanvasRuntimeMode = {
  enabled: boolean;
  source: CanvasRuntimeBooleanSource;
};

export type CanvasRuntimeViewportInput = {
  cssWidth: number;
  cssHeight: number;
  designWidth?: number;
  designHeight?: number;
};

export type CanvasRuntimeViewport = {
  cssWidth: number;
  cssHeight: number;
  logicalWidth: number;
  logicalHeight: number;
  stageScale: number;
  /**
   * Cover scale from the fixed design world into the zoom-equivalent logical viewport.
   * Do not apply this directly to CSS; use worldDisplayScale for CSS-visible sizing.
   */
  worldScale: number;
  /**
   * Final visible scale after applying the 75% zoom-equivalent stage scale.
   */
  worldDisplayScale: number;
};

type AdventureCanvasRuntimeQuery = string | URLSearchParams | Record<string, string | string[] | undefined>;

export type AdventureCanvasRuntimeModeInput = {
  query?: AdventureCanvasRuntimeQuery;
  envValue?: string | boolean | number | null;
};

const TRUE_VALUES = new Set(["1", "true", "on", "yes"]);
const FALSE_VALUES = new Set(["0", "false", "off", "no"]);

export function calculateCanvasRuntimeViewport({
  cssWidth,
  cssHeight,
  designWidth = CANVAS_RUNTIME_DESIGN_WIDTH,
  designHeight = CANVAS_RUNTIME_DESIGN_HEIGHT,
}: CanvasRuntimeViewportInput): CanvasRuntimeViewport {
  const safeCssWidth = clampCssDimension(cssWidth);
  const safeCssHeight = clampCssDimension(cssHeight);
  const logicalWidth = Math.round(safeCssWidth / CANVAS_RUNTIME_ZOOM_EQUIVALENT);
  const logicalHeight = Math.round(safeCssHeight / CANVAS_RUNTIME_ZOOM_EQUIVALENT);
  const safeDesignWidth = clampCssDimension(designWidth);
  const safeDesignHeight = clampCssDimension(designHeight);
  const worldScale = Math.max(logicalWidth / safeDesignWidth, logicalHeight / safeDesignHeight);

  return {
    cssWidth: safeCssWidth,
    cssHeight: safeCssHeight,
    logicalWidth,
    logicalHeight,
    stageScale: CANVAS_RUNTIME_ZOOM_EQUIVALENT,
    worldScale,
    worldDisplayScale: CANVAS_RUNTIME_ZOOM_EQUIVALENT * worldScale,
  };
}

export function resolveAdventureCanvasRuntimeMode({
  query,
  envValue,
}: AdventureCanvasRuntimeModeInput = {}): CanvasRuntimeMode {
  const queryValue = getQueryValue(query, "canvas");
  const queryFlag = parseExplicitBoolean(queryValue);

  if (queryFlag !== undefined) {
    return { enabled: queryFlag, source: "query" };
  }

  const envFlag = parseExplicitBoolean(envValue);

  if (envFlag !== undefined) {
    return { enabled: envFlag, source: "env" };
  }

  return { enabled: false, source: "default" };
}

function clampCssDimension(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.round(value));
}

function parseExplicitBoolean(value: string | boolean | number | null | undefined): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1 ? true : value === 0 ? false : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return undefined;
}

function getQueryValue(
  query: AdventureCanvasRuntimeQuery | undefined,
  key: string,
): string | undefined {
  if (!query) {
    return undefined;
  }

  if (typeof query === "string") {
    const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
    return params.get(key) ?? undefined;
  }

  if (query instanceof URLSearchParams) {
    return query.get(key) ?? undefined;
  }

  const value = query[key];
  return Array.isArray(value) ? value[0] : value;
}
