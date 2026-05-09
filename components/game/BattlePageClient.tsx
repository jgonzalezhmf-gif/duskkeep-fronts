"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FrontlineBattle from "@/components/game/frontline/FrontlineBattle";
import { BattlePageEnemySelector } from "@/components/game/frontline/BattlePageEnemySelector";
import { BattlePageEnemyTricksPanel } from "@/components/game/frontline/BattlePageEnemyTricksPanel";
import { BattlePageLaunchPanel } from "@/components/game/frontline/BattlePageLaunchPanel";
import { BattlePageSetupHero } from "@/components/game/frontline/BattlePageSetupHero";
import {
  FRONTLINE_CARD_BY_ID,
  FRONTLINE_PRESETS,
  FRONTLINE_UNIT_BY_ID,
} from "@/features/frontline/data";
import {
  getAdventureLevelForFrontline,
  getFrontlineAdventureRewardPreview,
  getFrontlineAdventureVictoryRewards,
  getFrontlinePresetForAdventure,
} from "@/features/frontline/adventure";
import { getFrontlineBoss } from "@/features/frontline/bosses";
import { summarizeBattleStats } from "@/lib/frontlineBattleStats";
import type { FrontlineEncounterBadgeKind } from "@/components/game/frontline/FrontlineBattle";
import { audio } from "@/lib/audio";
import { frontlinePresetName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import type { FrontlineBattleState } from "@/features/frontline/types";
import type { Rewards } from "@/lib/types";
import { FrontlineCardView } from "@/components/game/frontline/FrontlineVisualPrimitives";
import { getFrontlineBattleBackgroundSrc } from "@/components/game/frontline/frontlineVisualAssets";
import {
  accountProgressPercent,
  deriveEncounterBadge,
  encounterModifiers,
  projectAccountProgress,
  resolveBattleBackgroundKey,
} from "@/components/game/frontline/frontlineBattlePageLogic";
import { BattlePageMatchupGrid } from "@/components/game/frontline/BattlePageMatchup";
import { BossSignaturePreview, EmptyCard, Panel, RewardPreview } from "@/components/game/frontline/BattlePagePanels";
import { BattlePageResultPanel, type BattlePageResultContext } from "@/components/game/frontline/BattlePageResultPanel";
import { getFrontlineEnemyLeaderPortraitForPreset } from "@/lib/frontlineLeaderPortraitAssets";
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
  const [resultContext, setResultContext] = useState<BattlePageResultContext | null>(null);
  const [rewardReveal, setRewardReveal] = useState({ gold: 0, dust: 0, gems: 0, accountXp: 0, adventureKeys: 0, progress: 0 });

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
  const bossConfig = useMemo(() => getFrontlineBoss(selectedPreset.bossId), [selectedPreset.bossId]);
  const allyPower = allyHeroes.reduce((sum, hero) => sum + (hero ? hero.maxHp + hero.atk * 3 + hero.def * 2 + hero.speed : 0), 0);
  const enemyPower = enemyHeroes.reduce((sum, hero) => sum + (hero ? hero.maxHp + hero.atk * 3 + hero.def * 2 + hero.speed : 0), 0);
  const rewardPreview: Rewards = adventureLevel
    ? getFrontlineAdventureRewardPreview(adventureLevel, adventureProgress[adventureLevel.id])
    : selectedPreset.rewardSeed;
  const selectedPresetName = frontlinePresetName(t, selectedPreset);

  useEffect(() => {
    if (phase === "battle") {
      audio.setTheme(selectedPreset.bossId ? "boss" : "battle");
      return;
    }
    if (phase === "result") {
      audio.setTheme("postbattle");
      return;
    }
    if (adventureLevel) {
      audio.setTheme("adventure");
      return;
    }
    audio.setTheme("prebattle");
  }, [adventureLevel, phase, selectedPreset.bossId]);

  const startBattle = useCallback(() => {
    if (!squadReady || !deckReady) return;
    setBattleSeed(nextSeed());
    setPhase("battle");
    setResultContext(null);
    setRewardReveal({ gold: 0, dust: 0, gems: 0, accountXp: 0, adventureKeys: 0, progress: 0 });
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
        adventureKeys: Math.round(resultContext.rewards.adventureKeys * ratio),
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

    let firstClearAchieved = false;
    if (adventureLevel) {
      if (won) {
        const { firstClear } = markAdventureCleared(adventureLevel.id);
        firstClearAchieved = firstClear;
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
      adventureKeys: rewards.adventureKeys ?? 0,
      frontlineCards: rewards.frontlineCards ?? [],
    };
    const resourcesBefore = { gold: resources.gold, dust: resources.dust, gems: resources.gems };
    const resourcesAfter = {
      gold: resourcesBefore.gold + normalizedRewards.gold,
      dust: resourcesBefore.dust + normalizedRewards.dust,
      gems: resourcesBefore.gems + normalizedRewards.gems,
    };
    const accountBefore = { level: account.level, xp: account.xp };
    const accountAfter = projectAccountProgress(account.level, account.xp, normalizedRewards.accountXp);

    setResultContext({
      winner,
      enemyName: selectedPresetName,
      enemyPortraitSrc: getFrontlineEnemyLeaderPortraitForPreset(selectedPreset),
      rounds: battleState.round,
      allyCoreHp: battleState.allyCoreHp,
      enemyCoreHp: battleState.enemyCoreHp,
      rewards: normalizedRewards,
      resourcesBefore,
      resourcesAfter,
      accountBefore,
      accountAfter,
      stats: summarizeBattleStats(battleState),
      firstClear: firstClearAchieved,
      adventureName: adventureLevel?.name ?? null,
    });
    recordBattleResult(won, adventureLevel ? "adventure" : "vsai");
    if (rewards.gold || rewards.dust || rewards.gems || rewards.accountXp || rewards.xp || rewards.arenaTickets || rewards.adventureKeys || rewards.shards?.length || rewards.frontlineCards?.length) {
      awardRewards(rewards, won && adventureLevel ? adventureLevel.name : won ? t("frontline.victory") : winner === "draw" ? t("frontline.draw") : t("frontline.defeat"));
    }
    if (firstClearAchieved) {
      // Layered sting after the standard victory chime so it actually feels like a milestone.
      window.setTimeout(() => audio.playStinger("victory"), 720);
    }
    setPhase("result");
  }

  if (phase === "battle") {
    const encounterKind = deriveEncounterBadge(adventureLevel);
    const modifiers = encounterModifiers(encounterKind);
    const battleBackgroundSrc = getFrontlineBattleBackgroundSrc(
      resolveBattleBackgroundKey(adventureLevel, encounterKind, selectedPreset.bossId),
    );
    return (
      <div className="mx-auto flex w-full max-w-[1840px] flex-col gap-3 px-2 pb-3 pt-2 md:px-3 md:pb-4 md:pt-3 xl:px-4">
        <FrontlineBattle
          seed={battleSeed}
          loadout={frontlineLoadout}
          enemyPresetId={selectedPreset.id}
          allyHeroProfiles={allyHeroProfiles}
          allyCardProfiles={allyCardProfiles}
          allySupportProfiles={allySupportProfiles}
          modifiers={modifiers}
          encounterKind={encounterKind}
          encounterTitle={adventureLevel?.name ?? null}
          battleBackgroundSrc={battleBackgroundSrc}
          onFinished={(winner, battleState) => finishBattle(winner, battleState)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-3 pb-24 pt-20 md:px-6 md:pb-28 md:pt-24 xl:px-8">
      <section className="relative isolate overflow-hidden rounded-[40px] border border-[#f5d498]/14 bg-[radial-gradient(circle_at_16%_8%,rgba(245,196,81,0.2),transparent_24%),radial-gradient(circle_at_80%_14%,rgba(240,95,114,0.18),transparent_27%),linear-gradient(135deg,rgba(55,34,19,0.94),rgba(14,19,29,0.97)_44%,rgba(5,7,12,0.99)_100%)] shadow-[0_38px_96px_rgba(0,0,0,0.46)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.06),transparent_21%,rgba(0,0,0,0.22)_80%),radial-gradient(ellipse_at_50%_54%,rgba(156,100,51,0.24),transparent_44%)]" />
        <div className="pointer-events-none absolute inset-x-[4%] top-[21%] h-[28rem] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_50%,rgba(245,196,81,0.16),rgba(105,72,36,0.2)_34%,transparent_72%)] blur-sm" />
        <div className="pointer-events-none absolute left-[10%] top-16 h-36 w-36 rounded-full bg-[#65d2c8]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[14%] top-12 h-44 w-44 rounded-full bg-[#f05f72]/12 blur-3xl" />
        <div className="relative z-[1] px-4 py-5 md:px-6 md:py-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <BattlePageSetupHero
              adventureChapter={adventureLevel?.chapter ?? null}
              title={adventureLevel ? adventureLevel.name : t("frontline.chooseFronts")}
              squadCount={frontlineLoadout.squad.filter(Boolean).length}
              deckCount={frontlineLoadout.deck.filter(Boolean).length}
              squadReady={squadReady}
              deckReady={deckReady}
              allyPower={allyPower}
              enemyPower={enemyPower}
              enemyHeroes={enemyHeroes}
              selectedPresetId={selectedPreset.id}
            />

            <BattlePageLaunchPanel
              squadReady={squadReady}
              deckReady={deckReady}
              adventureLevelActive={Boolean(adventureLevel)}
              rewardPreview={rewardPreview}
              onStart={startBattle}
            />
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="grid gap-4">
              <Panel title={t("frontline.frontlineMatchup")} variant="stage">
                <BattlePageMatchupGrid allyHeroes={allyHeroes} enemyHeroes={enemyHeroes} />
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
              {!adventureLevel ? (
                <BattlePageEnemySelector
                  presets={FRONTLINE_PRESETS}
                  selectedPresetId={selectedPreset.id}
                  onSelect={setSelectedEnemyPresetId}
                />
              ) : null}

              {bossConfig ? (
                <Panel title={t("frontline.bossSignaturesTitle")} variant="enemy">
                  <div className="grid gap-2">
                    {bossConfig.signatures.map((signature, index) => (
                      <BossSignaturePreview key={`sig-${index}-${signature.type}`} signature={signature} />
                    ))}
                  </div>
                </Panel>
              ) : null}

              <BattlePageEnemyTricksPanel cards={enemyCards} />

              {!adventureLevel || rewardPreview.frontlineCards?.length || rewardPreview.adventureKeys ? (
                <Panel title={t("frontline.rewards")}>
                  <div className="grid grid-cols-2 gap-2">
                    {!adventureLevel ? (
                      <>
                        <RewardPreview label={t("resources.gold")} value={rewardPreview.gold ?? 0} icon="gold" tone="gold" />
                        <RewardPreview label={t("resources.dust")} value={rewardPreview.dust ?? 0} icon="dust" tone="dust" />
                        <RewardPreview label={t("resources.gems")} value={rewardPreview.gems ?? 0} icon="gems" tone="gems" />
                        <RewardPreview label="XP" value={rewardPreview.accountXp ?? 0} progressionIcon="level_up" tone="xp" />
                      </>
                    ) : null}
                    {rewardPreview.frontlineCards?.length ? (
                      <RewardPreview label={t("frontline.cardUnlocks")} value={rewardPreview.frontlineCards.length} progressionIcon="unlock" tone="card" />
                    ) : null}
                    {rewardPreview.adventureKeys ? (
                      <RewardPreview label={t("resources.adventureKeys")} value={rewardPreview.adventureKeys} progressionIcon="reward_chest" tone="card" />
                    ) : null}
                  </div>
                </Panel>
              ) : null}

              {phase === "result" && resultContext ? (
                <BattlePageResultPanel
                  resultContext={resultContext}
                  rewardReveal={rewardReveal}
                  animatedAccountProgress={animatedAccountProgress}
                  adventureLevelActive={Boolean(adventureLevel)}
                  onRunItBack={startBattle}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
