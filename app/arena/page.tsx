"use client";

import { useEffect, useMemo, useState } from "react";
import FrontlineBattle from "@/components/game/frontline/FrontlineBattle";
import GameBackNav from "@/components/game/shared/GameBackNav";
import GameIcon from "@/components/game/shared/GameIcon";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { RewardBurstOverlay } from "@/components/game/shared/RewardBurstOverlay";
import { RewardFlightOverlay } from "@/components/game/shared/RewardFlightOverlay";
import {
  SceneButton,
  ScreenBadge,
  ScreenPanel,
  ScreenScaffold,
  SectionTitle,
} from "@/components/game/screens/ScreenChrome";
import { mergeRewards } from "@/features/battle/rewards";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import type { FrontlineBattleState } from "@/features/frontline/types";
import type { Rewards } from "@/lib/types";
import { ArenaMetric, ArenaRankPlate, GateLine, ResultMetric, RewardChips } from "./ArenaPrimitives";
import { ArenaRivalCard } from "./ArenaRivalCard";
import { FRONTLINE_ARENA_RIVALS, rivalText, tx, type ArenaRival, type TranslateFn } from "./arenaPageHelpers";

type ArenaPhase = "browse" | "battle" | "post";

type ArenaResult = {
  winner: "ally" | "enemy" | "draw";
  rival: ArenaRival;
  rounds: number;
  rewards: Rewards;
  allyCoreHp: number;
  enemyCoreHp: number;
};

