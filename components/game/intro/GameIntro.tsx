"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";
import type { ThemeName } from "@/lib/audio-runtime";
import { useGameStore } from "@/lib/store";
import { INTRO_TOTAL_MS } from "./introScenes";
import { IntroStage } from "./IntroStage";

const INTRO_SFX_CUES = [
  { atMs: 2200, name: "eclipse_lightning" },
  { atMs: 9500, name: "eclipse_lightning" },
  { atMs: 11200, name: "fortress_eclipse_pulse" },
  { atMs: 15000, name: "boss_tension_riser" },
  { atMs: 15400, name: "eclipse_lightning" },
  { atMs: 16400, name: "eclipse_lightning" },
] as const;

type GameIntroProps = {
  /** Called once when the intro is skipped or the CTA is pressed. */
  onDone: () => void;
  returnTheme?: ThemeName;
};

/**
 * Cinematic intro shown before Home on first visit. Drives the timeline with
 * requestAnimationFrame so animations stay in sync with display refresh and
 * pause cleanly when the tab is hidden.
 */
export function GameIntro({ onDone, returnTheme = "home" }: GameIntroProps) {
  const storeReducedMotion = useGameStore((state) => state.reducedMotion);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [mediaReducedMotion, setMediaReducedMotion] = useState(false);
  const doneRef = useRef(false);
  const lastElapsedRef = useRef(0);
  const playedCueIndexesRef = useRef(new Set<number>());
  const introOffsetSeconds = () => Math.max(0, lastElapsedRef.current / 1000);

  useLayoutEffect(() => {
    audio.setRouteThemeSuppressed(true);
    audio.setTheme(null);
    audio.preloadMusicAsset("intro_cinematic");
    audio.playOneShotMusicAsset("intro_cinematic", { offsetSeconds: 0 });
    const retryTimers = [120, 450, 1100].map((delay) =>
      window.setTimeout(() => {
        if (!doneRef.current) audio.playOneShotMusicAsset("intro_cinematic", { offsetSeconds: introOffsetSeconds() });
      }, delay),
    );
    const retryIntroAudio = () => {
      if (!doneRef.current) audio.playOneShotMusicAsset("intro_cinematic", { offsetSeconds: introOffsetSeconds() });
    };
    window.addEventListener("pointerdown", retryIntroAudio, { passive: true });
    window.addEventListener("keydown", retryIntroAudio, { passive: true });
    return () => {
      for (const timer of retryTimers) window.clearTimeout(timer);
      window.removeEventListener("pointerdown", retryIntroAudio);
      window.removeEventListener("keydown", retryIntroAudio);
      audio.stopOneShotMusicAsset(0.28);
      audio.setRouteThemeSuppressed(false);
      audio.setTheme(returnTheme);
    };
  }, [returnTheme]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMediaReducedMotion(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const previous = lastElapsedRef.current;
    lastElapsedRef.current = elapsedMs;

    for (const [index, cue] of INTRO_SFX_CUES.entries()) {
      if (playedCueIndexesRef.current.has(index)) continue;
      if (previous <= cue.atMs && elapsedMs >= cue.atMs) {
        playedCueIndexesRef.current.add(index);
        audio.playOneShotMusicAsset("intro_cinematic", { offsetSeconds: elapsedMs / 1000 });
        audio.playSfxAsset(cue.name);
      }
    }
  }, [elapsedMs]);

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
      // Only Escape closes the intro. Enter/Space were causing accidental
      // skips when the user happened to have one of those keys focused or
      // pressed during page load — and they're easy to hit reflexively.
      if (event.key === "Escape") {
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
    audio.stopOneShotMusicAsset(0.28);
    audio.setRouteThemeSuppressed(false);
    audio.setTheme(returnTheme);
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
