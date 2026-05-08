"use client";

import Link from "next/link";
import { CombatIcon } from "@/components/game/shared/CombatIcon";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { cn } from "@/lib/cn";

export function LinkButton({
  href,
  icon,
  label,
  variant = "primary",
}: {
  href: string;
  icon: "deck" | "heroes";
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link href={href} className="block">
      <span
        className={cn(
          "group relative isolate flex items-center justify-center gap-2 overflow-hidden rounded-[22px] border px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition hover:-translate-y-0.5",
          variant === "primary"
            ? "border-[#f8d57b]/30 bg-[linear-gradient(180deg,#fff0bc_0%,#f5c451_44%,#d18c25_100%)] text-[#241102] shadow-[0_18px_38px_rgba(245,196,81,0.26)]"
            : "border-white/12 bg-[linear-gradient(180deg,rgba(24,29,40,0.84),rgba(9,11,18,0.96))] text-white/86 shadow-[0_16px_30px_rgba(0,0,0,0.28)]",
        )}
      >
        <GameIcon kind={icon} tone={variant === "primary" ? "gold" : "sky"} size="sm" className="h-8 w-8 rounded-[13px] p-1" />
        {label}
      </span>
    </Link>
  );
}

export function TeamMetric({
  icon,
  label,
  value,
  tone,
  active,
}: {
  icon: "team" | "power" | "deck" | "battle";
  label: string;
  value: string | number;
  tone: GameIconTone;
  active?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-[20px] border px-3 py-2.5", active ? "border-cyan-200/22 bg-cyan-300/10" : "border-white/10 bg-white/[0.045]")}>
      {icon === "power" ? <CombatIcon name="leader_power" size="sm" className="h-10 w-10" /> : <GameIcon kind={icon} tone={tone} size="sm" />}
      <div className="min-w-0">
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
        <div className="mt-0.5 truncate text-base font-black text-white">{value}</div>
      </div>
    </div>
  );
}

export function BuildStat({ label, value, tone, icon }: { label: string; value: number; tone: GameIconTone; icon: "deck" | "heroes" | "power" }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
          <div className="mt-1 text-2xl font-black text-white">{value}</div>
        </div>
        {icon === "power" ? <CombatIcon name="leader_power" size="sm" className="h-10 w-10" /> : <GameIcon kind={icon} tone={tone} size="sm" />}
      </div>
    </div>
  );
}
