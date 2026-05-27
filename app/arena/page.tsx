"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import FrontlineBattleLoadingShell from "@/components/game/frontline/FrontlineBattleLoadingShell";
import GameBackNav from "@/components/game/shared/GameBackNav";
import GameIcon from "@/components/game/shared/GameIcon";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { LazyRewardBurstOverlay } from "@/components/game/shared/LazyRewardBurstOverlay";
import { LazyRewardFlightOverlay } from "@/components/game/shared/LazyRewardFlightOverlay";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import {
  SceneButton,
  ScreenBadge,
  ScreenPanel,
  ScreenScaffold,
  SectionTitle,
} from "@/components/game/screens/ScreenChrome";
import { useI18n } from "@/lib/i18n/useI18n";
import { isServerAuthoritativePersistenceEnabled } from "@/lib/persistedGameState";
import { useGameStore } from "@/lib/store";
import { audio } from "@/lib/audio";
import type { AudioThemeName } from "@/lib/audio-score";
import { createFrontlineBattleSummary } from "@/features/frontline/battleSummary";
import { getFrontlineBattleBackgroundSrc } from "@/components/game/frontline/frontlineVisualAssets";
import {
  getLadderOpponentForPoints,
  getLadderRankForPoints,
  ladderRankLabel,
  type LadderOpponent,
} from "@/features/ladder/data";
import type { FrontlineBattleState } from "@/features/frontline/types";
import type { Rewards } from "@/lib/types";
import { ArenaMetric, ArenaRankPlate, GateLine, LadderRankPlate, ResultMetric, RewardChips } from "./ArenaPrimitives";
import { ArenaRivalCard } from "./ArenaRivalCard";
import { LadderQueueCard } from "./LadderQueueCard";
import { FRONTLINE_ARENA_RIVALS, rivalText, tx, type ArenaRival, type TranslateFn } from "./arenaPageHelpers";

const FrontlineBattle = dynamic(() => import("@/components/game/frontline/FrontlineBattle"), {
  ssr: false,
  loading: FrontlineBattleLoadingShell,
});

type ArenaPhase = "browse" | "battle" | "post";
type ArenaMode = "ladder" | "trials";
type LadderMatchmakingState = "idle" | "finding" | "found";
type BattlePick =
  | { mode: "trials"; rival: ArenaRival }
  | { mode: "ladder"; rival: LadderOpponent };

const ARENA_BATTLE_THEME_BY_MODE = {
  ladder: "ladder",
  trials: "arena_trials",
} satisfies Record<ArenaMode, AudioThemeName>;

type ArenaResult = {
  winner: "ally" | "enemy" | "draw";
  mode: ArenaMode;
  rival: ArenaRival | LadderOpponent;
  rounds: number;
  rewards: Rewards;
  allyCoreHp: number;
  enemyCoreHp: number;
  rankLabel: string;
  pointsDelta?: number;
  keyProgressDelta?: number;
  adventureKeysGranted?: number;
};

