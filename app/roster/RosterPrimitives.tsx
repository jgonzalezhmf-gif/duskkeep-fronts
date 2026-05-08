"use client";

import type { ReactNode } from "react";
import GameIcon from "@/components/game/shared/GameIcon";
import { ProgressionIcon, type ProgressionIconName } from "@/components/game/shared/ProgressionIcon";
import { cn } from "@/lib/cn";

export function HeroMetric({
  icon,
  progressionIcon,
  label,
  value,
  tone = "gold",
}: {
  icon?: "heroes" | "battle" | "power";
  progressionIcon?: ProgressionIconName;
  label: string;
  value: string;
  tone?: "gold" | "sky" | "violet";
}) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.045] px-3 py-3">
      {progressionIcon ? <ProgressionIcon name={progressionIcon} size="lg" /> : <GameIcon kind={icon ?? "heroes"} tone={tone} size="md" />}
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/42">{label}</div>
        <div className="mt-1 text-lg font-black text-white">{value}</div>
      </div>
    </div>
  );
}

export function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{label}</div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">{children}</div>
    </div>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "frontline-motion-tab shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] transition",
        active ? "border-[#f5c451] bg-[#f5c451] text-black" : "border-white/10 bg-white/[0.055] text-white/72 hover:border-white/18",
      )}
    >
      {children}
    </button>
  );
}

export function RosterTag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em]",
        tone === "gold" ? "border-[#f5c451]/24 bg-[#f5c451]/14 text-[#f5d498]" : "border-white/10 bg-black/32 text-white/58",
      )}
    >
      {children}
    </span>
  );
}
