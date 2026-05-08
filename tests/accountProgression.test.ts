import { describe, expect, it } from "vitest";
import { applyAccountXpReward } from "@/lib/accountProgression";
import type { AccountState } from "@/lib/types";

const account: AccountState = {
  name: "Commander",
  level: 2,
  xp: 40,
  createdAt: "2026-05-08T00:00:00.000Z",
};

describe("account progression", () => {
  it("returns null when no account XP reward is present", () => {
    expect(applyAccountXpReward(account, undefined, null)).toBeNull();
    expect(applyAccountXpReward(account, 0, null)).toBeNull();
  });

  it("adds account XP without leveling up", () => {
    expect(applyAccountXpReward(account, 50, null)).toEqual({
      account: { ...account, xp: 90, level: 2 },
    });
  });

  it("levels up and carries overflow XP", () => {
    expect(applyAccountXpReward(account, 180, null)).toEqual({
      account: { ...account, xp: 20, level: 3 },
      pendingUnlockLevel: 3,
    });
  });

  it("keeps the highest pending unlock level", () => {
    expect(applyAccountXpReward(account, 180, 5)).toEqual({
      account: { ...account, xp: 20, level: 3 },
      pendingUnlockLevel: 5,
    });
  });
});
