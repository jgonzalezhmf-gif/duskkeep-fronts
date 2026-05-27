"use client";

import { useEffect, useRef, useState } from "react";
import { FrontlineBattleStyles } from "@/components/game/frontline/FrontlineBattleStyles";
import {
  getFortressDefenseActions,
  getFortressDefenseOutcome,
  previewFortressDefenseActionDamage,
  type FortressDefenseActionDef,
  type FortressDefenseActionId,
  type FortressDefenseLane,
  type FortressDefenseRange,
  type FortressDefenseState,
  type FortressDefenseTargetType,
} from "@/features/fortress-defense/engine";
import { FORTRESS_DEFENSE_SCENE_ASSETS } from "@/features/fortress-defense/assets";
import { audio, sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import type { FrontlineFortressOutcome, Rewards } from "@/lib/types";
import { FortressDefenseActionDock } from "./FortressDefenseActionDock";
import {
  CastleKeep,
  EnemyAssaultFx,
  EnemyStandee,
  GuardStandee,
  OrderFx,
  TrapMarker,
} from "./FortressDefenseBattlefieldUnits";
import { FortressDefenseBattleFeed } from "./FortressDefenseBattleFeed";
import { FortressDefenseHeader } from "./FortressDefenseHeader";
import { FortressDefenseSceneStyles } from "./FortressDefenseSceneStyles";
import {
  defenseSlotKey,
  enemyForVisualPhase,
} from "./fortressDefenseBattlefieldLayout";
import {
  AdvancePath,
  FlowCue,
  TargetSlotLayer,
  TargetingCue,
  WaveBanner,
  validTargetSlotKeys,
} from "./FortressDefenseTargetingLayer";
import {
  clearVisualTimers,
  createOpeningVisualEvent,
  createPendingVisualEvent,
  describeTurnVisualEvent,
  scheduleVisualTimer,
  startVisualTimeline,
  type DefenseVisualPhase,
  type TurnVisualEvent,
} from "./fortressDefenseVisualEvents";
import { outcomeMeta, type TranslateFn } from "./fortressPageHelpers";
import { FortressDefenseOutcomeOverlay } from "./FortressDefenseOutcomeOverlay";

type FortressDefenseBattleProps = {
  defenseState: FortressDefenseState;
  forecast: { attackPower: number; defensePower: number; outcome: FrontlineFortressOutcome; rewards: Rewards };
  defenseRewards?: Rewards;
  claimPending: boolean;
  onAction: (actionId: FortressDefenseActionId, targetId?: string) => void;
  onClaim: () => void;
  onRetreat: () => void;
  t: TranslateFn;
};

let fortressDefenseThemeReleaseTimer: number | null = null;

function retainFortressDefenseTheme() {
  if (typeof window !== "undefined" && fortressDefenseThemeReleaseTimer !== null) {
    window.clearTimeout(fortressDefenseThemeReleaseTimer);
    fortressDefenseThemeReleaseTimer = null;
  }
  audio.setTheme("fortress_defense", { immediate: true, assetOnly: true });
}

function releaseFortressDefenseTheme() {
  if (typeof window === "undefined") {
    audio.setTheme("home");
    return;
  }
  if (fortressDefenseThemeReleaseTimer !== null) window.clearTimeout(fortressDefenseThemeReleaseTimer);
  fortressDefenseThemeReleaseTimer = window.setTimeout(() => {
    fortressDefenseThemeReleaseTimer = null;
    audio.setTheme("home");
  }, 320);
}

export function FortressDefenseBattle({
  defenseState,
  forecast,
  defenseRewards,
  claimPending,
  onAction,
  onClaim,
  onRetreat,
  t,
}: FortressDefenseBattleProps) {
  const outcome = getFortressDefenseOutcome(defenseState);
  const terminal = defenseState.status !== "active";
  const outcomeState = outcomeMeta(outcome, t);
  const actions = getFortressDefenseActions(defenseState);
  const rewards = defenseRewards ?? forecast.rewards;
  const [backdropFailed, setBackdropFailed] = useState(false);
  const [visualPhase, setVisualPhase] = useState<DefenseVisualPhase>("idle");
  const [visualEvent, setVisualEvent] = useState<TurnVisualEvent>(() => createOpeningVisualEvent(defenseState));
  const [inputLocked, setInputLocked] = useState(false);
  const [targetingActionId, setTargetingActionId] = useState<FortressDefenseActionId | null>(null);
  const [hoveredEnemyId, setHoveredEnemyId] = useState<string | null>(null);
  const [activeEnemyActionId, setActiveEnemyActionId] = useState<string | null>(null);
  const previousStateRef = useRef<FortressDefenseState | null>(defenseState);
  const pendingActionRef = useRef<FortressDefenseActionId | null>(null);
  const pendingTargetRef = useRef<string | undefined>(undefined);
  const visualTimersRef = useRef<number[]>([]);
  const playedPhaseRef = useRef<string>("");
  const lastTerminalStatusRef = useRef<FortressDefenseState["status"]>(defenseState.status);
  const currentEnemyIds = new Set(defenseState.enemies.map((enemy) => enemy.id));
  const ghostEnemies = visualPhase === "idle" ? [] : visualEvent.departedEnemies.filter((enemy) => !currentEnemyIds.has(enemy.id));
  const ghostEnemyIds = new Set(ghostEnemies.map((enemy) => enemy.id));
  const visualEnemies = defenseState.enemies.map((enemy) => enemyForVisualPhase(enemy, visualEvent, visualPhase));
  const fieldEnemies = [...visualEnemies, ...ghostEnemies].slice(0, 6);
  const currentGuardIds = new Set(defenseState.guards.map((guard) => guard.id));
  const ghostGuards = visualPhase === "idle" ? [] : visualEvent.departedGuards.filter((guard) => !currentGuardIds.has(guard.id));
  const fieldGuards = [...defenseState.guards, ...ghostGuards].slice(0, 6);
  const activeTraps = defenseState.traps ?? [];
  const currentTrapIds = new Set(activeTraps.map((trap) => trap.id));
  const ghostTraps = visualPhase === "idle" ? [] : visualEvent.departedTraps.filter((trap) => !currentTrapIds.has(trap.id));
  const fieldTraps = [...activeTraps, ...ghostTraps];
  const occupiedGuardSlots = new Set(fieldGuards.map((guard) => defenseSlotKey(guard.lane, guard.range)));
  const occupiedEnemySlots = new Set(fieldEnemies.map((enemy) => defenseSlotKey(enemy.lane, enemy.range)));
  const battleBackdrop = backdropFailed ? FORTRESS_DEFENSE_SCENE_ASSETS.lastBastionBackdrop.fallbackSrc : FORTRESS_DEFENSE_SCENE_ASSETS.lastBastionBackdrop.src;
  const targetingAction = targetingActionId ? actions.find((action) => action.id === targetingActionId) ?? null : null;
  const targetingType = targetingAction?.targetType ?? "none";
  const targetingEnemies = targetingType === "enemy";
  const validSlotKeys = targetingAction ? validTargetSlotKeys(defenseState, targetingAction.id) : undefined;

  useEffect(() => {
    retainFortressDefenseTheme();
    return releaseFortressDefenseTheme;
  }, []);

  useEffect(() => () => clearVisualTimers(visualTimersRef), []);

  useEffect(() => {
    if (targetingActionId && !actions.some((action) => action.id === targetingActionId)) {
      setTargetingActionId(null);
    }
  }, [actions, targetingActionId]);

  useEffect(() => {
    if (targetingActionId && (terminal || inputLocked || defenseState.enemies.length === 0)) {
      setTargetingActionId(null);
      setHoveredEnemyId(null);
    }
  }, [defenseState.enemies.length, inputLocked, targetingActionId, terminal]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setTargetingActionId(null);
      setHoveredEnemyId(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (defenseState.status !== lastTerminalStatusRef.current && defenseState.status !== "active") {
      if (defenseState.status === "victory") sfx.victory();
      if (defenseState.status === "breach") sfx.defeat();
    }
    lastTerminalStatusRef.current = defenseState.status;
  }, [defenseState.status]);

  useEffect(() => {
    const previous = previousStateRef.current;
    if (!previous) {
      previousStateRef.current = defenseState;
      return;
    }

    if (!fortressDefenseStateChanged(previous, defenseState)) {
      previousStateRef.current = defenseState;
      return;
    }

    const event = describeTurnVisualEvent(previous, defenseState, pendingActionRef.current, pendingTargetRef.current);
    pendingActionRef.current = null;
    pendingTargetRef.current = undefined;
    setVisualEvent(event);
    startVisualTimeline(event, setVisualPhase, setInputLocked, setActiveEnemyActionId, visualTimersRef, shouldUseReducedMotion());
    previousStateRef.current = defenseState;
  }, [defenseState]);

  useEffect(() => {
    const phaseKey = `${visualEvent.key}:${visualPhase}`;
    if (playedPhaseRef.current === phaseKey) return;
    playedPhaseRef.current = phaseKey;
    playPhaseSfx(visualEvent, visualPhase);
  }, [visualEvent, visualPhase]);

  function handleActionSelect(action: FortressDefenseActionDef) {
    if (terminal || inputLocked) return;
    if (action.disabledReason) return;
    if (action.targetType === "enemy" || action.targetType === "lane" || action.targetType === "slot") {
      setTargetingActionId((current) => (current === action.id ? null : action.id));
      setHoveredEnemyId(null);
      return;
    }
    executeAction(action.id);
  }

  function handleEnemyTarget(enemyId: string) {
    if (!targetingAction || targetingAction.targetType !== "enemy" || terminal || inputLocked) return;
    executeAction(targetingAction.id, enemyId);
  }

  function handleSlotTarget(lane: FortressDefenseLane, range: FortressDefenseRange) {
    if (!targetingAction || (targetingAction.targetType !== "lane" && targetingAction.targetType !== "slot") || terminal || inputLocked) return;
    executeAction(targetingAction.id, targetingAction.targetType === "lane" ? lane : `${lane}:${range}`);
  }

  function executeAction(actionId: FortressDefenseActionId, targetId?: string) {
    pendingActionRef.current = actionId;
    pendingTargetRef.current = targetId;
    setInputLocked(true);
    setTargetingActionId(null);
    setHoveredEnemyId(null);
    setVisualEvent(createPendingVisualEvent(defenseState, actionId, targetId));
    setVisualPhase("resolvingOrder");
    sfx.cardOrder();

    const delay = shouldUseReducedMotion() ? 40 : 260;
    scheduleVisualTimer(visualTimersRef, () => onAction(actionId, targetId), delay);
  }

  return (
    <section
      className={cn(
        "relative isolate min-h-dvh overflow-hidden bg-[#030406] text-white",
        (visualPhase === "enemyAttacking" || visualPhase === "castleHit") && "frontline-inferno-cast-fx",
      )}
      data-fortress-defense-backdrop={backdropFailed ? "fallback" : "last-bastion"}
      data-fortress-active-enemy-action={activeEnemyActionId ?? ""}
      data-fortress-enemy-action-count={visualEvent.enemyActions.length}
    >
      <FrontlineBattleStyles />
      <FortressDefenseSceneStyles />
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030406]" aria-hidden="true">
        <img
          src={battleBackdrop}
          alt=""
          loading="eager"
          decoding="async"
          draggable={false}
          onError={() => setBackdropFailed(true)}
          className="h-full w-full object-cover object-[36%_50%] opacity-100 sm:object-center"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_49%,rgba(245,196,81,0.12),transparent_23%),radial-gradient(circle_at_78%_45%,rgba(240,95,114,0.2),transparent_31%),linear-gradient(180deg,rgba(2,3,6,0.16),rgba(2,3,6,0.24)_42%,rgba(2,3,6,0.78)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.5)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(3,5,9,0.86),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,rgba(3,5,9,0.92),transparent)]" />
      </div>
      <div className="relative z-[2] mx-auto flex min-h-dvh w-full max-w-[1640px] flex-col gap-2 px-3 pb-3 pt-3 md:px-5 xl:px-7">
        <div className="fortress-defense-battle-enter-fx pointer-events-none fixed inset-0 z-[60] bg-black" aria-hidden="true" />
        <FortressDefenseHeader
          state={defenseState}
          visualPhase={visualPhase}
          terminal={terminal}
          outcomeHeadline={outcomeState.headline}
          onRetreat={onRetreat}
          t={t}
        />

        <section className="relative isolate min-h-[36rem] flex-1 overflow-visible md:min-h-[42rem]" data-fortress-defense-phase={visualPhase}>
          <div className="pointer-events-none absolute left-[18%] right-[5%] top-[54%] h-28 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_50%,rgba(70,52,35,0.24),rgba(245,196,81,0.1)_34%,rgba(240,95,114,0.08)_64%,transparent_78%)]" />
          <div className="pointer-events-none absolute left-[23%] right-[8%] top-[59%] h-px bg-[linear-gradient(90deg,rgba(245,196,81,0.52),rgba(255,255,255,0.18),rgba(240,95,114,0.42),transparent)]" />
          <div className="pointer-events-none absolute right-[4%] top-[18%] h-[60%] w-[22%] rounded-[50%] bg-rose-500/12 blur-2xl" />

          <FlowCue event={visualEvent} phase={visualPhase} t={t} />
          <TargetingCue action={targetingAction} t={t} onCancel={() => setTargetingActionId(null)} />
          <AdvancePath phase={visualPhase} targetingType={targetingType} />
          <WaveBanner state={defenseState} event={visualEvent} phase={visualPhase} t={t} />
          <TargetSlotLayer targetType={targetingType} validSlotKeys={validSlotKeys} onTarget={handleSlotTarget} t={t} />

          <CastleKeep
            state={defenseState}
            outcome={outcome}
            phase={visualPhase}
            event={visualEvent}
            t={t}
          />

          <OrderFx event={visualEvent} phase={visualPhase} enemies={fieldEnemies} />
          <EnemyAssaultFx event={visualEvent} phase={visualPhase} enemies={fieldEnemies} activeEnemyActionId={activeEnemyActionId} />

          <div className="pointer-events-none absolute inset-0 z-[10]">
            {fieldTraps.map((trap) => (
              <TrapMarker
                key={`${trap.id}-${ghostTraps.some((ghost) => ghost.id === trap.id) ? "ghost" : "field"}`}
                trap={trap}
                event={visualEvent}
                phase={visualPhase}
                ghost={ghostTraps.some((ghost) => ghost.id === trap.id)}
                t={t}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 z-[11]">
            {fieldGuards.map((guard, index) => (
              <GuardStandee
                key={`${guard.id}-${ghostGuards.some((ghost) => ghost.id === guard.id) ? "ghost" : "field"}`}
                guard={guard}
                index={index}
                event={visualEvent}
                phase={visualPhase}
                ghost={ghostGuards.some((ghost) => ghost.id === guard.id)}
                contested={occupiedEnemySlots.has(defenseSlotKey(guard.lane, guard.range))}
                t={t}
              />
            ))}
          </div>

          <div className="absolute inset-0 z-[8]">
            {fieldEnemies.length > 0 ? (
              fieldEnemies.map((enemy, index) => {
                const ghost = ghostEnemyIds.has(enemy.id);
                return (
                  <EnemyStandee
                    key={`${enemy.id}-${ghost ? "ghost" : "field"}`}
                    enemy={enemy}
                    index={index}
                    origin={visualEvent.enemyOrigins[enemy.id]}
                    event={visualEvent}
                    phase={visualPhase}
                    activeEnemyActionId={activeEnemyActionId}
                    ghost={ghost}
                    contested={occupiedGuardSlots.has(defenseSlotKey(enemy.lane, enemy.range))}
                    targeting={targetingEnemies && !terminal && !inputLocked && !ghost}
                    hovered={hoveredEnemyId === enemy.id}
                    shotPreview={previewFortressDefenseActionDamage(defenseState, "castle_shot", enemy)}
                    onTarget={handleEnemyTarget}
                    onHover={setHoveredEnemyId}
                    t={t}
                  />
                );
              })
            ) : (
              <div className="absolute left-[62%] top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[24px] border border-emerald-200/14 bg-emerald-300/10 px-5 py-4 text-center text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100/80 backdrop-blur-[1px]">
                {t("fortressScreen.defense.noEnemies")}
              </div>
            )}
          </div>

          <FortressDefenseBattleFeed entries={defenseState.log} t={t} />

          {terminal ? (
            <FortressDefenseOutcomeOverlay
              outcome={outcome}
              headline={outcomeState.headline}
              panelClassName={outcomeState.panel}
              rewards={rewards}
              claimPending={claimPending}
              onClaim={onClaim}
              t={t}
            />
          ) : null}
        </section>

        <FortressDefenseActionDock
          actions={actions}
          terminal={terminal}
          busy={inputLocked}
          selectedActionId={visualEvent.actionId}
          targetingActionId={targetingActionId}
          onActionSelect={handleActionSelect}
          onCancelTargeting={() => setTargetingActionId(null)}
          t={t}
        />
      </div>
    </section>
  );
}

function playPhaseSfx(event: TurnVisualEvent, phase: DefenseVisualPhase) {
  if (event.key === "opening" || event.key.startsWith("pending")) return;
  if (phase === "resolvingOrder") {
    if (event.actionId === "bulwark") sfx.shield();
    else if (event.actionId === "mend") sfx.heal();
    else if (event.actionId === "war_chant") sfx.leaderPower();
    else if (event.damagedEnemyIds.length > 0) sfx.hit();
    if (event.defeatedEnemyIds.length > 0) sfx.deathMonster();
    return;
  }
  if (phase === "enemyAdvancing" && (event.advancedEnemyIds.length > 0 || event.attackingEnemyIds.length > 0)) sfx.move();
  if (phase === "enemyAttacking" && event.attackingEnemyIds.length > 0) sfx.attack();
  if (phase === "castleHit") {
    if (event.shieldAbsorbed > 0) sfx.guard();
    if (event.castleDamage > 0) sfx.coreDamage();
  }
  if (phase === "waveIncoming" && event.waveIncoming) sfx.turnStart();
}

function fortressDefenseStateChanged(previous: FortressDefenseState, next: FortressDefenseState) {
  return previous.turn !== next.turn || previous.wave !== next.wave || previous.status !== next.status || previous.castleHp !== next.castleHp || previous.shield !== next.shield || previous.enemies !== next.enemies || previous.guards !== next.guards || previous.traps !== next.traps;
}

function shouldUseReducedMotion() {
  if (typeof window === "undefined") return false;
  if (document.documentElement.dataset.motion === "reduced") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
