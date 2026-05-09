"use client";

import type { FrontlineBossConfig, FrontlineCardDef, FrontlinePreset } from "@/features/frontline/types";
import type { Rewards } from "@/lib/types";
import { BattlePageBossSignaturesPanel } from "./BattlePageBossSignaturesPanel";
import { BattlePageEnemySelector } from "./BattlePageEnemySelector";
import { BattlePageEnemyTricksPanel } from "./BattlePageEnemyTricksPanel";
import { BattlePageResultPanel, type BattlePageResultContext } from "./BattlePageResultPanel";
import { BattlePageRewardsPanel } from "./BattlePageRewardsPanel";

type RewardRevealState = {
  gold: number;
  dust: number;
  gems: number;
  accountXp: number;
  adventureKeys: number;
  progress: number;
};

export function BattlePageSetupSidebar({
  presets,
  selectedPresetId,
  onSelectEnemy,
  adventureLevelActive,
  bossConfig,
  enemyCards,
  rewardPreview,
  resultContext,
  rewardReveal,
  animatedAccountProgress,
  onRunItBack,
}: {
  presets: FrontlinePreset[];
  selectedPresetId: string;
  onSelectEnemy: (presetId: string) => void;
  adventureLevelActive: boolean;
  bossConfig: FrontlineBossConfig | null;
  enemyCards: FrontlineCardDef[];
  rewardPreview: Rewards;
  resultContext: BattlePageResultContext | null;
  rewardReveal: RewardRevealState;
  animatedAccountProgress: number;
  onRunItBack: () => void;
}) {
  return (
    <div className="grid gap-4 content-start">
      {!adventureLevelActive ? (
        <BattlePageEnemySelector presets={presets} selectedPresetId={selectedPresetId} onSelect={onSelectEnemy} />
      ) : null}

      <BattlePageBossSignaturesPanel bossConfig={bossConfig} />

      <BattlePageEnemyTricksPanel cards={enemyCards} />

      <BattlePageRewardsPanel rewardPreview={rewardPreview} adventureLevelActive={adventureLevelActive} />

      {resultContext ? (
        <BattlePageResultPanel
          resultContext={resultContext}
          rewardReveal={rewardReveal}
          animatedAccountProgress={animatedAccountProgress}
          adventureLevelActive={adventureLevelActive}
          onRunItBack={onRunItBack}
        />
      ) : null}
    </div>
  );
}
