"use client";

import type { MusicAssetChannel } from "@/lib/audio-runtime";

type DuskkeepMusicAssetGlobal = typeof globalThis & {
  __duskkeepMusicElements?: Set<HTMLAudioElement>;
};

export function getMusicElementRegistry() {
  if (typeof window === "undefined") return null;
  const audioGlobal = globalThis as DuskkeepMusicAssetGlobal;
  audioGlobal.__duskkeepMusicElements ??= new Set<HTMLAudioElement>();
  return audioGlobal.__duskkeepMusicElements;
}

export function registerMusicElement(audio: HTMLAudioElement) {
  getMusicElementRegistry()?.add(audio);
}

export function disposeMusicElement(audio: HTMLAudioElement) {
  getMusicElementRegistry()?.delete(audio);
  audio.pause();
  audio.src = "";
  audio.load();
}

export function stopUntrackedMusicElements(except?: HTMLAudioElement) {
  const registry = getMusicElementRegistry();
  if (!registry) return;
  for (const audio of Array.from(registry)) {
    if (audio === except) continue;
    disposeMusicElement(audio);
  }
}

export function fadeHtmlAudio(
  channel: MusicAssetChannel,
  targetVolume: number,
  seconds: number,
  onDone?: () => void,
) {
  if (typeof window === "undefined") return;
  if (channel.timer !== null) {
    window.clearInterval(channel.timer);
    channel.timer = null;
  }

  const startVolume = channel.audio.volume;
  const duration = Math.max(0.02, seconds);
  const startedAt = performance.now();
  channel.timer = window.setInterval(() => {
    const progress = Math.min(1, (performance.now() - startedAt) / (duration * 1000));
    channel.audio.volume = startVolume + (targetVolume - startVolume) * progress;
    if (progress >= 1) {
      if (channel.timer !== null) window.clearInterval(channel.timer);
      channel.timer = null;
      onDone?.();
    }
  }, 40);
}
