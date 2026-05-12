"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/store";
import { INTRO_TOTAL_MS } from "./introScenes";
import { IntroStage } from "./IntroStage";

type GameIntroProps = {
  /** Called once when the intro is skipped or the CTA is pressed. */
  onDone: () => void;
};

/**
 * Cinematic intro shown before Home on first visit. Drives the timeline with
 * requestAnimationFrame so animations stay in sync with display refresh and
 * pause cleanly when the tab is hidden.
 */
export function GameIntro({ onDone }: GameIntroProps) {
  const storeReducedMotion = useGameStore((state) => state.reducedMotion);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [mediaReducedMotion, setMediaReducedMotion] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMediaReducedMotion(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  const reducedMotion = storeReducedMotion || mediaReducedMotion;

  useEffect(() => {
    if (doneRef.current) return;
    let rafId = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start == null) start = now;
      const elapsed = now - start;
      setElapsedMs(elapsed);
      if (elapsed >= INTRO_TOTAL_MS) {
        // Keep the final frame visible while the CTA fades in. Do not auto-dismiss.
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        finish();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // finish is stable via ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }

  return (
    <IntroStage
      elapsedMs={elapsedMs}
      totalMs={INTRO_TOTAL_MS}
      reducedMotion={reducedMotion}
      onSkip={finish}
      onEnter={finish}
    />
  );
}

export default GameIntro;
