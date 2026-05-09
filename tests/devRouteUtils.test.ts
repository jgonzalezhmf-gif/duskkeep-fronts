import { describe, expect, it } from "vitest";

import {
  normalizeLayout,
  renderAdventureMapLayout,
} from "@/app/api/dev/adventure-map-layout/adventureMapLayoutRouteUtils";
import {
  normalizeHomeEffect,
  renderHomeEffectLayout,
} from "@/app/api/dev/home-effects/homeEffectsRouteUtils";

describe("dev route utilities", () => {
  it("normalizes valid Home effect payloads and rejects invalid assets", () => {
    expect(
      normalizeHomeEffect({
        id: "world-flame",
        landmark: "world",
        effect: "flame_loop",
        xPercent: 10.04,
        yPercent: 20.06,
        widthPercent: 30.02,
        heightPercent: 40.09,
        opacity: 1.4,
        frameCount: 6,
        durationMs: 700,
        enabled: true,
      }),
    ).toMatchObject({
      id: "world-flame",
      landmark: "world",
      effect: "flame_loop",
      xPercent: 10,
      yPercent: 20.1,
      opacity: 1,
      frameCount: 6,
      enabled: true,
    });

    expect(
      normalizeHomeEffect({
        id: "bad",
        landmark: "world",
        effect: "missing_asset",
        xPercent: 0,
        yPercent: 0,
        widthPercent: 10,
        heightPercent: 10,
        opacity: 1,
        frameCount: 1,
        durationMs: 100,
        enabled: true,
      }),
    ).toBeNull();
  });

  it("normalizes Adventure map layouts with interactions and rejects incomplete nodes", () => {
    const layout = normalizeLayout({
      nodes: [{ id: "c1l1", x: 420.04, y: 780.05, type: "battle", status: "current", connectsTo: ["c1l2"] }],
      routes: [{ id: "route-1", from: "c1l1", to: "c1l2", state: "available", control1: { x: 500.02, y: 720.09 } }],
      props: [
        {
          id: "cache",
          type: "key_chest",
          x: 1400,
          y: 850,
          width: 90,
          height: 80,
          zIndex: 12,
          enabled: true,
          interaction: { id: "c1-cache", kind: "keyChest", keyCost: 1, unlockAfter: ["c1l2"] },
        },
      ],
      partyMarker: { size: 56, zIndex: 28, style: "banner", anchorNodeId: "c1l1" },
    });

    expect(layout).toMatchObject({
      nodes: [{ id: "c1l1", x: 420, y: 780.1, type: "battle", status: "current", connectsTo: ["c1l2"] }],
      routes: [{ id: "route-1", from: "c1l1", to: "c1l2", state: "available", control1: { x: 500, y: 720.1 } }],
      props: [{ id: "cache", type: "key_chest", interaction: { id: "c1-cache", kind: "keyChest", keyCost: 1, unlockAfter: ["c1l2"] } }],
    });

    expect(normalizeLayout({ nodes: [{ id: "bad", x: 1 }] })).toBeNull();
  });

  it("renders generated layout modules with required exported constants", () => {
    const homeOutput = renderHomeEffectLayout([]);
    const adventureOutput = renderAdventureMapLayout({ 1: { nodes: [{ id: "c1l1", x: 1, y: 2 }] } });

    expect(homeOutput).toContain("HOME_LANDMARK_EFFECT_DEFS");
    expect(homeOutput).toContain("HOME_WORLD_EFFECTS");
    expect(adventureOutput).toContain("ADVENTURE_MAP_INTERACTION_KINDS");
    expect(adventureOutput).toContain("ADVENTURE_MAP_CHAPTER_LAYOUTS");
  });
});
