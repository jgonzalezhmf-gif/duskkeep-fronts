"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Theme = "gold" | "arcane" | "forest" | "ember";

const themeMap: Record<Theme, string> = {
  gold:
    "bg-[linear-gradient(180deg,rgba(28,20,13,0.96)_0%,rgba(12,16,23,0.94)_46%,rgba(8,11,17,0.98)_100%)] before:bg-[radial-gradient(circle_at_12%_0%,rgba(245,196,81,0.2),transparent_28%),radial-gradient(circle_at_88%_20%,rgba(122,162,255,0.16),transparent_22%)]",
  arcane:
    "bg-[linear-gradient(180deg,rgba(29,15,40,0.96)_0%,rgba(12,16,26,0.94)_46%,rgba(8,11,17,0.98)_100%)] before:bg-[radial-gradient(circle_at_16%_0%,rgba(192,132,252,0.2),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(122,162,255,0.14),transparent_24%)]",
  forest:
    "bg-[linear-gradient(180deg,rgba(15,28,23,0.96)_0%,rgba(12,16,23,0.94)_46%,rgba(8,11,17,0.98)_100%)] before:bg-[radial-gradient(circle_at_16%_0%,rgba(93,211,158,0.18),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(245,196,81,0.12),transparent_22%)]",
  ember:
    "bg-[linear-gradient(180deg,rgba(34,19,14,0.96)_0%,rgba(16,16,24,0.94)_46%,rgba(8,11,17,0.98)_100%)] before:bg-[radial-gradient(circle_at_16%_0%,rgba(255,140,92,0.2),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(245,196,81,0.14),transparent_22%)]",
};

export default function SceneShell({
  eyebrow,
  title,
  description,
  children,
  action,
  theme = "gold",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  theme?: Theme;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[34px] border border-[#c7a46a]/18 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.54)] before:absolute before:inset-0 before:content-['']",
        themeMap[theme],
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_12%,transparent_84%,rgba(255,255,255,0.02))]" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-[44rem]">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#f5d498]">{eyebrow}</div>
            <h1 className="mt-2 text-[2rem] font-black leading-[0.94] tracking-[-0.045em] text-white md:text-[2.55rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-[42rem] text-[13px] leading-6 text-white/74 md:text-[15px]">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}
