"use client";

import type { ReactNode } from "react";
import { CombatIcon } from "@/components/game/shared/CombatIcon";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { cn } from "@/lib/cn";
import type { Rewards } from "@/lib/types";

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function ArenaRankPlate({
  wins,
  losses,
  winRate,
  rank,
  t,
}: {
  wins: number;
  losses: number;
  winRate: number;
  rank: string;
  t: TranslateFn;
}) {
  const progress = Math.min(100, Math.max(8, winRate || wins * 12));
  return (
    <div className="w-full rounded-[20px] border border-[#f5c451]/16 bg-[linear-gradient(180deg,rgba(55,35,18,0.34),rgba(8,10,16,0.78))] px-3 py-2.5 shadow-[0_14px_30px_rgba(0,0,0,0.22)] sm:min-w-[18rem] lg:w-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#f5d498]/70">{t("arenaScreen.floor.eyebrow")}</div>
          <div className="mt-0.5 text-base font-black text-white">{rank}</div>
        </div>
        <div className="text-right text-[10px] font-black uppercase tracking-[0.12em] text-white/58">
          {wins}W / {losses}L
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/10 bg-black/36">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#a36d29,#f5c451,#ffe3a1)] shadow-[0_0_16px_rgba(245,196,81,0.34)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function LadderRankPlate({
  rank,
  points,
  progressPercent,
  t,
}: {
  rank: string;
  points: number;
  progressPercent: number;
  t: TranslateFn;
}) {
  const progress = Math.min(100, Math.max(4, progressPercent));
  return (
    <div className="w-full rounded-[20px] border border-[#f5c451]/16 bg-[linear-gradient(180deg,rgba(55,35,18,0.34),rgba(8,10,16,0.78))] px-3 py-2.5 shadow-[0_14px_30px_rgba(0,0,0,0.22)] sm:min-w-[18rem] lg:w-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#f5d498]/70">{t("arenaScreen.ladder.rank")}</div>
          <div className="mt-0.5 text-base font-black text-white">{rank}</div>
        </div>
        <div className="text-right text-[10px] font-black uppercase tracking-[0.12em] text-white/58">
          {points} MMR
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/10 bg-black/36">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#a36d29,#f5c451,#ffe3a1)] shadow-[0_0_16px_rgba(245,196,81,0.34)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ArenaMetric({
  icon,
  modeIcon,
  label,
  value,
  tone,
  active,
}: {
  icon: "tickets" | "rewards" | "shield" | "power";
  modeIcon?: "ladder" | "arena_draft";
  label: string;
  value: string | number;
  tone: GameIconTone;
  active?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-[20px] border px-3 py-2.5", active ? "border-[#f5c451]/24 bg-[#f5c451]/10" : "border-white/10 bg-white/[0.045]")}>
      {modeIcon ? (
        <ModeIcon name={modeIcon} size="lg" />
      ) : icon === "power" ? (
        <CombatIcon name="advantage" size="md" className="h-12 w-12" />
      ) : (
        <GameIcon kind={icon} tone={tone} size="md" />
      )}
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
        <div className="mt-0.5 text-base font-black text-white">{value}</div>
      </div>
    </div>
  );
}

export function GateLine({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/46">{label}</span>
      <span className={cn("text-sm font-black", ok ? "text-emerald-200" : "text-rose-200")}>{value}</span>
    </div>
  );
}

export function SmallStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/18 px-3 py-2">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
    </div>
  );
}

export function ResultMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.045] px-3 py-3">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
    </div>
  );
}

export function RewardChips({ rewards, t }: { rewards: Rewards; t: TranslateFn }) {
  const chips: Array<{ icon: "gold" | "dust" | "gem" | "power" | "adventure_key"; tone: GameIconTone; value: number }> = [];
  if (rewards.gold) chips.push({ icon: "gold", tone: "gold", value: rewards.gold });
  if (rewards.dust) chips.push({ icon: "dust", tone: "violet", value: rewards.dust });
  if (rewards.gems) chips.push({ icon: "gem", tone: "sky", value: rewards.gems });
  if (rewards.adventureKeys) chips.push({ icon: "adventure_key", tone: "gold", value: rewards.adventureKeys });
  if (rewards.accountXp) chips.push({ icon: "power", tone: "emerald", value: rewards.accountXp });
  return (
    <>
      {chips.map((chip) => (
        <GameRewardToken key={`${chip.icon}-${chip.value}`} icon={chip.icon} tone={chip.tone} label={t(`arenaScreen.rewards.${chip.icon === "gem" ? "gems" : chip.icon}`)} value={chip.value} size="sm" />
      ))}
    </>
  );
}
