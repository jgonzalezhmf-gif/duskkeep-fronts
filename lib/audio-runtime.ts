"use client";

import type { AudioThemeName } from "@/lib/audio-score";

export type ThemeName = AudioThemeName | null;
export type BusName = "music" | "sfx";

export type ThemeMixProfile = {
  fadeIn: number;
  fadeOut: number;
  preRoll: number;
  dryLevel: number;
  fxLevel: number;
};

export type ThemeChannel = {
  theme: AudioThemeName;
  profile: ThemeMixProfile;
  dry: GainNode;
  fx: GainNode;
  timer: number | null;
  bar: number;
  nextBarAt: number;
  alive: boolean;
};

export type MusicAssetChannel = {
  theme: AudioThemeName;
  audio: HTMLAudioElement;
  timer: number | null;
};

export type AudioGraph = {
  ctx: AudioContext;
  masterGain: GainNode;
  musicGain: GainNode;
  themeGain: GainNode;
  musicDuckGain: GainNode;
  stingerGain: GainNode;
  sfxGain: GainNode;
  musicVerbIn: GainNode;
  musicDelayIn: GainNode;
  sfxVerbIn: GainNode;
};

export type FigureOptions = {
  bus: BusName;
  tempo?: number;
  duck?: number;
  startDelay?: number;
};

export const STORAGE_KEYS = {
  muted: "duskkeep-fronts:audio:muted",
  music: "duskkeep-fronts:audio:music-volume",
  sfx: "duskkeep-fronts:audio:sfx-volume",
} as const;

export const THEME_MIX: Record<AudioThemeName, ThemeMixProfile> = {
  home: { fadeIn: 1.7, fadeOut: 1.18, preRoll: 0.14, dryLevel: 0.92, fxLevel: 0.72 },
  intro: { fadeIn: 0.45, fadeOut: 0.58, preRoll: 0.02, dryLevel: 0.96, fxLevel: 0.58 },
  adventure: { fadeIn: 1.3, fadeOut: 0.95, preRoll: 0.1, dryLevel: 0.96, fxLevel: 0.76 },
  battle: { fadeIn: 0.82, fadeOut: 0.68, preRoll: 0.08, dryLevel: 1, fxLevel: 0.42 },
  boss: { fadeIn: 0.6, fadeOut: 0.7, preRoll: 0.06, dryLevel: 1, fxLevel: 0.46 },
  event: { fadeIn: 1.1, fadeOut: 0.88, preRoll: 0.08, dryLevel: 0.96, fxLevel: 0.68 },
  postbattle: { fadeIn: 0.55, fadeOut: 0.58, preRoll: 0.02, dryLevel: 0.92, fxLevel: 0.58 },
  prebattle: { fadeIn: 0.55, fadeOut: 0.58, preRoll: 0.02, dryLevel: 0.95, fxLevel: 0.52 },
  shop: { fadeIn: 1.05, fadeOut: 0.84, preRoll: 0.08, dryLevel: 0.94, fxLevel: 0.66 },
};

const sfxVariantCursor: Record<string, number> = {};

export function nextVariant(key: string, total: number) {
  const current = sfxVariantCursor[key] ?? 0;
  sfxVariantCursor[key] = (current + 1) % total;
  return current % total;
}

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function readStoredNumber(key: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? clamp01(value) : fallback;
  } catch {
    return fallback;
  }
}

export function readStoredMuted(fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(STORAGE_KEYS.muted) === "1";
  } catch {
    return fallback;
  }
}

export function midiToFrequency(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12);
}
