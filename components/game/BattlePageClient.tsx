"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import FrontlineBattle from "@/components/game/frontline/FrontlineBattle";
import {
  FRONTLINE_CARD_BY_ID,
  FRONTLINE_LEADER_BY_ID,
  FRONTLINE_PRESETS,
  FRONTLINE_UNIT_BY_ID,
} from "@/features/frontline/data";
import {
  getAdventureLevelForFrontline,
  getFrontlineAdventureRewardPreview,
  getFrontlineAdventureVictoryRewards,
  getFrontlinePresetForAdventure,
} from "@/features/frontline/adventure";
import { ACCOUNT_XP_PER_LEVEL } from "@/lib/constants";
import { cn } from "@/lib/cn";
import {
  frontlineCardKindLabel,
  frontlineCardName,
  frontlineHeroName,
  frontlineLeaderName,
  frontlinePresetName,
} from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import type { FrontlineBattleState } from "@/features/frontline/types";
import type { Rewards } from "@/lib/types";
import { FrontlineCardView, FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import { ProgressionIcon, type ProgressionIconName } from "@/components/game/shared/ProgressionIcon";
import { RewardBurstOverlay } from "@/components/game/shared/RewardBurstOverlay";
import { ResourceIcon, type ResourceIconKind } from "@/components/game/shared/ResourceIcon";
import {
  createFrontlineHeroProfileMap,
  getFrontlineHeroProfileById,
} from "@/features/frontline/heroProfile";
import {
  createFrontlineCardProfileMap,
  createFrontlineSupportProfileMap,
} from "@/features/frontline/cardProgression";

type Props = {
  autostart?: boolean;
  enemyPresetId?: string | null;
  adventureLevelId?: string | null;
};

type BattlePhase = "setup" | "battle" | "result";

type ResultContext = {
  winner: "ally" | "enemy" | "draw";
  enemyName: string;
  rounds: number;
  allyCoreHp: number;
  enemyCoreHp: number;
  rewards: { gold: number; dust: number; gems: number; accountXp: number; frontlineCards?: { cardId: string }[] };
  resourcesBefore: { gold: number; dust: number; gems: number };
  resourcesAfter: { gold: number; dust: number; gems: number };
  accountBefore: { level: number; xp: number };
  accountAfter: { level: number; xp: number };
};

function projectAccount(level: number, xp: number, gain: number) {
  let nextLevel = level;
  let nextXp = xp + gain;
  while (nextXp >= ACCOUNT_XP_PER_LEVEL * nextLevel) {
    nextXp -= ACCOUNT_XP_PER_LEVEL * nextLevel;
    nextLevel += 1;
  }
  return { level: nextLevel, xp: nextXp };
}

function accountProgressPercent(level: number, xp: number) {
  return Math.max(0, Math.min(100, (xp / (ACCOUNT_XP_PER_LEVEL * level)) * 100));
}

export default function BattlePageClient({ autostart = false, enemyPresetId, adventureLevelId }: Props) {
  const { t } = useI18n();
  const frontlineLoadout = useGameStore((state) => state.frontlineLoadout);
  const nextSeed = useGameStore((state) => state.nextSeed);
  const awardRewards = useGameStore((state) => state.awardRewards);
  const recordBattleResult = useGameStore((state) => state.recordBattleResult);
  const markAdventureCleared = useGameStore((state) => state.markAdventureCleared);
  const account = useGameStore((state) => state.account);
  const resources = useGameStore((state) => state.resources);
  const playerHeroes = useGameStore((state) => state.heroes);
  const frontlineCardLevels = useGameStore((state) => state.frontlineCardLevels);
  const adventureProgress = useGameStore((state) => state.adventureProgress);

  const adventureLevel = useMemo(() => getAdventureLevelForFrontline(adventureLevelId), [adventureLevelId]);
  const forcedPresetId = adventureLevel
    ? getFrontlinePresetForAdventure(adventureLevel).id
    : enemyPresetId && FRONTLINE_PRESETS.some((entry) => entry.id === enemyPresetId)
      ? enemyPresetId
      : null;
  const [phase, setPhase] = useState<BattlePhase>("setup");
  const [selectedEnemyPresetId, setSelectedEnemyPresetId] = useState(forcedPresetId ?? FRONTLINE_PRESETS[0].id);
  const [battleSeed, setBattleSeed] = useState(1);
  const [resultContext, setResultContext] = useState<ResultContext | null>(null);
  const [rewardReveal, setRewardReveal] = useState({ gold: 0, dust: 0, gems: 0, accountXp: 0, progress: 0 });

  const selectedPreset = useMemo(
    () =>
      FRONTLINE_PRESETS.find((entry) => entry.id === (forcedPresetId ?? selectedEnemyPresetId)) ??
      FRONTLINE_PRESETS[0],
    [forcedPresetId, selectedEnemyPresetId],
  );
  const animatedAccountProgress = resultContext
    ? accountProgressPercent(resultContext.accountAfter.level, resultContext.accountAfter.xp)
    : 0;
  const squadReady = frontlineLoadout.squad.filter(Boolean).length === 3;
  const deckReady = frontlineLoadout.deck.filter(Boolean).length === 8;
  const playerHeroById = useMemo(() => new Map(playerHeroes.map((hero) => [hero.heroId, hero] as const)), [playerHeroes]);
  const allyHeroProfiles = useMemo(() => createFrontlineHeroProfileMap(playerHeroes), [playerHeroes]);
  const allyCardProfiles = useMemo(() => createFrontlineCardProfileMap(frontlineCardLevels), [frontlineCardLevels]);
  const allySupportProfiles = useMemo(() => createFrontlineSupportProfileMap(frontlineCardLevels), [frontlineCardLevels]);
  const allyHeroes = useMemo(
    () => frontlineLoadout.squad.map((heroId) => (heroId ? getFrontlineHeroProfileById(heroId, playerHeroById.get(heroId)) : null)),
    [frontlineLoadout.squad, playerHeroById],
  );
  const allyCards = useMemo(
    () => frontlineLoadout.deck.map((cardId) => (cardId ? allyCardProfiles[cardId] ?? FRONTLINE_CARD_BY_ID[cardId] ?? null : null)),
    [allyCardProfiles, frontlineLoadout.deck],
  );
  const enemyHeroes = useMemo(
    () => selectedPreset.squad.map((heroId) => FRONTLINE_UNIT_BY_ID[heroId] ?? null),
    [selectedPreset.squad],
  );
  const enemyCards = useMemo(
    () => selectedPreset.deck.map((cardId) => FRONTLINE_CARD_BY_ID[cardId]).filter(Boolean),
    [selectedPreset.deck],
  );
  const allyPower = allyHeroes.reduce((sum, hero) => sum + (hero ? hero.maxHp + hero.atk * 3 + hero.def * 2 + hero.speed : 0), 0);
  const enemyPower = enemyHeroes.reduce((sum, hero) => sum + (hero ? hero.maxHp + hero.atk * 3 + hero.def * 2 + hero.speed : 0), 0);
  const rewardPreview: Rewards = adventureLevel
    ? getFrontlineAdventureRewardPreview(adventureLevel, adventureProgress[adventureLevel.id])
    : selectedPreset.rewardSeed;
  const selectedPresetName = frontlinePresetName(t, selectedPreset);

  const startBattle = useCallback(() => {
    if (!squadReady || !deckReady) return;
    setBattleSeed(nextSeed());
    setPhase("battle");
    setResultContext(null);
    setRewardReveal({ gold: 0, dust: 0, gems: 0, accountXp: 0, progress: 0 });
  }, [deckReady, nextSeed, squadReady]);

  useEffect(() => {
    if (autostart && phase === "setup" && squadReady && deckReady) {
      startBattle();
    }
  }, [autostart, deckReady, phase, squadReady, startBattle]);

  useEffect(() => {
    if (phase !== "result" || !resultContext) return;
    let frame = 0;
    const steps = 16;
    const interval = window.setInterval(() => {
      frame += 1;
      const ratio = Math.min(1, frame / steps);
      setRewardReveal({
        gold: Math.round(resultContext.rewards.gold * ratio),
        dust: Math.round(resultContext.rewards.dust * ratio),
        gems: Math.round(resultContext.rewards.gems * ratio),
        accountXp: Math.round(resultContext.rewards.accountXp * ratio),
        progress: ratio,
      });
      if (ratio >= 1) window.clearInterval(interval);
    }, 28);
    return () => window.clearInterval(interval);
  }, [phase, resultContext]);

  function finishBattle(winner: "ally" | "enemy" | "draw", battleState: FrontlineBattleState) {
    const won = winner === "ally";
    let rewards: Rewards =
      won
        ? selectedPreset.rewardSeed
        : winner === "draw"
          ? { gold: 50, dust: 6, gems: 0, accountXp: 3 }
          : { gold: 35, dust: 4, gems: 0, accountXp: 2 };

    if (adventureLevel) {
      if (won) {
        const { firstClear } = markAdventureCleared(adventureLevel.id);
        rewards = getFrontlineAdventureVictoryRewards(adventureLevel, firstClear);
      } else {
        rewards = winner === "draw" ? { gold: 20, dust: 2, gems: 0, accountXp: 1 } : { gold: 0, dust: 0, gems: 0, accountXp: 0 };
      }
    }
    const normalizedRewards = {
      gold: rewards.gold ?? 0,
      dust: rewards.dust ?? 0,
      gems: rewards.gems ?? 0,
      accountXp: rewards.accountXp ?? 0,
      frontlineCards: rewards.frontlineCards ?? [],
    };
    const resourcesBefore = { gold: resources.gold, dust: resources.dust, gems: resources.gems };
    const resourcesAfter = {
      gold: resourcesBefore.gold + normalizedRewards.gold,
      dust: resourcesBefore.dust + normalizedRewards.dust,
      gems: resourcesBefore.gems + normalizedRewards.gems,
    };
    const accountBefore = { level: account.level, xp: account.xp };
    const accountAfter = projectAccount(account.level, account.xp, normalizedRewards.accountXp);

    setResultContext({
      winner,
      enemyName: selectedPresetName,
      rounds: battleState.round,
      allyCoreHp: battleState.allyCoreHp,
      enemyCoreHp: battleState.enemyCoreHp,
      rewards: normalizedRewards,
      resourcesBefore,
      resourcesAfter,
      accountBefore,
      accountAfter,
    });
    recordBattleResult(won, adventureLevel ? "adventure" : "vsai");
    if (rewards.gold || rewards.dust || rewards.gems || rewards.accountXp || rewards.xp || rewards.arenaTickets || rewards.shards?.length || rewards.frontlineCards?.length) {
      awardRewards(rewards, won && adventureLevel ? adventureLevel.name : won ? t("frontline.victory") : winner === "draw" ? t("frontline.draw") : t("frontline.defeat"));
    }
    setPhase("result");
  }

  if (phase === "battle") {
    return (
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-3 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6 xl:px-8">
        <FrontlineBattle
          seed={battleSeed}
          loadout={frontlineLoadout}
          enemyPresetId={selectedPreset.id}
          allyHeroProfiles={allyHeroProfiles}
          allyCardProfiles={allyCardProfiles}
          allySupportProfiles={allySupportProfiles}
          onFinished={(winner, battleState) => finishBattle(winner, battleState)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-3 pb-24 pt-20 md:px-6 md:pb-28 md:pt-24 xl:px-8">
      <section className="relative isolate overflow-hidden rounded-[38px] border border-[#f5d498]/14 bg-[radial-gradient(circle_at_18%_12%,rgba(245,196,81,0.18),transparent_25%),radial-gradient(circle_at_78%_18%,rgba(106,190,255,0.14),transparent_28%),linear-gradient(135deg,rgba(52,35,22,0.92),rgba(16,20,29,0.96)_42%,rgba(7,9,14,0.99)_100%)] shadow-[0_34px_92px_rgba(0,0,0,0.42)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.055),transparent_22%,rgba(0,0,0,0.18)_78%),radial-gradient(ellipse_at_50%_54%,rgba(156,100,51,0.2),transparent_44%)]" />
        <div className="pointer-events-none absolute inset-x-[8%] top-[27%] h-[22rem] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_50%,rgba(245,196,81,0.11),rgba(105,72,36,0.18)_36%,transparent_72%)] blur-sm" />
        <div className="relative z-[1] px-4 py-5 md:px-6 md:py-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="min-w-0">
              <div className="inline-flex rounded-full border border-[#f5c451]/24 bg-[#f5c451]/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
                {adventureLevel ? t("frontline.adventureGate", { chapter: adventureLevel.chapter }) : t("frontline.command")}
              </div>
              <h1 className="mt-4 max-w-[58rem] text-[2.1rem] font-black leading-[0.94] text-white md:text-[3.35rem]">
                {adventureLevel ? adventureLevel.name : t("frontline.chooseFronts")}
              </h1>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <Metric label={t("frontline.squad")} value={`${frontlineLoadout.squad.filter(Boolean).length}/3`} ok={squadReady} t={t} />
                <Metric label={t("frontline.deck")} value={`${frontlineLoadout.deck.filter(Boolean).length}/8`} ok={deckReady} t={t} />
                <Metric label={t("frontline.allyPower")} value={allyPower} ok={squadReady} t={t} />
                <Metric label={t("frontline.enemyPower")} value={enemyPower} ok t={t} />
              </div>
            </div>

            <div className="rounded-[28px] border border-[#f5d498]/14 bg-[linear-gradient(180deg,rgba(245,196,81,0.1),rgba(16,12,11,0.92))] p-4 shadow-[0_22px_54px_rgba(0,0,0,0.28)]">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">{t("frontline.launchGate")}</div>
              <div className="mt-2 text-2xl font-black leading-tight text-white">{squadReady && deckReady ? t("frontline.readyToBreach") : t("frontline.loadoutIncomplete")}</div>
              <div className="mt-2 text-[12px] leading-5 text-white/62">
                {squadReady && deckReady ? t("frontline.readyCopy") : t("frontline.incompleteCopy")}
              </div>
              <button
                className="mt-4 w-full rounded-[22px] border border-emerald-200/28 bg-[linear-gradient(180deg,rgba(64,178,124,0.98),rgba(13,45,31,0.98))] px-4 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_18px_38px_rgba(25,166,105,0.2)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
                disabled={!squadReady || !deckReady}
                onClick={startBattle}
              >
                {t("frontline.startBattle")}
              </button>
              <Link
                href="/deck"
                className="mt-3 block rounded-[18px] border border-white/10 bg-white/[0.045] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/[0.08]"
              >
                {t("frontline.tuneSquadDeck")}
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="grid gap-4">
              <Panel title={t("frontline.frontlineMatchup")}>
                <div className="grid gap-3 lg:grid-cols-3">
                  {allyHeroes.map((hero, index) => (
                    <div key={`matchup-${index}`} className="relative rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_50%_42%,rgba(245,196,81,0.08),transparent_46%),rgba(0,0,0,0.18)] p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="rounded-full border border-cyan-200/14 bg-cyan-200/8 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100/72">
                          {index === 0 ? t("frontline.left") : index === 1 ? t("frontline.center") : t("frontline.right")}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/34">{t("frontline.front")}</span>
                      </div>
                      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end gap-2">
                        <FrontlineHeroStandee hero={hero} side="ally" compact label={t("frontline.yourHero")} className="min-h-[13rem]" />
                        <FrontlineHeroStandee hero={enemyHeroes[index]} side="enemy" compact label={t("frontline.enemy")} className="min-h-[13rem]" />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title={t("frontline.battlePackage")}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {allyCards.map((card, index) =>
                    card ? (
                      <FrontlineCardView key={`ally-card-${index}-${card.id}`} card={card} compact className="min-h-[12rem]" />
                    ) : (
                      <EmptyCard key={`ally-card-${index}-empty`} />
                    ),
                  )}
                </div>
              </Panel>
            </div>

            <div className="grid gap-4 content-start">
              <Panel title={adventureLevel ? t("frontline.missionEnemy") : t("frontline.chooseEnemy")}>
                <div className="grid gap-3">
                  {(adventureLevel ? [selectedPreset] : FRONTLINE_PRESETS).map((preset) => (
                    <button
                      key={preset.id}
                      className={cn(
                        "rounded-[24px] border px-4 py-3 text-left transition hover:-translate-y-0.5",
                        preset.id === selectedPreset.id
                          ? "border-[#f5c451]/28 bg-[linear-gradient(180deg,rgba(245,196,81,0.14),rgba(20,16,18,0.9))] shadow-[0_14px_32px_rgba(245,196,81,0.08)]"
                          : "border-white/10 bg-white/[0.035]",
                      )}
                      onClick={() => setSelectedEnemyPresetId(preset.id)}
                      disabled={Boolean(adventureLevel)}
                    >
                      <div className="text-base font-black text-white">{frontlinePresetName(t, preset)}</div>
                      <div className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#f5d498]/72">
                        {frontlineLeaderName(t, FRONTLINE_LEADER_BY_ID[preset.leaderId]) || t("frontline.unknownLeader")}
                      </div>
                      <div className="mt-3 flex -space-x-3">
                        {preset.squad.map((combatantId, index) => (
                          <EnemyMini key={`${preset.id}-${combatantId}-${index}`} combatantId={combatantId} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel title={t("frontline.enemyTricks")}>
                <div className="grid grid-cols-2 gap-2">
                  {enemyCards.slice(0, 4).map((card, index) => (
                    <div key={`enemy-card-${index}-${card.id}`} className="rounded-[18px] border border-rose-200/10 bg-[linear-gradient(180deg,rgba(111,37,45,0.26),rgba(10,8,14,0.92))] px-3 py-3">
                      <div className="text-[9px] font-black uppercase tracking-[0.15em] text-rose-100/52">{frontlineCardKindLabel(t, card)}</div>
                      <div className="mt-1 line-clamp-2 text-[12px] font-black leading-4 text-white">{frontlineCardName(t, card)}</div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title={t("frontline.rewards")}>
                <div className="grid grid-cols-2 gap-2">
                  <RewardPreview label={t("resources.gold")} value={rewardPreview.gold ?? 0} icon="gold" tone="gold" />
                  <RewardPreview label={t("resources.dust")} value={rewardPreview.dust ?? 0} icon="dust" tone="dust" />
                  <RewardPreview label={t("resources.gems")} value={rewardPreview.gems ?? 0} icon="gems" tone="gems" />
                  <RewardPreview label="XP" value={rewardPreview.accountXp ?? 0} progressionIcon="level_up" tone="xp" />
                  {rewardPreview.frontlineCards?.length ? (
                    <RewardPreview label={t("frontline.cardUnlocks")} value={rewardPreview.frontlineCards.length} progressionIcon="unlock" tone="card" />
                  ) : null}
                </div>
              </Panel>

              {phase === "result" && resultContext ? (
                <Panel title={resultContext.winner === "ally" ? t("frontline.victory") : resultContext.winner === "draw" ? t("frontline.draw") : t("frontline.defeat")}>
                  <div
                    className={cn(
                      "frontline-reward-success relative overflow-hidden rounded-[22px] border px-4 py-4",
                      resultContext.winner === "ally"
                        ? "border-[#f5c451]/26 bg-[linear-gradient(180deg,rgba(245,196,81,0.14),rgba(34,22,12,0.92))]"
                        : resultContext.winner === "draw"
                          ? "border-sky-200/16 bg-[linear-gradient(180deg,rgba(77,138,206,0.14),rgba(14,18,28,0.92))]"
                        : "border-rose-200/16 bg-[linear-gradient(180deg,rgba(128,48,58,0.16),rgba(18,12,18,0.92))]",
                    )}
                  >
                    <RewardBurstOverlay rewards={resultContext.rewards} />
                    <div className="flex items-start gap-3">
                      <ProgressionIcon name={resultContext.winner === "ally" ? "reward_chest" : "claim"} size="xl" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">{t("frontline.resultPulse")}</div>
                        <div className="mt-2 text-2xl font-black text-white">
                          {resultContext.winner === "ally"
                            ? t("frontline.resultWinCopy")
                            : resultContext.winner === "draw"
                              ? t("frontline.resultDrawCopy")
                              : t("frontline.resultDefeatCopy")}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-[13px] leading-6 text-white/62">
                      {t("frontline.resultSummary", {
                        enemy: resultContext.enemyName,
                        rounds: resultContext.rounds,
                        allyCore: resultContext.allyCoreHp,
                        enemyCore: resultContext.enemyCoreHp,
                      })}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <ResultMetric label={t("resources.gold")} value={rewardReveal.gold} finalValue={resultContext.rewards.gold} />
                      <ResultMetric label={t("resources.dust")} value={rewardReveal.dust} finalValue={resultContext.rewards.dust} />
                      <ResultMetric label={t("resources.gems")} value={rewardReveal.gems} finalValue={resultContext.rewards.gems} />
                      <ResultMetric label={t("frontline.accountXp")} value={rewardReveal.accountXp} finalValue={resultContext.rewards.accountXp} icon="level_up" />
                    </div>

                    {resultContext.rewards.frontlineCards?.length ? (
                      <div className="mt-3 rounded-[18px] border border-[#f5c451]/18 bg-[#f5c451]/8 px-3 py-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#f5d498]">
                          <ProgressionIcon name="unlock" size="sm" />
                          {t("frontline.unlockedCards")}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {resultContext.rewards.frontlineCards.map((unlock) => {
                            const card = FRONTLINE_CARD_BY_ID[unlock.cardId];
                            return (
                              <span key={unlock.cardId} className="rounded-full border border-white/10 bg-black/24 px-3 py-1.5 text-[11px] font-black text-white/74">
                                {frontlineCardName(t, card) || unlock.cardId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-[18px] border border-white/10 bg-black/16 p-3">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/48">
                        <span className="inline-flex items-center gap-2">
                          <ProgressionIcon name="level_up" size="sm" />
                          {t("frontline.accountProgress")}
                        </span>
                        <span>
                          {t("frontline.levelFromTo", { from: resultContext.accountBefore.level, to: resultContext.accountAfter.level })}
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#7fc2ff,#f5d498)] transition-[width] duration-500"
                          style={{
                            width: `${Math.max(6, animatedAccountProgress * Math.max(rewardReveal.progress, 0.22))}%`,
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-white/56">
                        <span>
                          {resultContext.resourcesBefore.gold}g to {resultContext.resourcesAfter.gold}g
                        </span>
                        <span>
                          {resultContext.resourcesBefore.dust}d to {resultContext.resourcesAfter.dust}d
                        </span>
                        <span>
                          {resultContext.resourcesBefore.gems}m to {resultContext.resourcesAfter.gems}m
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        className="rounded-[18px] border border-emerald-300/24 bg-[linear-gradient(180deg,rgba(48,129,97,0.96),rgba(12,28,20,0.98))] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                        onClick={startBattle}
                      >
                        {t("frontline.runItBack")}
                      </button>
                      <Link
                        href="/deck"
                        className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/74"
                      >
                        {t("frontline.tuneSquadInDeck")}
                      </Link>
                    </div>
                  </div>
                </Panel>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.9))] p-4 shadow-[0_20px_44px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{title}</div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyCard() {
  return (
    <div className="grid min-h-[12rem] place-items-center rounded-[24px] border border-dashed border-white/12 bg-white/[0.025] px-3 text-center">
      <div>
        <div className="mx-auto h-12 w-12 rounded-[18px] border border-white/10 bg-white/[0.04]" />
        <div className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/42">Empty card slot</div>
      </div>
    </div>
  );
}

function EnemyMini({ combatantId }: { combatantId: string }) {
  const { t } = useI18n();
  const combatant = FRONTLINE_UNIT_BY_ID[combatantId];
  const visual = getFrontlineHeroVisualAsset(combatantId);
  const src = visual.standeeSrc ?? visual.portraitFallbackSrc;
  const combatantName = frontlineHeroName(t, combatant) || combatantId;
  const initials = combatantName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2) ?? "?";

  return (
    <div className="relative h-[3.25rem] w-[3.25rem] overflow-hidden rounded-[18px] border border-rose-100/18 bg-[radial-gradient(circle_at_50%_25%,rgba(255,160,150,0.24),rgba(37,10,14,0.94))] shadow-[0_12px_24px_rgba(0,0,0,0.34)]">
      {src ? (
        <img src={src} alt={combatantName} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
      ) : (
        <div className="grid h-full w-full place-items-center text-sm font-black text-white">{initials}</div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-7 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.72))]" />
      <div className="absolute bottom-1 left-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] font-black text-white">T{combatant?.tier ?? 1}</div>
    </div>
  );
}

function RewardPreview({
  label,
  value,
  icon,
  progressionIcon,
  tone,
}: {
  label: string;
  value: number;
  icon?: ResourceIconKind;
  progressionIcon?: ProgressionIconName;
  tone: "gold" | "dust" | "gems" | "xp" | "card";
}) {
  const surface =
    tone === "gold"
      ? "border-amber-200/18 bg-[radial-gradient(circle_at_50%_20%,rgba(255,225,130,0.24),rgba(52,33,10,0.9))]"
      : tone === "gems"
        ? "border-sky-200/18 bg-[radial-gradient(circle_at_50%_20%,rgba(101,211,255,0.24),rgba(10,30,52,0.9))]"
        : tone === "dust"
          ? "border-violet-200/18 bg-[radial-gradient(circle_at_50%_20%,rgba(204,173,255,0.22),rgba(28,14,52,0.9))]"
          : tone === "card"
            ? "border-[#f5c451]/20 bg-[radial-gradient(circle_at_50%_20%,rgba(245,196,81,0.2),rgba(48,30,11,0.9))]"
            : "border-emerald-200/18 bg-[radial-gradient(circle_at_50%_20%,rgba(96,255,174,0.2),rgba(8,42,30,0.9))]";

  return (
    <div className={cn("flex items-center gap-2 rounded-[20px] border px-3 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.18)]", surface)}>
      {icon ? <ResourceIcon kind={icon} size="medium" className="h-9 w-9" /> : null}
      {progressionIcon ? <ProgressionIcon name={progressionIcon} size="md" /> : null}
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/48">{label}</div>
        <div className="mt-1 text-2xl font-black text-white">{value}</div>
      </div>
    </div>
  );
}

function Metric({ label, value, ok, t }: { label: string; value: string | number; ok: boolean; t: (key: string) => string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(9,11,17,0.94))] px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/44">{label}</div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
      <div className={cn("mt-1 text-[10px] uppercase tracking-[0.14em]", ok ? "text-emerald-300/70" : "text-rose-300/70")}>
        {ok ? t("frontline.ready") : t("frontline.missing")}
      </div>
    </div>
  );
}

function ResultMetric({ label, value, finalValue, icon }: { label: string; value: number; finalValue?: number; icon?: ProgressionIconName }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/42">
        {icon ? <ProgressionIcon name={icon} size="sm" /> : null}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
      {typeof finalValue === "number" ? (
        <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/40">final {finalValue}</div>
      ) : null}
    </div>
  );
}
