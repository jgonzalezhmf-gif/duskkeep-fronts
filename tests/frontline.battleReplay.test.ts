import { describe, expect, it } from "vitest";
import {
  createDefaultFrontlineLoadout,
  createFrontlineBattleState,
  playCard,
  resolveTurn,
} from "@/features/frontline/engine";
import {
  getFrontlineBattleReplayMismatches,
  replayFrontlineBattleFromActionLog,
} from "@/features/frontline/battleReplay";
import { createFrontlineBattleSummary } from "@/features/frontline/battleSummary";
import { FRONTLINE_PRESETS } from "@/features/frontline/data";
import type { FrontlinePlayerActionLogEntry } from "@/features/frontline/types";

function makeReplayInput(actionLog: FrontlinePlayerActionLogEntry[]) {
  return {
    seed: 77,
    loadout: createDefaultFrontlineLoadout(),
    enemyPreset: FRONTLINE_PRESETS[0],
    actionLog,
  };
}

describe("Frontline battle replay", () => {
  it("replays a canonical player action log with the existing engine", () => {
    const actionLog: FrontlinePlayerActionLogEntry[] = [
      { seq: 1, round: 1, side: "ally", action: "play_card", cardId: "tactic_battle_hymn" },
      { seq: 2, round: 1, side: "ally", action: "resolve_turn" },
    ];

    const replay = replayFrontlineBattleFromActionLog(makeReplayInput(actionLog));
    expect(replay.ok).toBe(true);
    if (!replay.ok) return;

    let manual = createFrontlineBattleState({
      seed: 77,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: FRONTLINE_PRESETS[0],
    });
    manual = playCard(manual, "ally", "tactic_battle_hymn");
    manual = resolveTurn(manual);
    const expectedSummary = createFrontlineBattleSummary({ ...manual, actionLog });

    expect(getFrontlineBattleReplayMismatches(expectedSummary, replay.summary)).toEqual([]);
    expect(replay.summary.actionLog).toEqual(actionLog);
  });

  it("rejects impossible player actions instead of producing a forged result", () => {
    const replay = replayFrontlineBattleFromActionLog(
      makeReplayInput([{ seq: 1, round: 1, side: "ally", action: "play_card", cardId: "missing_card" }]),
    );

    expect(replay).toMatchObject({
      ok: false,
      code: "invalid_action",
    });
  });

  it("detects declared summaries that do not match replay output", () => {
    const actionLog: FrontlinePlayerActionLogEntry[] = [{ seq: 1, round: 1, side: "ally", action: "resolve_turn" }];
    const replay = replayFrontlineBattleFromActionLog(makeReplayInput(actionLog));
    expect(replay.ok).toBe(true);
    if (!replay.ok) return;

    expect(getFrontlineBattleReplayMismatches({ ...replay.summary, enemyCoreHp: 999 }, replay.summary)).toContain(
      "enemyCoreHp",
    );
  });
});
