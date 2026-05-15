import type { FrontlineBattleState, FrontlineEvent } from "@/features/frontline/types";
import type { FrontlineLane } from "@/lib/types";

export const FRONTLINE_BATTLE_SUMMARY_VERSION = 1;
export const FRONTLINE_ENGINE_VERSION = "frontline-v1";
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
  };
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
