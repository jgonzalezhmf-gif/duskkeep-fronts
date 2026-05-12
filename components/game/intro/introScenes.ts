export type IntroSceneId =
  | "eclipse"
  | "roadsBroken"
  | "keepStands"
  | "gatherFrontline"
  | "crest";

export type IntroScene = {
  id: IntroSceneId;
  startMs: number;
  endMs: number;
  textKey: string;
};

export const INTRO_SCENES: readonly IntroScene[] = [
  { id: "eclipse", startMs: 0, endMs: 3000, textKey: "intro.eclipseRises" },
  { id: "roadsBroken", startMs: 3000, endMs: 6000, textKey: "intro.roadsBroken" },
  { id: "keepStands", startMs: 6000, endMs: 9000, textKey: "intro.keepStands" },
  { id: "gatherFrontline", startMs: 9000, endMs: 11500, textKey: "intro.gatherFrontline" },
  { id: "crest", startMs: 11500, endMs: 15000, textKey: "intro.title" },
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
