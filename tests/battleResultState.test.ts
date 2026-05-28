import { describe, expect, it } from "vitest";
import {
  getBattleResultMissionDeltas,
  planBattleResultState,
  type BattleResultCounters,
} from "@/lib/battleResultState";

const counters: BattleResultCounters = {
  battlesWon: 4,
  arenaWins: 2,
  arenaLosses: 1,
};

describe("battle result state planning", () => {
  it("increments battle wins and arena wins for arena victories", () => {
    expect(planBattleResultState(counters, true, "arena")).toEqual({
      patch: { battlesWon: 5, arenaWins: 3 },
      missionDeltas: [
        { metric: "battles_won", delta: 1 },
        { metric: "arena_battles", delta: 1 },
      ],
    });
  });

  it("increments arena losses without battle win progress for arena defeats", () => {
    expect(planBattleResultState(counters, false, "arena")).toEqual({
      patch: { arenaLosses: 2 },
      missionDeltas: [{ metric: "arena_battles", delta: 1 }],
    });
  });

  it("tracks event participation separately from arena counters", () => {
    expect(planBattleResultState(counters, false, "event")).toEqual({
      patch: {},
      missionDeltas: [{ metric: "events_played", delta: 1 }],
    });
  });

  it("does not add counters for non-victory non-arena sources", () => {
    expect(planBattleResultState(counters, false, "adventure")).toEqual({
      patch: {},
      missionDeltas: [],
    });
  });

  it("exposes mission deltas independently for authoritative result flows", () => {
    expect(getBattleResultMissionDeltas(true, "event")).toEqual([
      { metric: "battles_won", delta: 1 },
      { metric: "events_played", delta: 1 },
    ]);
    expect(getBattleResultMissionDeltas(false, "arena")).toEqual([{ metric: "arena_battles", delta: 1 }]);
  });
});
