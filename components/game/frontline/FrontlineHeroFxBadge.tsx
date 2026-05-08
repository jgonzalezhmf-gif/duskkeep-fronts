"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import { CombatIcon } from "./FrontlineCombatIcon";

type HeroFxBadgeTone = "damage" | "heal" | "shield" | "breach" | "ko" | "summon" | "stun" | "power";

export function HeroFxBadge({
  tone,
  icon,
  children,
}: {
  tone: HeroFxBadgeTone;
  icon: CombatAssetIconName;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "frontline-float-fx pointer-events-none absolute left-1/2 top-2 z-[5] -translate-x-1/2 rounded-full border border-white/20 px-3.5 py-1.5 text-[12px] font-black uppercase tracking-[0.14em]",
        tone === "heal"
          ? "bg-emerald-300 text-[#06140b] shadow-[0_0_24px_rgba(75,224,141,0.42)]"
          : tone === "shield"
            ? "bg-cyan-200 text-[#051417] shadow-[0_0_24px_rgba(101,210,200,0.4)]"
            : tone === "breach" || tone === "ko"
              ? "bg-[#f5c451] text-[#221509] shadow-[0_0_28px_rgba(245,196,81,0.48)]"
              : tone === "summon"
                ? "bg-emerald-200 text-[#06140b] shadow-[0_0_24px_rgba(75,224,141,0.34)]"
                : "bg-[#ff6f7d] text-white shadow-[0_0_24px_rgba(240,95,114,0.42)]",
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <CombatIcon name={icon} size="xs" fallbackClassName="opacity-90" />
        <span>{children}</span>
      </span>
    </div>
  );
}
