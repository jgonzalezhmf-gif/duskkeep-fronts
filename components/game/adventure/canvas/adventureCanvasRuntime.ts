import { calculateCanvasRuntimeViewport, type CanvasRuntimeViewport } from "@/features/canvas-runtime/runtimeConfig";
import {
  detectCanvasWebglSupport,
  resolveCanvasPixiInitOptions,
  type CanvasPixiInitOptions,
  type CanvasWebglLike,
} from "@/features/canvas-runtime/webglSupport";

export type AdventureCanvasRuntimeFallbackReason =
  | "webgl-unsupported"
  | "init-failed"
  | "context-lost";

export type AdventureCanvasRuntimeSnapshot =
  | {
      status: "idle";
      reason: "idle";
      viewport?: undefined;
      app?: undefined;
      canvas?: undefined;
      error?: undefined;
    }
  | {
      status: "mounting";
      reason: "mounting";
      viewport: CanvasRuntimeViewport;
      app?: undefined;
      canvas?: undefined;
      error?: undefined;
    }
  | {
      status: "ready";
      reason: "mounted";
      viewport: CanvasRuntimeViewport;
      app: AdventureCanvasRuntimeApplication;
      canvas: AdventureCanvasRuntimeCanvas;
      error?: undefined;
    }
  | {
      status: "fallback";
      reason: AdventureCanvasRuntimeFallbackReason;
      viewport?: CanvasRuntimeViewport;
      app?: undefined;
      canvas?: undefined;
      error?: unknown;
    }
  | {
      status: "destroyed";
      reason: "unmounted";
      viewport?: undefined;
      app?: undefined;
      canvas?: undefined;
      error?: undefined;
    };

export type AdventureCanvasRuntimeCanvas = CanvasWebglLike & {
  addEventListener?: (type: "webglcontextlost", listener: (event: Event) => void) => void;
  removeEventListener?: (type: "webglcontextlost", listener: (event: Event) => void) => void;
};

export type AdventureCanvasRuntimeApplication = {
  canvas: AdventureCanvasRuntimeCanvas;
  renderer?: {
    resize?: (width: number, height: number) => void;
  };
  destroy?: (
    removeView?: boolean,
    options?: {
      children?: boolean;
      texture?: boolean;
      textureSource?: boolean;
      baseTexture?: boolean;
    },
  ) => void;
};

export type AdventureCanvasRuntimeHost = {
  clientWidth: number;
  clientHeight: number;
  appendChild: (canvas: AdventureCanvasRuntimeCanvas) => void;
  removeChild?: (canvas: AdventureCanvasRuntimeCanvas) => void;
  contains?: (canvas: AdventureCanvasRuntimeCanvas) => boolean;
  ownerDocument?: {
    createElement: (tagName: "canvas") => CanvasWebglLike;
  };
};

export type CreateAdventureCanvasRuntimeOptions = {
  host: AdventureCanvasRuntimeHost;
  createApplication: (options: CanvasPixiInitOptions) => Promise<AdventureCanvasRuntimeApplication>;
  supportCanvas?: CanvasWebglLike | null;
  devicePixelRatio?: number;
};

export type AdventureCanvasRuntime = {
  mount: () => Promise<AdventureCanvasRuntimeSnapshot>;
  resize: (size?: { width?: number; height?: number }) => AdventureCanvasRuntimeSnapshot;
  destroy: () => AdventureCanvasRuntimeSnapshot;
  getSnapshot: () => AdventureCanvasRuntimeSnapshot;
};

const DESTROY_OPTIONS = {
  children: true,
  texture: true,
  textureSource: true,
} as const;

export type AdventureCanvasRuntimeInitializableApplication = AdventureCanvasRuntimeApplication & {
  init: (options: CanvasPixiInitOptions) => Promise<void> | void;
};

export async function initializeAdventureCanvasRuntimeApplication<TApplication extends AdventureCanvasRuntimeInitializableApplication>(
  app: TApplication,
  options: CanvasPixiInitOptions,
): Promise<TApplication> {
  try {
    await app.init(options);
    return app;
  } catch (error) {
    app.destroy?.(true, DESTROY_OPTIONS);
    throw error;
  }
}

