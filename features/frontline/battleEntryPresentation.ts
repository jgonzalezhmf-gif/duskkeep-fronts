import type { AudioThemeName } from "@/lib/audio-score";

export type BattleEntryMode = "adventure" | "boss" | "direct" | "ladder" | "arena" | "event";

export const BATTLE_ENTRY_NORMAL_DURATION_MS = 1550;
export const BATTLE_ENTRY_REDUCED_MOTION_DURATION_MS = 620;

export const BATTLE_ENTRY_THEME_BY_MODE = {
  adventure: "battle",
  boss: "boss",
  direct: "battle",
  ladder: "ladder",
  arena: "arena_trials",
  event: "event",
} as const satisfies Record<BattleEntryMode, AudioThemeName>;

export type BattleEntryCopyKeys = {
  eyebrowKey: string;
  fallbackTitleKey: string;
  subtitleKey: string;
};

const BATTLE_ENTRY_COPY_KEYS: Record<BattleEntryMode, BattleEntryCopyKeys> = {
  adventure: {
    eyebrowKey: "battleEntry.adventure.eyebrow",
    fallbackTitleKey: "battleEntry.adventure.title",
    subtitleKey: "battleEntry.adventure.subtitle",
  },
  boss: {
    eyebrowKey: "battleEntry.boss.eyebrow",
    fallbackTitleKey: "battleEntry.boss.title",
    subtitleKey: "battleEntry.boss.subtitle",
  },
  direct: {
    eyebrowKey: "battleEntry.direct.eyebrow",
    fallbackTitleKey: "battleEntry.direct.title",
    subtitleKey: "battleEntry.direct.subtitle",
  },
  ladder: {
    eyebrowKey: "battleEntry.ladder.eyebrow",
    fallbackTitleKey: "battleEntry.ladder.title",
    subtitleKey: "battleEntry.ladder.subtitle",
  },
  arena: {
    eyebrowKey: "battleEntry.arena.eyebrow",
    fallbackTitleKey: "battleEntry.arena.title",
    subtitleKey: "battleEntry.arena.subtitle",
  },
  event: {
    eyebrowKey: "battleEntry.event.eyebrow",
    fallbackTitleKey: "battleEntry.event.title",
    subtitleKey: "battleEntry.event.subtitle",
  },
};

export function battleEntryDurationMs(reducedMotion: boolean) {
  return reducedMotion ? BATTLE_ENTRY_REDUCED_MOTION_DURATION_MS : BATTLE_ENTRY_NORMAL_DURATION_MS;
}

export function battleEntryTheme(mode: BattleEntryMode) {
  return BATTLE_ENTRY_THEME_BY_MODE[mode];
}

export function battleEntryCopyKeys(mode: BattleEntryMode) {
  return BATTLE_ENTRY_COPY_KEYS[mode];
}
