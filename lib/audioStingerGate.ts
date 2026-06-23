import type { AudioStingerName } from "@/lib/audio-score";

export const DEFAULT_STINGER_DEDUP_WINDOW_MS = 1200;

export function shouldStartStinger(
  lastStartedAt: Partial<Record<AudioStingerName, number>>,
  name: AudioStingerName,
  now = Date.now(),
  windowMs = DEFAULT_STINGER_DEDUP_WINDOW_MS,
) {
  const previousStartedAt = lastStartedAt[name];
  if (previousStartedAt !== undefined && now - previousStartedAt < windowMs) return false;
  lastStartedAt[name] = now;
  return true;
}
