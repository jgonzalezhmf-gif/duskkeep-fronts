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
        className="absolute inset-0 scale-[1.03] bg-cover bg-center opacity-55"
        style={{ backgroundImage: `url('${backdrop}')` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-95"
        style={{ backgroundImage: `url('${backdrop}')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,196,81,0.07),transparent_34%),linear-gradient(180deg,rgba(7,9,12,0.08),rgba(7,9,12,0.26)_45%,rgba(7,9,12,0.52)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,213,128,0.1),transparent)]" />
      <div className="absolute inset-x-8 top-[39%] h-24 -skew-y-3 rounded-[999px] bg-[linear-gradient(90deg,rgba(101,210,200,0.04),rgba(245,196,81,0.1),rgba(240,95,114,0.04))] blur-xl" />
      <div className="absolute inset-x-10 bottom-[13rem] h-px bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.16),transparent)]" />
      {children}
    </section>
  );
}
