import { describe, expect, it } from "vitest";
import { eventDuration } from "@/components/game/frontline/FrontlineResolutionFlow";
import type { FrontlineEvent, FrontlineEventKind } from "@/features/frontline/types";

function event(kind: FrontlineEventKind, id: string, side?: FrontlineEvent["side"]): FrontlineEvent {
  return { id, kind, side, label: id };
}

describe("frontline resolution flow", () => {
  it("holds enemy intent beats longer than regular damage", () => {
    expect(eventDuration(event("card", "enemy-card", "enemy"))).toBeGreaterThan(eventDuration(event("damage", "damage")));
    expect(eventDuration(event("power", "enemy-power", "enemy"))).toBeGreaterThan(eventDuration(event("damage", "damage")));
  });

  it("does not slow player card playback inside resolution", () => {
    expect(eventDuration(event("card", "ally-card", "ally"))).toBe(eventDuration(event("damage", "damage")));
  });
});
