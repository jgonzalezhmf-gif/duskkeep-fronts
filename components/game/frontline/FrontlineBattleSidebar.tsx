"use client";

import { CardTypeIcon } from "@/components/game/shared/CardTypeIcon";
import type { FrontlineCardDef, FrontlineEvent } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import type { FrontlineLane } from "@/lib/types";
import { CompactPill, StatusTag } from "./FrontlineBattlePills";
import { impactTone, laneLabel } from "./FrontlineBattleUiState";
import { CombatIcon } from "./FrontlineCombatIcon";
import { combatIconForEvent } from "./FrontlineEventFloats";
import {
  combatIconForLaneStatus,
  laneStatusMeta,
  type LaneInsight,
} from "./FrontlineLaneInsights";

type FrontlineBattleSidebarProps = {
  focusedLane: FrontlineLane | null;
  selectedCard: FrontlineCardDef | null;
  selectedLeaderPower: boolean;
  selectedContextTitle: string;
  selectedContextBody: string;
  displayInsight: LaneInsight;
  targetableLanes: FrontlineLane[];
  latestFeed: FrontlineEvent[];
};

export function FrontlineBattleSidebar({
  focusedLane,
  selectedCard,
  selectedLeaderPower,
  selectedContextTitle,
  selectedContextBody,
  displayInsight,
  targetableLanes,
  latestFeed,
}: FrontlineBattleSidebarProps) {
  const { t } = useI18n();
  const statusMeta = laneStatusMeta(t, displayInsight);

  return (
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
            {!selectedCard && !selectedLeaderPower ? (
              <StatusTag
                tone={statusMeta.tone}
                label={statusMeta.label}
                detail={statusMeta.detail}
                icon={combatIconForLaneStatus(displayInsight.status)}
              />
            ) : null}
          </div>
          {(selectedCard || selectedLeaderPower) ? (
            <div className="mt-2 text-[12px] leading-5 text-white/58">{selectedContextBody}</div>
          ) : null}

          {!selectedCard && !selectedLeaderPower ? (
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

          {(selectedCard || selectedLeaderPower) && targetableLanes.length ? (
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
  );
}
