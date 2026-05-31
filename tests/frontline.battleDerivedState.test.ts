import { describe, expect, it } from "vitest";
import {
  getCoreShockChange,
  getResolutionPlaybackEvents,
  MAX_RESOLUTION_PLAYBACK_EVENTS,
} from "@/components/game/frontline/FrontlineBattleDerivedState";
import { analyzeLane, laneStatusMeta, laneStatusSubtitle } from "@/components/game/frontline/FrontlineLaneInsights";
import { FRONTLINE_PRESETS } from "@/features/frontline/data";
import { createDefaultFrontlineLoadout, createFrontlineBattleState } from "@/features/frontline/engine";
import type { FrontlineEvent, FrontlineEventKind } from "@/features/frontline/types";
import type { TranslateFn } from "@/lib/i18n/frontlineText";
import { eventPrimaryTargetSide, heroVisualState } from "@/components/game/frontline/FrontlineVisualState";

function event(kind: FrontlineEventKind, id: string): FrontlineEvent {
  return { id, kind, label: id };
}

function makeState() {
  return createFrontlineBattleState({
    seed: 77,
    allyLoadout: createDefaultFrontlineLoadout(),
    enemyPreset: FRONTLINE_PRESETS[0],
  });
}

const t: TranslateFn = (key, params) => `${key}${params?.amount ? `:${params.amount}` : ""}`;

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

  it("surfaces boosted open-lane breach pressure in lane insights", () => {
    const state = makeState();
    state.lanes.left.enemyHero = null;
    state.lanes.left.enemySupport = null;
    state.lanes.left.allyHero!.tempAtk = 3;

    const insight = analyzeLane(state, "left");

    expect(insight.status).toBe("open_breach");
    expect(insight.breachAmount).toBe(4);
    expect(laneStatusMeta(t, insight).detail).toBe("4");
    expect(laneStatusSubtitle(t, insight.lane, insight.status, insight.breachAmount ?? undefined)).toBe(
      "frontline.subtitleBreach:4",
    );
  });

  it("targets the defending core side for breach visual trails", () => {
    expect(eventPrimaryTargetSide({ ...event("breach", "ally-breach"), side: "ally", lane: "left" })).toBe("enemy");
    expect(eventPrimaryTargetSide({ ...event("breach", "enemy-breach"), side: "enemy", lane: "right" })).toBe("ally");
  });

  it("does not duplicate core-targeted events as hero float badges", () => {
    const breachSource = heroVisualState({
      side: "ally",
      focused: false,
      targeted: false,
      activeEvent: { ...event("breach", "ally-breach"), side: "ally", lane: "left", amount: 2 },
      cardFx: null,
      cardEvent: null,
    });
    const coreHealTarget = heroVisualState({
      side: "ally",
      focused: false,
      targeted: false,
      activeEvent: { ...event("heal", "core-heal"), side: "ally", lane: "left", amount: 3, label: "Sanctuary steadies the core" },
      cardFx: null,
      cardEvent: null,
    });

    expect(breachSource.attacking).toBe(true);
    expect(breachSource.floatLabel).toBeUndefined();
    expect(coreHealTarget.healed).toBe(false);
    expect(coreHealTarget.floatLabel).toBeUndefined();
  });

  it("keeps one target-local badge for unit damage", () => {
    const target = heroVisualState({
      side: "enemy",
      focused: false,
      targeted: false,
      activeEvent: { ...event("damage", "unit-damage"), side: "ally", lane: "left", amount: 4, label: "Bran hits Rotmaw" },
      cardFx: null,
      cardEvent: null,
    });

    expect(target.hit).toBe(true);
    expect(target.floatLabel).toBe("-4");
  });
});
