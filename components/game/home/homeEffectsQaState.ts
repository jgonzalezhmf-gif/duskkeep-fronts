import {
  HOME_LANDMARK_EFFECT_DEFS,
  type HomeEffectAnchorId,
  type HomeLandmarkEffectConfig,
} from "@/components/game/home/homeEffectLayout";
import { HOME_EFFECT_IDS, type HomeEffectId } from "@/lib/homeEffectAssets";

export const HOME_EFFECTS_QA_STORAGE_KEY = "duskkeep:homeEffectsQa";

const HOME_EFFECT_ANCHORS = new Set<HomeEffectAnchorId>(["world", "fortress", "adventure", "arena", "market", "events", "deck"]);
const HOME_EFFECT_TYPES = new Set<HomeEffectId>(HOME_EFFECT_IDS);

function isValidHomeEffectDraft(value: unknown): value is HomeLandmarkEffectConfig {
  if (!value || typeof value !== "object") return false;
  const effect = value as Partial<HomeLandmarkEffectConfig>;

  return (
    typeof effect.id === "string" &&
    typeof effect.landmark === "string" &&
    typeof effect.effect === "string" &&
    typeof effect.xPercent === "number" &&
    typeof effect.yPercent === "number" &&
    typeof effect.widthPercent === "number" &&
    typeof effect.heightPercent === "number" &&
    typeof effect.opacity === "number" &&
    typeof effect.frameCount === "number" &&
    typeof effect.durationMs === "number" &&
    typeof effect.enabled === "boolean"
  );
}

export function mergeHomeEffectQaEdits(value: unknown): HomeLandmarkEffectConfig[] {
  if (!Array.isArray(value)) {
    return HOME_LANDMARK_EFFECT_DEFS;
  }

  const editsById = new Map<string, Partial<HomeLandmarkEffectConfig>>();
  value.forEach((item) => {
    if (item && typeof item === "object" && "id" in item && typeof item.id === "string") {
      editsById.set(item.id, item as Partial<HomeLandmarkEffectConfig>);
    }
  });

  const merged = HOME_LANDMARK_EFFECT_DEFS.map((base) => {
    const edit = editsById.get(base.id);
    if (!edit) return base;

    return {
      ...base,
      landmark: HOME_EFFECT_ANCHORS.has(edit.landmark as HomeEffectAnchorId) ? (edit.landmark as HomeEffectAnchorId) : base.landmark,
      effect: HOME_EFFECT_TYPES.has(edit.effect as HomeEffectId) ? (edit.effect as HomeEffectId) : base.effect,
      xPercent: typeof edit.xPercent === "number" ? edit.xPercent : base.xPercent,
      yPercent: typeof edit.yPercent === "number" ? edit.yPercent : base.yPercent,
      widthPercent: typeof edit.widthPercent === "number" ? edit.widthPercent : base.widthPercent,
      heightPercent: typeof edit.heightPercent === "number" ? edit.heightPercent : base.heightPercent,
      opacity: typeof edit.opacity === "number" ? edit.opacity : base.opacity,
      frameCount: typeof edit.frameCount === "number" ? edit.frameCount : base.frameCount,
      durationMs: typeof edit.durationMs === "number" ? edit.durationMs : base.durationMs,
      enabled: typeof edit.enabled === "boolean" ? edit.enabled : base.enabled,
      rotationDeg: typeof edit.rotationDeg === "number" ? edit.rotationDeg : base.rotationDeg,
      yawDeg: typeof edit.yawDeg === "number" ? edit.yawDeg : base.yawDeg,
      originXPercent: typeof edit.originXPercent === "number" ? edit.originXPercent : base.originXPercent,
      originYPercent: typeof edit.originYPercent === "number" ? edit.originYPercent : base.originYPercent,
      flipX: typeof edit.flipX === "boolean" ? edit.flipX : base.flipX,
      flipY: typeof edit.flipY === "boolean" ? edit.flipY : base.flipY,
      backgroundY: typeof edit.backgroundY === "string" ? edit.backgroundY : base.backgroundY,
      mobileDisabled: typeof edit.mobileDisabled === "boolean" ? edit.mobileDisabled : base.mobileDisabled,
    };
  });

  value.forEach((item) => {
    if (!isValidHomeEffectDraft(item)) return;
    if (HOME_LANDMARK_EFFECT_DEFS.some((base) => base.id === item.id)) return;
    merged.push({
      ...item,
      rotationDeg: typeof item.rotationDeg === "number" ? item.rotationDeg : undefined,
      yawDeg: typeof item.yawDeg === "number" ? item.yawDeg : undefined,
      originXPercent: typeof item.originXPercent === "number" ? item.originXPercent : undefined,
      originYPercent: typeof item.originYPercent === "number" ? item.originYPercent : undefined,
      flipX: typeof item.flipX === "boolean" ? item.flipX : undefined,
      flipY: typeof item.flipY === "boolean" ? item.flipY : undefined,
      backgroundY: typeof item.backgroundY === "string" ? item.backgroundY : undefined,
      mobileDisabled: typeof item.mobileDisabled === "boolean" ? item.mobileDisabled : undefined,
    });
  });

  return merged;
}

export function createDuplicateEffectId(baseId: string, effects: HomeLandmarkEffectConfig[]) {
  const ids = new Set(effects.map((effect) => effect.id));
  let index = 1;
  let candidate = `${baseId}-copy`;

  while (ids.has(candidate)) {
    index += 1;
    candidate = `${baseId}-copy-${index}`;
  }

  return candidate;
}
