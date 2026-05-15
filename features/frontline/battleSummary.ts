import type {
  FrontlineBattleState,
  FrontlineEvent,
  FrontlinePlayerActionLogEntry,
} from "@/features/frontline/types";
import type { FrontlineLane } from "@/lib/types";

export const FRONTLINE_BATTLE_SUMMARY_VERSION = 1;
export const FRONTLINE_ENGINE_VERSION = "frontline-v1";
export const MAX_FRONTLINE_ACTION_LOG_ENTRIES = 256;
const MAX_RECENT_EVENTS = 12;

export type FrontlineBattleLaneSummary = {
  lane: FrontlineLane;
  allyHp: number;
  enemyHp: number;
  allyAlive: boolean;
  enemyAlive: boolean;
};

export type FrontlineBattleRecentEventSummary = {
  kind: FrontlineEvent["kind"];
  side?: FrontlineEvent["side"];
  lane?: FrontlineEvent["lane"];
  amount?: number;
  emphasis?: FrontlineEvent["emphasis"];
  signature?: FrontlineEvent["signature"];
  signatureId?: string;
};

export type FrontlineBattleSummary = {
  schemaVersion: typeof FRONTLINE_BATTLE_SUMMARY_VERSION;
  engineVersion: typeof FRONTLINE_ENGINE_VERSION;
  seed: number;
  round: number;
  maxRounds: number;
  winner?: NonNullable<FrontlineBattleState["winner"]>;
  allyCoreHp: number;
  enemyCoreHp: number;
  lanes: FrontlineBattleLaneSummary[];
  recentEvents: FrontlineBattleRecentEventSummary[];
  actionLog: FrontlinePlayerActionLogEntry[];
};

export function createFrontlineBattleSummary(state: FrontlineBattleState): FrontlineBattleSummary {
  const lanes = (Object.entries(state.lanes) as Array<[FrontlineLane, FrontlineBattleState["lanes"][FrontlineLane]]>).map(
    ([lane, laneState]) => ({
      lane,
      allyHp: laneState.allyHero?.hp ?? 0,
      enemyHp: laneState.enemyHero?.hp ?? 0,
      allyAlive: Boolean(laneState.allyHero?.alive),
      enemyAlive: Boolean(laneState.enemyHero?.alive),
    }),
  );

  return {
    schemaVersion: FRONTLINE_BATTLE_SUMMARY_VERSION,
    engineVersion: FRONTLINE_ENGINE_VERSION,
    seed: state.seed,
    round: state.round,
    maxRounds: state.maxRounds,
    ...(state.winner ? { winner: state.winner } : {}),
    allyCoreHp: state.allyCoreHp,
    enemyCoreHp: state.enemyCoreHp,
    lanes,
    recentEvents: state.events.slice(0, MAX_RECENT_EVENTS).map(toRecentEventSummary),
    actionLog: sanitizeFrontlineActionLog(state.actionLog ?? []),
  };
}

export function appendFrontlineActionLogEntry(
  currentLog: FrontlinePlayerActionLogEntry[],
  state: FrontlineBattleState,
  action: Omit<FrontlinePlayerActionLogEntry, "seq" | "round" | "side">,
): FrontlinePlayerActionLogEntry[] {
  const lastEntry = currentLog.length > 0 ? currentLog[currentLog.length - 1] : null;
  const nextEntry: FrontlinePlayerActionLogEntry = {
    ...action,
    seq: (lastEntry?.seq ?? 0) + 1,
    round: state.round,
    side: "ally",
  };

  return sanitizeFrontlineActionLog([...currentLog, nextEntry]);
}

function toRecentEventSummary(event: FrontlineEvent): FrontlineBattleRecentEventSummary {
  return {
    kind: event.kind,
    ...(event.side ? { side: event.side } : {}),
    ...(event.lane ? { lane: event.lane } : {}),
    ...(event.amount !== undefined ? { amount: event.amount } : {}),
    ...(event.emphasis ? { emphasis: event.emphasis } : {}),
    ...(event.signature ? { signature: event.signature } : {}),
    ...(event.signatureId ? { signatureId: event.signatureId } : {}),
  };
}

function sanitizeFrontlineActionLog(log: FrontlinePlayerActionLogEntry[]): FrontlinePlayerActionLogEntry[] {
  return log.slice(-MAX_FRONTLINE_ACTION_LOG_ENTRIES).map((entry) => ({
    seq: entry.seq,
    round: entry.round,
    side: "ally",
    action: entry.action,
    ...(entry.cardId ? { cardId: entry.cardId } : {}),
    ...(entry.lane ? { lane: entry.lane } : {}),
  }));
}
