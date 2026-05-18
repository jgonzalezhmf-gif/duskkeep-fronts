import type { GameIconTone } from "@/components/game/shared/GameIcon";
import { FRONTLINE_ARENA_PRESET_BY_OPPONENT_ID } from "@/features/frontline/encounterPresets";
import type { Rewards } from "@/lib/types";

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export type ArenaRival = {
  id: string;
  ownerName: string;
  rank: string;
  style: string;
  presetId: string;
  power: number;
  rewards: Rewards;
  tone: GameIconTone;
  modifier: string;
};

export const FRONTLINE_ARENA_RIVALS: ArenaRival[] = [
  {
    id: "arena_bonewood",
    ownerName: "Ironfang",
    rank: "Bronze II",
    style: "Fast breach patrol",
    presetId: FRONTLINE_ARENA_PRESET_BY_OPPONENT_ID.arena_bonewood,
    power: 110,
    rewards: { gold: 120, gems: 3, accountXp: 8 },
    tone: "ember",
    modifier: "Breach weather: enemy left front starts aggressive.",
  },
  {
    id: "arena_plague",
    ownerName: "Duskrose",
    rank: "Silver III",
    style: "Sustain pressure",
    presetId: FRONTLINE_ARENA_PRESET_BY_OPPONENT_ID.arena_plague,
    power: 175,
    rewards: { gold: 180, gems: 5, dust: 20, accountXp: 10 },
    tone: "emerald",
    modifier: "Plague mist: sustain-focused enemy pressure.",
  },
  {
    id: "arena_ember",
    ownerName: "Stormking",
    rank: "Gold I",
    style: "Heavy core threat",
    presetId: FRONTLINE_ARENA_PRESET_BY_OPPONENT_ID.arena_ember,
    power: 260,
    rewards: { gold: 260, gems: 8, dust: 35, accountXp: 14 },
    tone: "gold",
    modifier: "Storm oath: heavier core threat and slower trading.",
  },
];

export function tx(t: TranslateFn, key: string, fallback: string, params?: Record<string, string | number>) {
  const value = t(key, params);
  return value === key ? fallback : value;
}

export function rivalText(t: TranslateFn, rival: ArenaRival, field: "rank" | "style") {
  return tx(t, `arenaScreen.rivals.${rival.id}.${field}`, rival[field]);
}

export function arenaModifierText(t: TranslateFn, rival: ArenaRival) {
  return tx(t, `arenaScreen.rivals.${rival.id}.modifier`, rival.modifier);
}
