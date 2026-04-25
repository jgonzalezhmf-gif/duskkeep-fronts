"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/store";

export default function Hydrator() {
  const ensureMissions = useGameStore((s) => s.ensureMissionsInitialized);
  const hydrate = useGameStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
    ensureMissions();
  }, [hydrate, ensureMissions]);

  useEffect(() => {
    const syncCycles = () => ensureMissions();
    const onVisible = () => {
      if (document.visibilityState === "visible") syncCycles();
    };

    window.addEventListener("focus", syncCycles);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", syncCycles);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ensureMissions]);

  return null;
}
