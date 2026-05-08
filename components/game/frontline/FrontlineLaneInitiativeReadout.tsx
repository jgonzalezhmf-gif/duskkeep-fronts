"use client";

import { useMemo } from "react";
import { laneStrikeOrder } from "@/features/frontline/engine";
import type { FrontlineBattleState } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import type { FrontlineLane } from "@/lib/types";

export function LaneInitiativeReadout({ state, lane }: { state: FrontlineBattleState; lane: FrontlineLane }) {
  const order = useMemo(() => laneStrikeOrder(state, lane), [state, lane]);
  if (!order.length) return null;
  return (
    <div className="rounded-[14px] border border-white/8 bg-black/22 px-3 py-2">
      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/48">Strike order</div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {order.map((entry, index) => (
          <span
            key={`${entry.side}-${entry.kind}-${index}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]",
              entry.side === "ally"
                ? "border-cyan-200/30 bg-cyan-300/10 text-cyan-100/86"
                : "border-rose-200/30 bg-rose-300/10 text-rose-100/86",
            )}
          >
            <span className="font-black opacity-70">{index + 1}</span>
            <span className="truncate max-w-[6.5rem]">{entry.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
