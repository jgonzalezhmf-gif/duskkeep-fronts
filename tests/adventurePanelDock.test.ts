import { describe, expect, it } from "vitest";
import { ADVENTURE_MAP_CHAPTER_LAYOUTS } from "@/features/adventure/mapLayout";
import {
  getAdventurePanelDockForY,
  getAdventureSelectedFocusY,
} from "@/components/game/adventure/adventurePanelDock";

describe("Adventure map panel docking", () => {
  it("docks lower mission nodes above the map so the panel does not cover them", () => {
    const chapterOneFocusY = getAdventureSelectedFocusY({
      mapLayout: ADVENTURE_MAP_CHAPTER_LAYOUTS[1],
      selectedNodeId: "c1l1",
    });
    const chapterTwoFocusY = getAdventureSelectedFocusY({
      mapLayout: ADVENTURE_MAP_CHAPTER_LAYOUTS[2],
      selectedNodeId: "c2l1",
    });

    expect(getAdventurePanelDockForY(chapterOneFocusY)).toBe("top");
    expect(getAdventurePanelDockForY(chapterTwoFocusY)).toBe("top");
  });

  it("keeps upper mission nodes docked near the bottom", () => {
    const focusY = getAdventureSelectedFocusY({
      mapLayout: ADVENTURE_MAP_CHAPTER_LAYOUTS[1],
      selectedNodeId: "c1l12",
    });

    expect(getAdventurePanelDockForY(focusY)).toBe("bottom");
  });

  it("uses the selected map interaction position before falling back to the node", () => {
    const focusY = getAdventureSelectedFocusY({
      mapLayout: ADVENTURE_MAP_CHAPTER_LAYOUTS[1],
      selectedInteractionId: "c1-lower-cache",
      selectedNodeId: "c1l12",
    });

    expect(focusY).toBeGreaterThan(900);
    expect(getAdventurePanelDockForY(focusY)).toBe("top");
  });

  it("moves mid-map selections upward when details are expanded", () => {
    const focusY = getAdventureSelectedFocusY({
      mapLayout: ADVENTURE_MAP_CHAPTER_LAYOUTS[1],
      selectedNodeId: "c1l4",
    });

    expect(getAdventurePanelDockForY(focusY)).toBe("bottom");
    expect(getAdventurePanelDockForY(focusY, { expanded: true })).toBe("top");
  });

  it("falls back to the bottom dock when the selected map item cannot be resolved", () => {
    expect(
      getAdventurePanelDockForY(
        getAdventureSelectedFocusY({
          mapLayout: ADVENTURE_MAP_CHAPTER_LAYOUTS[1],
          selectedInteractionId: "missing-cache",
          selectedNodeId: "missing-node",
        }),
      ),
    ).toBe("bottom");
  });
});
