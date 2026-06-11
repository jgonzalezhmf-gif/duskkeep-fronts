import { describe, expect, it, vi } from "vitest";
import {
  createAdventureCanvasRuntime,
  initializeAdventureCanvasRuntimeApplication,
  type AdventureCanvasRuntimeApplication,
  type AdventureCanvasRuntimeCanvas,
  type AdventureCanvasRuntimeHost,
} from "@/components/game/adventure/canvas/adventureCanvasRuntime";
import { calculateCanvasRuntimeViewport } from "@/features/canvas-runtime/runtimeConfig";

function createHost({
  width = 800,
  height = 600,
  webglContext = { kind: "webgl2" },
}: {
  width?: number;
  height?: number;
  webglContext?: object | null;
} = {}) {
  const listeners = new Map<string, (event: Event) => void>();
  const canvas = {
    getContext: vi.fn(() => webglContext),
    addEventListener: vi.fn((type: string, listener: (event: Event) => void) => {
      listeners.set(type, listener);
    }),
    removeEventListener: vi.fn((type: string, listener: (event: Event) => void) => {
      if (listeners.get(type) === listener) {
        listeners.delete(type);
      }
    }),
  } satisfies AdventureCanvasRuntimeCanvas;
  const host = {
    clientWidth: width,
    clientHeight: height,
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  };

  return {
    canvas,
    host: host as unknown as AdventureCanvasRuntimeHost,
    dispatchCanvasEvent(type: string, event: Event) {
      listeners.get(type)?.(event);
    },
  };
}

