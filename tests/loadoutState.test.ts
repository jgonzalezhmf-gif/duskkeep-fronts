import { describe, expect, it } from "vitest";
import { createDefaultFrontlineLoadout } from "@/features/frontline/engine";
import {
  setDeckSlotState,
  setFrontlineLeaderState,
  setFrontlineSquadSlotState,
  setTeamSlotState,
  toggleFrontlineDeckCardState,
} from "@/lib/loadoutState";

describe("loadout state helpers", () => {
  it("keeps a hero in only one team slot", () => {
    expect(setTeamSlotState(["bran", "kara", "mira", null], 2, "bran")).toEqual([null, "kara", "bran", null]);
  });

  it("keeps a card in only one deck slot", () => {
    expect(setDeckSlotState(["guard_break", "quick_step", null], 2, "guard_break")).toEqual([
      null,
      "quick_step",
      "guard_break",
    ]);
  });

  it("sets frontline leader without changing squad or deck", () => {
    const loadout = createDefaultFrontlineLoadout();

    expect(setFrontlineLeaderState(loadout, "morrow").leaderId).toBe("morrow");
    expect(setFrontlineLeaderState(loadout, "morrow").squad).toEqual(loadout.squad);
    expect(setFrontlineLeaderState(loadout, "morrow").deck).toEqual(loadout.deck);
  });

  it("keeps a hero in only one frontline squad slot", () => {
    const loadout = {
      ...createDefaultFrontlineLoadout(),
      squad: ["bran", "kara", "mira"] as [string | null, string | null, string | null],
    };

    expect(setFrontlineSquadSlotState(loadout, 1, "bran").squad).toEqual([null, "bran", "mira"]);
  });

  it("removes an existing frontline deck card when toggled", () => {
    const loadout = {
      ...createDefaultFrontlineLoadout(),
      deck: ["guard_break", "quick_step"],
    };

    expect(toggleFrontlineDeckCardState(loadout, "guard_break", 3).deck).toEqual(["quick_step"]);
  });

  it("adds or replaces frontline deck cards using the existing deck-size policy", () => {
    const loadout = {
      ...createDefaultFrontlineLoadout(),
      deck: ["guard_break", "quick_step", "holy_ward"],
    };

    expect(toggleFrontlineDeckCardState(loadout, "dark_bolt", 3).deck).toEqual([
      "guard_break",
      "quick_step",
      "dark_bolt",
    ]);
  });
});
