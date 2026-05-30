import { describe, expect, it } from "vitest";
import { createDefaultLadderState } from "@/features/ladder/data";
import { planLocalLadderResult } from "@/features/ladder/resultState";

describe("ladder local result planning", () => {
  it("grants normal win rewards and key progress for the expected opponent", () => {
    const plan = planLocalLadderResult({
      ladder: createDefaultLadderState(),
      opponentId: "ladder_bronze_iii_iron_vow",
      winner: "ally",
      victoryRewards: { gold: 60, dust: 4, accountXp: 4 },
      today: "2026-05-28",
    });

    expect(plan).toEqual({
      ok: true,
      ladder: {
        seasonId: "alpha_s1",
        points: 25,
        league: "bronze",
        division: "iii",
        keyProgress: 35,
        dailyRewardedWins: 1,
        dailyCycleKey: "2026-05-28",
      },
      rewards: { gold: 60, dust: 4, accountXp: 4 },
      pointsDelta: 25,
      keyProgressDelta: 35,
      adventureKeysGranted: 0,
    });
  });

  it("uses reduced win rewards after the daily rewarded win limit", () => {
    const plan = planLocalLadderResult({
      ladder: {
        ...createDefaultLadderState(),
        dailyRewardedWins: 5,
        dailyCycleKey: "2026-05-28",
      },
      opponentId: "ladder_bronze_iii_iron_vow",
      winner: "ally",
      victoryRewards: { gold: 60, dust: 4, accountXp: 4 },
      today: "2026-05-28",
    });

    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.rewards).toEqual({ gold: 15, accountXp: 1 });
    expect(plan.keyProgressDelta).toBe(0);
    expect(plan.ladder.dailyRewardedWins).toBe(5);
  });

  it("accepts any active same-division simulated commander", () => {
    const plan = planLocalLadderResult({
      ladder: createDefaultLadderState(),
      opponentId: "ladder_bronze_iii_candle_warden",
      winner: "ally",
      victoryRewards: { gold: 60, dust: 4, accountXp: 4 },
      today: "2026-05-28",
    });

    expect(plan.ok).toBe(true);
  });

  it("rejects stale or mismatched ladder opponents", () => {
    expect(
      planLocalLadderResult({
        ladder: createDefaultLadderState(),
        opponentId: "ladder_bronze_ii_ash_squire",
        winner: "ally",
        victoryRewards: { gold: 60 },
        today: "2026-05-28",
      }),
    ).toEqual({ ok: false, reason: "Ladder opponent locked" });
  });
});
