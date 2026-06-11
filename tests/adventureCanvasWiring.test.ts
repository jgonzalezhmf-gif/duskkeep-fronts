import { describe, expect, it } from "vitest";
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
});
