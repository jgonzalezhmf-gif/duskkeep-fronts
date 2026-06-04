"use client";

import type { ReactNode } from "react";
import GameIcon from "@/components/game/shared/GameIcon";
import { ProgressionIcon, type ProgressionIconName } from "@/components/game/shared/ProgressionIcon";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/types";

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

export function CompanySeal({
  eyebrow,
  title,
  value,
  ready,
}: {
  eyebrow: string;
  title: string;
  value: string;
  ready: boolean;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[30px] border p-4 shadow-[0_24px_54px_rgba(0,0,0,0.34)]",
        ready
          ? "border-emerald-200/24 bg-[radial-gradient(circle_at_22%_10%,rgba(167,243,208,0.22),transparent_36%),linear-gradient(180deg,rgba(16,185,129,0.16),rgba(8,15,14,0.9))]"
          : "border-[#f5c451]/24 bg-[radial-gradient(circle_at_22%_10%,rgba(245,196,81,0.22),transparent_36%),linear-gradient(180deg,rgba(245,196,81,0.13),rgba(15,11,9,0.9))]",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_34%,rgba(0,0,0,0.28))]" />
      <div className="relative z-[1] flex items-center gap-3">
        <GameIcon kind="heroes" tone={ready ? "emerald" : "gold"} size="lg" />
        <div className="min-w-0">
          <div className={cn("text-[10px] font-black uppercase tracking-[0.2em]", ready ? "text-emerald-100/78" : "text-[#f5d498]/82")}>
            {eyebrow}
          </div>
          <div className="mt-1 text-[1.45rem] font-black leading-none text-white md:text-[1.75rem]">{title}</div>
          <div className="mt-2 inline-flex rounded-full border border-white/10 bg-black/24 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/62">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

const roleTone: Record<Role, string> = {
  tank: "border-sky-200/20 bg-sky-400/10 text-sky-100",
  fighter: "border-orange-200/20 bg-orange-400/10 text-orange-100",
  archer: "border-emerald-200/20 bg-emerald-400/10 text-emerald-100",
  mage: "border-violet-200/20 bg-violet-400/10 text-violet-100",
  support: "border-[#f5c451]/22 bg-[#f5c451]/10 text-[#f5d498]",
  summoner: "border-fuchsia-200/20 bg-fuchsia-400/10 text-fuchsia-100",
};

export function RoleSigil({ role, label, owned, total }: { role: Role; label: string; owned: number; total: number }) {
  return (
    <div className={cn("rounded-[18px] border px-2.5 py-2", roleTone[role])}>
      <div className="flex items-center justify-between gap-2">
        <div className="truncate text-[9px] font-black uppercase tracking-[0.14em]">{label}</div>
        <div className="text-sm font-black text-white">{owned}/{total}</div>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {Array.from({ length: Math.max(1, total) }).map((_, index) => (
          <span
            key={`${role}-${index}`}
            className={cn(
              "h-1.5 rounded-full",
              index < owned ? "bg-current shadow-[0_0_10px_currentColor]" : "bg-white/12",
            )}
          />
        ))}
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