export function createAdventureCanvasRuntime({
  host,
  createApplication,
  supportCanvas,
  devicePixelRatio = 1,
}: CreateAdventureCanvasRuntimeOptions): AdventureCanvasRuntime {
  let snapshot: AdventureCanvasRuntimeSnapshot = { status: "idle", reason: "idle" };
  let currentApp: AdventureCanvasRuntimeApplication | null = null;
  let currentCanvas: AdventureCanvasRuntimeCanvas | null = null;
  let contextLostListener: ((event: Event) => void) | null = null;
  let destroyed = false;
  let lifecycleRevision = 0;

  function resolveViewport(size?: { width?: number; height?: number }) {
    return calculateCanvasRuntimeViewport({
      cssWidth: size?.width ?? host.clientWidth,
      cssHeight: size?.height ?? host.clientHeight,
    });
  }

  function cleanupApplication(nextSnapshot: AdventureCanvasRuntimeSnapshot) {
    if (currentCanvas && contextLostListener) {
      currentCanvas.removeEventListener?.("webglcontextlost", contextLostListener);
    }

    if (currentCanvas && host.removeChild) {
      try {
        if (!host.contains || host.contains(currentCanvas)) {
          host.removeChild(currentCanvas);
        }
      } catch {
        // The runtime owns cleanup best-effort only; fallback must remain recoverable.
      }
    }

    currentApp?.destroy?.(true, DESTROY_OPTIONS);
    currentApp = null;
    currentCanvas = null;
    contextLostListener = null;
    snapshot = nextSnapshot;
    return snapshot;
  }

  function enterFallback(reason: AdventureCanvasRuntimeFallbackReason, viewport?: CanvasRuntimeViewport, error?: unknown) {
    return cleanupApplication({
      status: "fallback",
      reason,
      viewport,
      error,
    });
  }

  function createProbeCanvas() {
    return supportCanvas ?? host.ownerDocument?.createElement("canvas") ?? null;
  }

  return {
    async mount() {
      if (destroyed) {
        return snapshot;
      }

      if (snapshot.status === "ready") {
        return snapshot;
      }

      const mountRevision = ++lifecycleRevision;
      const viewport = resolveViewport();
      const support = detectCanvasWebglSupport(createProbeCanvas());

      if (support.status !== "supported") {
        snapshot = { status: "fallback", reason: "webgl-unsupported", viewport };
        return snapshot;
      }

      snapshot = { status: "mounting", reason: "mounting", viewport };

      try {
        const initOptions = resolveCanvasPixiInitOptions({ viewport, devicePixelRatio });
        const app = await createApplication(initOptions);

        if (destroyed || mountRevision !== lifecycleRevision) {
          app.destroy?.(true, DESTROY_OPTIONS);
          return snapshot;
        }

        const mountedViewport = snapshot.viewport ?? viewport;
        const canvas = app.canvas;

        contextLostListener = (event: Event) => {
          event.preventDefault();
          enterFallback("context-lost", snapshot.viewport ?? mountedViewport);
        };

        if (mountedViewport.cssWidth !== viewport.cssWidth || mountedViewport.cssHeight !== viewport.cssHeight) {
          app.renderer?.resize?.(mountedViewport.cssWidth, mountedViewport.cssHeight);
        }

        canvas.addEventListener?.("webglcontextlost", contextLostListener);
        host.appendChild(canvas);
        currentApp = app;
        currentCanvas = canvas;
        snapshot = {
          status: "ready",
          reason: "mounted",
          viewport: mountedViewport,
          app,
          canvas,
        };
        return snapshot;
      } catch (error) {
        if (destroyed || mountRevision !== lifecycleRevision) {
          return snapshot;
        }

        snapshot = {
          status: "fallback",
          reason: "init-failed",
          viewport,
          error,
        };
        return snapshot;
      }
    },
    resize(size) {
      if (destroyed) {
        return snapshot;
      }

      const viewport = resolveViewport(size);

      if (snapshot.status !== "ready") {
        snapshot = { ...snapshot, viewport } as AdventureCanvasRuntimeSnapshot;
        return snapshot;
      }

      snapshot.app.renderer?.resize?.(viewport.cssWidth, viewport.cssHeight);
      snapshot = { ...snapshot, viewport };
      return snapshot;
    },
    destroy() {
      destroyed = true;
      lifecycleRevision += 1;
      return cleanupApplication({ status: "destroyed", reason: "unmounted" });
    },
    getSnapshot() {
      return snapshot;
    },
  };
}
