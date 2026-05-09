import type { HomeLandmarkEffectConfig } from "./homeEffectLayout";

export type HomeEffectPatch = Partial<HomeLandmarkEffectConfig>;

export type HomeEffectsQaEditorState = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: HomeEffectPatch) => void;
};