export default function ArenaPage() {
  const { t } = useI18n();
  const [clientReady, setClientReady] = useState(false);
  const tickets = useGameStore((state) => state.resources.arenaTickets);
  const resources = useGameStore((state) => state.resources);
  const wins = useGameStore((state) => state.arenaWins);
  const losses = useGameStore((state) => state.arenaLosses);
  const ladder = useGameStore((state) => state.ladder);
  const accountLinkMode = useGameStore((state) => state.accountLinkMode);
  const frontlineLoadout = useGameStore((state) => state.frontlineLoadout);
  const nextSeed = useGameStore((state) => state.nextSeed);
  const spend = useGameStore((state) => state.spend);
  const recordArenaResult = useGameStore((state) => state.recordArenaResultOnlineFirst);
  const recordLadderResult = useGameStore((state) => state.recordLadderResultOnlineFirst);
  const refreshTickets = useGameStore((state) => state.refreshArenaTicketsIfNeeded);

  const [phase, setPhase] = useState<ArenaPhase>("browse");
  const [mode, setMode] = useState<ArenaMode>("ladder");
  const [picked, setPicked] = useState<BattlePick | null>(null);
  const [seed, setSeed] = useState(1);
  const [result, setResult] = useState<ArenaResult | null>(null);
  const [ticketSpentLocally, setTicketSpentLocally] = useState(false);
  const [ladderMatchmaking, setLadderMatchmaking] = useState<LadderMatchmakingState>("idle");
  const [foundLadderOpponent, setFoundLadderOpponent] = useState<LadderOpponent | null>(null);
  const ladderMatchTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const pickedMode = picked?.mode ?? null;

  useEffect(() => {
    setClientReady(true);
    if (!isServerAuthoritativePersistenceEnabled()) refreshTickets();
  }, [refreshTickets]);

  useEffect(() => {
    return () => {
      ladderMatchTimers.current.forEach((timer) => clearTimeout(timer));
      ladderMatchTimers.current = [];
    };
  }, []);

  useEffect(() => {
    if (phase === "battle" && pickedMode) {
      audio.setTheme(ARENA_BATTLE_THEME_BY_MODE[pickedMode]);
      return;
    }
    if (phase === "post") {
      audio.setTheme("postbattle");
      return;
    }
    audio.setTheme("home");
  }, [phase, pickedMode]);

  const squadReady = frontlineLoadout.squad.filter(Boolean).length === 3;
  const deckReady = frontlineLoadout.deck.filter(Boolean).length === 8;
  const loadoutReady = squadReady && deckReady;
  const record = wins + losses;
  const winRate = record ? Math.round((wins / record) * 100) : 0;
  const ladderRank = getLadderRankForPoints(ladder.points);
  const ladderRankName = ladderRankLabel(ladderRank);
  const ladderProgress =
    ladderRank.maxPoints > ladderRank.minPoints
      ? Math.round(((ladder.points - ladderRank.minPoints) / (ladderRank.maxPoints - ladderRank.minPoints + 1)) * 100)
      : 100;
  const currentLadderOpponent = useMemo(() => getLadderOpponentForPoints(ladder.points), [ladder.points]);

  function startArenaBattle(rival: ArenaRival) {
    if (tickets <= 0 || !loadoutReady) return;
    const shouldSpendLocally = accountLinkMode !== "linked" && !isServerAuthoritativePersistenceEnabled();
    const ticketSpent = shouldSpendLocally ? spend({ arenaTickets: 1 }) : false;
    if (shouldSpendLocally && !ticketSpent) return;
    setPicked({ mode: "trials", rival });
    setSeed(nextSeed());
    setResult(null);
    setTicketSpentLocally(ticketSpent);
    setPhase("battle");
  }

  function startLadderBattle(rival: LadderOpponent) {
    if (!loadoutReady || rival.id !== currentLadderOpponent.id) return;
    setPicked({ mode: "ladder", rival });
    setSeed(nextSeed());
    setResult(null);
    setTicketSpentLocally(false);
    setPhase("battle");
  }

  function startLadderMatchmaking() {
    if (!loadoutReady || ladderMatchmaking !== "idle") return;
    ladderMatchTimers.current.forEach((timer) => clearTimeout(timer));
    ladderMatchTimers.current = [];
    setFoundLadderOpponent(null);
    setLadderMatchmaking("finding");

    const foundTimer = setTimeout(() => {
      setFoundLadderOpponent(currentLadderOpponent);
      setLadderMatchmaking("found");
    }, 620);
    const battleTimer = setTimeout(() => {
      setLadderMatchmaking("idle");
      setFoundLadderOpponent(null);
      startLadderBattle(currentLadderOpponent);
    }, 1120);
    ladderMatchTimers.current = [foundTimer, battleTimer];
  }

  async function finishBattle(winner: "ally" | "enemy" | "draw", battleState: FrontlineBattleState) {
    if (!picked) return;
    const won = winner === "ally";
    const previewRewards = picked.mode === "ladder" ? picked.rival.previewRewards : picked.rival.rewards;
    const rewards = won ? previewRewards : winner === "draw" ? { gold: 45, dust: 5, accountXp: 3 } : { gold: 25, accountXp: 2 };
    const rewardSource = won
      ? t(picked.mode === "ladder" ? "arenaScreen.result.ladderWinSource" : "arenaScreen.result.winSource", { name: picked.rival.ownerName })
      : t(picked.mode === "ladder" ? "arenaScreen.result.ladderResultSource" : "arenaScreen.result.resultSource", { name: picked.rival.ownerName });
    const battleSummary = createFrontlineBattleSummary(battleState);

    if (picked.mode === "ladder") {
      const recorded = await recordLadderResult({
        opponentId: picked.rival.id,
        battleSeed: seed,
        winner,
        turns: battleState.round,
        battleSummary,
        rewards,
        source: rewardSource,
      });
      if (!recorded) {
        setPhase("browse");
        return;
      }
      const nextRank = getLadderRankForPoints(Math.max(0, Math.min(300, ladder.points + recorded.pointsDelta)));
      setResult({
        winner,
        mode: picked.mode,
        rival: picked.rival,
        rounds: battleState.round,
        rewards: recorded.rewards,
        allyCoreHp: battleState.allyCoreHp,
        enemyCoreHp: battleState.enemyCoreHp,
        rankLabel: ladderRankLabel(nextRank),
        pointsDelta: recorded.pointsDelta,
        keyProgressDelta: recorded.keyProgressDelta,
        adventureKeysGranted: recorded.adventureKeysGranted,
      });
      setPhase("post");
      return;
    }

    const recorded = await recordArenaResult({
      opponentId: picked.rival.id,
      battleSeed: seed,
      winner,
      turns: battleState.round,
      battleSummary,
      rewards,
      source: rewardSource,
      ticketAlreadySpent: ticketSpentLocally,
    });
    if (!recorded) {
      setPhase("browse");
      return;
    }
    setResult({
      winner,
      mode: picked.mode,
      rival: picked.rival,
      rounds: battleState.round,
      rewards: recorded.rewards,
      allyCoreHp: battleState.allyCoreHp,
      enemyCoreHp: battleState.enemyCoreHp,
      rankLabel: rivalText(t, picked.rival, "rank"),
    });
    setPhase("post");
  }

  if (phase === "battle" && picked) {
    return (
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-3 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6 xl:px-8">
        <FrontlineBattle
          seed={seed}
          loadout={frontlineLoadout}
          enemyPresetId={picked.rival.presetId}
          battleBackgroundSrc={getFrontlineBattleBackgroundSrc(
            picked.mode === "ladder" ? "ladder_duel_arena" : "arena_trials_coliseum",
          )}
          onFinished={finishBattle}
        />
      </div>
    );
  }

  if (phase === "post" && result) {
    const won = result.winner === "ally";
    const isLadder = result.mode === "ladder";
    return (
      <ScreenScaffold scene="arena" dock={false} homeNav={false} hud={false}>
        <ArenaTopChrome resources={resources} t={t} />
        <LazyRewardFlightOverlay rewards={result.rewards} active nonce={`${result.rival.id}-${result.rounds}`} origin="center" />
        <div className="absolute inset-0 grid place-items-center px-4 py-24">
          <ScreenPanel className="w-full max-w-[42rem] p-5 text-center md:p-7" accent={won}>
            <LazyRewardBurstOverlay rewards={result.rewards} compact />
            <div className="mx-auto w-fit">
              {won ? <ModeIcon name={isLadder ? "ladder" : "arena_draft"} size="xl" /> : <GameIcon kind="battle" tone="ember" size="lg" />}
            </div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#f5d498]">
              {isLadder ? t("arenaScreen.result.ladderEyebrow") : t("arenaScreen.result.eyebrow")}
            </div>
            <div className="mt-3 text-4xl font-black text-white">{won ? t("arenaScreen.result.victory") : result.winner === "draw" ? t("arenaScreen.result.draw") : t("arenaScreen.result.defeat")}</div>
            <div className="mt-2 text-sm text-white/62">{t("arenaScreen.result.rounds", { name: result.rival.ownerName, rounds: result.rounds })}</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ResultMetric label={t("arenaScreen.result.allyCore")} value={result.allyCoreHp} />
              <ResultMetric label={t("arenaScreen.result.enemyCore")} value={result.enemyCoreHp} />
              <ResultMetric label={isLadder ? t("arenaScreen.ladder.rank") : t("arenaScreen.result.rank")} value={result.rankLabel} />
            </div>
            {isLadder ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <ResultMetric label={t("arenaScreen.ladder.pointsDelta")} value={formatSigned(result.pointsDelta ?? 0)} />
                <ResultMetric label={t("arenaScreen.ladder.keyProgress")} value={`+${result.keyProgressDelta ?? 0}%`} />
                <ResultMetric label={t("arenaScreen.ladder.keys")} value={result.adventureKeysGranted ?? 0} />
              </div>
            ) : null}
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-4 text-left">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/46">{t("arenaScreen.result.rewards")}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <RewardChips rewards={result.rewards} t={t} />
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <SceneButton onClick={() => setPhase("browse")} variant="secondary">
                {isLadder ? t("arenaScreen.result.backToLadder") : t("arenaScreen.result.backToArena")}
              </SceneButton>
              <SceneButton
                onClick={() => {
                  if (isLadder) {
                    startLadderBattle(result.rival as LadderOpponent);
                  } else {
                    startArenaBattle(result.rival as ArenaRival);
                  }
                }}
                disabled={isLadder ? !loadoutReady : tickets <= 0 || !loadoutReady}
              >
                {t("arenaScreen.result.rematch")}
              </SceneButton>
            </div>
          </ScreenPanel>
        </div>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold scene="arena" dock={false} homeNav={false} hud={false}>
      <ArenaTopChrome resources={resources} t={t} />
      {!clientReady ? (
        <div className="absolute inset-x-3 bottom-4 top-20 z-20 overflow-hidden md:inset-x-8 md:top-24" aria-busy="true">
          <div className="mx-auto flex max-w-[88rem] flex-col gap-3 pb-6">
            <ScreenPanel className="overflow-hidden p-3 md:p-4">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(255,151,92,0.14),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(245,196,81,0.1),transparent_22%)]" />
              <div className="relative z-[1]">
                <div className="h-7 w-32 rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10" />
                <div className="mt-4 h-10 max-w-[30rem] rounded-full bg-white/[0.07]" />
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="h-20 rounded-[22px] border border-white/10 bg-white/[0.045]" />
                  <div className="h-20 rounded-[22px] border border-white/10 bg-white/[0.045]" />
                  <div className="h-20 rounded-[22px] border border-white/10 bg-white/[0.045]" />
                  <div className="h-20 rounded-[22px] border border-white/10 bg-white/[0.045]" />
                </div>
              </div>
            </ScreenPanel>
            <ScreenPanel className="p-3 md:p-4">
              <div className="h-7 w-40 rounded-full bg-white/[0.06]" />
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="h-64 rounded-[26px] border border-white/10 bg-white/[0.045]" />
                <div className="h-64 rounded-[26px] border border-white/10 bg-white/[0.045]" />
                <div className="h-64 rounded-[26px] border border-white/10 bg-white/[0.045]" />
              </div>
            </ScreenPanel>
          </div>
        </div>
      ) : (
      <div className="absolute inset-x-3 bottom-4 top-20 z-20 overflow-y-auto md:inset-x-8 md:top-24">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-3 pb-6">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <ScreenPanel className="overflow-hidden p-3 md:p-4">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(255,151,92,0.18),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(245,196,81,0.13),transparent_22%)]" />
              <div className="relative z-[1]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="max-w-[48rem]">
                    <div className="inline-flex rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">
                      {t("arenaScreen.hub.badge")}
                    </div>
                    <h1 className="mt-2 max-w-[45rem] text-[1.75rem] font-black leading-[0.92] tracking-[-0.045em] text-white md:text-[2.3rem]">
                      {t("arenaScreen.hub.title")}
                    </h1>
                    <p className="mt-2 max-w-[40rem] text-sm font-semibold leading-6 text-white/58">{t("arenaScreen.hub.copy")}</p>
                  </div>
                  {mode === "ladder" ? (
                    <LadderRankPlate rank={ladderRankName} points={ladder.points} progressPercent={ladderProgress} t={t} />
                  ) : (
                    <ArenaRankPlate wins={wins} losses={losses} winRate={winRate} rank={tx(t, "arenaScreen.rivals.arena_bonewood.rank", "Bronze II")} t={t} />
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {mode === "ladder" ? (
                    <>
                      <ArenaMetric icon="rewards" modeIcon="ladder" label={t("arenaScreen.ladder.points")} value={ladder.points} tone="gold" active />
                      <ArenaMetric icon="power" label={t("arenaScreen.ladder.rank")} value={ladderRankName} tone="sky" />
                      <ArenaMetric icon="rewards" label={t("arenaScreen.ladder.keyProgress")} value={`${ladder.keyProgress}%`} tone="gold" />
                      <ArenaMetric icon="shield" label={t("arenaScreen.ladder.dailyWins")} value={`${ladder.dailyRewardedWins}/5`} tone="emerald" />
                    </>
                  ) : (
                    <>
                      <ArenaMetric icon="tickets" label={t("arenaScreen.metrics.tickets")} value={tickets} tone="gold" active={tickets > 0} />
                      <ArenaMetric icon="rewards" modeIcon="arena_draft" label={t("arenaScreen.metrics.wins")} value={wins} tone="emerald" />
                      <ArenaMetric icon="shield" label={t("arenaScreen.metrics.losses")} value={losses} tone="ember" />
                      <ArenaMetric icon="power" label={t("arenaScreen.metrics.rate")} value={`${winRate}%`} tone="sky" />
                    </>
                  )}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <ModeSelectCard
                    active={mode === "ladder"}
                    icon="ladder"
                    eyebrow={t("arenaScreen.ladder.badge")}
                    title={t("arenaScreen.ladder.modeTitle")}
                    copy={t("arenaScreen.ladder.modeCopy")}
                    meta={t("arenaScreen.ladder.modeMeta")}
                    onClick={() => setMode("ladder")}
                  />
                  <ModeSelectCard
                    active={mode === "trials"}
                    icon="arena_draft"
                    eyebrow={t("arenaScreen.trials.badge")}
                    title={t("arenaScreen.trials.modeTitle")}
                    copy={t("arenaScreen.trials.modeCopy")}
                    meta={t("arenaScreen.trials.modeMeta")}
                    onClick={() => setMode("trials")}
                  />
                </div>
              </div>
            </ScreenPanel>

            <ScreenPanel className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f5d498]">{t("arenaScreen.gate.eyebrow")}</div>
                  <div className="mt-1 text-lg font-black text-white">{t("arenaScreen.gate.title")}</div>
                </div>
                <ScreenBadge tone={loadoutReady ? "gold" : "ember"}>{loadoutReady ? t("arenaScreen.gate.ready") : t("arenaScreen.gate.deckNeeded")}</ScreenBadge>
              </div>
              <div className="mt-3 grid gap-1.5">
                <GateLine label={t("arenaScreen.gate.squad")} value={`${frontlineLoadout.squad.filter(Boolean).length}/3`} ok={squadReady} />
                <GateLine label={t("arenaScreen.gate.cards")} value={`${frontlineLoadout.deck.filter(Boolean).length}/8`} ok={deckReady} />
                {mode === "trials" ? <GateLine label={t("arenaScreen.gate.ticket")} value={`${tickets}`} ok={tickets > 0} /> : null}
              </div>
              {!loadoutReady ? (
                <a href="/deck" className="mt-4 block rounded-[20px] border border-[#f5c451]/22 bg-[#f5c451]/12 px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-[#f5d498]">
                  {t("arenaScreen.gate.fixDeck")}
                </a>
              ) : null}
            </ScreenPanel>
          </div>

          <ScreenPanel className="p-3 md:p-4">
            <SectionTitle
              eyebrow={mode === "ladder" ? t("arenaScreen.ladder.eyebrow") : t("arenaScreen.floor.eyebrow")}
              title={mode === "ladder" ? t("arenaScreen.ladder.sectionTitle") : t("arenaScreen.floor.title")}
              aside={
                mode === "ladder" ? (
                  <ScreenBadge tone={loadoutReady ? "gold" : "neutral"}>{loadoutReady ? t("arenaScreen.ladder.ready") : t("arenaScreen.gate.deckNeeded")}</ScreenBadge>
                ) : (
                  <ScreenBadge tone={tickets > 0 ? "gold" : "neutral"}>{tickets > 0 ? t("arenaScreen.floor.entryReady") : t("arenaScreen.floor.noTickets")}</ScreenBadge>
                )
              }
            />
            {mode === "ladder" ? (
              <div className="mt-4">
                <LadderQueueCard
                  rankName={ladderRankName}
                  points={ladder.points}
                  progressPercent={ladderProgress}
                  dailyWins={ladder.dailyRewardedWins}
                  keyProgress={ladder.keyProgress}
                  rewardPreview={currentLadderOpponent.previewRewards}
                  matchmaking={ladderMatchmaking}
                  foundOpponent={foundLadderOpponent}
                  disabled={!loadoutReady}
                  onFindMatch={startLadderMatchmaking}
                  t={t}
                />
              </div>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {FRONTLINE_ARENA_RIVALS.map((rival, index) => (
                  <ArenaRivalCard
                    key={rival.id}
                    rival={rival}
                    featured={index === 1}
                    disabled={tickets <= 0 || !loadoutReady}
                    onChallenge={() => startArenaBattle(rival)}
                    t={t}
                  />
                ))}
              </div>
            )}
          </ScreenPanel>
        </div>
      </div>
      )}
    </ScreenScaffold>
  );
}

