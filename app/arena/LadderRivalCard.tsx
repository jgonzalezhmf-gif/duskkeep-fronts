"use client";

import { CombatIcon } from "@/components/game/shared/CombatIcon";
import GameIcon from "@/components/game/shared/GameIcon";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import { SceneButton } from "@/components/game/screens/ScreenChrome";
import {
  FRONTLINE_LEADER_BY_ID,
  FRONTLINE_PRESET_BY_ID,
  FRONTLINE_UNIT_BY_ID,
} from "@/features/frontline/data";
import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import type { FrontlineHeroDef } from "@/features/frontline/types";
import type { LadderOpponent } from "@/features/ladder/data";
import { getFrontlineEnemyLeaderPortraitForPreset } from "@/lib/frontlineLeaderPortraitAssets";
import { frontlineHeroName, frontlineHeroRole, frontlineLeaderName } from "@/lib/i18n/frontlineText";
import { RewardChips, SmallStat } from "./ArenaPrimitives";
import type { TranslateFn } from "./arenaPageHelpers";

export function LadderRivalCard({
  opponent,
  rankName,
  points,
  progressPercent,
  dailyWins,
  keyProgress,
  disabled,
  onChallenge,
  t,
}: {
  opponent: LadderOpponent;
  rankName: string;
  points: number;
  progressPercent: number;
  dailyWins: number;
  keyProgress: number;
  disabled: boolean;
  onChallenge: () => void;
  t: TranslateFn;
}) {
  const preset = FRONTLINE_PRESET_BY_ID[opponent.presetId];
  const leader = FRONTLINE_LEADER_BY_ID[preset?.leaderId ?? ""];
  const portraitSrc = getFrontlineEnemyLeaderPortraitForPreset(preset);
  const progress = Math.min(100, Math.max(4, progressPercent));

  return (
    <article className="relative overflow-hidden rounded-[32px] border border-[#f5c451]/22 bg-[radial-gradient(circle_at_18%_8%,rgba(245,196,81,0.18),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(125,211,252,0.1),transparent_28%),linear-gradient(180deg,rgba(32,28,22,0.76),rgba(7,9,15,0.96))] p-4 shadow-[0_26px_70px_rgba(0,0,0,0.34)] md:p-5">
      <div className="pointer-events-none absolute -left-24 top-12 h-48 w-48 rounded-full bg-[#f5c451]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -top-20 h-56 w-56 rounded-full bg-cyan-200/10 blur-3xl" />

      <div className="relative z-[1] grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)_16rem]">
        <div className="relative min-h-[18rem] overflow-hidden rounded-[28px] border border-[#f5c451]/18 bg-[linear-gradient(180deg,rgba(245,196,81,0.08),rgba(0,0,0,0.32))]">
          <div className="absolute inset-x-5 top-5 flex items-center justify-between">
            <span className="rounded-full border border-[#f5c451]/24 bg-black/34 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#f5d498]">
              {t("arenaScreen.ladder.rivalPreview")}
            </span>
            <ModeIcon name="ladder" size="md" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.74))]" />
          <img
            src={portraitSrc}
            alt={opponent.ownerName}
            loading="lazy"
            decoding="async"
            className="h-full min-h-[18rem] w-full object-cover object-top opacity-95 saturate-[1.08] contrast-[1.04]"
          />
          <div className="absolute inset-x-5 bottom-5">
            <div className="text-3xl font-black leading-none text-white">{opponent.ownerName}</div>
            <div className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#f5d498]">{rankName}</div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <LadderPill>{t("arenaScreen.ladder.noTicketCost")}</LadderPill>
            <LadderPill>{t("arenaScreen.ladder.playerLikeRival")}</LadderPill>
            <LadderPill>{t("arenaScreen.ladder.persistentRank")}</LadderPill>
          </div>

          <h2 className="mt-4 text-[2rem] font-black leading-[0.96] tracking-[-0.045em] text-white md:text-[2.65rem]">
            {t("arenaScreen.ladder.floorTitle")}
          </h2>
          <p className="mt-3 max-w-[42rem] text-sm font-semibold leading-6 text-white/58">{t("arenaScreen.ladder.floorCopy")}</p>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/42">{t("arenaScreen.ladder.currentProgress")}</div>
                <div className="mt-1 text-lg font-black text-white">{points} {t("arenaScreen.ladder.points")}</div>
              </div>
              <div className="text-right text-[11px] font-black uppercase tracking-[0.14em] text-[#f5d498]">{rankName}</div>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-black/40">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#9b6a2b,#f5c451,#fff0b8)] shadow-[0_0_18px_rgba(245,196,81,0.34)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <SmallStat label={t("arenaScreen.ladder.opponentRank")} value={rankName} />
            <SmallStat label={t("arenaScreen.ladder.approxPower")} value={opponent.power} />
            <SmallStat label={t("arenaScreen.card.leader")} value={frontlineLeaderName(t, leader)} />
            <SmallStat label={t("arenaScreen.ladder.loadoutStyle")} value={opponent.style} />
          </div>

          <div className="mt-4">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/42">{t("arenaScreen.ladder.squadPreview")}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {preset?.squad.map((unitId) => (
                <LadderSquadSigil key={`${opponent.id}-${unitId}`} hero={FRONTLINE_UNIT_BY_ID[unitId] ?? null} t={t} />
              ))}
            </div>
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(0,0,0,0.24))] p-4">
          <div className="grid gap-3">
            <LadderTrack icon="shield" label={t("arenaScreen.ladder.dailyWinReward")} value={`${dailyWins}/5`} />
            <LadderTrack icon="key" label={t("arenaScreen.ladder.keyTrack")} value={`${keyProgress}%`} />
            <LadderTrack icon="reward" label={t("arenaScreen.ladder.reducedRepeatReward")} value={t("arenaScreen.ladder.rewardMode")} />
          </div>

          <div className="rounded-[22px] border border-[#f5c451]/14 bg-[#f5c451]/8 p-3">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#f5d498]/74">{t("arenaScreen.ladder.rewardPreview")}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <RewardChips rewards={opponent.previewRewards} t={t} />
            </div>
          </div>

          <SceneButton onClick={onChallenge} disabled={disabled} className="w-full">
            {t("arenaScreen.ladder.challenge")}
          </SceneButton>
        </aside>
      </div>
    </article>
  );
}

