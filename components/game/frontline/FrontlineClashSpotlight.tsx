"use client";

import type { FrontlineEvent } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import { CombatIcon } from "./FrontlineCombatIcon";
import type { FrontlineVisualFxTone } from "./FrontlineLaneActionTrail";

export function ClashSpotlight({
  event,
  index,
  total,
  tone,
  icon,
  targetSide,
}: {
  event: FrontlineEvent | null;
  index: number;
  total: number;
  tone: FrontlineVisualFxTone | null;
  icon: CombatAssetIconName | null;
  targetSide: "ally" | "enemy" | null;
}) {
  const { t } = useI18n();
  if (!event || !tone || !icon) return null;

  const laneLabel = event.lane ? event.lane.toUpperCase() : "CORE";
  const headline =
    event.kind === "card"
      ? t("frontline.card")
      : event.kind === "power"
        ? t("frontline.power")
        : event.kind === "breach"
          ? t("frontline.statusBreach")
      : event.kind === "ko"
        ? "KO"
        : event.kind === "heal"
          ? t("frontline.castHeal")
          : event.kind === "shield"
            ? t("frontline.castShield")
            : event.kind === "summon"
              ? t("frontline.castSummon")
              : event.kind === "stun"
                ? t("frontline.castStun")
                : t("frontline.castStrike");

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[8.8rem] z-[8] hidden justify-center px-4 md:flex">
      <div
        key={event.id}
        className={cn(
          "frontline-clash-spotlight-fx relative min-w-[20rem] max-w-[31rem] overflow-hidden rounded-[26px] border px-4 py-3 shadow-[0_22px_64px_rgba(0,0,0,0.38)] backdrop-blur-md",
          tone === "heal"
            ? "border-emerald-200/42 bg-emerald-300/16 text-emerald-50"
            : tone === "shield"
              ? "border-cyan-100/44 bg-cyan-300/16 text-cyan-50"
              : tone === "breach" || tone === "ko"
                ? "border-[#f5c451]/54 bg-[#f5c451]/18 text-[#fff0bd]"
                : "border-rose-100/42 bg-rose-400/16 text-rose-50",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.16),transparent)]" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-black/26 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_28px_rgba(245,196,81,0.12)]">
            <CombatIcon name={icon} size="lg" className="h-12 w-12" fallbackClassName="h-12 w-12" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/62">
              <span>{laneLabel}</span>
              <span>{Math.min(index + 1, total)}/{Math.max(total, 1)}</span>
              {targetSide ? <span>{targetSide === "ally" ? t("frontline.yourHero") : t("frontline.enemy")}</span> : null}
            </div>
            <div className="mt-1 flex items-center gap-3">
              <div className="text-2xl font-black uppercase leading-none text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.5)]">{headline}</div>
              {typeof event.amount === "number" ? (
                <div className="rounded-full bg-black/34 px-3 py-1 text-sm font-black text-white">
                  {event.kind === "heal" || event.kind === "shield" ? "+" : "-"}
                  {event.amount}
                </div>
              ) : null}
            </div>
            <div className="mt-1 truncate text-[12px] font-bold text-white/72">{event.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
