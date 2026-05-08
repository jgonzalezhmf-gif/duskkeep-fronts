"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CardTypeIcon } from "@/components/game/shared/CardTypeIcon";
import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
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
  getFrontlineEnemyLeaderPortraitForPreset,
  getFrontlineLeaderPortraitSrc,
} from "@/lib/frontlineLeaderPortraitAssets";
import {
  frontlineCardName,
  frontlineLeaderPowerDescription,
  frontlineLeaderPowerName,
  frontlinePresetName,
} from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import type { FrontlineLane, FrontlineLoadout } from "@/lib/types";
import { FrontlineErrorBoundary } from "./FrontlineErrorBoundary";
import { BattleEndOverlay } from "./FrontlineBattleEndOverlay";
import { CommandPips, CompactPressureBar, CoreShockOverlay } from "./FrontlineBattleMeters";
import { CompactPill, StatusTag } from "./FrontlineBattlePills";
import { laneSurfaceClass } from "./FrontlineBattleSurfaceClasses";
import {
  cardEffectSummary,
  cardTargetLabel,
  impactTone,
  laneLabel,
  nextActionLabel,
  shouldCoreFlash,
} from "./FrontlineBattleUiState";
import { BossBanner } from "./FrontlineBossBanner";
import { BossColossusOverlay } from "./FrontlineBossColossusOverlay";
import { BossSegmentReadout } from "./FrontlineBossSegmentReadout";
import { CardCastFx, type FrontlineCardPlayFx } from "./FrontlineCardCastFx";
import { CardUseToast } from "./FrontlineCardUseToast";
import { ClashSpotlight } from "./FrontlineClashSpotlight";
import { CombatIcon } from "./FrontlineCombatIcon";
import { CoreTotem } from "./FrontlineCoreTotem";
import { DeathGhost, type FrontlineDeathGhostFx } from "./FrontlineDeathGhost";
import { EncounterBanner, type FrontlineEncounterBadgeKind } from "./FrontlineEncounterBanner";
import { combatIconForEvent, toResolutionFloatItems } from "./FrontlineEventFloats";
import { FrontlineHandSection } from "./FrontlineHandSection";
import { FrontlineHeroPiece } from "./FrontlineHeroPiece";
import {
  analyzeLane,
  combatIconForLaneStatus,
  laneBreachValue,
  laneStatusMeta,
  laneStatusSubtitle,
  laneStatusTitle,
  type LaneInsight,
} from "./FrontlineLaneInsights";
import { FrontlineBattleStyles } from "./FrontlineBattleStyles";
import { LaneActionTrail, type FrontlineVisualFxTone } from "./FrontlineLaneActionTrail";
import { LaneKoFx } from "./FrontlineLaneKoFx";
import { LaneInitiativeReadout } from "./FrontlineLaneInitiativeReadout";
import { PreviewSpotlight } from "./FrontlinePreviewSpotlight";
import { ResolutionFloat } from "./FrontlineResolutionFloat";
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
  cardPlayEventForSide,
  eventPrimaryTargetSide,
  heroVisualState,
  visualTargetSideForCard,
  visualTargetSideForLeader,
  visualToneFromCard,
  visualToneFromEvent,
} from "./FrontlineVisualState";
import { getFrontlineBoss } from "@/features/frontline/bosses";
import type { FrontlineBossSegmentConfig } from "@/features/frontline/types";

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
        <header className="grid gap-3 lg:grid-cols-[13rem_minmax(0,1fr)_13rem] xl:grid-cols-[15rem_minmax(0,1fr)_15rem]">
          <div className="relative">
            <CoreTotem
              leaderId={state.enemyDeck.leaderId}
              leaderNameOverride={frontlinePresetName(t, getEnemyPreset(enemyPresetId))}
              portraitSrc={getFrontlineEnemyLeaderPortraitForPreset(getEnemyPreset(enemyPresetId))}
              title={t("frontline.enemyCore")}
              hp={displayState.enemyCoreHp}
              maxHp={state.enemyCoreMaxHp}
              accent="enemy"
              flash={shouldCoreFlash(activeResolutionEvent ?? latestImpact, "ally")}
              powerCooldown={state.enemyDeck.powerCooldown}
            />
            <CoreShockOverlay shock={coreShock} side="enemy" />
          </div>

          <div className="relative self-start overflow-hidden rounded-[24px] border border-[#f5d498]/10 bg-[linear-gradient(135deg,rgba(255,236,185,0.026),rgba(255,255,255,0.006)_45%,rgba(0,0,0,0.055))] px-3 py-2 shadow-[inset_0_1px_0_rgba(245,212,152,0.04),0_10px_26px_rgba(0,0,0,0.1)] backdrop-blur-[1px] md:px-4">
            <div className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.24),transparent)]" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="sr-only">{resolutionFx ? t("frontline.clashLabel") : t("frontline.playerPhase")}</span>
                <span className="rounded-full bg-black/24 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/55">
                  {t("frontline.roundLabel", { round: state.round })}
                </span>
                <CommandPips value={state.allyDeck.command} />
              </div>
              {latestImpact ? (
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] shadow-[0_0_28px_rgba(245,196,81,0.12)]",
                    impactTone(latestImpact.kind) === "high"
                      ? "bg-[#f5c451]/16 text-[#f5d498]"
                      : "bg-white/[0.055] text-white/62",
                  )}
                >
                  <CombatIcon name={combatIconForEvent(latestImpact)} size="xs" fallbackClassName="opacity-90" />
                  <span>
                    {latestImpact.label}
                    {typeof latestImpact.amount === "number" ? ` ${latestImpact.amount}` : ""}
                  </span>
                </div>
              ) : null}
            </div>

            <span className="sr-only">{actionState.title} - {actionState.subtitle}</span>
            <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
              <button
                className={cn(
                  "relative isolate min-h-14 overflow-hidden rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition",
                  state.selectedLeaderPower
                    ? "border-[#ffe5a4]/70 bg-[radial-gradient(circle_at_28%_20%,rgba(255,248,214,0.9),rgba(245,196,81,0.78)_32%,rgba(86,45,17,0.94)_100%)] text-[#180c05] shadow-[0_0_38px_rgba(245,196,81,0.42)]"
                    : "border-[#f5c451]/42 bg-[radial-gradient(circle_at_26%_20%,rgba(255,248,214,0.36),rgba(245,196,81,0.2)_38%,rgba(44,24,12,0.88)_100%)] text-[#fff3c7] shadow-[0_12px_30px_rgba(245,196,81,0.24)] hover:-translate-y-0.5 hover:border-[#ffe5a4]/68 hover:shadow-[0_16px_38px_rgba(245,196,81,0.32)]",
                )}
                disabled={
                  actionsLocked ||
                  state.allyDeck.usedLeaderPower ||
                  state.allyDeck.powerCooldown > 0 ||
                  state.allyDeck.command < allyLeader.power.cost
                }
                onClick={handleLeaderPowerClick}
                title={allyLeaderPowerDescription}
              >
                <span className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.32),transparent_36%)]" />
                <span className="inline-flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-[#ffe5a4]/48 bg-black/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_24px_rgba(245,196,81,0.24)]">
                    <CombatIcon name="leader_power" size="lg" className="h-8 w-8" fallbackClassName="opacity-95" />
                  </span>
                  <span className="hidden max-w-[10rem] truncate sm:inline">{allyLeaderPowerName}</span>
                  <ResourceIcon kind="command" size="small" className="h-5 w-5" />
                  {allyLeader.power.cost}
                </span>
              </button>
              {(selectedCard || state.selectedLeaderPower || focusedLane) ? (
                <button
                  className="rounded-full bg-white/[0.055] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/72 transition hover:bg-white/[0.09]"
                  onClick={() => {
                    if (actionsLocked) return;
                    setFocusedLane(null);
                    setState((current) => ({ ...current, selectedCardId: null, selectedLeaderPower: false }));
                  }}
                  disabled={actionsLocked}
                >
                  {t("frontline.clear")}
                </button>
              ) : null}
              <button
                data-resolve-clash
                className="frontline-resolve-cta-fx rounded-full bg-[linear-gradient(180deg,rgba(74,166,111,0.98),rgba(14,59,38,0.98))] px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_26px_rgba(49,170,107,0.22)] transition hover:-translate-y-0.5 disabled:opacity-40 disabled:[animation:none]"
                disabled={actionsLocked}
                onClick={handleResolveClick}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CombatIcon name="clash" size="md" className="h-7 w-7" fallbackClassName="opacity-95" />
                  {t("frontline.resolveClash")}
                </span>
              </button>
            </div>
          </div>

          <div className="relative">
            <CoreTotem
              leaderId={state.allyDeck.leaderId}
              portraitSrc={getFrontlineLeaderPortraitSrc(state.allyDeck.leaderId)}
              title={t("frontline.yourCore")}
              hp={displayState.allyCoreHp}
              maxHp={state.allyCoreMaxHp}
              accent="ally"
              flash={shouldCoreFlash(activeResolutionEvent ?? latestImpact, "enemy")}
              powerCooldown={state.allyDeck.powerCooldown}
              powerReadyExtra={state.allyDeck.command >= allyLeader.power.cost && !state.allyDeck.usedLeaderPower}
            />
            <CoreShockOverlay shock={coreShock} side="ally" />
          </div>
        </header>

        {bossConfig && state.bossState ? (
          <BossBanner
            boss={bossConfig}
            bossState={state.bossState}
            modifiers={modifiers ?? null}
            cardCostMod={state.playerCardCostMod}
          />
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_14.5rem]">
          <div className="relative grid gap-3 lg:grid-cols-3">
            {bossConfig ? <BossColossusOverlay assetKey={bossConfig.assetKey} /> : null}
            {FRONTLINE_LANES.map((lane) => {
              const laneState = displayState.lanes[lane];
              const active = targetableLanes.includes(lane);
              const focused = displayLane === lane;
              const insight = laneInsights.find((entry) => entry.lane === lane)!;
              const statusMeta = laneStatusMeta(t, insight);
              const latestHere = latestImpact?.lane === lane;
              const activeLaneEvent = activeResolutionEvent?.lane === lane ? activeResolutionEvent : null;
              const laneFx = activeLaneEvent ? [activeLaneEvent] : [];
              const laneCardFx = cardPlayFx && (cardPlayFx.lane === lane || cardPlayFx.events.some((event) => event.lane === lane)) ? cardPlayFx : null;
              const laneDeathGhost =
                (activeLaneEvent ? deathGhosts.find((ghost) => ghost.eventId === activeLaneEvent.id) : null) ??
                (laneCardFx ? deathGhosts.find((ghost) => ghost.lane === lane && laneCardFx.events.some((event) => event.id === ghost.eventId)) : null) ??
                null;
              const allyCardEvent = cardPlayEventForSide(laneCardFx, lane, "ally");
              const enemyCardEvent = cardPlayEventForSide(laneCardFx, lane, "enemy");
              const allyTargeted = active && (selectedTargetSide === "ally" || selectedTargetSide === "both");
              const enemyTargeted = active && (selectedTargetSide === "enemy" || selectedTargetSide === "both");
              const allyVisualState = heroVisualState({
                side: "ally",
                focused,
                targeted: allyTargeted,
                activeEvent: activeLaneEvent,
                cardFx: laneCardFx,
                cardEvent: allyCardEvent,
              });
              const enemyVisualState = heroVisualState({
                side: "enemy",
                focused,
                targeted: enemyTargeted,
                activeEvent: activeLaneEvent,
                cardFx: laneCardFx,
                cardEvent: enemyCardEvent,
              });
              const breachFx = activeLaneEvent?.kind === "breach";
              return (
                <button
                  key={lane}
                  data-frontline-lane={lane}
                  onClick={() => handleLaneClick(lane)}
                  onMouseEnter={() => setFocusedLane(lane)}
                  onFocus={() => setFocusedLane(lane)}
                  className={cn(
                    "group relative min-h-[25rem] overflow-hidden rounded-[30px] p-3 text-left transition duration-300",
                    laneSurfaceClass(statusMeta.tone, active, focused),
                    latestHere && "ring-2 ring-[#f5c451]/18",
                    latestHere && impactTone(latestImpact?.kind) !== "low" && "frontline-lane-impact-fx",
                    laneCardFx && "frontline-lane-impact-fx ring-2 ring-[#f5c451]/34 shadow-[0_0_44px_rgba(245,196,81,0.22)]",
                    active && "ring-2 ring-[#f5c451]/26",
                    activeResolutionEvent && !activeLaneEvent && "opacity-60 saturate-[0.78] scale-[0.99] transition-[opacity,filter,transform] duration-200",
                    activeLaneEvent && "z-[2] ring-[3px] ring-[#f5c451]/56 shadow-[0_0_72px_rgba(245,196,81,0.32)] transition-[box-shadow,transform] duration-200",
                  )}
                  title={laneStatusSubtitle(t, insight.lane, insight.status)}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.028),transparent_30%,rgba(0,0,0,0.14))]" />
                  <div className="pointer-events-none absolute inset-x-6 top-11 h-24 rounded-[999px] bg-[radial-gradient(circle,rgba(245,196,81,0.08),transparent_67%)] blur-lg" />
                  <div className="pointer-events-none absolute inset-x-8 top-[46%] h-14 rounded-[999px] bg-[radial-gradient(ellipse,rgba(245,196,81,0.1),transparent_70%)] blur-md" />
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-0 transition duration-300",
                      active && "opacity-100 bg-[radial-gradient(circle_at_50%_50%,rgba(245,196,81,0.18),transparent_58%)]",
                      laneCardFx && "opacity-100 bg-[radial-gradient(circle_at_50%_52%,rgba(245,196,81,0.2),transparent_64%)]",
                      insight.breachSide === "ally" && !active && "opacity-100 bg-[radial-gradient(circle_at_50%_52%,rgba(101,210,200,0.12),transparent_62%)]",
                      insight.breachSide === "enemy" && !active && "opacity-100 bg-[radial-gradient(circle_at_50%_52%,rgba(240,95,114,0.14),transparent_62%)]",
                    )}
                  />
                  <div className="pointer-events-none absolute inset-x-7 top-[49%] h-px rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,236,185,0.2),transparent)]" />
                  {breachFx ? (
                    <div className="frontline-breach-fx pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 rounded-full border-2 border-[#f5c451]/70 bg-[#f5c451]/14 shadow-[0_0_48px_rgba(245,196,81,0.42)]" />
                  ) : null}
                  <LaneActionTrail
                    event={activeLaneEvent}
                    targetSide={activeLaneEvent ? eventPrimaryTargetSide(activeLaneEvent) : null}
                    tone={activeLaneEvent ? visualToneFromEvent(activeLaneEvent) : null}
                    icon={activeLaneEvent ? combatIconForEvent(activeLaneEvent) : null}
                  />
                  <ResolutionFloat items={toResolutionFloatItems(laneFx)} />
                  <CardCastFx fx={laneCardFx} />
                  <DeathGhost ghost={laneDeathGhost} />
                  <LaneKoFx event={activeLaneEvent} targetSide={activeLaneEvent ? eventPrimaryTargetSide(activeLaneEvent) : null} />

                  <div className="relative z-[1] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="text-white/48">{lane}</span>
                      {bossSegmentByLane[lane] ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                            bossSegmentByLane[lane]?.weakpoint
                              ? "border-rose-200/52 bg-rose-400/16 text-rose-50"
                              : "border-[#f5c451]/52 bg-[#f5c451]/12 text-[#fff0bd]",
                          )}
                          title={bossSegmentByLane[lane]?.weakpoint ? t("frontline.bossSegmentWeakpoint") : t("frontline.bossSegmentTitle")}
                        >
                          <CombatIcon name={bossSegmentByLane[lane]?.weakpoint ? "danger" : "leader_power"} size="sm" className="h-5 w-5" fallbackClassName="opacity-90" />
                          <span>{t(bossSegmentByLane[lane]!.titleKey)}</span>
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {insight.breachSide ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-black/24 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/72">
                          <CombatIcon name={insight.breachSide === "ally" ? "breach" : "danger"} size="sm" className="h-5 w-5" fallbackClassName="opacity-90" />
                          <span>{laneBreachValue(lane)}</span>
                        </div>
                      ) : null}
                      <StatusTag tone={statusMeta.tone} label={statusMeta.label} detail={statusMeta.detail} icon={combatIconForLaneStatus(insight.status)} />
                    </div>
                  </div>

                  <div className={cn("relative z-[2]", bossConfig ? "mt-[10rem]" : "mt-3")}>
                    {bossConfig && bossSegmentByLane[lane] ? (
                      <BossSegmentReadout
                        segment={bossSegmentByLane[lane]!}
                        hero={laneState.enemyHero}
                        support={laneState.enemySupport}
                        scorch={displayState.bossState?.scorch[lane] ?? 0}
                        active={active}
                        focused={focused}
                        targeted={enemyTargeted}
                        pressured={insight.enemyLow}
                        attacking={Boolean(enemyVisualState.attacking)}
                        hit={Boolean(enemyVisualState.hit)}
                        ko={Boolean(enemyVisualState.ko)}
                      />
                    ) : (
                      <FrontlineHeroPiece
                        actor={laneState.enemyHero}
                        support={laneState.enemySupport}
                        accent="enemy"
                        pressured={insight.enemyLow}
                        visualState={enemyVisualState}
                      />
                    )}
                  </div>

                  <div className="relative z-[1] my-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28))]" />
                    <div
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center rounded-full text-[9px] font-black uppercase tracking-[0.18em]",
                        active
                          ? "bg-[#f5c451]/16 text-[#f5d498] shadow-[0_0_26px_rgba(245,196,81,0.22)]"
                          : insight.breachSide === "ally"
                            ? "bg-emerald-300/12 text-emerald-100"
                            : insight.breachSide === "enemy"
                              ? "bg-rose-300/12 text-rose-100"
                            : "bg-black/24 text-white/44",
                      )}
                    >
                          <CombatIcon
                            name={active ? "target" : insight.breachSide === "ally" ? "breach" : insight.breachSide === "enemy" ? "danger" : "clash"}
                        size="md"
                        className="h-7 w-7"
                        fallbackClassName="opacity-90"
                      />
                      <span className="sr-only">
                        {active
                          ? t("frontline.target")
                          : insight.breachSide === "ally"
                            ? t("frontline.statusBreach")
                            : insight.breachSide === "enemy"
                              ? t("frontline.defend")
                              : t("frontline.clash")}
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.28),transparent)]" />
                  </div>

                  <div className="relative z-[1]">
                    <FrontlineHeroPiece
                      actor={laneState.allyHero}
                      support={laneState.allySupport}
                      accent="ally"
                      pressured={insight.allyLow}
                      visualState={allyVisualState}
                      scorch={state.bossState?.scorch[lane] ?? 0}
                    />
                  </div>

                  <CompactPressureBar allyScore={insight.allyScore} enemyScore={insight.enemyScore} />
                </button>
              );
            })}
          </div>

          <aside className="grid gap-3">
            <section className="relative overflow-hidden rounded-[26px] border border-[#f5d498]/10 bg-[linear-gradient(180deg,rgba(255,236,185,0.026),rgba(255,255,255,0.006)_44%,rgba(0,0,0,0.055))] p-3 shadow-[inset_0_1px_0_rgba(245,212,152,0.035)] backdrop-blur-[1px]">
              <div className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.22),transparent)]" />
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">
                  <CombatIcon name="target" size="sm" className="h-5 w-5" fallbackClassName="opacity-90" />
                  <span>{t("frontline.focus")}</span>
                </div>
                {focusedLane ? <CompactPill tone="neutral">{laneLabel(t, focusedLane)}</CompactPill> : null}
              </div>

              <div className="mt-2 rounded-[20px] bg-black/8 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-black text-white">
                    {selectedCard ? <CardTypeIcon type={selectedCard.kind} size="sm" className="h-7 w-7" /> : null}
                    <span className="truncate">{selectedContextTitle}</span>
                  </div>
                  {!selectedCard && !state.selectedLeaderPower ? (
                    (() => {
                      const meta = laneStatusMeta(t, displayInsight);
                      return (
                        <StatusTag
                          tone={meta.tone}
                          label={meta.label}
                          detail={meta.detail}
                          icon={combatIconForLaneStatus(displayInsight.status)}
                        />
                      );
                    })()
                  ) : null}
                </div>
                {(selectedCard || state.selectedLeaderPower) ? (
                  <div className="mt-2 text-[12px] leading-5 text-white/58">{selectedContextBody}</div>
                ) : null}

                {!selectedCard && !state.selectedLeaderPower ? (
                  <div className="mt-3 flex items-center justify-between rounded-[16px] bg-black/10 px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/58">
                    <span className="inline-flex items-center gap-1">
                      <CombatIcon name="attack" size="sm" className="h-5 w-5" fallbackClassName="opacity-85" />
                      {displayInsight.allyScore}
                    </span>
                    <span className="h-px flex-1 mx-2 bg-[linear-gradient(90deg,rgba(101,210,200,0.4),rgba(240,95,114,0.4))]" />
                    <span className="inline-flex items-center gap-1">
                      <CombatIcon name="danger" size="sm" className="h-5 w-5" fallbackClassName="opacity-85" />
                      {displayInsight.enemyScore}
                    </span>
                  </div>
                ) : null}

                {(selectedCard || state.selectedLeaderPower) && targetableLanes.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {targetableLanes.map((lane) => (
                      <div
                        key={`target-${lane}`}
                        className="inline-flex items-center gap-1 rounded-full bg-[#f5c451]/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#f5d498]"
                      >
                        <CombatIcon name="target" size="sm" className="h-5 w-5" fallbackClassName="opacity-90" />
                        <span>{laneLabel(t, lane)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-3 space-y-1.5">
                {latestFeed.map((entry, index) => {
                  if (entry.kind === "round") {
                    return (
                      <div
                        key={entry.id}
                        className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/44"
                      >
                        <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(245,212,152,0.1))]" />
                        <span className="rounded-full border border-[#f5d498]/12 bg-black/24 px-2 py-0.5">{entry.label}</span>
                        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(245,212,152,0.1),transparent)]" />
                      </div>
                    );
                  }
                  const high = impactTone(entry.kind) === "high";
                  const isTop = index === 0;
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "rounded-[14px] border px-3 py-1.5 transition",
                        high
                          ? "border-[#f5c451]/30 bg-[#f5c451]/12 text-[#f5d498]"
                          : "border-[#f5d498]/8 bg-white/[0.025] text-white/72",
                        isTop && high && "shadow-[0_0_18px_rgba(245,196,81,0.22)] ring-1 ring-[#f5c451]/45",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className={cn("flex min-w-0 items-center gap-2 font-black", isTop ? "text-[12px]" : "text-[11px]")}>
                          <CombatIcon name={combatIconForEvent(entry)} size="md" fallbackClassName="opacity-90 h-6 w-6" className="h-6 w-6" />
                          <span className="truncate">{entry.label}</span>
                        </div>
                        {typeof entry.amount === "number" ? (
                          <div className={cn("font-black tabular-nums", isTop && high ? "text-[13px]" : "text-[11px]")}>
                            {entry.amount}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
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
