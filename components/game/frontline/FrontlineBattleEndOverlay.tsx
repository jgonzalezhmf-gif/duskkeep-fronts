"use client";

import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import { CombatIcon } from "./FrontlineCombatIcon";

export function BattleEndOverlay({ winner }: { winner: "ally" | "enemy" | "draw" }) {
  const { t } = useI18n();
  const allyWin = winner === "ally";
  const title = allyWin ? t("frontline.victory") : winner === "draw" ? t("frontline.draw") : t("frontline.defeat");
  return (
    <div className="frontline-finish-overlay-fx pointer-events-none absolute inset-0 z-[30] grid place-items-center bg-[radial-gradient(circle_at_50%_42%,rgba(245,196,81,0.22),rgba(6,8,13,0.72)_48%,rgba(6,8,13,0.9))]">
      <div
        className={cn(
          "frontline-finish-emblem-fx relative grid min-h-64 w-[min(34rem,90vw)] place-items-center overflow-hidden rounded-[34px] border px-8 py-10 text-center shadow-[0_34px_100px_rgba(0,0,0,0.52)]",
          allyWin
            ? "border-[#f5c451]/50 bg-[#f5c451]/14"
            : winner === "draw"
              ? "border-cyan-200/36 bg-cyan-300/12"
              : "border-rose-200/42 bg-rose-400/14",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
        <div className="relative grid place-items-center gap-4">
          <div className="grid h-24 w-24 place-items-center rounded-[30px] bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_54px_rgba(245,196,81,0.24)]">
            <CombatIcon name={allyWin ? "advantage" : winner === "draw" ? "clash" : "danger"} size="xl" className="h-20 w-20" fallbackClassName="h-20 w-20" />
          </div>
          <div className="text-[clamp(2.8rem,8vw,6.2rem)] font-black uppercase leading-none tracking-[-0.06em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.7)]">
            {title}
          </div>
          <div className="rounded-full bg-black/32 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#f5d498]">
            {t("frontline.resolveClash")}
          </div>
        </div>
      </div>
    </div>
  );
}
