import {
  activateLeaderPower,
  createFrontlineBattleState,
  playCard,
  resolveTurn,
} from "@/features/frontline/engine";
import {
  createFrontlineBattleSummary,
  type FrontlineBattleSummary,
} from "@/features/frontline/battleSummary";
import type { FrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import type {
  FrontlineBattleModifiers,
  FrontlineBattleState,
  FrontlineCardProfileMap,
  FrontlinePlayerActionLogEntry,
  FrontlinePreset,
  FrontlineSupportProfileMap,
} from "@/features/frontline/types";
import type { FrontlineLoadout } from "@/lib/types";

export type FrontlineBattleReplayInput = {
  seed: number;
  loadout: FrontlineLoadout;
  enemyPreset: FrontlinePreset;
  actionLog: FrontlinePlayerActionLogEntry[];
  allyHeroProfiles?: FrontlineHeroProfileMap;
  allyCardProfiles?: FrontlineCardProfileMap;
  allySupportProfiles?: FrontlineSupportProfileMap;
  modifiers?: FrontlineBattleModifiers;
};

export type FrontlineBattleReplayErrorCode =
  | "invalid_sequence"
  | "round_mismatch"
  | "action_after_finished"
  | "invalid_action";

export type FrontlineBattleReplayResult =
  | {
      ok: true;
      state: FrontlineBattleState;
      summary: FrontlineBattleSummary;
    }
  | {
      ok: false;
      code: FrontlineBattleReplayErrorCode;
      reason: string;
      action?: FrontlinePlayerActionLogEntry;
    };

export function replayFrontlineBattleFromActionLog(input: FrontlineBattleReplayInput): FrontlineBattleReplayResult {
  let state = createFrontlineBattleState({
    seed: input.seed,
    allyLoadout: input.loadout,
    enemyPreset: input.enemyPreset,
    allyHeroProfiles: input.allyHeroProfiles,
    allyCardProfiles: input.allyCardProfiles,
    allySupportProfiles: input.allySupportProfiles,
    modifiers: input.modifiers,
  });

  let previousSeq = 0;
  for (const action of input.actionLog) {
    if (action.seq <= previousSeq) {
      return failReplay("invalid_sequence", "Action log sequence must be strictly increasing.", action);
    }
    previousSeq = action.seq;

    if (state.winner) {
      return failReplay("action_after_finished", "Action log contains an action after battle finished.", action);
    }

    if (action.round !== state.round) {
      return failReplay("round_mismatch", "Action round does not match replay state.", action);
    }

    if (action.action === "play_card") {
      if (!action.cardId) return failReplay("invalid_action", "Card action is missing cardId.", action);
      const next = runReplayStep(() => playCard(state, "ally", action.cardId!, action.lane));
      if (!next.ok) return failReplay("invalid_action", next.reason, action);
      if (next.state === state) return failReplay("invalid_action", "Card action is not playable in replay state.", action);
      state = next.state;
      continue;
    }

    if (action.action === "leader_power") {
      if (!action.lane) return failReplay("invalid_action", "Leader power action is missing lane.", action);
      const next = runReplayStep(() => activateLeaderPower(state, "ally", action.lane!));
      if (!next.ok) return failReplay("invalid_action", next.reason, action);
      if (next.state === state) return failReplay("invalid_action", "Leader power action is not valid in replay state.", action);
      state = next.state;
      continue;
    }

    if (action.action === "resolve_turn") {
      if (action.cardId || action.lane) return failReplay("invalid_action", "Resolve action cannot include target data.", action);
      const next = runReplayStep(() => resolveTurn(state));
      if (!next.ok) return failReplay("invalid_action", next.reason, action);
      state = next.state;
      continue;
    }

    return failReplay("invalid_action", "Unsupported Frontline action.", action);
  }

  const replayedState = { ...state, actionLog: input.actionLog };
  return {
    ok: true,
    state: replayedState,
    summary: createFrontlineBattleSummary(replayedState),
  };
}

function runReplayStep(step: () => FrontlineBattleState): { ok: true; state: FrontlineBattleState } | { ok: false; reason: string } {
  try {
    return { ok: true, state: step() };
  } catch {
    return { ok: false, reason: "Replay action failed engine validation." };
  }
}

export function getFrontlineBattleReplayMismatches(
  declared: Partial<FrontlineBattleSummary>,
  replayed: FrontlineBattleSummary,
) {
  const mismatches: string[] = [];
  if (declared.seed !== undefined && declared.seed !== replayed.seed) mismatches.push("seed");
  if (declared.round !== undefined && declared.round !== replayed.round) mismatches.push("round");
  if (declared.maxRounds !== undefined && declared.maxRounds !== replayed.maxRounds) mismatches.push("maxRounds");
  if (declared.winner !== undefined && declared.winner !== replayed.winner) mismatches.push("winner");
  if (declared.allyCoreHp !== undefined && declared.allyCoreHp !== replayed.allyCoreHp) mismatches.push("allyCoreHp");
  if (declared.enemyCoreHp !== undefined && declared.enemyCoreHp !== replayed.enemyCoreHp) mismatches.push("enemyCoreHp");
  if (declared.lanes && !frontlineLaneSummariesMatch(declared.lanes, replayed.lanes)) mismatches.push("lanes");
  if (declared.actionLog && !frontlineActionLogsMatch(declared.actionLog, replayed.actionLog)) mismatches.push("actionLog");
  return mismatches;
}

function failReplay(
  code: FrontlineBattleReplayErrorCode,
  reason: string,
  action: FrontlinePlayerActionLogEntry,
): FrontlineBattleReplayResult {
  return { ok: false, code, reason, action };
}

function frontlineLaneSummariesMatch(
  declared: FrontlineBattleSummary["lanes"],
  replayed: FrontlineBattleSummary["lanes"],
) {
  if (declared.length !== replayed.length) return false;
  return declared.every((declaredLane) => {
    const replayedLane = replayed.find((lane) => lane.lane === declaredLane.lane);
    if (!replayedLane) return false;
    return (
      declaredLane.allyHp === replayedLane.allyHp &&
      declaredLane.enemyHp === replayedLane.enemyHp &&
      declaredLane.allyAlive === replayedLane.allyAlive &&
      declaredLane.enemyAlive === replayedLane.enemyAlive
    );
  });
}

function frontlineActionLogsMatch(
  declared: FrontlinePlayerActionLogEntry[],
  replayed: FrontlinePlayerActionLogEntry[],
) {
  if (declared.length !== replayed.length) return false;
  return declared.every((entry, index) => {
    const replayedEntry = replayed[index];
    return (
      entry.seq === replayedEntry.seq &&
      entry.round === replayedEntry.round &&
      entry.side === replayedEntry.side &&
      entry.action === replayedEntry.action &&
      entry.cardId === replayedEntry.cardId &&
      entry.lane === replayedEntry.lane
    );
  });
}