function createApplication(canvas = createHost().canvas) {
  return {
    canvas,
    renderer: {
      resize: vi.fn(),
    },
    destroy: vi.fn(),
  } satisfies AdventureCanvasRuntimeApplication;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

describe("Adventure Pixi runtime lifecycle", () => {
  it("initializes a Pixi app with safe options, appends its canvas, and owns the application reference", async () => {
    const { host, canvas } = createHost({ width: 1024, height: 768 });
    const app = createApplication(canvas);
    const createApplicationFactory = vi.fn(async () => app);
    const runtime = createAdventureCanvasRuntime({
      host,
      supportCanvas: canvas,
      createApplication: createApplicationFactory,
      devicePixelRatio: 3,
    });

    await expect(runtime.mount()).resolves.toMatchObject({
      status: "ready",
      reason: "mounted",
      app,
      canvas,
    });

    expect(createApplicationFactory).toHaveBeenCalledWith({
      width: 1024,
      height: 768,
      autoDensity: true,
      resolution: 2,
      antialias: false,
      backgroundAlpha: 0,
    });
    expect(host.appendChild).toHaveBeenCalledWith(canvas);
    expect(runtime.getSnapshot()).toMatchObject({ status: "ready", reason: "mounted", app, canvas });
  });

  it("returns fallback state for unsupported WebGL or Pixi application init failure", async () => {
    const unsupportedHost = createHost({ webglContext: null });
    const unsupportedRuntime = createAdventureCanvasRuntime({
      host: unsupportedHost.host,
      supportCanvas: unsupportedHost.canvas,
      createApplication: vi.fn(),
    });

    await expect(unsupportedRuntime.mount()).resolves.toMatchObject({
      status: "fallback",
      reason: "webgl-unsupported",
    });
    expect(unsupportedHost.host.appendChild).not.toHaveBeenCalled();

    const failingHost = createHost();
    const failingRuntime = createAdventureCanvasRuntime({
      host: failingHost.host,
      supportCanvas: failingHost.canvas,
      createApplication: vi.fn(async () => {
        throw new Error("Pixi unavailable");
      }),
    });

    await expect(failingRuntime.mount()).resolves.toMatchObject({
      status: "fallback",
      reason: "init-failed",
    });
    expect(failingHost.host.appendChild).not.toHaveBeenCalled();
  });

  it("resizes through the Pixi renderer using calibrated safe dimensions", async () => {
    const { host } = createHost({ width: 1200, height: 900 });
    const app = createApplication();
    const runtime = createAdventureCanvasRuntime({
      host,
      supportCanvas: createHost().canvas,
      createApplication: vi.fn(async () => app),
    });

    await runtime.mount();
    runtime.resize({ width: Number.NaN, height: 0 });

    expect(app.renderer.resize).toHaveBeenCalledWith(1, 1);

    runtime.resize({ width: 390, height: 844 });

    expect(app.renderer.resize).toHaveBeenLastCalledWith(390, 844);
    expect(runtime.getSnapshot()).toMatchObject({
      viewport: calculateCanvasRuntimeViewport({ cssWidth: 390, cssHeight: 844 }),
    });
  });

  it("keeps a resize requested while mounting when the Pixi app becomes ready", async () => {
    const { host, canvas } = createHost({ width: 800, height: 600 });
    const app = createApplication(canvas);
    const pendingApp = deferred<AdventureCanvasRuntimeApplication>();
    const runtime = createAdventureCanvasRuntime({
      host,
      supportCanvas: canvas,
      createApplication: vi.fn(() => pendingApp.promise),
    });
    const resizedViewport = calculateCanvasRuntimeViewport({ cssWidth: 390, cssHeight: 844 });

    const mountPromise = runtime.mount();
    runtime.resize({ width: 390, height: 844 });
    pendingApp.resolve(app);

    await expect(mountPromise).resolves.toMatchObject({
      status: "ready",
      reason: "mounted",
      viewport: resizedViewport,
    });
    expect(app.renderer.resize).toHaveBeenCalledWith(390, 844);
  });

  it("prevents default context loss and transitions to a recoverable fallback state", async () => {
    const { host, canvas, dispatchCanvasEvent } = createHost();
    const app = createApplication(canvas);
    const runtime = createAdventureCanvasRuntime({
      host,
      supportCanvas: createHost().canvas,
      createApplication: vi.fn(async () => app),
    });
    const contextLostEvent = {
      preventDefault: vi.fn(),
    } as unknown as Event;

    await runtime.mount();
    dispatchCanvasEvent("webglcontextlost", contextLostEvent);

    expect(contextLostEvent.preventDefault).toHaveBeenCalled();
    expect(runtime.getSnapshot()).toMatchObject({
      status: "fallback",
      reason: "context-lost",
    });
  });

  it("keeps the latest viewport when context loss happens after resize", async () => {
    const { host, canvas, dispatchCanvasEvent } = createHost();
    const app = createApplication(canvas);
    const runtime = createAdventureCanvasRuntime({
      host,
      supportCanvas: createHost().canvas,
      createApplication: vi.fn(async () => app),
    });
    const resizedViewport = calculateCanvasRuntimeViewport({ cssWidth: 390, cssHeight: 844 });

    await runtime.mount();
    runtime.resize({ width: 390, height: 844 });
    dispatchCanvasEvent("webglcontextlost", { preventDefault: vi.fn() } as unknown as Event);

    expect(runtime.getSnapshot()).toMatchObject({
      status: "fallback",
      reason: "context-lost",
      viewport: resizedViewport,
    });
  });

  it("keeps destroyed state and cleans up a late app when unmounted during an in-flight mount", async () => {
    const { host, canvas } = createHost();
    const app = createApplication(canvas);
    const pendingApp = deferred<AdventureCanvasRuntimeApplication>();
    const runtime = createAdventureCanvasRuntime({
      host,
      supportCanvas: canvas,
      createApplication: vi.fn(() => pendingApp.promise),
    });

    const mountPromise = runtime.mount();
    runtime.destroy();
    pendingApp.resolve(app);

    await expect(mountPromise).resolves.toMatchObject({
      status: "destroyed",
      reason: "unmounted",
    });
    expect(host.appendChild).not.toHaveBeenCalled();
    expect(app.destroy).toHaveBeenCalledWith(true, {
      children: true,
      texture: true,
      textureSource: true,
    });
  });

  it("keeps resize calls inert after the runtime has been destroyed", async () => {
    const { host, canvas } = createHost();
    const app = createApplication(canvas);
    const runtime = createAdventureCanvasRuntime({
      host,
      supportCanvas: canvas,
      createApplication: vi.fn(async () => app),
    });

    await runtime.mount();
    runtime.destroy();

    expect(runtime.resize({ width: 390, height: 844 })).toEqual({
      status: "destroyed",
      reason: "unmounted",
    });
    expect(runtime.getSnapshot()).toEqual({
      status: "destroyed",
      reason: "unmounted",
    });
  });

  it("destroys the Pixi app deterministically and removes owned listeners on unmount", async () => {
    const { host, canvas } = createHost();
    const app = createApplication(canvas);
    const runtime = createAdventureCanvasRuntime({
      host,
      supportCanvas: canvas,
      createApplication: vi.fn(async () => app),
    });

    await runtime.mount();
    runtime.destroy();

    expect(app.destroy).toHaveBeenCalledWith(true, {
      children: true,
      texture: true,
      textureSource: true,
    });
    expect(canvas.removeEventListener).toHaveBeenCalledWith("webglcontextlost", expect.any(Function));
    expect(host.removeChild).toHaveBeenCalledWith(canvas);
    expect(runtime.getSnapshot()).toMatchObject({ status: "destroyed", reason: "unmounted" });
  });
});

describe("Adventure Pixi application initialization", () => {
  it("destroys a partially allocated Pixi app when init fails", async () => {
    const app = {
      ...createApplication(),
      init: vi.fn(async () => {
        throw new Error("init failed after allocation");
      }),
    };

    await expect(
      initializeAdventureCanvasRuntimeApplication(app, {
        width: 800,
        height: 600,
        autoDensity: true,
        resolution: 1,
        antialias: false,
        backgroundAlpha: 0,
      }),
    ).rejects.toThrow("init failed after allocation");
    expect(app.destroy).toHaveBeenCalledWith(true, {
      children: true,
      texture: true,
      textureSource: true,
    });
  });
});
