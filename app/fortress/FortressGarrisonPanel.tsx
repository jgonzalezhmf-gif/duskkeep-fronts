"use client";

import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import { FortressIcon } from "@/components/game/shared/FortressIcon";
import GameIcon from "@/components/game/shared/GameIcon";
import { FRONTLINE_HEROES } from "@/features/frontline/data";
import { getFrontlineHeroProfileById, type FrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import type { FrontlineHeroDef } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { frontlineHeroName, frontlineHeroRole } from "@/lib/i18n/frontlineText";
import { firstOpenSlot, type TranslateFn } from "./fortressPageHelpers";

export function GarrisonPanel({
  garrison,
  setGarrisonSlot,
  defenseRating,
  heroProfiles,
  t,
}: {
  garrison: [string | null, string | null, string | null];
  setGarrisonSlot: (slot: number, heroId: string | null) => void;
  defenseRating: number;
  heroProfiles: FrontlineHeroProfileMap;
  t: TranslateFn;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,17,28,0.58),rgba(5,7,12,0.84))] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{t("fortressScreen.garrison.eyebrow")}</div>
          <div className="mt-1 text-lg font-black text-white">{t("fortressScreen.garrison.title")}</div>
        </div>
        <FortressIcon name="garrison" size="lg" />
      </div>

      <div className="mt-3 grid gap-2">
        {garrison.map((heroId, index) => {
          const hero = heroId ? heroProfiles[heroId] ?? getFrontlineHeroProfileById(heroId) : null;
          return (
            <GarrisonSlotCard
              key={`garrison-slot-${index}`}
              hero={hero}
              label={index === 0 ? t("fortressScreen.garrison.leftWall") : index === 1 ? t("fortressScreen.garrison.mainGate") : t("fortressScreen.garrison.rightWall")}
              emptyLabel={t("fortressScreen.garrison.emptyGuard")}
              clearLabel={t("fortressScreen.garrison.clear")}
              onClear={heroId ? () => setGarrisonSlot(index, null) : undefined}
              t={t}
            />
          );
        })}
      </div>

      <div className="mt-3 rounded-[18px] border border-white/10 bg-white/[0.035] p-2.5">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-white/46">
          <span className="inline-flex items-center gap-2">
            <FortressIcon name="defense_rating" size="sm" />
            {t("fortressScreen.garrison.defenseRating")}
          </span>
          <span>{defenseRating}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {FRONTLINE_HEROES.map((hero) => {
          const selectedIndex = garrison.findIndex((entry) => entry === hero.heroId);
          const progressedHero = heroProfiles[hero.heroId] ?? hero;
          return (
            <button
              key={hero.heroId}
              className={cn(
                "frontline-motion-tab rounded-[16px] border p-2 text-left transition",
                selectedIndex >= 0
                  ? "border-[#f5c451]/24 bg-[#f5c451]/10 shadow-[0_12px_28px_rgba(245,196,81,0.1)]"
                  : "border-white/10 bg-white/[0.035] hover:border-white/18",
              )}
              onClick={() => {
                const targetSlot = selectedIndex >= 0 ? selectedIndex : firstOpenSlot(garrison);
                setGarrisonSlot(targetSlot, hero.heroId);
              }}
            >
              <div className="flex items-center gap-2">
                <GameIcon kind={selectedIndex >= 0 ? "shield" : "heroes"} tone={selectedIndex >= 0 ? "gold" : "steel"} size="sm" className="h-9 w-9 rounded-[14px]" />
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-black text-white">{hero.name.split(" ")[0]}</div>
                  <div className="truncate text-[10px] uppercase tracking-[0.1em] text-white/42">{progressedHero.role}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function GarrisonSlotCard({
  hero,
  label,
  emptyLabel,
  clearLabel,
  onClear,
  t,
}: {
  hero: FrontlineHeroDef | null;
  label: string;
  emptyLabel: string;
  clearLabel: string;
  onClear?: () => void;
  t: TranslateFn;
}) {
  const visual = hero ? getFrontlineHeroVisualAsset(hero.heroId) : null;
  return (
    <div className={cn("flex items-center gap-2 rounded-[18px] border p-2", hero ? "border-[#f5c451]/18 bg-[#f5c451]/8" : "border-dashed border-white/10 bg-white/[0.025]")}>
      <div className="grid h-16 w-14 shrink-0 place-items-end overflow-hidden rounded-[14px] border border-white/10 bg-black/22">
        {visual?.standeeSrc ? (
          <img
            src={visual.standeeSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,0.44)]"
          />
        ) : (
          <FortressIcon name="garrison" size="md" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#f5d498]/82">{label}</div>
        <div className="mt-0.5 truncate text-sm font-black text-white">{hero ? frontlineHeroName(t, hero) : emptyLabel}</div>
        {hero ? (
          <div className="mt-1 flex gap-2 text-[9px] font-black uppercase tracking-[0.08em] text-white/52">
            <span>{frontlineHeroRole(t, hero)}</span>
            <span>HP {hero.maxHp}</span>
            <span>ATK {hero.atk}</span>
            <span>DEF {hero.def}</span>
          </div>
        ) : null}
      </div>
      {onClear ? (
        <button
          className="frontline-motion-action rounded-full border border-white/12 bg-black/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/58 transition hover:text-white"
          onClick={onClear}
        >
          {clearLabel}
        </button>
      ) : null}
    </div>
  );
}
