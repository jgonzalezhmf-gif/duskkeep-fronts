"use client";

import { useMemo } from "react";
import {
  introBossOpacity,
  introBossScale,
  introCameraDriftX,
  introCameraDriftY,
  introCameraOrigin,
  introCameraScale,
  introCrestOpacity,
  introCrestScale,
  introCrowOpacity,
  introCrowProgress,
  introFogOpacity,
  introGoldShineOpacity,
  introKeepGlow,
  introLightningOpacity,
  introShake,
} from "./introMotion";

export function useIntroMotion(elapsedMs: number, reducedMotion: boolean) {
  const cameraScale = useMemo(() => introCameraScale(elapsedMs, reducedMotion), [elapsedMs, reducedMotion]);
  const cameraOrigin = useMemo(() => introCameraOrigin(elapsedMs, reducedMotion), [elapsedMs, reducedMotion]);
  const cameraDriftX = useMemo(() => introCameraDriftX(elapsedMs, reducedMotion), [elapsedMs, reducedMotion]);
  const cameraDriftY = useMemo(() => introCameraDriftY(elapsedMs, reducedMotion), [elapsedMs, reducedMotion]);
  const lightningOpacity = useMemo(
    () => (reducedMotion ? 0 : introLightningOpacity(elapsedMs)),
    [elapsedMs, reducedMotion],
  );
  const fogOpacity = useMemo(() => introFogOpacity(elapsedMs), [elapsedMs]);
  const fogShiftA = useMemo(() => (reducedMotion ? 0 : (elapsedMs / 1000) * 7), [elapsedMs, reducedMotion]);
  const fogShiftB = useMemo(
    () => (reducedMotion ? 0 : (elapsedMs / 1000) * 4 * -1),
    [elapsedMs, reducedMotion],
  );
  const crowOpacity = useMemo(() => introCrowOpacity(elapsedMs), [elapsedMs]);
  const crowProgress = useMemo(() => introCrowProgress(elapsedMs, reducedMotion), [elapsedMs, reducedMotion]);
  const keepGlow = useMemo(() => introKeepGlow(elapsedMs), [elapsedMs]);
  const bossOpacity = useMemo(() => introBossOpacity(elapsedMs), [elapsedMs]);
  const bossScale = useMemo(() => introBossScale(elapsedMs, reducedMotion), [elapsedMs, reducedMotion]);
  const shake = useMemo(() => introShake(elapsedMs, reducedMotion), [elapsedMs, reducedMotion]);
  const crestOpacity = useMemo(() => introCrestOpacity(elapsedMs), [elapsedMs]);
  const crestScale = useMemo(() => introCrestScale(elapsedMs, reducedMotion), [elapsedMs, reducedMotion]);
  const goldShineOpacity = useMemo(() => introGoldShineOpacity(elapsedMs), [elapsedMs]);

  return {
    bossOpacity,
    bossScale,
    cameraDriftX,
    cameraDriftY,
    cameraOrigin,
    cameraScale,
    crestOpacity,
    crestScale,
    crowLeadVw: 110 - crowProgress * 140,
    crowOpacity,
    crowTrailVw: 105 - crowProgress * 130,
    fogOpacity,
    fogShiftA,
    fogShiftB,
    goldShineOpacity,
    keepGlow,
    lightningOpacity,
    shake,
  };
}
