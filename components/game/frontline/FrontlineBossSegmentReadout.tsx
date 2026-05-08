"use client";

import { StatusIcon } from "@/components/game/shared/StatusIcon";
import { FRONTLINE_UNIT_BY_ID } from "@/features/frontline/data";
import type { FrontlineBattleState, FrontlineBossSegmentConfig } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { frontlineSupportName, frontlineTraitInfo } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { CombatIcon } from "./FrontlineCombatIcon";

export function BossSegmentReadout({
  segment,
  hero,
  support,
  scorch,
  active,
  focused,
  targeted,
  pressured,
  attacking,
  hit,
  ko,
}: {
  segment: FrontlineBossSegmentConfig;
  hero: FrontlineBattleState["lanes"]["left"]["enemyHero"];
  support: FrontlineBattleState["lanes"]["left"]["enemySupport"];
  scorch: number;
  active: boolean;
  focused: boolean;
  targeted: boolean;
  pressured: boolean;
  attacking: boolean;
  hit: boolean;
  ko: boolean;
}) {
  const { t } = useI18n();
  const supportName = support ? frontlineSupportName(t, support) : "";

  if (!hero) {
    return (
      <div className="rounded-[20px] border border-rose-200/24 bg-[radial-gradient(circle_at_50%_46%,rgba(240,95,114,0.18),rgba(20,8,12,0.92))] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-100/72">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5">
            <CombatIcon name="breach" size="sm" fallbackClassName="opacity-80" />
            {t(segment.titleKey)} - {t("frontline.openFront")}
          </span>
          {support ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/30 bg-emerald-300/14 px-2 py-0.5 text-emerald-100/80">
              <CombatIcon name="summon" size="xs" fallbackClassName="opacity-80" />
              <span className="truncate max-w-[5.6rem]">{supportName}</span>
              <span>{support.hp}/{support.maxHp}</span>
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  const hpWidth = Math.max(0, (hero.hp / hero.maxHp) * 100);
  const heroDef = FRONTLINE_UNIT_BY_ID[hero.heroId];
  const traitInfo = heroDef ? frontlineTraitInfo(t, heroDef.trait) : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border px-3 py-2.5 backdrop-blur-md transition",
        segment.weakpoint
          ? "border-rose-200/56 bg-[linear-gradient(180deg,rgba(240,95,114,0.18),rgba(20,6,10,0.78))]"
          : "border-[#f5c451]/44 bg-[linear-gradient(180deg,rgba(245,140,80,0.18),rgba(20,10,6,0.78))]",
        targeted && "ring-2 ring-[#f5c451]/64 shadow-[0_0_28px_rgba(245,196,81,0.32)]",
        focused && !targeted && "ring-1 ring-[#f5c451]/30",
        active && "shadow-[0_0_24px_rgba(245,196,81,0.24)]",
        pressured && "shadow-[0_0_22px_rgba(244,99,112,0.22)]",
        hit && "frontline-hit-fx",
        attacking && "frontline-attack-enemy-fx",
        ko && "opacity-60 grayscale-[0.4]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
              segment.weakpoint
                ? "border-rose-200/52 bg-rose-400/16 text-rose-50"
                : "border-[#f5c451]/52 bg-[#f5c451]/12 text-[#fff0bd]",
            )}
          >
            <CombatIcon name={segment.weakpoint ? "danger" : "leader_power"} size="sm" className="h-5 w-5" fallbackClassName="opacity-90" />
            <span>{t(segment.titleKey)}</span>
          </span>
          {traitInfo ? (
            <span
              title={`${traitInfo.label} - ${traitInfo.description}`}
              className="inline-flex items-center gap-1 rounded-full border border-rose-200/30 bg-rose-300/12 px-1.5 py-0.5 text-rose-100/82"
            >
              <StatusIcon name={traitInfo.icon} size="sm" className="h-5 w-5" fallbackClassName="opacity-90" />
              <span className="truncate max-w-[5.6rem]">{traitInfo.label}</span>
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-rose-100/82">
          <CombatIcon name="attack" size="sm" className="h-5 w-5" fallbackClassName="opacity-80" />
          <span>{hero.atk + hero.tempAtk}</span>
          {hero.shield > 0 ? (
            <span className="inline-flex items-center gap-0.5">
              <StatusIcon name="guard" size="sm" className="h-5 w-5" fallbackClassName="opacity-80" />
              {hero.shield}
            </span>
          ) : null}
          {hero.stun > 0 ? (
            <span className="inline-flex items-center gap-0.5">
              <StatusIcon name="debuff" size="sm" className="h-5 w-5" fallbackClassName="opacity-80" />
              {hero.stun}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#ff6d69,#ffd86f)] shadow-[0_0_14px_rgba(255,140,140,0.32)] transition-[width] duration-300"
          style={{ width: `${hpWidth}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/68">
        <span>{hero.hp}/{hero.maxHp}</span>
        {scorch > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-400/22 px-1.5 py-0.5 text-rose-100">
            <StatusIcon name="poison" size="sm" className="h-5 w-5" fallbackClassName="opacity-80" />
            {scorch}
          </span>
        ) : null}
      </div>
      {support ? (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-[14px] border border-emerald-200/30 bg-emerald-300/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100/82">
          <span className="inline-flex items-center gap-1 truncate">
            <CombatIcon name="summon" size="sm" className="h-5 w-5" fallbackClassName="opacity-80" />
            <span className="truncate max-w-[6rem]">{supportName}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span>{support.hp}/{support.maxHp}</span>
            {support.atk > 0 ? (
              <span className="inline-flex items-center gap-0.5">
                <CombatIcon name="attack" size="sm" className="h-5 w-5" fallbackClassName="opacity-80" />
                {support.atk}
              </span>
            ) : null}
            <span className="opacity-72">T{support.duration}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
