"use client";

import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import { CombatIcon } from "./FrontlineCombatIcon";

export type CoreShockState = { side: "ally" | "enemy"; amount: number; key: number } | null;

export function CoreShockOverlay({
  shock,
  side,
}: {
  shock: CoreShockState;
  side: "ally" | "enemy";
}) {
  const { t } = useI18n();
  if (!shock || shock.side !== side) return null;
  const coreLabel = side === "ally" ? t("frontline.yourCore") : t("frontline.enemyCore");
  return (
    <div key={shock.key} className="pointer-events-none absolute inset-0 z-[3]">
      <span className="frontline-core-shock-flash-fx absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_50%_50%,rgba(245,196,81,0.45),rgba(240,95,114,0.22)_42%,transparent_72%)]" />
      <div className="frontline-core-shock-fx absolute left-1/2 top-1/2 grid place-items-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#f5c451]/70 bg-[#1a0a08]/86 px-3 py-1.5 text-[#fff0bd] shadow-[0_0_42px_rgba(245,196,81,0.46)] backdrop-blur-sm">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f5c451]/18">
            <CombatIcon name="breach" size="sm" className="h-6 w-6" fallbackClassName="h-6 w-6" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[#f5d498]/80">{coreLabel}</span>
            <span className="text-2xl font-black tabular-nums">-{shock.amount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function CommandPips({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/[0.055] px-3 py-1.5">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full transition",
            index < value ? "opacity-100 drop-shadow-[0_0_12px_rgba(245,212,152,0.55)]" : "opacity-28 grayscale",
          )}
        >
          <ResourceIcon kind="command" size="small" className="h-7 w-7" />
        </span>
      ))}
    </div>
  );
}

export function CompactPressureBar({ allyScore, enemyScore }: { allyScore: number; enemyScore: number }) {
  const total = Math.max(allyScore + enemyScore, 1);
  const allyWidth = Math.max(6, Math.round((allyScore / total) * 100));
  const enemyWidth = Math.max(6, 100 - allyWidth);
  return (
    <div className="relative z-[1] mt-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.12em] text-white/42">
      <span>{allyScore}</span>
      <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-white/8">
        <div className="bg-[linear-gradient(90deg,#65d2c8,#8adfff)]" style={{ width: `${allyWidth}%` }} />
        <div className="bg-[linear-gradient(90deg,#ffb36d,#f05f72)]" style={{ width: `${enemyWidth}%` }} />
      </div>
      <span>{enemyScore}</span>
    </div>
  );
}
