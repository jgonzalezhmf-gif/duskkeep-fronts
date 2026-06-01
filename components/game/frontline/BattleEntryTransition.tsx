"use client";

import { useEffect, useMemo, useState } from "react";
import type { FrontlineHeroDef } from "@/features/frontline/types";
import {
  battleEntryCopyKeys,
  battleEntryDurationMs,
  type BattleEntryMode,
} from "@/features/frontline/battleEntryPresentation";
import { cn } from "@/lib/cn";
import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import GameIcon from "@/components/game/shared/GameIcon";
import { ModeIcon, type ModeIconName } from "@/components/game/shared/ModeIcon";
import { frontlineHeroName, frontlineHeroRole } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";

type BattleEntryTransitionProps = {
  mode: BattleEntryMode;
  title?: string | null;
  subtitle?: string | null;
  allyHeroes?: Array<FrontlineHeroDef | null>;
  enemyHeroes?: Array<FrontlineHeroDef | null>;
  battleBackgroundSrc?: string | null;
  onComplete: () => void;
};

const MODE_ICON: Record<BattleEntryMode, ModeIconName> = {
  adventure: "campaign",
  boss: "boss_event",
  direct: "challenge",
  ladder: "ladder",
  arena: "arena_draft",
  event: "daily_event",
};

