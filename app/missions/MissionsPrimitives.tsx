"use client";

import type { ReactNode } from "react";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { ProgressionIcon, type ProgressionIconName } from "@/components/game/shared/ProgressionIcon";
import type { GlyphKind } from "@/components/ui/GameGlyph";
import { cn } from "@/lib/cn";
import type { Rewards } from "@/lib/types";
import type { TranslateFn } from "./missionsPageHelpers";

export function LogMetric({
  icon,
  progressionIcon,
  label,
  value,
  tone,
  active,
}: {
  icon?: GlyphKind;
  progressionIcon?: ProgressionIconName;
  label: string;
  value: string;
  tone: GameIconTone;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[16px] border px-2 py-2 md:gap-2.5 md:rounded-[20px] md:px-3 md:py-2.5",
        active ? "border-[#f5c451]/24 bg-[#f5c451]/10" : "border-white/10 bg-white/[0.045]",
      )}
    >
      {progressionIcon ? (
        <ProgressionIcon name={progressionIcon} size="lg" />
      ) : (
        <GameIcon kind={icon ?? "rewards"} tone={tone} size="sm" className="h-10 w-10 md:h-11 md:w-11" />
      )}
      <div>
        <div className="text-[8px] font-black uppercase tracking-[0.14em] text-white/42 md:text-[9px] md:tracking-[0.18em]">{label}</div>
        <div className="mt-0.5 text-sm font-black text-white md:mt-1 md:text-lg">{value}</div>
      </div>
    </div>
  );
}

export function ProgressRail({ progress, ready, value, t }: { progress: number; ready: boolean; value: string; t: TranslateFn }) {
  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-white/46">
        <span>{ready ? t("missionsScreen.progress.readyToClaim") : t("missionsScreen.progress.progress")}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            ready ? "bg-[linear-gradient(90deg,#f5c451,#fff0bc)]" : "bg-[linear-gradient(90deg,#5dd39e,#8bdfff)]",
          )}
          style={{ width: `${Math.max(4, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function RewardChips({ rewards, t }: { rewards: Rewards; t: TranslateFn }) {
  const chips: Array<{ icon: GlyphKind; tone: GameIconTone; value: number }> = [];
  if (rewards.gold) chips.push({ icon: "gold", tone: "gold", value: rewards.gold });
  if (rewards.dust) chips.push({ icon: "dust", tone: "violet", value: rewards.dust });
  if (rewards.gems) chips.push({ icon: "gem", tone: "sky", value: rewards.gems });
  if (rewards.accountXp) chips.push({ icon: "power", tone: "emerald", value: rewards.accountXp });
  if (rewards.arenaTickets) chips.push({ icon: "tickets", tone: "ember", value: rewards.arenaTickets });

  return (
    <>
      {chips.map((chip) => (
        <GameRewardToken
          key={`${chip.icon}-${chip.value}`}
          icon={chip.icon}
          tone={chip.tone}
          label={t(`missionsScreen.rewards.${chip.icon === "gem" ? "gems" : chip.icon === "power" ? "power" : chip.icon}`)}
          value={chip.value}
          size="sm"
          featured={chip.icon === "gold" || chip.icon === "gem" || chip.icon === "dust"}
        />
      ))}
    </>
  );
}

export function StatusSeal({ ready, claimed, compact, t }: { ready: boolean; claimed: boolean; compact?: boolean; t: TranslateFn }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border font-black uppercase tracking-[0.14em]",
        compact ? "px-2.5 py-1 text-[9px]" : "px-3 py-1.5 text-[10px]",
        claimed
          ? "border-emerald-300/22 bg-emerald-300/10 text-emerald-200"
          : ready
            ? "border-[#f5c451]/24 bg-[#f5c451]/14 text-[#f5d498]"
            : "border-white/10 bg-white/[0.045] text-white/46",
      )}
    >
      <ProgressionIcon name={claimed ? "claim" : ready ? "claim" : "unlock"} size={compact ? "xs" : "sm"} withGlow={ready} />
      {claimed ? t("missionsScreen.status.claimed") : ready ? t("missionsScreen.status.ready") : t("missionsScreen.status.active")}
    </span>
  );
}

export function MiniBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em]",
        tone === "gold" ? "border-[#f5c451]/22 bg-[#f5c451]/12 text-[#f5d498]" : "border-white/10 bg-white/[0.05] text-white/54",
      )}
    >
      {children}
    </span>
  );
}