export default function ArenaPage() {
  const { t } = useI18n();
  const tickets = useGameStore((state) => state.resources.arenaTickets);
  const resources = useGameStore((state) => state.resources);
  const wins = useGameStore((state) => state.arenaWins);
  const losses = useGameStore((state) => state.arenaLosses);
  const frontlineLoadout = useGameStore((state) => state.frontlineLoadout);
  const nextSeed = useGameStore((state) => state.nextSeed);
  const awardRewards = useGameStore((state) => state.awardRewards);
  const recordBattleResult = useGameStore((state) => state.recordBattleResult);
  const refreshTickets = useGameStore((state) => state.refreshArenaTicketsIfNeeded);

  const [phase, setPhase] = useState<ArenaPhase>("browse");
  const [picked, setPicked] = useState<ArenaRival | null>(null);
  const [seed, setSeed] = useState(1);
  const [result, setResult] = useState<ArenaResult | null>(null);

  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  const squadReady = frontlineLoadout.squad.filter(Boolean).length === 3;
  const deckReady = frontlineLoadout.deck.filter(Boolean).length === 8;
  const loadoutReady = squadReady && deckReady;
  const record = wins + losses;
  const winRate = record ? Math.round((wins / record) * 100) : 0;

  function startArenaBattle(rival: ArenaRival) {
    if (tickets <= 0 || !loadoutReady) return;
    useGameStore.setState((state) => ({
      resources: { ...state.resources, arenaTickets: Math.max(0, state.resources.arenaTickets - 1) },
    }));
    setPicked(rival);
    setSeed(nextSeed());
    setResult(null);
    setPhase("battle");
  }

  function finishArenaBattle(winner: "ally" | "enemy" | "draw", battleState: FrontlineBattleState) {
    if (!picked) return;
    const won = winner === "ally";
    const rewards = won ? picked.rewards : winner === "draw" ? { gold: 45, dust: 5, accountXp: 3 } : { gold: 25, accountXp: 2 };
    recordBattleResult(won, "arena");
    awardRewards(
      mergeRewards(rewards),
      won ? t("arenaScreen.result.winSource", { name: picked.ownerName }) : t("arenaScreen.result.resultSource", { name: picked.ownerName }),
    );
    setResult({
      winner,
      rival: picked,
      rounds: battleState.round,
      rewards,
      allyCoreHp: battleState.allyCoreHp,
      enemyCoreHp: battleState.enemyCoreHp,
    });
    setPhase("post");
  }

  if (phase === "battle" && picked) {
    return (
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-3 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6 xl:px-8">
        <FrontlineBattle
          seed={seed}
          loadout={frontlineLoadout}
          enemyPresetId={picked.presetId}
          onFinished={finishArenaBattle}
        />
      </div>
    );
  }

  if (phase === "post" && result) {
    const won = result.winner === "ally";
    return (
      <ScreenScaffold scene="arena" dock={false} homeNav={false} hud={false}>
        <ArenaTopChrome resources={resources} t={t} />
        <RewardFlightOverlay rewards={result.rewards} active nonce={`${result.rival.id}-${result.rounds}`} origin="center" />
        <div className="absolute inset-0 grid place-items-center px-4 py-24">
          <ScreenPanel className="w-full max-w-[42rem] p-5 text-center md:p-7" accent={won}>
            <RewardBurstOverlay rewards={result.rewards} compact />
            <div className="mx-auto w-fit">
              {won ? <ModeIcon name="ladder" size="xl" /> : <GameIcon kind="battle" tone="ember" size="lg" />}
            </div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#f5d498]">{t("arenaScreen.result.eyebrow")}</div>
            <div className="mt-3 text-4xl font-black text-white">{won ? t("arenaScreen.result.victory") : result.winner === "draw" ? t("arenaScreen.result.draw") : t("arenaScreen.result.defeat")}</div>
            <div className="mt-2 text-sm text-white/62">{t("arenaScreen.result.rounds", { name: result.rival.ownerName, rounds: result.rounds })}</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ResultMetric label={t("arenaScreen.result.allyCore")} value={result.allyCoreHp} />
              <ResultMetric label={t("arenaScreen.result.enemyCore")} value={result.enemyCoreHp} />
              <ResultMetric label={t("arenaScreen.result.rank")} value={rivalText(t, result.rival, "rank")} />
            </div>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-4 text-left">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/46">{t("arenaScreen.result.rewards")}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <RewardChips rewards={result.rewards} t={t} />
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <SceneButton onClick={() => setPhase("browse")} variant="secondary">
                {t("arenaScreen.result.backToArena")}
              </SceneButton>
              <SceneButton onClick={() => startArenaBattle(result.rival)} disabled={tickets <= 0 || !loadoutReady}>
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
      <div className="absolute inset-x-3 bottom-4 top-20 z-20 overflow-y-auto md:inset-x-8 md:top-24">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-3 pb-6">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <ScreenPanel className="overflow-hidden p-3 md:p-4">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(255,151,92,0.18),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(245,196,81,0.13),transparent_22%)]" />
              <div className="relative z-[1]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="inline-flex rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">
                      {t("arenaScreen.hero.badge")}
                    </div>
                    <h1 className="mt-2 max-w-[45rem] text-[1.75rem] font-black leading-[0.92] tracking-[-0.045em] text-white md:text-[2.3rem]">
                      {t("arenaScreen.hero.title")}
                    </h1>
                  </div>
                  <ArenaRankPlate wins={wins} losses={losses} winRate={winRate} rank={tx(t, "arenaScreen.rivals.arena_bonewood.rank", "Bronze II")} t={t} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                  <ArenaMetric icon="tickets" label={t("arenaScreen.metrics.tickets")} value={tickets} tone="gold" active={tickets > 0} />
                  <ArenaMetric icon="rewards" modeIcon="ladder" label={t("arenaScreen.metrics.wins")} value={wins} tone="emerald" />
                  <ArenaMetric icon="shield" label={t("arenaScreen.metrics.losses")} value={losses} tone="ember" />
                  <ArenaMetric icon="power" label={t("arenaScreen.metrics.rate")} value={`${winRate}%`} tone="sky" />
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
                <GateLine label={t("arenaScreen.gate.ticket")} value={`${tickets}`} ok={tickets > 0} />
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
              eyebrow={t("arenaScreen.floor.eyebrow")}
              title={t("arenaScreen.floor.title")}
              aside={<ScreenBadge tone={tickets > 0 ? "gold" : "neutral"}>{tickets > 0 ? t("arenaScreen.floor.entryReady") : t("arenaScreen.floor.noTickets")}</ScreenBadge>}
            />
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
          </ScreenPanel>
        </div>
      </div>
    </ScreenScaffold>
  );
}

function ArenaTopChrome({ resources, t }: { resources: { gold: number; dust: number; gems: number; arenaTickets: number }; t: TranslateFn }) {
  return (
    <>
      <GameBackNav label={t("common.home")} eyebrow={t("nav.arena")} icon="arena" tone="gold" placement="top-left" />
      <div className="pointer-events-auto fixed right-3 top-3 z-40 flex items-center gap-1.5 md:right-5 md:top-4 md:gap-2">
        <GameResourceBar resources={resources} arenaTickets={resources.arenaTickets} size="sm" className="max-w-[calc(100vw-9rem)] md:max-w-none" />
      </div>
    </>
  );
}
