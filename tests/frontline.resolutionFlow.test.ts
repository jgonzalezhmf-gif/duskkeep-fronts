import { describe, expect, it } from "vitest";
import { eventDuration } from "@/components/game/frontline/FrontlineResolutionFlow";
import { toResolutionFloatItems } from "@/components/game/frontline/FrontlineEventFloats";
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

  it("holds unit impact beats long enough to read", () => {
    expect(eventDuration(event("damage", "damage"))).toBeGreaterThanOrEqual(1380);
    expect(eventDuration(event("heal", "heal"))).toBeGreaterThanOrEqual(1240);
    expect(eventDuration(event("shield", "shield"))).toBeGreaterThanOrEqual(1240);
  });

  it("keeps lane floats for intent and core beats, not duplicated unit hits", () => {
    const items = toResolutionFloatItems([
      { ...event("damage", "unit-damage", "ally"), lane: "left", amount: 3, label: "Bran hits Rotmaw" },
      { ...event("heal", "unit-heal", "ally"), lane: "left", amount: 4, label: "Mira heals Bran" },
      { ...event("shield", "unit-shield", "ally"), lane: "left", amount: 5, label: "Barrier shields Bran" },
      { ...event("breach", "core-breach", "ally"), lane: "left", amount: 2, label: "left breach" },
      { ...event("card", "enemy-card", "enemy"), lane: "center", label: "Enemy Plague Spit" },
      { ...event("damage", "core-damage", "ally"), lane: "right", amount: 4, label: "Solar Lance burns the core" },
    ]);

    expect(items.map((item) => item.id)).toEqual(["core-breach", "enemy-card", "core-damage"]);
  });
});
