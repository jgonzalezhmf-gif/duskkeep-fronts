import type { MissionMetric } from "@/lib/types";

export type BattleResultSource = "adventure" | "arena" | "vsai" | "event";

export type BattleResultCounters = {
  battlesWon: number;
  arenaWins: number;
  arenaLosses: number;
};

export type BattleResultStatePlan = {
  patch: Partial<BattleResultCounters>;
  missionDeltas: { metric: MissionMetric; delta: number }[];
};

export function getBattleResultMissionDeltas(
  won: boolean,
  source: BattleResultSource,
): { metric: MissionMetric; delta: number }[] {
  const missionDeltas: { metric: MissionMetric; delta: number }[] = [];

  if (won) {
    missionDeltas.push({ metric: "battles_won", delta: 1 });
  }

  if (source === "arena") {
    missionDeltas.push({ metric: "arena_battles", delta: 1 });
  }

  if (source === "event") {
    missionDeltas.push({ metric: "events_played", delta: 1 });
  }

  return missionDeltas;
}

export function planBattleResultState(
  counters: BattleResultCounters,
  won: boolean,
  source: BattleResultSource,
): BattleResultStatePlan {
  const patch: Partial<BattleResultCounters> = {};

  if (won) {
    patch.battlesWon = counters.battlesWon + 1;
  }

  if (source === "arena") {
    if (won) {
      patch.arenaWins = counters.arenaWins + 1;
    } else {
      patch.arenaLosses = counters.arenaLosses + 1;
    }
  }

  return { patch, missionDeltas: getBattleResultMissionDeltas(won, source) };
}
