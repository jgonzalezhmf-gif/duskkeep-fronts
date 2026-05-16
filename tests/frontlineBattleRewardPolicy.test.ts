import { describe, expect, it } from "vitest";
import { shouldPersistBattleOutcome, shouldRecordLocalBattleOutcome } from "@/components/game/frontline/frontlineBattleRewardPolicy";

describe("frontline battle reward policy", () => {
  it("keeps local practice rewards available for guest accounts", () => {
    expect(
      shouldPersistBattleOutcome({
        accountLinkMode: "guest",
        adventureLevelActive: false,
        adventureClaimSucceeded: false,
      }),
    ).toBe(true);
  });

  it("blocks standalone battle local rewards when Supabase persistence is enabled", () => {
    expect(
      shouldPersistBattleOutcome({
        accountLinkMode: "guest",
        adventureLevelActive: false,
        adventureClaimSucceeded: false,
        serverPersistenceEnabled: true,
      }),
    ).toBe(false);
  });

  it("blocks local practice persistence for linked accounts", () => {
    expect(
      shouldPersistBattleOutcome({
        accountLinkMode: "linked",
        adventureLevelActive: false,
        adventureClaimSucceeded: false,
      }),
    ).toBe(false);
  });

  it("persists Adventure outcomes only after the Adventure claim succeeds", () => {
    expect(
      shouldPersistBattleOutcome({
        accountLinkMode: "linked",
        adventureLevelActive: true,
        adventureClaimSucceeded: false,
      }),
    ).toBe(false);

    expect(
      shouldPersistBattleOutcome({
        accountLinkMode: "linked",
        adventureLevelActive: true,
        adventureClaimSucceeded: true,
      }),
    ).toBe(true);
  });

  it("does not record local battle counters when Supabase persistence is enabled", () => {
    expect(
      shouldRecordLocalBattleOutcome({
        accountLinkMode: "guest",
        serverPersistenceEnabled: true,
      }),
    ).toBe(false);
  });

  it("keeps local battle counters available for explicit local guest mode", () => {
    expect(
      shouldRecordLocalBattleOutcome({
        accountLinkMode: "guest",
        serverPersistenceEnabled: false,
      }),
    ).toBe(true);
  });
});
