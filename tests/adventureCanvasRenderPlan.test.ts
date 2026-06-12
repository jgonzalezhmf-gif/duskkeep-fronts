import { describe, expect, it } from "vitest";
import { buildAdventureCanvasRenderPlan } from "@/components/game/adventure/canvas/adventureCanvasRenderer";
import type { AdventureCanvasSceneModel } from "@/features/canvas-runtime/adventureAdapter";

describe("Adventure canvas render plan", () => {
  it("builds visible Pixi primitives for routes, nodes, selected focus and interaction props", () => {
    const plan = buildAdventureCanvasRenderPlan(createSceneModel());

    expect(plan.routes).toEqual([
      expect.objectContaining({
        id: "route-a-b",
        color: 0xeeb456,
        alpha: expect.any(Number),
      }),
    ]);
    expect(plan.routeMarkers).toHaveLength(2);
    expect(plan.routeMarkers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "route-a-b-rune-0",
          color: 0xf5c451,
          alpha: expect.any(Number),
        }),
        expect.objectContaining({
          id: "route-a-b-rune-1",
          color: 0xf5c451,
          alpha: expect.any(Number),
        }),
      ]),
    );
    expect(plan.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "node-a",
          selected: true,
          fillColor: 0xf5c451,
          haloColor: 0xf5c451,
        }),
        expect.objectContaining({
          id: "node-b",
          locked: true,
          fillColor: 0x344055,
        }),
      ]),
    );
    expect(plan.focus).toEqual(
      expect.objectContaining({
        id: "node-a-focus",
        radius: expect.any(Number),
      }),
    );
    expect(plan.props).toEqual([
      expect.objectContaining({
        id: "cache-a",
        selected: true,
        color: 0xf5c451,
      }),
    ]);
  });
});

function createSceneModel(): AdventureCanvasSceneModel {
  return {
    designSize: { width: 1920, height: 1080 },
    chapter: 1,
    meta: {
      name: "Chapter",
      subtitle: "Frontier",
      accent: "#f5c451",
      scene: "adventureAsh",
      terrainLabel: "Ash road",
      threatLabel: "Low",
    },
    background: { manifest: "screenBackground", id: "adventure" },
    selected: { nodeId: "node-a", interactionId: "cache-a" },
    routes: [
      {
        id: "route-a-b",
        fromNodeId: "node-a",
        toNodeId: "node-b",
        state: "available",
        pathPoints: [
          { x: 100, y: 200 },
          { x: 180, y: 170 },
          { x: 260, y: 230 },
          { x: 340, y: 200 },
        ],
      },
    ],
    nodes: [
      {
        id: "node-a",
        label: "Gate",
        accessibleLabel: "Gate battle current",
        index: 1,
        total: 2,
        position: { x: 100, y: 200 },
        size: 50,
        zIndex: 20,
        type: "battle",
        status: "current",
        selected: true,
        assetRef: { manifest: "adventureNode", id: "current" },
        stateFlags: {
          locked: false,
          cleared: false,
          current: true,
          claimed: false,
          available: true,
          pausedHere: false,
          firstClearAvailable: true,
        },
        intent: { type: "selectNode", nodeId: "node-a" },
      },
      {
        id: "node-b",
        label: "Seal",
        accessibleLabel: "Seal battle locked",
        index: 2,
        total: 2,
        position: { x: 340, y: 200 },
        size: 46,
        zIndex: 20,
        type: "battle",
        status: "locked",
        selected: false,
        assetRef: { manifest: "adventureNode", id: "locked" },
        stateFlags: {
          locked: true,
          cleared: false,
          current: false,
          claimed: false,
          available: false,
          pausedHere: false,
          firstClearAvailable: false,
        },
        intent: { type: "selectNode", nodeId: "node-b" },
      },
    ],
    props: [
      {
        id: "cache-a",
        type: "key_chest",
        position: { x: 220, y: 260 },
        dimensions: { width: 64, height: 64 },
        zIndex: 32,
        opacity: 1,
        rotation: { x: 0, y: 0, z: 0 },
        assetRef: { manifest: "adventureMapInteraction", id: "key_chest_claimable" },
        interaction: {
          id: "cache-a",
          kind: "keyChest",
          status: "ready",
          selected: true,
          intent: { type: "selectInteraction", interactionId: "cache-a" },
        },
      },
    ],
    partyMarker: {
      anchorNodeId: "node-a",
      position: { x: 100, y: 160 },
      size: 64,
      zIndex: 40,
      style: "banner",
      intent: { type: "selectNode", nodeId: "node-a" },
    },
  };
}
