"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import { CombatIcon } from "./FrontlineCombatIcon";

export function StatusTag({
  tone,
  label,
  detail,
  icon,
}: {
  tone: "ally" | "enemy" | "neutral";
  label: string;
  detail?: string;
  icon?: CombatAssetIconName;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] shadow-[0_0_18px_rgba(255,255,255,0.04)]",
        tone === "ally"
          ? "bg-[#65d2c8]/13 text-cyan-100"
          : tone === "enemy"
            ? "bg-[#f05f72]/14 text-rose-100"
            : "bg-white/[0.055] text-white/62",
      )}
    >
      {icon ? <CombatIcon name={icon} size="sm" className="h-5 w-5" fallbackClassName="opacity-85" /> : null}
      <span>
        {label}
        {detail ? ` ${detail}` : ""}
      </span>
    </div>
  );
}

export function CompactPill({
  tone,
  children,
}: {
  tone: "ally" | "enemy" | "neutral";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]",
        tone === "ally"
          ? "bg-[#65d2c8]/13 text-cyan-100"
          : tone === "enemy"
            ? "bg-[#f05f72]/14 text-rose-100"
            : "bg-white/[0.055] text-white/62",
      )}
    >
      {children}
    </div>
  );
}
