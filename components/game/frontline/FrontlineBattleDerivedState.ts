import { FRONTLINE_LANES } from "@/features/frontline/data";
import { validCardTargets, validLeaderPowerTargets } from "@/features/frontline/engine";
import type {
  FrontlineBattleState,
  FrontlineBossConfig,
  FrontlineBossSegmentConfig,
  FrontlineCardDef,
  FrontlineEvent,
  FrontlineSnapshot,
} from "@/features/frontline/types";
import type { TranslateFn } from "@/lib/i18n/frontlineText";
import { frontlineCardName } from "@/lib/i18n/frontlineText";
import type { FrontlineLane } from "@/lib/types";
import { cardEffectSummary, cardTargetLabel, laneLabel } from "./FrontlineBattleUiState";
import { analyzeLane, laneStatusSubtitle, type LaneInsight } from "./FrontlineLaneInsights";

type ResolutionPlayback = {
  events: FrontlineEvent[];
  activeIndex: number;
} | null;

type PendingResolution = {
  finalState: FrontlineBattleState;
  snapshots: FrontlineSnapshot[];
} | null;

type CoreTotals = {
  ally: number;
  enemy: number;
};

export type CoreShockChange = {
  side: "ally" | "enemy";
  amount: number;
  key: number;
};

export function getCoreShockChange(previous: CoreTotals, current: CoreTotals, key: number): CoreShockChange | null {
  const allyLoss = Math.max(0, previous.ally - current.ally);
  const enemyLoss = Math.max(0, previous.enemy - current.enemy);
  if (allyLoss <= 0 && enemyLoss <= 0) return null;
  const side: "ally" | "enemy" = allyLoss >= enemyLoss ? "ally" : "enemy";
  return {
    side,
    amount: side === "ally" ? allyLoss : enemyLoss,
    key,
  };
}

export function buildBossSegmentByLane(boss: FrontlineBossConfig | null): Partial<Record<FrontlineLane, FrontlineBossSegmentConfig>> {
  const map: Partial<Record<FrontlineLane, FrontlineBossSegmentConfig>> = {};
  if (boss) for (const segment of boss.segments) map[segment.lane] = segment;
  return map;
}

export function getDisplayBattleState(
  state: FrontlineBattleState,
  pendingResolution: PendingResolution,
  resolutionFx: ResolutionPlayback,
) {
  if (!pendingResolution || !resolutionFx) return state;
  const idx = resolutionFx.activeIndex;
  const matchById = pendingResolution.snapshots.findIndex((snapshot) => snapshot.eventId === resolutionFx.events[idx]?.id);
  if (matchById < 0) return state;
  if (matchById === 0) return state;
  return pendingResolution.snapshots[matchById - 1]?.state ?? state;
}

export function getTargetableBattleLanes(state: FrontlineBattleState, selectedCard: FrontlineCardDef | null) {
  if (state.selectedLeaderPower) return validLeaderPowerTargets(state, "ally");
  if (selectedCard) return validCardTargets(state, "ally", selectedCard.id);
  return [];
}

export function getSortedLaneInsights(displayState: FrontlineBattleState) {
  return FRONTLINE_LANES.map((lane) => analyzeLane(displayState, lane)).sort((left, right) => right.priority - left.priority);
}

export function getSelectedBattleContext({
  t,
  selectedLeaderPower,
  allyLeaderPowerName,
  allyLeaderPowerDescription,
  selectedCard,
  displayLane,
  displayInsight,
}: {
  t: TranslateFn;
  selectedLeaderPower: boolean;
  allyLeaderPowerName: string;
  allyLeaderPowerDescription: string;
  selectedCard: FrontlineCardDef | null;
  displayLane: FrontlineLane;
  displayInsight: LaneInsight;
}) {
  if (selectedLeaderPower) {
    return {
      title: allyLeaderPowerName,
      body: allyLeaderPowerDescription,
    };
  }

  if (selectedCard) {
    return {
      title: frontlineCardName(t, selectedCard),
      body: `${cardEffectSummary(t, selectedCard)} - ${cardTargetLabel(t, selectedCard)}`,
    };
  }

  return {
    title: `${laneLabel(t, displayLane)} ${t("frontline.front")}`,
    body: laneStatusSubtitle(t, displayInsight.lane, displayInsight.status),
  };
}

export function isInfernoCastingEvent(event: FrontlineEvent | null) {
  return event?.kind === "boss_signature" && event.signature === "cast";
}
