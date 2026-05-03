import type { AdventureLevel } from "@/lib/types";
import { ADVENTURE_BY_ID } from "@/data/adventure";
import {
  getAdventureNodeRewardPreview,
  getAdventureVictoryRewards,
  type AdventureProgressEntry,
} from "@/features/adventure/nodeResolution";
import type { AdventureFirstClearProgress } from "@/lib/rewardVisibility";
import { FRONTLINE_PRESET_BY_ID, FRONTLINE_PRESETS, FRONTLINE_UNIT_BY_ID } from "./data";
import type { FrontlinePreset } from "./types";

const ADVENTURE_PRESET_TIERS = {
  early: "bonewood_raiders",
  mid: "plague_pack",
  late: "ember_court",
} as const;

export function getFrontlinePresetIdForAdventure(level: AdventureLevel) {
  if (level.frontlinePresetId && FRONTLINE_PRESET_BY_ID[level.frontlinePresetId]) {
    return level.frontlinePresetId;
  }

  if (level.chapter >= 2) {
    return level.index <= 2 ? ADVENTURE_PRESET_TIERS.mid : ADVENTURE_PRESET_TIERS.late;
  }
  if (level.index <= 4) return ADVENTURE_PRESET_TIERS.early;
  if (level.index <= 8) return ADVENTURE_PRESET_TIERS.mid;
  return ADVENTURE_PRESET_TIERS.late;
}

export function getFrontlinePresetForAdventure(level: AdventureLevel): FrontlinePreset {
  return FRONTLINE_PRESET_BY_ID[getFrontlinePresetIdForAdventure(level)] ?? FRONTLINE_PRESETS[0];
}

export function getAdventureLevelForFrontline(levelId?: string | null) {
  if (!levelId) return null;
  return ADVENTURE_BY_ID[levelId] ?? null;
}

export function getFrontlineAdventureSquad(level: AdventureLevel) {
  const preset = getFrontlinePresetForAdventure(level);
  return preset.squad.map((combatantId) => FRONTLINE_UNIT_BY_ID[combatantId]).filter(Boolean);
}

export function getFrontlineAdventureRewardPreview(
  level: AdventureLevel,
  progress: AdventureFirstClearProgress | undefined,
) {
  return getAdventureNodeRewardPreview(level, progress as AdventureProgressEntry | undefined);
}

export function getFrontlineAdventureVictoryRewards(level: AdventureLevel, firstClear: boolean) {
  return getAdventureVictoryRewards(level, firstClear);
}
