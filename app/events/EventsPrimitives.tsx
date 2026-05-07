"use client";

import type { ReactNode } from "react";
import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { ModeIcon, type ModeIconName } from "@/components/game/shared/ModeIcon";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { FRONTLINE_UNIT_BY_ID } from "@/features/frontline/data";
import type { FrontlineHeroDef, FrontlinePreset } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { frontlineHeroName, frontlineHeroRole } from "@/lib/i18n/frontlineText";
import type { Rewards } from "@/lib/types";

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function EventMetric({
  icon,
  modeIcon,
  label,
  value,
  tone,
  active,
}: {
  icon: "events" | "rewards" | "power" | "deck";
  modeIcon?: ModeIconName;
  label: string;
  value: string | number;
  tone: GameIconTone;
  active?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-[16px] border px-2.5 py-2", active ? "border-violet-200/22 bg-violet-300/10" : "border-white/10 bg-white/[0.045]")}>
      {modeIcon ? (
        <ModeIcon name={modeIcon} size="md" />
      ) : icon === "power" ? (
        <ProgressionIcon name="level_up" size="sm" className="h-10 w-10" />
      ) : (
        <GameIcon kind={icon} tone={tone} size="sm" />
      )}
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
        <div className="mt-0.5 text-sm font-black text-white">{value}</div>
      </div>
    </div>
  );
}

export function EventSquadChip({
  hero,
  label,
  emptyLabel,
  compact,
  t,
}: {
  hero: FrontlineHeroDef | null;
  label: string;
  emptyLabel: string;
  compact?: boolean;
  t: TranslateFn;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-[16px] border px-2 py-2", compact && "flex-col items-center text-center lg:flex-row lg:text-left", hero ? "border-violet-200/14 bg-violet-300/8" : "border-dashed border-white/10 bg-white/[0.025]")}>
      <UnitThumb hero={hero} compact={compact} />
      <div className="min-w-0">
        <div className="text-[9px] font-black uppercase tracking-[0.14em] text-violet-100/58">{label}</div>
        <div className="mt-0.5 truncate text-[12px] font-black text-white">{hero ? frontlineHeroName(t, hero) : emptyLabel}</div>
        {hero ? <div className="mt-0.5 truncate text-[10px] uppercase tracking-[0.1em] text-white/42">{frontlineHeroRole(t, hero)}</div> : null}
      </div>
    </div>
  );
}

export function EnemyLineup({ operationId, preset, t }: { operationId: string; preset: FrontlinePreset | undefined; t: TranslateFn }) {
  if (!preset) return null;
  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5">
      {preset.squad.map((unitId, index) => {
        const unit = FRONTLINE_UNIT_BY_ID[unitId] ?? null;
        return (
          <div key={`${operationId}-${unitId}-${index}`} className="min-w-0 rounded-[16px] border border-white/10 bg-black/18 px-2 py-2">
            <div className="flex items-center gap-2">
              <UnitThumb hero={unit} enemy compact />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-black text-white">{frontlineHeroName(t, unit)}</div>
                <div className="mt-0.5 truncate text-[8px] font-black uppercase tracking-[0.08em] text-white/42">
                  {index === 0 ? t("eventsScreen.entry.left") : index === 1 ? t("eventsScreen.entry.center") : t("eventsScreen.entry.right")}
                </div>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-[8px] font-black uppercase tracking-[0.08em] text-white/46">
              <span className="truncate">{unit ? frontlineHeroRole(t, unit) : t("eventsScreen.card.unknown")}</span>
              {unit ? <span className="text-rose-100/62">ATK {unit.atk}</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UnitThumb({ hero, enemy, compact }: { hero: FrontlineHeroDef | null; enemy?: boolean; compact?: boolean }) {
  const visual = hero ? getFrontlineHeroVisualAsset(hero.heroId) : null;
  return (
    <div className={cn("grid shrink-0 place-items-end overflow-hidden rounded-[13px] border bg-black/24", compact ? "h-10 w-9" : "h-12 w-11", enemy ? "border-rose-200/14" : "border-white/10")}>
      {visual?.standeeSrc ? (
        <img
          src={visual.standeeSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain object-bottom drop-shadow-[0_9px_12px_rgba(0,0,0,0.44)]"
        />
      ) : (
        <GameIcon kind={enemy ? "battle" : "heroes"} tone={enemy ? "ember" : "violet"} size="sm" />
      )}
    </div>
  );
}

export function SmallStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-[16px] border border-white/10 bg-black/18 px-3 py-2">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
    </div>
  );
}

export function ResultMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.045] px-3 py-3">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
    </div>
  );
}

export function RewardChips({ rewards, compact, t }: { rewards: Rewards; compact?: boolean; t: TranslateFn }) {
  const chips: Array<{ icon: "gold" | "dust" | "gem" | "power"; tone: GameIconTone; value: number }> = [];
  if (rewards.gold) chips.push({ icon: "gold", tone: "gold", value: rewards.gold });
  if (rewards.dust) chips.push({ icon: "dust", tone: "violet", value: rewards.dust });
  if (rewards.gems) chips.push({ icon: "gem", tone: "sky", value: rewards.gems });
  if (rewards.accountXp || rewards.xp) chips.push({ icon: "power", tone: "emerald", value: rewards.accountXp ?? rewards.xp ?? 0 });
  return (
    <span className={cn("inline-flex flex-wrap gap-1.5", compact && "max-w-full")}>
      {chips.map((chip) => (
        <GameRewardToken
          key={`${chip.icon}-${chip.value}`}
          icon={chip.icon}
          tone={chip.tone}
          label={t(`eventsScreen.rewards.${chip.icon === "gem" ? "gems" : chip.icon}`)}
          value={chip.value}
          size={compact ? "sm" : "md"}
          featured={chip.icon === "gold" || chip.icon === "gem" || chip.icon === "dust"}
        />
      ))}
    </span>
  );
}
