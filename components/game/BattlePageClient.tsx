"use client";

import { useCallback, useEffect, useState } from "react";
import { BattlePageBattleView } from "@/components/game/frontline/BattlePageBattleView";
import { BattlePageLaunchPanel } from "@/components/game/frontline/BattlePageLaunchPanel";
import { BattlePageMatchupPanel } from "@/components/game/frontline/BattlePageMatchupPanel";
import { BattlePagePackagePanel } from "@/components/game/frontline/BattlePagePackagePanel";
import { BattlePageSetupHero } from "@/components/game/frontline/BattlePageSetupHero";
import { BattlePageSetupLayout } from "@/components/game/frontline/BattlePageSetupLayout";
import { BattlePageSetupSidebar } from "@/components/game/frontline/BattlePageSetupSidebar";
import { useBattlePageEnemySelection } from "@/components/game/frontline/useBattlePageEnemySelection";
import { useBattlePageLoadoutPreview } from "@/components/game/frontline/useBattlePageLoadoutPreview";
import { useBattlePageRewardReveal } from "@/components/game/frontline/useBattlePageRewardReveal";
import { FRONTLINE_PRESETS } from "@/features/frontline/data";
import {
  getFrontlineAdventureRewardPreview,
} from "@/features/frontline/adventure";
import { createFrontlineBattleSummary } from "@/features/frontline/battleSummary";
import { summarizeBattleStats } from "@/lib/frontlineBattleStats";
import { audio } from "@/lib/audio";
import { frontlinePresetName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { isServerAuthoritativePersistenceEnabled } from "@/lib/persistedGameState";
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
} from "@/components/game/frontline/frontlineBattlePageLogic";
import { shouldPersistBattleOutcome, shouldRecordLocalBattleOutcome } from "@/components/game/frontline/frontlineBattleRewardPolicy";
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
  const claimAdventureBattleResultOnlineFirst = useGameStore((state) => state.claimAdventureBattleResultOnlineFirst);
  const account = useGameStore((state) => state.account);
  const accountLinkMode = useGameStore((state) => state.accountLinkMode);
  const resources = useGameStore((state) => state.resources);
  const playerHeroes = useGameStore((state) => state.heroes);
  const frontlineCardLevels = useGameStore((state) => state.frontlineCardLevels);
  const adventureProgress = useGameStore((state) => state.adventureProgress);

  const {
    adventureLevel,
    selectedEnemyPresetId,
    setSelectedEnemyPresetId,
    selectedPreset,
  } = useBattlePageEnemySelection({
    adventureLevelId,
    enemyPresetId,
  });
  const [phase, setPhase] = useState<BattlePhase>("setup");
  const [battleSeed, setBattleSeed] = useState(1);
  const [resultContext, setResultContext] = useState<BattlePageResultContext | null>(null);
  const { rewardReveal, resetRewardReveal } = useBattlePageRewardReveal({
    active: phase === "result",
    resultContext,
  });

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

  async function finishBattle(winner: "ally" | "enemy" | "draw", battleState: FrontlineBattleState) {
    const won = winner === "ally";
    let rewards: Rewards =
      won
        ? selectedPreset.rewardSeed
        : winner === "draw"
          ? { gold: 50, dust: 6, gems: 0, accountXp: 3 }
          : { gold: 35, dust: 4, gems: 0, accountXp: 2 };

    let firstClearAchieved = false;
    let rewardsAppliedByAdventureClaim = false;
    let adventureClaimSucceeded = !adventureLevel;
    let authoritativeResourcesAfter: { gold: number; dust: number; gems: number } | null = null;
    if (adventureLevel) {
      const claim = await claimAdventureBattleResultOnlineFirst({
        levelId: adventureLevel.id,
        battleSeed: battleState.seed,
        winner,
        turns: battleState.round,
        battleSummary: createFrontlineBattleSummary(battleState),
      });
      if (claim) {
        rewards = claim.rewards;
        firstClearAchieved = claim.firstClear;
        rewardsAppliedByAdventureClaim = true;
        adventureClaimSucceeded = true;
        authoritativeResourcesAfter = claim.resources
          ? {
              gold: claim.resources.gold,
              dust: claim.resources.dust,
              gems: claim.resources.gems,
            }
          : null;
      } else {
        rewards = { gold: 0, dust: 0, gems: 0, accountXp: 0 };
      }
    }
    const serverPersistenceEnabled = isServerAuthoritativePersistenceEnabled();
    const shouldPersistOutcome = shouldPersistBattleOutcome({
      accountLinkMode,
      adventureLevelActive: Boolean(adventureLevel),
      adventureClaimSucceeded,
      serverPersistenceEnabled,
    });
    const shouldRecordLocalOutcome = shouldPersistOutcome && shouldRecordLocalBattleOutcome({ accountLinkMode, serverPersistenceEnabled });
    if (!shouldPersistOutcome) {
      rewards = {};
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
      gold: authoritativeResourcesAfter?.gold ?? resourcesBefore.gold + normalizedRewards.gold,
      dust: authoritativeResourcesAfter?.dust ?? resourcesBefore.dust + normalizedRewards.dust,
      gems: authoritativeResourcesAfter?.gems ?? resourcesBefore.gems + normalizedRewards.gems,
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
    if (shouldRecordLocalOutcome) recordBattleResult(won, adventureLevel ? "adventure" : "vsai");
    if (!rewardsAppliedByAdventureClaim && (rewards.gold || rewards.dust || rewards.gems || rewards.accountXp || rewards.xp || rewards.arenaTickets || rewards.adventureKeys || rewards.shards?.length || rewards.frontlineCards?.length)) {
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
        onFinished={(winner, battleState) => {
          void finishBattle(winner, battleState);
        }}
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
