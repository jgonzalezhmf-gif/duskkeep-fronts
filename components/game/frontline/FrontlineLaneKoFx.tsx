"use client";

import type { FrontlineEvent } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { CombatIcon } from "./FrontlineCombatIcon";

export function LaneKoFx({
  event,
  targetSide,
}: {
  event: FrontlineEvent | null;
  targetSide: "ally" | "enemy" | null;
}) {
  if (event?.kind !== "ko") return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[7]">
      <div
        className={cn(
          "frontline-ko-burst-fx absolute left-1/2 grid h-28 w-28 place-items-center rounded-full border-2 border-[#f5c451]/64 bg-[#f5c451]/16 text-[#fff0bd] shadow-[0_0_58px_rgba(245,196,81,0.42)] backdrop-blur-sm",
          targetSide === "ally" ? "top-[72%]" : "top-[25%]",
        )}
      >
        <div className="absolute h-40 w-40 rounded-full border border-[#f5c451]/28" />
        <div className="grid place-items-center gap-1">
          <CombatIcon name="danger" size="lg" className="h-12 w-12" fallbackClassName="h-12 w-12" />
          <div className="rounded-full bg-black/40 px-3 py-1 text-sm font-black uppercase tracking-[0.2em] text-white">KO</div>
        </div>
      </div>
    </div>
  );
}