function ModeSelectCard({
  active,
  onClick,
  icon,
  eyebrow,
  title,
  copy,
  meta,
}: {
  active: boolean;
  onClick: () => void;
  icon: "ladder" | "arena_draft";
  eyebrow: string;
  title: string;
  copy: string;
  meta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group/mode relative overflow-hidden rounded-[26px] border p-3 text-left transition duration-300 md:p-4",
        active
          ? "border-[#f5c451]/34 bg-[radial-gradient(circle_at_18%_8%,rgba(245,196,81,0.22),transparent_36%),linear-gradient(180deg,rgba(62,39,18,0.62),rgba(8,10,16,0.88))] shadow-[0_18px_44px_rgba(245,196,81,0.12)]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.76))] hover:border-white/18 hover:bg-white/[0.07]",
      ].join(" ")}
    >
      <span className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-white/10 blur-2xl transition group-hover/mode:bg-white/14" />
      <span className="relative z-[1] flex items-start gap-3">
        <span className={["grid h-14 w-14 shrink-0 place-items-center rounded-[20px] border", active ? "border-[#f5c451]/28 bg-[#f5c451]/12" : "border-white/10 bg-black/18"].join(" ")}>
          <ModeIcon name={icon} size="lg" />
        </span>
        <span className="min-w-0">
          <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-[#f5d498]/78">{eyebrow}</span>
          <span className="mt-1 block text-lg font-black leading-tight text-white">{title}</span>
          <span className="mt-1 block text-[12px] font-semibold leading-5 text-white/55">{copy}</span>
          <span className={["mt-3 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]", active ? "border-[#f5c451]/28 bg-[#f5c451]/12 text-[#ffe3a1]" : "border-white/10 bg-white/[0.045] text-white/46"].join(" ")}>
            {meta}
          </span>
        </span>
      </span>
    </button>
  );
}

function ArenaTopChrome({ resources, t }: { resources: { gold: number; dust: number; gems: number; arenaTickets: number }; t: TranslateFn }) {
  return (
    <>
      <GameBackNav />
      <div className="pointer-events-auto fixed right-3 top-3 z-40 flex items-center gap-1.5 md:right-5 md:top-4 md:gap-2">
        <GameResourceBar resources={resources} arenaTickets={resources.arenaTickets} size="sm" className="max-w-[calc(100vw-9rem)] md:max-w-none" />
      </div>
    </>
  );
}

function formatSigned(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}
