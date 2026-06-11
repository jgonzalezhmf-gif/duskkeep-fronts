import { describe, expect, it } from "vitest";
import { buildAdventureCanvasSceneModel } from "@/features/canvas-runtime/adventureAdapter";
import type { AdventureMapChapterLayout } from "@/features/adventure/mapLayout";
import type { AdventureCampaignMeta, AdventureNodeState } from "@/features/adventure/campaignTypes";

const meta: AdventureCampaignMeta = {
  name: "Ash Road",
  subtitle: "Chapter I",
  accent: "#f5c451",
  scene: "adventureAsh",
  hint: "Follow the road.",
  atmosphere: "Ash storm",
  terrainLabel: "Burnt road",
  threatLabel: "Rising",
  landmarks: [],
};

function node(id: string, index: number, patch: Partial<AdventureNodeState> = {}): AdventureNodeState {
  return {
    lvl: {
      id,
      chapter: 1,
      index,
      name: `Level ${index}`,
      enemyTeam: [],
      rewards: { gold: 999 },
      firstClearRewards: { gems: 10 },
      recommendedPower: 100,
    },
    cleared: false,
    locked: false,
    current: false,
    pausedHere: false,
    firstClearAvailable: false,
    ...patch,
  };
}

describe("Adventure canvas scene model adapter", () => {
  it("maps Adventure nodes and explicit route curves into renderer-safe presentation data", () => {
    const layout: AdventureMapChapterLayout = {
      nodes: [
        { id: "c1l1", x: 100, y: 200, type: "battle", size: 50, zIndex: 10, connectsTo: ["c1l2"] },
        { id: "c1l2", x: 320, y: 260, type: "boss", size: 70, zIndex: 12 },
      ],
      routes: [
        {
          id: "road-1",
          from: "c1l1",
          to: "c1l2",
          state: "available",
          control1: { x: 160, y: 210 },
          control2: { x: 260, y: 250 },
        },
      ],
    };

    const model = buildAdventureCanvasSceneModel({
      meta,
      chapter: 1,
      nodes: [node("c1l1", 1), node("c1l2", 2, { current: true })],
      mapLayout: layout,
      selectedId: "c1l2",
    });

    expect(model.designSize).toEqual({ width: 1920, height: 1080 });
    expect(model.background).toMatchObject({ manifest: "screenBackground", id: "adventure" });
    expect(model.nodes).toEqual([
      expect.objectContaining({
        id: "c1l1",
        label: "Level 1",
        position: { x: 100, y: 200 },
        size: 50,
        type: "battle",
        status: "available",
        selected: false,
        assetRef: { manifest: "adventureNode", id: "battle" },
        intent: { type: "selectNode", nodeId: "c1l1" },
      }),
      expect.objectContaining({
        id: "c1l2",
        label: "Level 2",
        position: { x: 320, y: 260 },
        size: 70,
        type: "boss",
        status: "current",
        selected: true,
        assetRef: { manifest: "adventureNode", id: "current" },
        stateFlags: expect.objectContaining({ current: true, available: true }),
      }),
    ]);
    expect(model.routes).toEqual([
      {
        id: "road-1",
        fromNodeId: "c1l1",
        toNodeId: "c1l2",
        state: "available",
        pathPoints: [
          { x: 100, y: 200 },
          { x: 160, y: 210 },
          { x: 260, y: 250 },
          { x: 320, y: 260 },
        ],
      },
    ]);
    const serializedModel = JSON.stringify(model);
    expect(serializedModel).not.toContain("rewards");
    expect(serializedModel).not.toContain("firstClearRewards");
    expect(serializedModel).not.toContain("enemyTeam");
    expect(serializedModel).not.toContain("gold");
    expect(serializedModel).not.toContain("gems");
    expect(serializedModel).not.toContain("recommendedPower");
  });

  it("maps props and interaction intents without emitting authority data", () => {
    const layout: AdventureMapChapterLayout = {
      nodes: [{ id: "c1l1", x: 100, y: 200, type: "battle" }],
      props: [
        {
          id: "cache",
          type: "key_chest",
          x: 420,
          y: 510,
          size: 90,
          zIndex: 32,
          enabled: true,
          interaction: {
            id: "c1-lower-cache",
            kind: "keyChest",
            keyCost: 5,
            unlockAfter: ["c1l1"],
            rewardId: "secret-loot",
          },
        },
        {
          id: "disabled-glow",
          type: "hidden_glow",
          x: 10,
          y: 20,
          size: 40,
          zIndex: 1,
          enabled: false,
        },
      ],
    };

    const model = buildAdventureCanvasSceneModel({
      meta,
      chapter: 1,
      nodes: [node("c1l1", 1)],
      mapLayout: layout,
      selectedId: "c1l1",
      selectedInteractionId: "c1-lower-cache",
      interactionStates: { "c1-lower-cache": "ready" },
    });

    expect(model.props).toEqual([
      expect.objectContaining({
        id: "cache",
        type: "key_chest",
        position: { x: 420, y: 510 },
        dimensions: { width: 90, height: 90 },
        zIndex: 32,
        assetRef: { manifest: "adventureMapInteraction", id: "key_chest_claimable" },
        interaction: {
          id: "c1-lower-cache",
          kind: "keyChest",
          status: "ready",
          selected: true,
          intent: { type: "selectInteraction", interactionId: "c1-lower-cache" },
        },
      }),
    ]);
    const serializedModel = JSON.stringify(model);
    expect(serializedModel).not.toContain("keyCost");
    expect(serializedModel).not.toContain("unlockAfter");
    expect(serializedModel).not.toContain("rewardId");
  });

  it("derives fallback routes and semantic visual tokens when no explicit route or manifest asset exists", () => {
    const layout: AdventureMapChapterLayout = {
      nodes: [
        { id: "c1l1", x: 50, y: 60, type: "battle", connectsTo: ["c1l2"] },
        { id: "c1l2", x: 250, y: 260, type: "battle" },
      ],
      props: [
        { id: "camp", type: "camp_prop", x: 300, y: 400, width: 80, height: 60, zIndex: 3, enabled: true },
      ],
      partyMarker: { anchorNodeId: "c1l1", size: 64, zIndex: 40, style: "banner" },
    };

    const model = buildAdventureCanvasSceneModel({
      meta,
      chapter: 1,
      nodes: [node("c1l1", 1, { cleared: true }), node("c1l2", 2, { locked: true })],
      mapLayout: layout,
      selectedId: "c1l1",
    });

    expect(model.routes[0]).toMatchObject({ id: "c1l1-c1l2", fromNodeId: "c1l1", toNodeId: "c1l2" });
    expect(model.routes[0].pathPoints).toHaveLength(4);
    expect(model.props[0]).toMatchObject({
      id: "camp",
      assetRef: { manifest: "semanticToken", id: "camp_prop" },
      dimensions: { width: 80, height: 60 },
    });
    expect(model.partyMarker).toMatchObject({
      anchorNodeId: "c1l1",
      position: { x: 50, y: 60 },
      intent: { type: "selectNode", nodeId: "c1l1" },
    });
  });
});
