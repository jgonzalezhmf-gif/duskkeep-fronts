"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BattlePageBattleView } from "@/components/game/frontline/BattlePageBattleView";
import { BattlePageLaunchPanel } from "@/components/game/frontline/BattlePageLaunchPanel";
import { BattlePageMatchupPanel } from "@/components/game/frontline/BattlePageMatchupPanel";
import { BattlePagePackagePanel } from "@/components/game/frontline/BattlePagePackagePanel";
import { BattlePageSetupHero } from "@/components/game/frontline/BattlePageSetupHero";
import { BattlePageSetupLayout } from "@/components/game/frontline/BattlePageSetupLayout";
import { BattlePageSetupSidebar } from "@/components/game/frontline/BattlePageSetupSidebar";
import { useBattlePageLoadoutPreview } from "@/components/game/frontline/useBattlePageLoadoutPreview";
import { useBattlePageRewardReveal } from "@/components/game/frontline/useBattlePageRewardReveal";
import { FRONTLINE_PRESETS } from "@/features/frontline/data";
import {
  getAdventureLevelForFrontline,
  getFrontlineAdventureRewardPreview,
  getFrontlineAdventureVictoryRewards,
} from "@/features/frontline/adventure";
import { summarizeBattleStats } from "@/lib/frontlineBattleStats";
import { audio } from "@/lib/audio";
import { frontlinePresetName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import type { FrontlineBattleState } from "@/features/frontline/types";
import type { Rewards } from "@/lib/types";
import { getFrontlineBattleBackgroundSrc } from "@/components/game/frontline/frontlineVisualAssets";
import {
  accountProgressPercent,
  deriveEncounterBadge,
  encounterModifiers,
  projectAccountProgress,
  resolveBattleBackgroundKey,
  resolveForcedEnemyPresetId,
  resolveSelectedEnemyPreset,
} from "@/components/game/frontline/frontlineBattlePageLogic";
import type { BattlePageResultContext } from "@/components/game/frontline/BattlePageResultPanel";
import { getFrontlineEnemyLeaderPortraitForPreset } from "@/lib/frontlineLeaderPortraitAssets";

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
  const forcedPresetId = resolveForcedEnemyPresetId({
    adventureLevel,
    enemyPresetId,
    presets: FRONTLINE_PRESETS,
  });
  const [phase, setPhase] = useState<BattlePhase>("setup");
  const [selectedEnemyPresetId, setSelectedEnemyPresetId] = useState(forcedPresetId ?? FRONTLINE_PRESETS[0].id);
  const [battleSeed, setBattleSeed] = useState(1);
  const [resultContext, setResultContext] = useState<BattlePageResultContext | null>(null);
  const { rewardReveal, resetRewardReveal } = useBattlePageRewardReveal({
    active: phase === "result",
    resultContext,
  });

  const selectedPreset = useMemo(
    () => resolveSelectedEnemyPreset({ forcedPresetId, selectedEnemyPresetId, presets: FRONTLINE_PRESETS }),
    [forcedPresetId, selectedEnemyPresetId],
  );
  const animatedAccountProgress = resultContext
    ? accountProgressPercent(resultContext.accountAfter.level, resultContext.accountAfter.xp)
    : 0;
  const squadReady = frontlineLoadout.squad.filter(Boolean).length === 3;
  const deckReady = frontlineLoadout.deck.filter(Boolean).length === 8;
  const {
    allyHeroProfiles,
    allyCardProfiles,
    allySupportProfiles,
    allyHeroes,
    allyCards,
    enemyHeroes,
    enemyCards,
    bossConfig,
    allyPower,
    enemyPower,
  } = useBattlePageLoadoutPreview({
    frontlineLoadout,
    playerHeroes,
    frontlineCardLevels,
    selectedPreset,
  });
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
    resetRewardReveal();
  }, [deckReady, nextSeed, resetRewardReveal, squadReady]);

  useEffect(() => {
    if (autostart && phase === "setup" && squadReady && deckReady) {
      startBattle();
    }
  }, [autostart, deckReady, phase, squadReady, startBattle]);

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
      <BattlePageBattleView
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
    );
  }

  return (
    <BattlePageSetupLayout
      hero={
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
      }
      launch={
        <BattlePageLaunchPanel
          squadReady={squadReady}
          deckReady={deckReady}
          adventureLevelActive={Boolean(adventureLevel)}
          rewardPreview={rewardPreview}
          onStart={startBattle}
        />
      }
      main={
        <div className="grid gap-4">
          <BattlePageMatchupPanel allyHeroes={allyHeroes} enemyHeroes={enemyHeroes} />

          <BattlePagePackagePanel cards={allyCards} />
        </div>
      }
      sidebar={
        <BattlePageSetupSidebar
          presets={FRONTLINE_PRESETS}
          selectedPresetId={selectedPreset.id}
          onSelectEnemy={setSelectedEnemyPresetId}
          adventureLevelActive={Boolean(adventureLevel)}
          bossConfig={bossConfig}
          enemyCards={enemyCards}
          rewardPreview={rewardPreview}
          resultContext={phase === "result" ? resultContext : null}
          rewardReveal={rewardReveal}
          animatedAccountProgress={animatedAccountProgress}
          onRunItBack={startBattle}
        />
      }
    />
  );
}
