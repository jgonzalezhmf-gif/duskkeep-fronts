"use client";

import { CombatIcon } from "./FrontlineCombatIcon";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import { cn } from "@/lib/cn";

export type ResolutionFloatItem = {
  id: string;
  icon: CombatAssetIconName;
  label: string;
  className: string;
};

export function ResolutionFloat({ items }: { items: ResolutionFloatItem[] }) {
  if (!items.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[4]">
      {items.slice(0, 5).map((item, index) => (
        <div
          key={`${item.id}-fx`}
          className={cn(
            "frontline-float-fx absolute left-1/2 rounded-full border border-white/20 px-4 py-2 text-[13px] font-black uppercase tracking-[0.14em]",
            item.className,
          )}
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <span className="inline-flex items-center gap-1.5">
            <CombatIcon name={item.icon} size="xs" fallbackClassName="opacity-90" />
            <span>{item.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
