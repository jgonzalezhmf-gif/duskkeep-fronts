import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveAdventureCanvasMapPresentation } from "@/features/canvas-runtime/runtimeConfig";

describe("Adventure canvas map wiring", () => {
  it("keeps the DOM Adventure map as the default presentation", () => {
    expect(resolveAdventureCanvasMapPresentation({ query: "" })).toEqual({
      renderer: "dom",
      reason: "default",
      modeSource: "default",
      canvasRequested: false,
    });
  });

  it("allows ?canvas=1 to opt into the Canvas runtime island when safe", () => {
    expect(resolveAdventureCanvasMapPresentation({ query: "?canvas=1" })).toEqual({
      renderer: "canvas",
      reason: "enabled",
      modeSource: "query",
      canvasRequested: true,
    });
  });

  it("keeps QA/editor and reduced-capability paths DOM-only even when canvas is requested", () => {
    expect(
      resolveAdventureCanvasMapPresentation({
        query: "?canvas=1",
        qaMapEditor: true,
      }),
    ).toEqual({
      renderer: "dom",
      reason: "qa-editor",
      modeSource: "query",
      canvasRequested: true,
    });

    expect(
      resolveAdventureCanvasMapPresentation({
        query: "?canvas=1",
        reducedCapability: true,
      }),
    ).toEqual({
      renderer: "dom",
      reason: "reduced-capability",
      modeSource: "query",
      canvasRequested: true,
    });
  });

  it("keeps Adventure node interactions in invisible DOM hit targets when canvas owns the visuals", () => {
    const campaignSceneSource = readFileSync(resolve("components/game/adventure/AdventureCampaignScene.tsx"), "utf8");
    const nodeElementSource = readFileSync(resolve("components/game/adventure/AdventureMapNodeElement.tsx"), "utf8");

    expect(campaignSceneSource).toContain('visualMode={canvasSceneModel ? "canvasOverlay" : "dom"}');
    expect(nodeElementSource).toContain('visualMode?: "dom" | "canvasOverlay";');
    expect(nodeElementSource).toContain('data-adventure-canvas-hit-target="true"');
  });

  it("keeps the DOM background layer out of the canvas-owned Adventure map", () => {
    const campaignSceneSource = readFileSync(resolve("components/game/adventure/AdventureCampaignScene.tsx"), "utf8");

    expect(campaignSceneSource).toContain("data-adventure-dom-background-layer");
    expect(campaignSceneSource).toContain("!canvasSceneModel ? (");
  });
});
