import { describe, expect, it } from "vitest";
import {
  getCoreShockChange,
  getResolutionPlaybackEvents,
  MAX_RESOLUTION_PLAYBACK_EVENTS,
} from "@/components/game/frontline/FrontlineBattleDerivedState";
import type { FrontlineEvent, FrontlineEventKind } from "@/features/frontline/types";

function event(kind: FrontlineEventKind, id: string): FrontlineEvent {
  return { id, kind, label: id };
}

describe("frontline battle derived state", () => {
  it("returns null when neither core loses hp", () => {
    expect(getCoreShockChange({ ally: 20, enemy: 18 }, { ally: 20, enemy: 18 }, 1)).toBeNull();
  });

  it("tracks ally core damage", () => {
    expect(getCoreShockChange({ ally: 20, enemy: 18 }, { ally: 16, enemy: 18 }, 2)).toEqual({
      side: "ally",
      amount: 4,
      key: 2,
    });
  });

  it("tracks enemy core damage", () => {
    expect(getCoreShockChange({ ally: 20, enemy: 18 }, { ally: 20, enemy: 13 }, 3)).toEqual({
      side: "enemy",
      amount: 5,
      key: 3,
    });
  });

  it("prefers ally when both cores lose the same amount", () => {
    expect(getCoreShockChange({ ally: 20, enemy: 18 }, { ally: 17, enemy: 15 }, 4)).toEqual({
      side: "ally",
      amount: 3,
      key: 4,
    });
  });

  it("keeps only resolution playback events", () => {
    const events = [
      event("card", "card-1"),
      event("damage", "damage-1"),
      event("round", "round-1"),
      event("breach", "breach-1"),
      event("boss_signature", "boss-1"),
    ];

    expect(getResolutionPlaybackEvents(events).map((entry) => entry.id)).toEqual(["damage-1", "breach-1"]);
  });

  it("keeps enemy card and power beats in resolution playback", () => {
    const events: FrontlineEvent[] = [
      { ...event("card", "ally-card"), side: "ally", lane: "left" },
      { ...event("card", "enemy-card"), side: "enemy", lane: "center" },
      { ...event("power", "enemy-power"), side: "enemy", lane: "right" },
      event("damage", "damage-1"),
    ];

    expect(getResolutionPlaybackEvents(events).map((entry) => entry.id)).toEqual([
      "enemy-card",
      "enemy-power",
      "damage-1",
    ]);
  });

  it("caps resolution playback events", () => {
    const events = Array.from({ length: MAX_RESOLUTION_PLAYBACK_EVENTS + 3 }, (_, index) => event("damage", `damage-${index}`));

    expect(getResolutionPlaybackEvents(events)).toHaveLength(MAX_RESOLUTION_PLAYBACK_EVENTS);
    expect(getResolutionPlaybackEvents(events).at(-1)?.id).toBe(`damage-${MAX_RESOLUTION_PLAYBACK_EVENTS - 1}`);
  });
});
