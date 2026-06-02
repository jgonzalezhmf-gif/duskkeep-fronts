import type { GameIconTone } from "@/components/game/shared/GameIcon";
import { getArenaTrialMutatorForRival } from "@/features/arena/trialMutators";
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
};

export type ArenaMode = "ladder" | "trials";

export type ArenaModeIntelInput = {
  mode: ArenaMode;
  tickets: number;
  loadoutReady: boolean;
  ladderDailyWins: number;
  ladderKeyProgress: number;
};

export type ArenaModeIntel = {
  icon: "ladder" | "arena_draft";
  ready: boolean;
  statusKey: string;
  primaryLabelKey: string;
  primaryValue?: string;
  primaryValueKey?: string;
  secondaryLabelKey: string;
  secondaryValue?: string;
  secondaryValueKey?: string;
  tertiaryLabelKey: string;
  tertiaryValue?: string;
  tertiaryValueKey?: string;
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
  const mutator = getArenaTrialMutatorForRival(rival.id);
  return tx(t, mutator?.descriptionKey ?? `arenaScreen.rivals.${rival.id}.style`, rival.style);
}

export function arenaModifierLabel(t: TranslateFn, rival: ArenaRival) {
  const mutator = getArenaTrialMutatorForRival(rival.id);
  return tx(t, mutator?.labelKey ?? `arenaScreen.rivals.${rival.id}.style`, rival.style);
}

export function buildArenaModeIntel({
  mode,
  tickets,
  loadoutReady,
  ladderDailyWins,
  ladderKeyProgress,
}: ArenaModeIntelInput): ArenaModeIntel {
  if (mode === "ladder") {
    return {
      icon: "ladder",
      ready: loadoutReady,
      statusKey: loadoutReady ? "arenaScreen.modeIntel.queueReady" : "arenaScreen.gate.deckNeeded",
      primaryLabelKey: "arenaScreen.modeIntel.entry",
      primaryValueKey: "arenaScreen.ladder.noTicketCost",
      secondaryLabelKey: "arenaScreen.ladder.dailyWins",
      secondaryValue: `${ladderDailyWins}/5`,
      tertiaryLabelKey: "arenaScreen.ladder.keyProgress",
      tertiaryValue: `${ladderKeyProgress}%`,
    };
  }

  const hasTicket = tickets > 0;
  return {
    icon: "arena_draft",
    ready: loadoutReady && hasTicket,
    statusKey: !loadoutReady ? "arenaScreen.gate.deckNeeded" : hasTicket ? "arenaScreen.floor.entryReady" : "arenaScreen.floor.noTickets",
    primaryLabelKey: "arenaScreen.gate.ticket",
    primaryValue: String(tickets),
    secondaryLabelKey: "arenaScreen.modeIntel.rules",
    secondaryValueKey: "arenaScreen.trials.modeMeta",
    tertiaryLabelKey: "arenaScreen.modeIntel.payoff",
    tertiaryValueKey: "arenaScreen.trials.specialReward",
  };
}
