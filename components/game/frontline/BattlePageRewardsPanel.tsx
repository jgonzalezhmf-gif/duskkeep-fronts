"use client";

import type { Rewards } from "@/lib/types";
import { useI18n } from "@/lib/i18n/useI18n";
import { Panel, RewardPreview } from "./BattlePagePanels";

export function BattlePageRewardsPanel({
  rewardPreview,
  adventureLevelActive,
}: {
  rewardPreview: Rewards;
  adventureLevelActive: boolean;
}) {
  const { t } = useI18n();
  const shouldRender =
    !adventureLevelActive || Boolean(rewardPreview.frontlineCards?.length) || Boolean(rewardPreview.adventureKeys);

  if (!shouldRender) return null;

  return (
    <Panel title={t("frontline.rewards")}>
      <div className="grid grid-cols-2 gap-2">
        {!adventureLevelActive ? (
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
  );
}
