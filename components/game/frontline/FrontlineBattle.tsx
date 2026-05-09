"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  activateLeaderPower,
  getFrontlineCard,
  playCard,
  resolveTurnTraced,
  validLeaderPowerTargets,
} from "@/features/frontline/engine";
import type {
  FrontlineBattleModifiers,
  FrontlineBattleState,
  FrontlineCardProfileMap,
  FrontlineEvent,
  FrontlineSupportProfileMap,
} from "@/features/frontline/types";
import type { FrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import { getBattleBackdrop } from "@/lib/art";
import { audio, sfx } from "@/lib/audio";
import type { FrontlineLane, FrontlineLoadout } from "@/lib/types";
import { FrontlineErrorBoundary } from "./FrontlineErrorBoundary";
import { playFrontlineCardSfx, playFrontlineResolutionSfx } from "./FrontlineBattleSfx";
import { FrontlineBattleStage } from "./FrontlineBattleStage";
import { createBattleStateFromProps } from "./FrontlineBattleStateFactory";
import { clearFrontlineTimer } from "./FrontlineBattleTimers";
import {
  getCoreShockChange,
  getResolutionPlaybackEvents,
} from "./FrontlineBattleDerivedState";
import type { FrontlineEncounterBadgeKind } from "./FrontlineEncounterBanner";
import type {
  FrontlineBattleFinishFx,
  FrontlineCardFxState,
  FrontlineCoreShockState,
  FrontlineDeathGhostState,
  FrontlinePendingResolution,
  FrontlineResolutionFx,
  FrontlineVisualTone,
} from "./FrontlineBattleFxState";
import {
  collectDeathGhosts,
  collectNewEvents,
  eventDuration,
  resolutionSequenceDuration,
  truncateAtWinner,
} from "./FrontlineResolutionFlow";
import {
  visualTargetSideForCard,
  visualTargetSideForLeader,
  visualToneFromCard,
} from "./FrontlineVisualState";
import { useFrontlineBattleViewModel } from "./useFrontlineBattleViewModel";

export type { FrontlineEncounterBadgeKind } from "./FrontlineEncounterBanner";

type Props = {
  seed: number;
  loadout: FrontlineLoadout;
  enemyPresetId: string;
  allyHeroProfiles?: FrontlineHeroProfileMap;
  allyCardProfiles?: FrontlineCardProfileMap;
  allySupportProfiles?: FrontlineSupportProfileMap;
  modifiers?: FrontlineBattleModifiers;
  encounterKind?: FrontlineEncounterBadgeKind | null;
  encounterTitle?: string | null;
  battleBackgroundSrc?: string | null;
  onFinished: (winner: "ally" | "enemy" | "draw", state: FrontlineBattleState) => void;
};

function FrontlineBattleInner({
  seed,
  loadout,
  enemyPresetId,
  allyHeroProfiles,
  allyCardProfiles,
  allySupportProfiles,
  modifiers,
  encounterKind,
  encounterTitle,
  battleBackgroundSrc,
  onFinished,
}: Props) {
  const [state, setState] = useState<FrontlineBattleState>(() =>
    createBattleStateFromProps({
      seed,
      loadout,
      enemyPresetId,
      allyHeroProfiles,
      allyCardProfiles,
      allySupportProfiles,
      modifiers,
    }),
  );
  const [focusedLane, setFocusedLane] = useState<FrontlineLane | null>(null);
  const [resolutionFx, setResolutionFx] = useState<FrontlineResolutionFx | null>(null);
  const [cardPlayFx, setCardPlayFx] = useState<FrontlineCardFxState | null>(null);
  const [finishFx, setFinishFx] = useState<FrontlineBattleFinishFx | null>(null);
  const [deathGhosts, setDeathGhosts] = useState<FrontlineDeathGhostState[]>([]);
  const [coreShock, setCoreShock] = useState<FrontlineCoreShockState | null>(null);
  const [pendingResolution, setPendingResolution] = useState<FrontlinePendingResolution | null>(null);
  const finishedRef = useRef(false);
  const fxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardFxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishOverlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishDelayRef = useRef(1800);
  const fxIdRef = useRef(0);
  const playedFxEventIdRef = useRef<string | null>(null);
  const finishStingerPlayedRef = useRef(false);
  const prevCoreRef = useRef({ ally: 0, enemy: 0 });
  const coreShockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coreShockIdRef = useRef(0);
  const backdrop = useMemo(() => battleBackgroundSrc ?? getBattleBackdrop(seed), [battleBackgroundSrc, seed]);

  useEffect(() => {
    finishedRef.current = false;
    playedFxEventIdRef.current = null;
    finishStingerPlayedRef.current = false;
    finishDelayRef.current = 1800;
    setFocusedLane(null);
    setResolutionFx(null);
    setCardPlayFx(null);
    setFinishFx(null);
    setDeathGhosts([]);
    clearFrontlineTimer(finishOverlayTimerRef);
    clearFrontlineTimer(finishDoneTimerRef);
    setState(
      createBattleStateFromProps({
        seed,
        loadout,
        enemyPresetId,
        allyHeroProfiles,
        allyCardProfiles,
        allySupportProfiles,
        modifiers,
      }),
    );
  }, [allyCardProfiles, allyHeroProfiles, allySupportProfiles, enemyPresetId, loadout, modifiers, seed]);

  useEffect(() => {
    return () => {
      clearFrontlineTimer(fxTimerRef);
      clearFrontlineTimer(cardFxTimerRef);
      clearFrontlineTimer(finishOverlayTimerRef);
      clearFrontlineTimer(finishDoneTimerRef);
      clearFrontlineTimer(coreShockTimerRef);
    };
  }, []);

  useEffect(() => {
    const ally = state.allyCoreHp;
    const enemy = state.enemyCoreHp;
    const prev = prevCoreRef.current;
    if (prev.ally === 0 && prev.enemy === 0) {
      prevCoreRef.current = { ally, enemy };
      return;
    }
    const nextShock = getCoreShockChange(prev, { ally, enemy }, coreShockIdRef.current + 1);
    if (nextShock) {
      coreShockIdRef.current += 1;
      setCoreShock(nextShock);
      sfx.coreDamage();
      clearFrontlineTimer(coreShockTimerRef);
      coreShockTimerRef.current = setTimeout(() => {
        setCoreShock((current) => (current?.key === nextShock.key ? null : current));
      }, 950);
    }
    prevCoreRef.current = { ally, enemy };
  }, [state.allyCoreHp, state.enemyCoreHp]);

  function showResolutionFx(events: FrontlineEvent[]) {
    const meaningfulEvents = getResolutionPlaybackEvents(events);
    if (!meaningfulEvents.length) return;
    fxIdRef.current += 1;
    setResolutionFx({ id: fxIdRef.current, events: meaningfulEvents, activeIndex: 0 });
  }

  useEffect(() => {
    if (!resolutionFx) return;
    const activeEvent = resolutionFx.events[resolutionFx.activeIndex];
    if (!activeEvent) {
      setResolutionFx(null);
      return;
    }
    clearFrontlineTimer(fxTimerRef);
    fxTimerRef.current = setTimeout(() => {
      setResolutionFx((current) => {
        if (!current || current.id !== resolutionFx.id) return current;
        const nextIndex = current.activeIndex + 1;
        return nextIndex < current.events.length ? { ...current, activeIndex: nextIndex } : null;
      });
    }, eventDuration(activeEvent));
    return () => {
      clearFrontlineTimer(fxTimerRef);
    };
  }, [resolutionFx]);

  useEffect(() => {
    if (resolutionFx || !pendingResolution) return;
    setState(pendingResolution.finalState);
    setPendingResolution(null);
  }, [resolutionFx, pendingResolution]);

  useEffect(() => {
    if (!state.bossState || state.winner) return;
    audio.setTheme("boss");
  }, [state.bossState, state.winner]);

  // The full round (enemy plays + clash) now runs synchronously inside
  // handleResolveClick — no reactive enemy-turn effect needed.

  useEffect(() => {
    if (!state.winner || finishedRef.current) return;
    finishedRef.current = true;
    audio.setTheme("postbattle");
    if (!finishStingerPlayedRef.current) {
      finishStingerPlayedRef.current = true;
      if (state.winner === "ally") window.setTimeout(() => sfx.victory(), 160);
      else if (state.winner === "enemy") window.setTimeout(() => sfx.defeat(), 160);
    }
    const winner = state.winner;
    const finalState = state;
    const delay = finishDelayRef.current;
    clearFrontlineTimer(finishOverlayTimerRef);
    clearFrontlineTimer(finishDoneTimerRef);
    finishOverlayTimerRef.current = setTimeout(() => setFinishFx({ winner }), Math.max(500, delay - 1750));
    finishDoneTimerRef.current = setTimeout(() => onFinished(winner, finalState), delay);
  }, [onFinished, state, state.winner]);

  const {
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
  } = useFrontlineBattleViewModel({
    state,
    pendingResolution,
    resolutionFx,
    focusedLane,
    finishFx,
  });

  useEffect(() => {
    if (!activeResolutionEvent) return;
    if (playedFxEventIdRef.current === activeResolutionEvent.id) return;
    playedFxEventIdRef.current = activeResolutionEvent.id;
    playFrontlineResolutionSfx(activeResolutionEvent, deathGhosts);
  }, [activeResolutionEvent, deathGhosts]);

  function resetSelection(next: FrontlineBattleState, nextFocusedLane?: FrontlineLane | null) {
    setState({ ...next, selectedCardId: null, selectedLeaderPower: false });
    setFocusedLane(nextFocusedLane ?? null);
  }

  function showCardPlayFx(
    cardId: string,
    lane: FrontlineLane | null,
    targetSide: FrontlineCardFxState["targetSide"],
    tone: FrontlineVisualTone,
    events: FrontlineEvent[],
  ) {
    clearFrontlineTimer(cardFxTimerRef);
    fxIdRef.current += 1;
    setCardPlayFx({ id: fxIdRef.current, cardId, lane, targetSide, tone, events: events.slice(0, 4) });
    playFrontlineCardSfx(cardId, tone);
    cardFxTimerRef.current = setTimeout(() => setCardPlayFx(null), 1900);
  }

  function playInstantCard(cardId: string) {
    if (actionsLocked) return;
    const next = playCard(state, "ally", cardId);
    const card = getFrontlineCard(cardId, state.allyCardProfiles);
    const newEvents = collectNewEvents(state, next);
    setDeathGhosts(collectDeathGhosts(state, newEvents));
    showCardPlayFx(cardId, null, visualTargetSideForCard(card), visualToneFromCard(card), newEvents);
    resetSelection(next, focusedLane);
  }

  function handleCardClick(cardId: string) {
    if (actionsLocked) return;
    const card = getFrontlineCard(cardId, state.allyCardProfiles);
    if (card.target === "none") {
      playInstantCard(cardId);
      return;
    }
    setState((current) => ({
      ...current,
      selectedCardId: current.selectedCardId === cardId ? null : cardId,
      selectedLeaderPower: false,
    }));
  }

  function handleLeaderPowerClick() {
    if (actionsLocked) return;
    if (allyLeader.power.effect.type === "rally") {
      const lane = validLeaderPowerTargets(state, "ally")[0];
      if (lane) {
        const next = activateLeaderPower(state, "ally", lane);
        const newEvents = collectNewEvents(state, next);
        setDeathGhosts(collectDeathGhosts(state, newEvents));
        showCardPlayFx(`leader:${allyLeader.id}`, lane, "ally", "power", newEvents);
        resetSelection(next, lane);
      }
      return;
    }
    setState((current) => ({
      ...current,
      selectedLeaderPower: !current.selectedLeaderPower,
      selectedCardId: null,
    }));
  }

  function handleLaneClick(lane: FrontlineLane) {
    if (actionsLocked) {
      setFocusedLane(lane);
      return;
    }
    if (state.selectedLeaderPower) {
      if (!targetableLanes.includes(lane)) {
        setFocusedLane(lane);
        return;
      }
      const next = activateLeaderPower(state, "ally", lane);
      const newEvents = collectNewEvents(state, next);
      setDeathGhosts(collectDeathGhosts(state, newEvents));
      showCardPlayFx(`leader:${allyLeader.id}`, lane, visualTargetSideForLeader(allyLeader.power.effect.type), "power", newEvents);
      resetSelection(next, lane);
      return;
    }
    if (selectedCard && targetableLanes.includes(lane)) {
      const next = playCard(state, "ally", selectedCard.id, lane);
      const newEvents = collectNewEvents(state, next);
      setDeathGhosts(collectDeathGhosts(state, newEvents));
      showCardPlayFx(selectedCard.id, lane, visualTargetSideForCard(selectedCard), visualToneFromCard(selectedCard), newEvents);
      resetSelection(next, lane);
      return;
    }
    setFocusedLane((current) => (current === lane ? null : lane));
  }

  function handleResolveClick() {
    if (actionsLocked) return;
    sfx.resolveClash();
    setCardPlayFx(null);
    const { final, snapshots } = resolveTurnTraced(state);
    const truncated = truncateAtWinner(final, snapshots);
    const newEvents = collectNewEvents(state, final).filter((event) => truncated.allowedEventIds.has(event.id));
    setDeathGhosts(collectDeathGhosts(state, newEvents));
    finishDelayRef.current = final.winner ? 900 : 1800;
    setPendingResolution({ finalState: final, snapshots: truncated.snapshots });
    showResolutionFx(newEvents);
    if (!final.winner && final.turn === "ally") {
      window.setTimeout(() => sfx.turnStart(), Math.max(380, resolutionSequenceDuration(newEvents) - 420));
    }
  }

  return (
    <FrontlineBattleStage
      backdrop={backdrop}
      hasCustomBackdrop={Boolean(battleBackgroundSrc)}
      infernoCasting={infernoCasting}
      activeResolutionEvent={activeResolutionEvent}
      resolutionIndex={resolutionFx?.activeIndex ?? 0}
      resolutionTotal={resolutionFx?.events.length ?? 0}
      previewOutcome={previewOutcome}
      selectedCardName={selectedCard ? selectedContext.title : null}
      cardPlayFx={cardPlayFx}
      finishWinner={finishFx?.winner ?? null}
      encounterKind={encounterKind}
      encounterTitle={encounterTitle}
      state={state}
      displayState={displayState}
      enemyPresetId={enemyPresetId}
      allyLeader={allyLeader}
      allyLeaderPowerName={allyLeaderPowerName}
      allyLeaderPowerDescription={allyLeaderPowerDescription}
      latestImpact={latestImpact}
      resolutionActive={Boolean(resolutionFx)}
      coreShock={coreShock}
      actionState={actionState}
      actionsLocked={actionsLocked}
      selectedCard={selectedCard}
      focusedLane={focusedLane}
      focusedLaneActive={Boolean(focusedLane)}
      bossConfig={bossConfig}
      bossSegmentByLane={bossSegmentByLane}
      modifiers={modifiers}
      targetableLanes={targetableLanes}
      displayLane={displayLane}
      displayInsight={displayInsight}
      laneInsights={laneInsights}
      deathGhosts={deathGhosts}
      selectedTargetSide={selectedTargetSide}
      selectedLeaderPower={state.selectedLeaderPower}
      selectedContextTitle={selectedContext.title}
      selectedContextBody={selectedContext.body}
      latestFeed={latestFeed}
      onLeaderPowerClick={handleLeaderPowerClick}
      onResolveClick={handleResolveClick}
      onClearSelection={() => {
        if (actionsLocked) return;
        setFocusedLane(null);
        setState((current) => ({ ...current, selectedCardId: null, selectedLeaderPower: false }));
      }}
      onLaneClick={handleLaneClick}
      onLaneFocus={setFocusedLane}
      onCardClick={handleCardClick}
    />
  );
}


export default function FrontlineBattle(props: Props) {
  return (
    <FrontlineErrorBoundary>
      <FrontlineBattleInner {...props} />
    </FrontlineErrorBoundary>
  );
}
