import type { ReactNode } from "react";
import { FortressIcon, type FortressIconName } from "@/components/game/shared/FortressIcon";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { cn } from "@/lib/cn";
import type { Rewards } from "@/lib/types";
import type { TranslateFn } from "./fortressPageHelpers";

export function SceneLight() {
  return (
    <>
      <span className="pointer-events-none absolute left-[12%] top-[16%] h-40 w-40 rounded-full bg-[#f5c451]/12 blur-[70px]" />
      <span className="pointer-events-none absolute right-[10%] top-[20%] h-44 w-44 rounded-full bg-sky-300/12 blur-[80px]" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,rgba(2,5,10,0.72),transparent)]" />
    </>
  );
}

export function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: FortressIconName;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/24 px-2.5 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <FortressIcon name={icon} size="md" />
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
          <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

export function PressureBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "ally" | "enemy" }) {
  const width = Math.max(8, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.14em] text-white/48">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/34">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "ally" ? "bg-[linear-gradient(90deg,#55d18f,#f5d498)]" : "bg-[linear-gradient(90deg,#d95764,#ffb16f)]",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function RewardRow({ rewards, className, t }: { rewards: Rewards; className?: string; t: TranslateFn }) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      <GameRewardToken icon="gold" tone="gold" label={t("fortressScreen.resources.gold")} value={rewards.gold ?? 0} size="sm" featured />
      <GameRewardToken icon="dust" tone="violet" label={t("fortressScreen.resources.dust")} value={rewards.dust ?? 0} size="sm" featured />
      <GameRewardToken icon="gem" tone="sky" label={t("fortressScreen.resources.gems")} value={rewards.gems ?? 0} size="sm" featured />
    </div>
  );
}

export function CostTile({
  label,
  icon,
  current,
  required,
  tone,
}: {
  label: string;
  icon: "gold" | "dust";
  current: number;
  required: number;
  tone: GameIconTone;
}) {
  const enough = current >= required;
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/20 p-2.5">
      <div className="flex items-center gap-2">
        <GameIcon kind={icon} tone={tone} size="sm" className="h-7 w-7 rounded-[11px] p-1" />
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/42">{label}</div>
          <div className={cn("text-sm font-black", enough ? "text-white" : "text-rose-200")}>{current}/{required}</div>
        </div>
      </div>
    </div>
  );
}

export function MiniFact({ label, value, danger }: { label: string; value: ReactNode; danger?: boolean }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/18 px-3 py-2">
      <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/38">{label}</div>
      <div className={cn("mt-1 text-sm font-black", danger ? "text-rose-200" : "text-white")}>{value}</div>
    </div>
  );
}
