"use client";

import { StatusIcon } from "@/components/game/shared/StatusIcon";
import type { FrontlineEvent } from "@/features/frontline/types";
import { cn } from "@/lib/cn";

export function SynergyGlobalToast({ event }: { event: FrontlineEvent | null }) {
  if (!event || event.signature !== "synergy" || event.lane) return null;

  const label = event.label.replace(/^Synergy:\s*/i, "");

  return (
    <div className="frontline-trait-proc-fx pointer-events-none absolute left-1/2 top-[6.5rem] z-[7] -translate-x-1/2">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-300/26 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-amber-50 shadow-[0_0_22px_rgba(245,196,81,0.4)] backdrop-blur-sm">
        <StatusIcon name="buff" size="sm" className="h-4 w-4 text-amber-100" fallbackClassName="opacity-95 h-4 w-4" />
        <span>Synergy · {label}</span>
      </div>
    </div>
  );
}

export function SynergyProcBadge({ label }: { label: string }) {
  return (
    <div
      className={cn(
        "frontline-trait-proc-fx pointer-events-none absolute left-1/2 top-[-3rem] z-[6] inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-amber-200/80 bg-amber-300/26 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-50 shadow-[0_0_18px_rgba(245,196,81,0.34)] backdrop-blur-sm",
      )}
    >
      <StatusIcon name="buff" size="sm" className="h-4 w-4 text-amber-100" fallbackClassName="opacity-95 h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}
