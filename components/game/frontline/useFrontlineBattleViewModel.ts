"use client";

import { useMemo } from "react";
import { FRONTLINE_CARD_BY_ID, FRONTLINE_LEADER_BY_ID } from "@/features/frontline/data";
import { getFrontlineBoss } from "@/features/frontline/bosses";
import type { FrontlineBattleState } from "@/features/frontline/types";
import { previewCardOutcome, type FrontlinePreview } from "@/features/frontline/preview";
import {
  frontlineLeaderPowerDescription,
  frontlineLeaderPowerName,
} from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import type { FrontlineLane } from "@/lib/types";
import {
  buildBossSegmentByLane,
  getDisplayBattleState,
  getSelectedBattleContext,
  getSortedLaneInsights,
  getTargetableBattleLanes,
  isInfernoCastingEvent,
} from "./FrontlineBattleDerivedState";
import type {
  FrontlineBattleFinishFx,
  FrontlinePendingResolution,
  FrontlineResolutionFx,
} from "./FrontlineBattleFxState";
import { nextActionLabel } from "./FrontlineBattleUiState";
import {
  visualTargetSideForCard,
  visualTargetSideForLeader,
} from "./FrontlineVisualState";

export function useFrontlineBattleViewModel({
  state,
  pendingResolution,
  resolutionFx,
  focusedLane,
  finishFx,
}: {
  state: FrontlineBattleState;
  pendingResolution: FrontlinePendingResolution | null;
  resolutionFx: FrontlineResolutionFx | null;
  focusedLane: FrontlineLane | null;
  finishFx: FrontlineBattleFinishFx | null;
}) {
  const { t } = useI18n();
  const allyLeader = FRONTLINE_LEADER_BY_ID[state.allyDeck.leaderId];
  const selectedCard = state.selectedCardId ? state.allyCardProfiles?.[state.selectedCardId] ?? FRONTLINE_CARD_BY_ID[state.selectedCardId] : null;
  const displayState = useMemo<FrontlineBattleState>(() => getDisplayBattleState(state, pendingResolution, resolutionFx), [state, pendingResolution, resolutionFx]);
  const targetableLanes = useMemo(() => getTargetableBattleLanes(state, selectedCard), [selectedCard, state]);
  const laneInsights = useMemo(() => getSortedLaneInsights(displayState), [displayState]);
  const priorityLane = laneInsights[0];
  const displayLane = focusedLane ?? priorityLane.lane;
  const displayInsight = laneInsights.find((entry) => entry.lane === displayLane) ?? priorityLane;
  const latestImpact = state.events[0] ?? null;
  const latestFeed = state.events.slice(0, 4);
  const bossConfig = useMemo(() => getFrontlineBoss(state.bossState?.id), [state.bossState?.id]);
  const bossSegmentByLane = useMemo(() => buildBossSegmentByLane(bossConfig), [bossConfig]);

  const previewOutcome = useMemo<FrontlinePreview | null>(() => {
    if (state.selectedLeaderPower || !selectedCard) return null;
    if (selectedCard.target === "none") {
      return previewCardOutcome(state, "ally", selectedCard.id);
    }
    const lane = focusedLane && targetableLanes.includes(focusedLane) ? focusedLane : null;
    if (!lane) return null;
    return previewCardOutcome(state, "ally", selectedCard.id, lane);
  }, [focusedLane, selectedCard, state, targetableLanes]);

  const allyLeaderPowerName = frontlineLeaderPowerName(t, allyLeader);
  const allyLeaderPowerDescription = frontlineLeaderPowerDescription(t, allyLeader);
  const actionState = nextActionLabel(state, t, allyLeaderPowerName, selectedCard, state.selectedLeaderPower);
  const activeResolutionEvent = resolutionFx?.events[resolutionFx.activeIndex] ?? null;
  const selectedTargetSide = selectedCard
    ? visualTargetSideForCard(selectedCard)
    : state.selectedLeaderPower
      ? visualTargetSideForLeader(allyLeader.power.effect.type)
      : null;
  const actionsLocked = Boolean(resolutionFx || finishFx) || state.turn !== "ally" || !!state.winner;
  const selectedContext = getSelectedBattleContext({
    t,
    selectedLeaderPower: state.selectedLeaderPower,
    allyLeaderPowerName,
    allyLeaderPowerDescription,
    selectedCard,
    displayLane,
    displayInsight,
  });
  const infernoCasting = isInfernoCastingEvent(activeResolutionEvent);

  return {
    allyLeader,
    selectedCard,
    displayState,
    targetableLanes,
    laneInsights,
    displayLane,
    displayInsight,
    latestImpact,
    latestFeed,
    bossConfig,
    bossSegmentByLane,
    previewOutcome,
    allyLeaderPowerName,
    allyLeaderPowerDescription,
    actionState,
    activeResolutionEvent,
    selectedTargetSide,
    actionsLocked,
    selectedContext,
    infernoCasting,
  };
}
