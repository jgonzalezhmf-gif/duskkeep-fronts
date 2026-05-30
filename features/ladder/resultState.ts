import type { Rewards } from "@/lib/types";
import {
  getLadderOpponentById,
  getLadderOpponentForPoints,
  getLadderRankForPoints,
  isLadderOpponentAvailableForPoints,
  LADDER_DAILY_NORMAL_WIN_LIMIT,
  type LadderState,
} from "./data";

export type LadderBattleWinner = "ally" | "enemy" | "draw";

export type LocalLadderResultPlan =
  | { ok: false; reason: "Ladder opponent locked" }
  | {
      ok: true;
      ladder: LadderState;
      rewards: Rewards;
      pointsDelta: number;
      keyProgressDelta: number;
      adventureKeysGranted: number;
    };

export function planLocalLadderResult({
  ladder,
  opponentId,
  winner,
  victoryRewards,
  today,
}: {
  ladder: LadderState;
  opponentId: string;
  winner: LadderBattleWinner;
  victoryRewards: Rewards;
  today: string;
}): LocalLadderResultPlan {
  const opponent = getLadderOpponentById(opponentId);
  if (!opponent || !isLadderOpponentAvailableForPoints(opponentId, ladder.points)) {
    return { ok: false, reason: "Ladder opponent locked" };
  }

  const pointsDelta = winner === "ally" ? opponent.pointsWin : winner === "draw" ? opponent.pointsDraw : opponent.pointsLoss;
  const nextPoints = Math.max(0, Math.min(300, ladder.points + pointsDelta));
  const nextRank = getLadderRankForPoints(nextPoints);
  const sameDay = ladder.dailyCycleKey === today;
  const dailyRewardedWins = sameDay ? ladder.dailyRewardedWins : 0;
  const normalReward = winner === "ally" && dailyRewardedWins < LADDER_DAILY_NORMAL_WIN_LIMIT;
  const keyProgressDelta = normalReward ? 35 : 0;
  const totalKeyProgress = ladder.keyProgress + keyProgressDelta;
  const adventureKeysGranted = Math.floor(totalKeyProgress / 100);
  const nextKeyProgress = totalKeyProgress % 100;
  const rewards =
    winner === "ally"
      ? normalReward
        ? { ...victoryRewards, ...(adventureKeysGranted ? { adventureKeys: adventureKeysGranted } : {}) }
        : { gold: 15, accountXp: 1 }
      : winner === "draw"
        ? { gold: 10, accountXp: 1 }
        : {};

  return {
    ok: true,
    ladder: {
      seasonId: ladder.seasonId,
      points: nextPoints,
      league: nextRank.league,
      division: nextRank.division,
      keyProgress: nextKeyProgress,
      dailyRewardedWins: normalReward ? dailyRewardedWins + 1 : dailyRewardedWins,
      dailyCycleKey: today,
    },
    rewards,
    pointsDelta,
    keyProgressDelta,
    adventureKeysGranted,
  };
}
