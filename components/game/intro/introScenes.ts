export type IntroSceneId =
  | "omen"
  | "eclipse"
  | "roadsBroken"
  | "keepStands"
  | "shadow"
  | "gatherFrontline"
  | "crest";

export type IntroScene = {
  id: IntroSceneId;
  startMs: number;
  endMs: number;
  /** i18n key for the narrative line, or null for silent beats. */
  textKey: string | null;
};

/**
 * 24-second cinematic timeline. Each beat has space to breathe before the
 * next one lights up, so the intro feels paced instead of stitched.
 * Scenes:
 *   omen            0–3s    silent presage, near-black + faint fog
 *   eclipse         3–7s    sky reveal + first narrative line
 *   roadsBroken     7–11s   parallax pan + lightning + roads line
 *   keepStands      11–15s  fortress focus + camera push + keep line
 *   shadow          15–19s  boss reveal (4s) + new shadow line
 *   gatherFrontline 19–22s  boss fades, call to arms
 *   crest           22–24s+ title crest + CTA fade-in
 */
export const INTRO_SCENES: readonly IntroScene[] = [
  { id: "omen", startMs: 0, endMs: 3000, textKey: null },
  { id: "eclipse", startMs: 3000, endMs: 7000, textKey: "intro.eclipseRises" },
  { id: "roadsBroken", startMs: 7000, endMs: 11000, textKey: "intro.roadsBroken" },
  { id: "keepStands", startMs: 11000, endMs: 15000, textKey: "intro.keepStands" },
  { id: "shadow", startMs: 15000, endMs: 19000, textKey: "intro.shadowClaims" },
  { id: "gatherFrontline", startMs: 19000, endMs: 22000, textKey: "intro.gatherFrontline" },
  { id: "crest", startMs: 22000, endMs: 24000, textKey: "intro.title" },
];

export const INTRO_TOTAL_MS = INTRO_SCENES[INTRO_SCENES.length - 1].endMs;

export function activeIntroScene(elapsedMs: number): IntroScene | null {
  for (const scene of INTRO_SCENES) {
    if (elapsedMs >= scene.startMs && elapsedMs < scene.endMs) return scene;
  }
  return INTRO_SCENES[INTRO_SCENES.length - 1] ?? null;
}

/** Normalised progress (0..1) within a scene. Clamped at the edges. */
export function sceneProgress(scene: IntroScene, elapsedMs: number) {
  const span = scene.endMs - scene.startMs;
  if (span <= 0) return 1;
  const local = Math.max(0, Math.min(span, elapsedMs - scene.startMs));
  return local / span;
}
