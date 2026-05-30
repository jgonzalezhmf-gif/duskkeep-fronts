"use client";

import GameIcon from "@/components/game/shared/GameIcon";
import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import { SceneButton } from "@/components/game/screens/ScreenChrome";
import type { LadderOpponent } from "@/features/ladder/data";
import type { Rewards } from "@/lib/types";
import { RewardChips, SmallStat } from "./ArenaPrimitives";
import { tx, type TranslateFn } from "./arenaPageHelpers";

type LadderMatchmakingState = "idle" | "finding" | "found";

export function LadderQueueCard({
  rankName,
  points,
  progressPercent,
  dailyWins,
  keyProgress,
  rewardPreview,
  matchmaking,
  foundOpponent,
  disabled,
  onFindMatch,
  t,
}: {
  rankName: string;
  points: number;
  progressPercent: number;
  dailyWins: number;
  keyProgress: number;
  rewardPreview: Rewards;
  matchmaking: LadderMatchmakingState;
  foundOpponent: LadderOpponent | null;
  disabled: boolean;
  onFindMatch: () => void;
  t: TranslateFn;
}) {
  const progress = Math.min(100, Math.max(4, progressPercent));
  const busy = matchmaking !== "idle";

  return (
    <article className="relative overflow-hidden rounded-[32px] border border-[#f5c451]/22 bg-[radial-gradient(circle_at_18%_8%,rgba(245,196,81,0.18),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(125,211,252,0.1),transparent_28%),linear-gradient(180deg,rgba(32,28,22,0.76),rgba(7,9,15,0.96))] p-4 shadow-[0_26px_70px_rgba(0,0,0,0.34)] md:p-5">
      <div className="pointer-events-none absolute -left-24 top-12 h-48 w-48 rounded-full bg-[#f5c451]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -top-20 h-56 w-56 rounded-full bg-cyan-200/10 blur-3xl" />

      <div className="relative z-[1] grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <LadderPill>{t("arenaScreen.ladder.noTicketCost")}</LadderPill>
            <LadderPill>{t("arenaScreen.ladder.playerLikeRival")}</LadderPill>
            <LadderPill>{t("arenaScreen.ladder.persistentRank")}</LadderPill>
            <LadderPill>{t("arenaScreen.ladder.reducedAfterDaily")}</LadderPill>
          </div>

          <h2 className="mt-4 text-[2rem] font-black leading-[0.96] tracking-[-0.045em] text-white md:text-[2.65rem]">
            {t("arenaScreen.ladder.queueTitle")}
          </h2>
          <p className="mt-3 max-w-[48rem] text-sm font-semibold leading-6 text-white/58">{t("arenaScreen.ladder.queueCopy")}</p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/42">{t("arenaScreen.ladder.currentProgress")}</div>
                  <div className="mt-1 text-2xl font-black text-white">{rankName}</div>
                </div>
                <div className="rounded-[18px] border border-[#f5c451]/18 bg-[#f5c451]/10 px-3 py-2 text-right">
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#f5d498]/78">{t("arenaScreen.ladder.points")}</div>
                  <div className="mt-1 text-lg font-black text-white">{points}</div>
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full border border-white/10 bg-black/40">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#9b6a2b,#f5c451,#fff0b8)] shadow-[0_0_18px_rgba(245,196,81,0.34)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <SmallStat label={t("arenaScreen.ladder.dailyWinReward")} value={`${dailyWins}/5`} />
              <SmallStat label={t("arenaScreen.ladder.keyTrack")} value={`${keyProgress}%`} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <LadderRule icon="shield" label={t("arenaScreen.ladder.dailyReward")} value={t("arenaScreen.ladder.dailyRewardHint")} />
            <LadderRule icon="reward" label={t("arenaScreen.ladder.reducedRepeatReward")} value={t("arenaScreen.ladder.rewardMode")} />
            <LadderRule icon="key" label={t("arenaScreen.ladder.keyTrack")} value={t("arenaScreen.ladder.keyTrackHint")} />
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(0,0,0,0.24))] p-4">
          <div className="grid gap-3">
            <div className="rounded-[24px] border border-[#f5c451]/14 bg-[#f5c451]/8 p-3">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#f5d498]/74">{t("arenaScreen.ladder.rewardPreview")}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <RewardChips rewards={rewardPreview} t={t} />
              </div>
            </div>

            <MatchmakingStatus matchmaking={matchmaking} foundOpponent={foundOpponent} rankName={rankName} t={t} />
          </div>

          <SceneButton onClick={onFindMatch} disabled={disabled || busy} className="w-full">
            {busy ? t("arenaScreen.ladder.findingRival") : t("arenaScreen.ladder.findRival")}
          </SceneButton>
        </aside>
      </div>
    </article>
  );
}

function MatchmakingStatus({
  matchmaking,
  foundOpponent,
  rankName,
  t,
}: {
  matchmaking: LadderMatchmakingState;
  foundOpponent: LadderOpponent | null;
  rankName: string;
  t: TranslateFn;
}) {
  if (matchmaking === "idle") {
    return (
      <div className="rounded-[24px] border border-white/10 bg-black/20 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/42">{t("arenaScreen.ladder.matchmakingStatus")}</div>
        <div className="mt-2 text-sm font-black text-white">{t("arenaScreen.ladder.readyToQueue")}</div>
      </div>
    );
  }

  if (matchmaking === "finding") {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-cyan-200/18 bg-cyan-200/8 p-3">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_32%_50%,rgba(125,211,252,0.18),transparent_42%)]" />
        <div className="relative z-[1] text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/64">{t("arenaScreen.ladder.matchmakingStatus")}</div>
        <div className="relative z-[1] mt-2 text-sm font-black text-white">{t("arenaScreen.ladder.findingRival")}</div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-[#f5c451]/22 bg-[#f5c451]/10 p-3">
      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#f5d498]/78">{t("arenaScreen.ladder.rivalFound")}</div>
      <div className="mt-2 text-lg font-black text-white">{foundOpponent?.ownerName ?? t("arenaScreen.ladder.unknownCommander")}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">{rankName}</div>
      {foundOpponent ? (
        <div className="mt-1 text-[11px] font-semibold text-[#ffe0a4]/80">
          {tx(t, `arenaScreen.ladderOpponents.${foundOpponent.id}.style`, foundOpponent.style)}
        </div>
      ) : null}
    </div>
  );
}

function LadderPill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-[#f5c451]/18 bg-[#f5c451]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#ffe3a1]">
      {children}
    </span>
  );
}

function LadderRule({ icon, label, value }: { icon: "shield" | "key" | "reward"; label: string; value: string }) {
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
        <span className="mt-1 block text-sm font-black leading-snug text-white">{value}</span>
      </span>
    </div>
  );
}
