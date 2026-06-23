import { describe, expect, it } from "vitest";
import { shouldStartStinger } from "@/lib/audioStingerGate";
import type { AudioStingerName } from "@/lib/audio-score";

describe("audio stinger gate", () => {
  it("deduplicates the same stinger within the short victory window", () => {
    const startedAt: Partial<Record<AudioStingerName, number>> = {};

    expect(shouldStartStinger(startedAt, "victory", 1000)).toBe(true);
    expect(shouldStartStinger(startedAt, "victory", 1800)).toBe(false);
    expect(shouldStartStinger(startedAt, "victory", 2300)).toBe(true);
  });

  it("does not block different stingers", () => {
    const startedAt: Partial<Record<AudioStingerName, number>> = {};

    expect(shouldStartStinger(startedAt, "victory", 1000)).toBe(true);
    expect(shouldStartStinger(startedAt, "defeat", 1001)).toBe(true);
  });
});
