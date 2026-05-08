"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FRONTLINE_CARD_BY_ID,
  FRONTLINE_LANES,
  FRONTLINE_LEADER_BY_ID,
} from "@/features/frontline/data";
import {
  activateLeaderPower,
  createFrontlineBattleState,
  getEnemyPreset,
  getFrontlineCard,
  playCard,
  resolveTurn,
  resolveTurnTraced,
  runEnemyTurn,
  runEnemyTurnTraced,
  validCardTargets,
  validLeaderPowerTargets,
} from "@/features/frontline/engine";
import type {
  FrontlineBattleModifiers,
  FrontlineBattleState,
  FrontlineBossSegmentConfig,
  FrontlineCardDef,
  FrontlineCardProfileMap,
  FrontlineEvent,
  FrontlineSnapshot,
  FrontlineSupportProfileMap,
} from "@/features/frontline/types";
import type { FrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import { previewCardOutcome, type FrontlinePreview } from "@/features/frontline/preview";
import { getBattleBackdrop } from "@/lib/art";
import { audio, sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import {
  frontlineCardName,
  frontlineLeaderPowerDescription,
  frontlineLeaderPowerName,
} from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import type { FrontlineLane, FrontlineLoadout } from "@/lib/types";
import { FrontlineErrorBoundary } from "./FrontlineErrorBoundary";
import { BattleEndOverlay } from "./FrontlineBattleEndOverlay";
import { FrontlineBattleHeader } from "./FrontlineBattleHeader";
import { FrontlineBattleLanes } from "./FrontlineBattleLanes";
import { FrontlineBattleSidebar } from "./FrontlineBattleSidebar";
import {
  cardEffectSummary,
  cardTargetLabel,
  laneLabel,
  nextActionLabel,
} from "./FrontlineBattleUiState";
import { BossBanner } from "./FrontlineBossBanner";
import type { FrontlineCardPlayFx } from "./FrontlineCardCastFx";
import { CardUseToast } from "./FrontlineCardUseToast";
import { ClashSpotlight } from "./FrontlineClashSpotlight";
import type { FrontlineDeathGhostFx } from "./FrontlineDeathGhost";
import { EncounterBanner, type FrontlineEncounterBadgeKind } from "./FrontlineEncounterBanner";
import { combatIconForEvent } from "./FrontlineEventFloats";
import { FrontlineHandSection } from "./FrontlineHandSection";
import {
  analyzeLane,
  laneStatusSubtitle,
  laneStatusTitle,
  type LaneInsight,
} from "./FrontlineLaneInsights";
import { FrontlineBattleStyles } from "./FrontlineBattleStyles";
import type { FrontlineVisualFxTone } from "./FrontlineLaneActionTrail";
import { LaneInitiativeReadout } from "./FrontlineLaneInitiativeReadout";
import { PreviewSpotlight } from "./FrontlinePreviewSpotlight";
import {
  collectDeathGhosts,
  collectNewEvents,
  eventDuration,
  isResolutionEvent,
  resolutionSequenceDuration,
  truncateAtWinner,
} from "./FrontlineResolutionFlow";
import { SynergyGlobalToast } from "./FrontlineSynergyFeedback";
import {
  eventPrimaryTargetSide,
  visualTargetSideForCard,
  visualTargetSideForLeader,
  visualToneFromCard,
  visualToneFromEvent,
} from "./FrontlineVisualState";
import { getFrontlineBoss } from "@/features/frontline/bosses";

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

type ResolutionFx = {
  id: number;
  events: FrontlineEvent[];
  activeIndex: number;
};

type CardPlayFx = FrontlineCardPlayFx;

type BattleFinishFx = {
  winner: "ally" | "enemy" | "draw";
};

type DeathGhostFx = FrontlineDeathGhostFx;

type VisualFxTone = FrontlineVisualFxTone;

function playFrontlineCardSfx(cardId: string, tone: VisualFxTone) {
  if (cardId.startsWith("leader:")) {
    sfx.leaderPower();
  } else {
    const card = FRONTLINE_CARD_BY_ID[cardId];
    if (card?.kind === "order") sfx.cardOrder();
    else if (card?.kind === "tactic") sfx.cardTactic();
    else if (card?.kind === "summon") sfx.cardSummon();
    else sfx.ability();
  }
  if (tone === "heal") window.setTimeout(() => sfx.heal(), 260);
  if (tone === "shield") window.setTimeout(() => sfx.shield(), 260);
  if (tone === "breach") window.setTimeout(() => sfx.breach(), 320);
  if (tone === "summon") window.setTimeout(() => sfx.summon(), 260);
}

const FEMALE_HERO_IDS = new Set(["kara", "mira", "tovi", "lyria", "fenra"]);

function playDeathVoiceForGhost(ghost: DeathGhostFx | undefined) {
  if (!ghost) {
    sfx.death();
    return;
  }
  if (ghost.targetSide !== "ally") {
    sfx.deathMonster();
    return;
  }
  if (FEMALE_HERO_IDS.has(ghost.actor.heroId)) {
    sfx.deathHumanFemale();
    return;
  }
  sfx.deathHumanMale();
}

function playFrontlineResolutionSfx(event: FrontlineEvent, ghosts: DeathGhostFx[]) {
  if (event.kind === "damage" || event.kind === "stun") {
    sfx.attack();
    window.setTimeout(() => sfx.hit(), 420);
    return;
  }
  if (event.kind === "ko") {
    sfx.hit();
    const ghost = ghosts.find((entry) => entry.eventId === event.id);
    window.setTimeout(() => playDeathVoiceForGhost(ghost), 360);
    return;
  }
  if (event.kind === "breach") {
    sfx.coreDamage();
    return;
  }
  if (event.kind === "heal") {
    sfx.heal();
    return;
  }
  if (event.kind === "shield") {
    sfx.shield();
    return;
  }
  if (event.kind === "summon") {
    sfx.summon();
    return;
  }
  if (event.kind === "power") {
    sfx.leaderPower();
    return;
  }
  if (event.kind === "boss_signature" && event.signature === "cast") {
    sfx.coreDamage();
    window.setTimeout(() => sfx.breach(), 220);
  }
}

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
  const { t } = useI18n();
  const [state, setState] = useState<FrontlineBattleState>(() =>
    createFrontlineBattleState({
      seed,
      allyLoadout: loadout,
      enemyPreset: getEnemyPreset(enemyPresetId),
      allyHeroProfiles,
      allyCardProfiles,
      allySupportProfiles,
      modifiers,
    }),
  );
  const [focusedLane, setFocusedLane] = useState<FrontlineLane | null>(null);
  const [resolutionFx, setResolutionFx] = useState<ResolutionFx | null>(null);
  const [cardPlayFx, setCardPlayFx] = useState<CardPlayFx | null>(null);
  const [finishFx, setFinishFx] = useState<BattleFinishFx | null>(null);
  const [deathGhosts, setDeathGhosts] = useState<DeathGhostFx[]>([]);
  const [coreShock, setCoreShock] = useState<{ side: "ally" | "enemy"; amount: number; key: number } | null>(null);
  const [pendingResolution, setPendingResolution] = useState<{ finalState: FrontlineBattleState; snapshots: FrontlineSnapshot[] } | null>(null);
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
    if (finishOverlayTimerRef.current) clearTimeout(finishOverlayTimerRef.current);
    if (finishDoneTimerRef.current) clearTimeout(finishDoneTimerRef.current);
    setState(
      createFrontlineBattleState({
        seed,
        allyLoadout: loadout,
        enemyPreset: getEnemyPreset(enemyPresetId),
        allyHeroProfiles,
        allyCardProfiles,
        allySupportProfiles,
        modifiers,
      }),
    );
  }, [allyCardProfiles, allyHeroProfiles, allySupportProfiles, enemyPresetId, loadout, modifiers, seed]);

  useEffect(() => {
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
      if (cardFxTimerRef.current) clearTimeout(cardFxTimerRef.current);
      if (finishOverlayTimerRef.current) clearTimeout(finishOverlayTimerRef.current);
      if (finishDoneTimerRef.current) clearTimeout(finishDoneTimerRef.current);
      if (coreShockTimerRef.current) clearTimeout(coreShockTimerRef.current);
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
    const allyLoss = Math.max(0, prev.ally - ally);
    const enemyLoss = Math.max(0, prev.enemy - enemy);
    if (allyLoss > 0 || enemyLoss > 0) {
      coreShockIdRef.current += 1;
      const id = coreShockIdRef.current;
      const side: "ally" | "enemy" = allyLoss >= enemyLoss ? "ally" : "enemy";
      const amount = side === "ally" ? allyLoss : enemyLoss;
      setCoreShock({ side, amount, key: id });
      sfx.coreDamage();
      if (coreShockTimerRef.current) clearTimeout(coreShockTimerRef.current);
      coreShockTimerRef.current = setTimeout(() => {
        setCoreShock((current) => (current?.key === id ? null : current));
      }, 950);
    }
    prevCoreRef.current = { ally, enemy };
  }, [state.allyCoreHp, state.enemyCoreHp]);

  function showResolutionFx(events: FrontlineEvent[]) {
    const meaningfulEvents = events.filter(isResolutionEvent).slice(0, 12);
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
    if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
    fxTimerRef.current = setTimeout(() => {
      setResolutionFx((current) => {
        if (!current || current.id !== resolutionFx.id) return current;
        const nextIndex = current.activeIndex + 1;
        return nextIndex < current.events.length ? { ...current, activeIndex: nextIndex } : null;
      });
    }, eventDuration(activeEvent));
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
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
    if (finishOverlayTimerRef.current) clearTimeout(finishOverlayTimerRef.current);
    if (finishDoneTimerRef.current) clearTimeout(finishDoneTimerRef.current);
    finishOverlayTimerRef.current = setTimeout(() => setFinishFx({ winner }), Math.max(500, delay - 1750));
    finishDoneTimerRef.current = setTimeout(() => onFinished(winner, finalState), delay);
  }, [onFinished, state, state.winner]);

  const allyLeader = FRONTLINE_LEADER_BY_ID[state.allyDeck.leaderId];
  const selectedCard = state.selectedCardId ? state.allyCardProfiles?.[state.selectedCardId] ?? FRONTLINE_CARD_BY_ID[state.selectedCardId] : null;
  const displayState = useMemo<FrontlineBattleState>(() => {
    if (!pendingResolution || !resolutionFx) return state;
    const idx = resolutionFx.activeIndex;
    const matchById = pendingResolution.snapshots.findIndex((snap) => snap.eventId === resolutionFx.events[idx]?.id);
    if (matchById < 0) return state;
    if (matchById === 0) return state;
    return pendingResolution.snapshots[matchById - 1]?.state ?? state;
  }, [state, pendingResolution, resolutionFx]);
  const targetableLanes = useMemo(() => {
    if (state.selectedLeaderPower) return validLeaderPowerTargets(state, "ally");
    if (selectedCard) return validCardTargets(state, "ally", selectedCard.id);
    return [];
  }, [selectedCard, state]);

  const laneInsights = useMemo(
    () =>
      FRONTLINE_LANES.map((lane) => analyzeLane(displayState, lane)).sort((left, right) => right.priority - left.priority),
    [displayState.lanes], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const priorityLane = laneInsights[0];
  const displayLane = focusedLane ?? priorityLane.lane;
  const displayInsight = laneInsights.find((entry) => entry.lane === displayLane) ?? priorityLane;
  const latestImpact = state.events[0] ?? null;
  const latestFeed = state.events.slice(0, 4);
  const bossConfig = useMemo(() => getFrontlineBoss(state.bossState?.id), [state.bossState?.id]);
  const bossSegmentByLane = useMemo(() => {
    const map: Partial<Record<FrontlineLane, FrontlineBossSegmentConfig>> = {};
    if (bossConfig) for (const seg of bossConfig.segments) map[seg.lane] = seg;
    return map;
  }, [bossConfig]);

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
    targetSide: CardPlayFx["targetSide"],
    tone: VisualFxTone,
    events: FrontlineEvent[],
  ) {
    if (cardFxTimerRef.current) clearTimeout(cardFxTimerRef.current);
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
    const leader = FRONTLINE_LEADER_BY_ID[state.allyDeck.leaderId];
    if (leader.power.effect.type === "rally") {
      const lane = validLeaderPowerTargets(state, "ally")[0];
      if (lane) {
        const next = activateLeaderPower(state, "ally", lane);
        const newEvents = collectNewEvents(state, next);
        setDeathGhosts(collectDeathGhosts(state, newEvents));
        showCardPlayFx(`leader:${leader.id}`, lane, "ally", "power", newEvents);
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
      const leader = FRONTLINE_LEADER_BY_ID[state.allyDeck.leaderId];
      const next = activateLeaderPower(state, "ally", lane);
      const newEvents = collectNewEvents(state, next);
      setDeathGhosts(collectDeathGhosts(state, newEvents));
      showCardPlayFx(`leader:${leader.id}`, lane, visualTargetSideForLeader(leader.power.effect.type), "power", newEvents);
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

  const selectedContextTitle = state.selectedLeaderPower
    ? allyLeaderPowerName
    : selectedCard
      ? frontlineCardName(t, selectedCard)
      : `${laneLabel(t, displayLane)} ${t("frontline.front")}`;

  const selectedContextBody = state.selectedLeaderPower
    ? allyLeaderPowerDescription
    : selectedCard
      ? `${cardEffectSummary(t, selectedCard)} - ${cardTargetLabel(t, selectedCard)}`
      : laneStatusSubtitle(t, displayInsight.lane, displayInsight.status);

  const infernoCasting =
    activeResolutionEvent?.kind === "boss_signature" && activeResolutionEvent.signature === "cast";

  return (
    <section
      className={cn(
        "relative isolate min-h-[calc(100svh-1rem)] overflow-hidden rounded-[30px] bg-[#080a0d] shadow-[0_34px_95px_rgba(0,0,0,0.5)]",
        infernoCasting && "frontline-inferno-cast-fx",
      )}
      data-frontline-battle-background={battleBackgroundSrc ? backdrop : "fallback"}
    >
      <FrontlineBattleStyles />
      <div
        className="absolute inset-0 scale-[1.03] bg-cover bg-center opacity-55"
        style={{ backgroundImage: `url('${backdrop}')` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-95"
        style={{ backgroundImage: `url('${backdrop}')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,196,81,0.07),transparent_34%),linear-gradient(180deg,rgba(7,9,12,0.08),rgba(7,9,12,0.26)_45%,rgba(7,9,12,0.52)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,213,128,0.1),transparent)]" />
      <div className="absolute inset-x-8 top-[39%] h-24 -skew-y-3 rounded-[999px] bg-[linear-gradient(90deg,rgba(101,210,200,0.04),rgba(245,196,81,0.1),rgba(240,95,114,0.04))] blur-xl" />
      <div className="absolute inset-x-10 bottom-[13rem] h-px bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.16),transparent)]" />
      <ClashSpotlight
        event={activeResolutionEvent}
        index={resolutionFx?.activeIndex ?? 0}
        total={resolutionFx?.events.length ?? 0}
        tone={activeResolutionEvent ? visualToneFromEvent(activeResolutionEvent) : null}
        icon={activeResolutionEvent ? combatIconForEvent(activeResolutionEvent) : null}
        targetSide={activeResolutionEvent ? eventPrimaryTargetSide(activeResolutionEvent) : null}
      />
      {!activeResolutionEvent && !cardPlayFx && !finishFx ? (
        <PreviewSpotlight preview={previewOutcome} cardName={selectedCard ? frontlineCardName(t, selectedCard) : null} />
      ) : null}
      <CardUseToast fx={cardPlayFx} />
      <SynergyGlobalToast event={activeResolutionEvent} />
      {finishFx ? <BattleEndOverlay winner={finishFx.winner} /> : null}

      <div className="relative z-[1] flex flex-col gap-4 p-4 md:p-5">
        {encounterKind && encounterKind !== "boss" ? <EncounterBanner kind={encounterKind} title={encounterTitle ?? null} /> : null}
        <FrontlineBattleHeader
          state={state}
          displayState={displayState}
          enemyPresetId={enemyPresetId}
          allyLeader={allyLeader}
          allyLeaderPowerName={allyLeaderPowerName}
          allyLeaderPowerDescription={allyLeaderPowerDescription}
          activeResolutionEvent={activeResolutionEvent}
          latestImpact={latestImpact}
          resolutionActive={Boolean(resolutionFx)}
          coreShock={coreShock}
          actionState={actionState}
          actionsLocked={actionsLocked}
          selectedCard={selectedCard}
          focusedLaneActive={Boolean(focusedLane)}
          onLeaderPowerClick={handleLeaderPowerClick}
          onResolveClick={handleResolveClick}
          onClearSelection={() => {
            if (actionsLocked) return;
            setFocusedLane(null);
            setState((current) => ({ ...current, selectedCardId: null, selectedLeaderPower: false }));
          }}
        />

        {bossConfig && state.bossState ? (
          <BossBanner
            boss={bossConfig}
            bossState={state.bossState}
            modifiers={modifiers ?? null}
            cardCostMod={state.playerCardCostMod}
          />
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_14.5rem]">
          <FrontlineBattleLanes
            state={state}
            displayState={displayState}
            bossConfig={bossConfig}
            bossSegmentByLane={bossSegmentByLane}
            targetableLanes={targetableLanes}
            displayLane={displayLane}
            laneInsights={laneInsights}
            latestImpact={latestImpact}
            activeResolutionEvent={activeResolutionEvent}
            cardPlayFx={cardPlayFx}
            deathGhosts={deathGhosts}
            selectedTargetSide={selectedTargetSide}
            onLaneClick={handleLaneClick}
            onLaneFocus={setFocusedLane}
          />

          <FrontlineBattleSidebar
            focusedLane={focusedLane}
            selectedCard={selectedCard}
            selectedLeaderPower={state.selectedLeaderPower}
            selectedContextTitle={selectedContextTitle}
            selectedContextBody={selectedContextBody}
            displayInsight={displayInsight}
            targetableLanes={targetableLanes}
            latestFeed={latestFeed}
          />
        </div>

        <FrontlineHandSection
          state={state}
          actionsLocked={actionsLocked}
          laneInsights={laneInsights}
          onCardClick={handleCardClick}
        />
      </div>
    </section>
  );
}


export default function FrontlineBattle(props: Props) {
  return (
    <FrontlineErrorBoundary>
      <FrontlineBattleInner {...props} />
    </FrontlineErrorBoundary>
  );
}
