"use client";

import { FRONTLINE_LANES } from "@/features/frontline/data";
import type {
  FrontlineBattleState,
  FrontlineBossConfig,
  FrontlineBossSegmentConfig,
  FrontlineEvent,
} from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import type { FrontlineLane } from "@/lib/types";
import { BossColossusOverlay } from "./FrontlineBossColossusOverlay";
import { BossSegmentReadout } from "./FrontlineBossSegmentReadout";
import { CompactPressureBar } from "./FrontlineBattleMeters";
import { StatusTag } from "./FrontlineBattlePills";
import { laneSurfaceClass } from "./FrontlineBattleSurfaceClasses";
import { impactTone } from "./FrontlineBattleUiState";
import { CardCastFx, type FrontlineCardPlayFx } from "./FrontlineCardCastFx";
import { CombatIcon } from "./FrontlineCombatIcon";
import { DeathGhost, type FrontlineDeathGhostFx } from "./FrontlineDeathGhost";
import { combatIconForEvent, toResolutionFloatItems } from "./FrontlineEventFloats";
import { FrontlineHeroPiece } from "./FrontlineHeroPiece";
import {
  combatIconForLaneStatus,
  laneBreachValue,
  laneStatusMeta,
  laneStatusSubtitle,
  type LaneInsight,
} from "./FrontlineLaneInsights";
import { LaneActionTrail } from "./FrontlineLaneActionTrail";
import { FrontlineLaneCenterMarker } from "./FrontlineLaneCenterMarker";
import { LaneKoFx } from "./FrontlineLaneKoFx";
import { ResolutionFloat } from "./FrontlineResolutionFloat";
import {
  cardPlayEventForSide,
  eventPrimaryTargetSide,
  heroVisualState,
  visualToneFromEvent,
} from "./FrontlineVisualState";

type FrontlineBattleLanesProps = {
  state: FrontlineBattleState;
  displayState: FrontlineBattleState;
  bossConfig: FrontlineBossConfig | null;
  bossSegmentByLane: Partial<Record<FrontlineLane, FrontlineBossSegmentConfig>>;
  targetableLanes: FrontlineLane[];
  displayLane: FrontlineLane;
  laneInsights: LaneInsight[];
  latestImpact: FrontlineEvent | null;
  activeResolutionEvent: FrontlineEvent | null;
  cardPlayFx: FrontlineCardPlayFx | null;
  deathGhosts: FrontlineDeathGhostFx[];
  selectedTargetSide: "ally" | "enemy" | "both" | null;
  onLaneClick: (lane: FrontlineLane) => void;
  onLaneFocus: (lane: FrontlineLane) => void;
};

export function FrontlineBattleLanes({
  state,
  displayState,
  bossConfig,
  bossSegmentByLane,
  targetableLanes,
  displayLane,
  laneInsights,
  latestImpact,
  activeResolutionEvent,
  cardPlayFx,
  deathGhosts,
  selectedTargetSide,
  onLaneClick,
  onLaneFocus,
}: FrontlineBattleLanesProps) {
  const { t } = useI18n();

  return (
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
            onClick={() => onLaneClick(lane)}
            onMouseEnter={() => onLaneFocus(lane)}
            onFocus={() => onLaneFocus(lane)}
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
            title={laneStatusSubtitle(t, insight.lane, insight.status, insight.breachAmount ?? undefined)}
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
                    <span>{insight.breachAmount ?? laneBreachValue(lane)}</span>
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

            <FrontlineLaneCenterMarker active={active} breachSide={insight.breachSide} />

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
  );
}
