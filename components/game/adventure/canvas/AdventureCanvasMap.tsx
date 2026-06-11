"use client";

import { useEffect, useRef, useState } from "react";
import type { AdventureCanvasSceneModel } from "@/features/canvas-runtime/adventureAdapter";
import {
  createAdventureCanvasRuntime,
  initializeAdventureCanvasRuntimeApplication,
  type AdventureCanvasRuntime,
  type AdventureCanvasRuntimeApplication,
  type AdventureCanvasRuntimeInitializableApplication,
  type AdventureCanvasRuntimeFallbackReason,
  type AdventureCanvasRuntimeHost,
} from "./adventureCanvasRuntime";
import type { CanvasPixiInitOptions } from "@/features/canvas-runtime/webglSupport";

export type AdventureCanvasMapProps = {
  sceneModel: AdventureCanvasSceneModel;
  className?: string;
  onFallback?: (reason: AdventureCanvasRuntimeFallbackReason) => void;
};

export function AdventureCanvasMap({ sceneModel, className, onFallback }: AdventureCanvasMapProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<AdventureCanvasRuntime | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<"idle" | "mounting" | "ready" | "fallback" | "destroyed">("idle");

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    let cancelled = false;
    const supportCanvas = document.createElement("canvas");
    const runtimeHost: AdventureCanvasRuntimeHost = {
      get clientWidth() {
        return host.clientWidth;
      },
      get clientHeight() {
        return host.clientHeight;
      },
      appendChild(canvas) {
        host.appendChild(canvas as unknown as Node);
      },
      removeChild(canvas) {
        host.removeChild(canvas as unknown as Node);
      },
      contains(canvas) {
        return host.contains(canvas as unknown as Node);
      },
      ownerDocument: document,
    };
    const runtime = createAdventureCanvasRuntime({
      host: runtimeHost,
      supportCanvas,
      devicePixelRatio: window.devicePixelRatio,
      createApplication: createPixiApplication,
    });
    runtimeRef.current = runtime;

    void runtime.mount().then((snapshot) => {
      if (cancelled) {
        runtime.destroy();
        return;
      }

      setRuntimeStatus(snapshot.status);
      if (snapshot.status === "fallback") {
        onFallback?.(snapshot.reason);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      const snapshot = runtime.resize();
      setRuntimeStatus(snapshot.status);
      if (snapshot.status === "fallback") {
        onFallback?.(snapshot.reason);
      }
    });
    resizeObserver.observe(host);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      runtime.destroy();
      runtimeRef.current = null;
    };
  }, [onFallback]);

  return (
    <div
      ref={hostRef}
      className={className}
      data-adventure-canvas-map
      data-adventure-canvas-chapter={sceneModel.chapter}
      data-adventure-canvas-status={runtimeStatus}
    />
  );
}

async function createPixiApplication(options: CanvasPixiInitOptions): Promise<AdventureCanvasRuntimeApplication> {
  const { Application } = await import("pixi.js");
  const app = new Application() as unknown as AdventureCanvasRuntimeInitializableApplication;

  return initializeAdventureCanvasRuntimeApplication(app, options);
}
