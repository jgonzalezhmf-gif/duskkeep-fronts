import { EVENTS_BY_ID } from "@/data/events";
import { TD_EVENT_BY_ID } from "@/data/towerDefense";
import { getAdventureLevelForFrontline, getFrontlinePresetForAdventure } from "@/features/frontline/adventure";
import { FRONTLINE_PRESET_BY_ID } from "@/features/frontline/data";
import type { FrontlinePreset } from "@/features/frontline/types";

export const FRONTLINE_ARENA_PRESET_BY_OPPONENT_ID: Record<string, string> = {
  arena_bonewood: "bonewood_raiders",
  arena_plague: "plague_pack",
  arena_ember: "ember_court",
};

export const FRONTLINE_LADDER_PRESET_BY_OPPONENT_ID: Record<string, string> = {
  ladder_bronze_iii_iron_vow: "bonewood_scouts",
  ladder_bronze_ii_ash_squire: "bonewood_raiders",
  ladder_bronze_i_dusk_knight: "rotwood_pack",
};

export const FRONTLINE_EVENT_PRESET_BY_EVENT_ID: Record<string, string> = {
  gold_rush: "bonewood_raiders",
  arcane_surge: "plague_pack",
  td_fortress_siege: "ember_court",
};

export function getFrontlinePresetForArenaOpponent(opponentId: string): FrontlinePreset | null {
  return getFrontlinePresetByMappedId(FRONTLINE_ARENA_PRESET_BY_OPPONENT_ID[opponentId]);
}

export function getFrontlinePresetForLadderOpponent(opponentId: string): FrontlinePreset | null {
  return getFrontlinePresetByMappedId(FRONTLINE_LADDER_PRESET_BY_OPPONENT_ID[opponentId]);
}

export function getFrontlinePresetForEvent(eventId: string): FrontlinePreset | null {
  if (!EVENTS_BY_ID[eventId] && !TD_EVENT_BY_ID[eventId]) return null;
  return getFrontlinePresetByMappedId(FRONTLINE_EVENT_PRESET_BY_EVENT_ID[eventId]);
}

export function getFrontlinePresetForAdventureNode(nodeId: string): FrontlinePreset | null {
  const level = getAdventureLevelForFrontline(nodeId);
  return level ? getFrontlinePresetForAdventure(level) : null;
}

function getFrontlinePresetByMappedId(presetId: string | undefined): FrontlinePreset | null {
  if (!presetId) return null;
  return FRONTLINE_PRESET_BY_ID[presetId] ?? null;
}