function LadderPill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-[#f5c451]/18 bg-[#f5c451]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#ffe3a1]">
      {children}
    </span>
  );
}

function LadderTrack({ icon, label, value }: { icon: "shield" | "key" | "reward"; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-black/20 px-3 py-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-white/10 bg-white/[0.045]">
        {icon === "shield" ? (
          <GameIcon kind="shield" tone="emerald" size="sm" />
        ) : icon === "key" ? (
          <ResourceIcon kind="adventure_key" size="large" />
        ) : (
          <GameIcon kind="rewards" tone="gold" size="sm" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</span>
        <span className="mt-1 block truncate text-sm font-black text-white">{value}</span>
      </span>
    </div>
  );
}

function LadderSquadSigil({ hero, t }: { hero: FrontlineHeroDef | null; t: TranslateFn }) {
  if (!hero) {
    return (
      <span className="grid h-16 w-16 place-items-center rounded-[20px] border border-dashed border-white/12 bg-white/[0.035]">
        <CombatIcon name="clash" size="sm" className="h-8 w-8 opacity-65" />
      </span>
    );
  }

  const visual = getFrontlineHeroVisualAsset(hero.heroId);
  const src = visual.standeeSrc ?? visual.portraitFallbackSrc;
  return (
    <span className="group/sigil relative h-16 w-16 overflow-hidden rounded-[20px] border border-rose-200/14 bg-[radial-gradient(circle_at_50%_25%,rgba(251,113,133,0.18),transparent_52%),rgba(0,0,0,0.28)]">
      {src ? (
        <img
          src={src}
          alt={frontlineHeroName(t, hero)}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain object-bottom p-1.5 opacity-90 drop-shadow-[0_10px_16px_rgba(0,0,0,0.46)] transition duration-300 group-hover/sigil:scale-105"
        />
      ) : (
        <CombatIcon name="clash" size="sm" className="m-auto mt-4 h-8 w-8 opacity-65" />
      )}
      <span className="absolute inset-x-1 bottom-1 truncate rounded-full bg-black/58 px-1.5 py-0.5 text-center text-[7px] font-black uppercase tracking-[0.08em] text-white/72">
        {frontlineHeroRole(t, hero)}
      </span>
    </span>
  );
}
