"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FrontlineBattleStyles } from "./FrontlineBattleStyles";

type FrontlineBattleShellProps = {
  backdrop: string;
  hasCustomBackdrop: boolean;
  infernoCasting: boolean;
  children: ReactNode;
};

export function FrontlineBattleShell({
  backdrop,
  hasCustomBackdrop,
  infernoCasting,
  children,
}: FrontlineBattleShellProps) {
  return (
    <section
      className={cn(
        "relative isolate min-h-[calc(100svh-1rem)] overflow-hidden rounded-[30px] bg-[#080a0d] shadow-[0_34px_95px_rgba(0,0,0,0.5)]",
        infernoCasting && "frontline-inferno-cast-fx",
      )}
      data-frontline-battle-background={hasCustomBackdrop ? backdrop : "fallback"}
    >
      <FrontlineBattleStyles />
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030406]"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 scale-[1.06] bg-cover bg-center opacity-[0.38] blur-sm"
          style={{ backgroundImage: `url('${backdrop}')` }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: `url('${backdrop}')` }}
        />
      </div>
      <div
        className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_18%,rgba(245,196,81,0.07),transparent_34%),linear-gradient(180deg,rgba(7,9,12,0.08),rgba(7,9,12,0.26)_45%,rgba(7,9,12,0.52)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 z-[1] h-28 bg-[linear-gradient(180deg,rgba(255,213,128,0.1),transparent)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-8 top-[39%] z-[1] h-24 -skew-y-3 rounded-[999px] bg-[linear-gradient(90deg,rgba(101,210,200,0.04),rgba(245,196,81,0.1),rgba(240,95,114,0.04))] blur-xl"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-10 bottom-[13rem] z-[1] h-px bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.16),transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] rounded-[30px] ring-1 ring-white/[0.045]"
        aria-hidden="true"
      />
      {children}
    </section>
  );
}