export function BattleEntryTransition({
  mode,
  title,
  subtitle,
  allyHeroes = [],
  enemyHeroes = [],
  battleBackgroundSrc,
  onComplete,
}: BattleEntryTransitionProps) {
  const { t } = useI18n();
  const reducedMotion = useGameStore((state) => state.reducedMotion);
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  const keys = battleEntryCopyKeys(mode);
  const durationMs = battleEntryDurationMs(reducedMotion);
  const headline = title || t(keys.fallbackTitleKey);
  const body = subtitle || t(keys.subtitleKey, { name: headline });
  const ariaLabel = t("battleEntry.ariaLabel", { name: headline });
  const visibleAllies = useMemo(() => normalizeHeroSlots(allyHeroes), [allyHeroes]);
  const visibleEnemies = useMemo(() => normalizeHeroSlots(enemyHeroes), [enemyHeroes]);

  useEffect(() => {
    const timer = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onComplete]);

  return (
    <section
      className="battle-entry-presentation relative isolate min-h-dvh overflow-hidden bg-[#030407] text-white"
      data-battle-entry-mode={mode}
      data-battle-entry-motion={reducedMotion ? "reduced" : "full"}
      aria-label={ariaLabel}
      role="region"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {battleBackgroundSrc && !backgroundFailed ? (
          <img
            src={battleBackgroundSrc}
            alt=""
            loading="eager"
            decoding="async"
            draggable={false}
            onError={() => setBackgroundFailed(true)}
            className="battle-entry-presentation__backdrop h-full w-full object-cover opacity-66"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_28%_24%,rgba(245,196,81,0.18),transparent_28%),radial-gradient(circle_at_72%_34%,rgba(240,95,114,0.18),transparent_32%),linear-gradient(135deg,#111827,#030407_66%)]" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(245,196,81,0.18),transparent_31%),linear-gradient(180deg,rgba(3,4,7,0.34),rgba(3,4,7,0.64)_52%,rgba(3,4,7,0.94))]" />
        <div className="battle-entry-presentation__slash absolute inset-y-[-18%] left-1/2 w-[16rem] -translate-x-1/2 rotate-12 bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.2),rgba(255,255,255,0.2),transparent)] blur-sm" />
      </div>

      <div className="relative z-[1] mx-auto grid min-h-dvh w-full max-w-[1500px] content-center gap-3 px-4 py-5 md:gap-5 md:px-8 md:py-8">
        <div className="mx-auto flex w-full max-w-[64rem] flex-col items-center text-center">
          <ModeIcon name={MODE_ICON[mode]} size="xl" />
          <div className="mt-2 inline-flex rounded-full border border-[#f5c451]/24 bg-[#f5c451]/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f5d498] md:mt-4">
            {t(keys.eyebrowKey)}
          </div>
          <h1 className="mt-2 max-w-[55rem] text-[2.05rem] font-black leading-[0.9] tracking-[-0.05em] text-white md:mt-3 md:text-[4.8rem]">
            {headline}
          </h1>
          <p className="mt-2 max-w-[42rem] text-sm font-semibold leading-5 text-white/68 md:mt-3 md:text-base md:leading-6">{body}</p>
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="battle-entry-presentation__button mx-auto rounded-[20px] border border-[#f5c451]/30 bg-[#f5c451]/16 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#f5d498] shadow-[0_18px_34px_rgba(245,196,81,0.12)] transition hover:border-[#f5c451]/52 hover:bg-[#f5c451]/22 md:py-3"
        >
          {t("battleEntry.beginNow")}
        </button>

        <div className="mx-auto grid w-full max-w-[70rem] gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <HeroLineup label={t("battleEntry.allies")} heroes={visibleAllies} side="ally" />
          <div className="battle-entry-presentation__versus mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#f5c451]/28 bg-[#150f08]/88 text-base font-black text-[#f5d498] shadow-[0_18px_38px_rgba(0,0,0,0.4),0_0_34px_rgba(245,196,81,0.18)] md:h-20 md:w-20 md:text-lg">
            {t("battleEntry.versus")}
          </div>
          <HeroLineup label={t("battleEntry.enemies")} heroes={visibleEnemies} side="enemy" />
        </div>
      </div>

      <style jsx global>{`
        .battle-entry-presentation__backdrop {
          animation: battleEntryBackdrop 1550ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .battle-entry-presentation__slash {
          animation: battleEntrySlash 1550ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .battle-entry-presentation__versus {
          animation: battleEntryVersus 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .battle-entry-presentation__button {
          animation: battleEntryButton 520ms cubic-bezier(0.22, 1, 0.36, 1) 420ms both;
        }
        [data-battle-entry-motion="reduced"] .battle-entry-presentation__backdrop,
        [data-battle-entry-motion="reduced"] .battle-entry-presentation__slash,
        [data-battle-entry-motion="reduced"] .battle-entry-presentation__versus,
        [data-battle-entry-motion="reduced"] .battle-entry-presentation__button {
          animation: none;
        }
        @keyframes battleEntryBackdrop {
          from {
            transform: scale(1.06);
            filter: saturate(0.82) brightness(0.75);
          }
          to {
            transform: scale(1);
            filter: saturate(1.05) brightness(1);
          }
        }
        @keyframes battleEntrySlash {
          from {
            transform: translateX(-70%) rotate(12deg);
            opacity: 0;
          }
          42% {
            opacity: 1;
          }
          to {
            transform: translateX(58%) rotate(12deg);
            opacity: 0;
          }
        }
        @keyframes battleEntryVersus {
          from {
            transform: scale(0.86);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes battleEntryButton {
          from {
            transform: translateY(8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}

function HeroLineup({
  label,
  heroes,
  side,
}: {
  label: string;
  heroes: Array<FrontlineHeroDef | null>;
  side: "ally" | "enemy";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[26px] border p-2 shadow-[0_24px_48px_rgba(0,0,0,0.28)] md:rounded-[30px] md:p-3",
        side === "ally"
          ? "border-cyan-200/14 bg-[radial-gradient(circle_at_24%_10%,rgba(103,232,249,0.14),transparent_36%),linear-gradient(180deg,rgba(12,34,43,0.7),rgba(5,8,13,0.9))]"
          : "border-rose-200/14 bg-[radial-gradient(circle_at_76%_10%,rgba(240,95,114,0.16),transparent_36%),linear-gradient(180deg,rgba(54,15,24,0.72),rgba(8,7,12,0.92))]",
      )}
    >
      <div className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/48">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        {heroes.map((hero, index) => (
          <BattleEntryHeroTile key={`${side}-${hero?.heroId ?? index}`} hero={hero} side={side} />
        ))}
      </div>
    </div>
  );
}

function BattleEntryHeroTile({ hero, side }: { hero: FrontlineHeroDef | null; side: "ally" | "enemy" }) {
  const { t } = useI18n();

  if (!hero) {
    return (
      <div className="grid min-h-[6.4rem] place-items-center rounded-[18px] border border-dashed border-white/10 bg-black/20 md:min-h-[8.5rem] md:rounded-[22px]">
        <GameIcon kind="heroes" tone="steel" size="md" />
      </div>
    );
  }

  const name = frontlineHeroName(t, hero);
  const role = frontlineHeroRole(t, hero);
  const visual = getFrontlineHeroVisualAsset(hero.heroId);
  const src = visual.standeeSrc ?? visual.portraitFallbackSrc;

  return (
    <div className="relative min-h-[6.4rem] overflow-hidden rounded-[18px] border border-white/10 bg-black/24 p-1.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:min-h-[8.5rem] md:rounded-[22px] md:p-2">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-2 bottom-8 h-5 rounded-full blur-sm",
          side === "ally" ? "bg-cyan-200/18" : "bg-rose-300/18",
        )}
      />
      <div className="relative mx-auto h-14 w-14 md:h-20 md:w-20">
        {src ? (
          <img
            src={src}
            alt={name}
            loading="eager"
            decoding="async"
            draggable={false}
            className={cn("h-full w-full drop-shadow-[0_14px_20px_rgba(0,0,0,0.5)]", visual.standeeSrc ? "object-contain" : "rounded-[18px] object-cover")}
          />
        ) : (
          <div className="grid h-full w-full place-items-center rounded-[18px] bg-white/[0.06]">
            <GameIcon kind="heroes" tone={side === "ally" ? "sky" : "ember"} size="md" />
          </div>
        )}
      </div>
      <div className="relative mt-1 truncate text-[10px] font-black text-white md:text-[11px]">{name}</div>
      <div className="relative truncate text-[7px] font-black uppercase tracking-[0.14em] text-white/48 md:text-[8px]">{role}</div>
    </div>
  );
}

function normalizeHeroSlots(heroes: Array<FrontlineHeroDef | null>) {
  return [heroes[0] ?? null, heroes[1] ?? null, heroes[2] ?? null];
}

export default BattleEntryTransition;
