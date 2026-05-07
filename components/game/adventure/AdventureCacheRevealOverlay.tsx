"use client";

import { type AdventureMapInteractionOpenResult } from "@/features/adventure/mapInteractions";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { SceneButton, ScreenBadge } from "@/components/game/screens/ScreenChrome";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  RewardChip,
  buildRewardChipsFromRewards,
  getLootTierLabel,
  getLootTierTone,
} from "./AdventureMissionPanelParts";

export function AdventureCacheRevealOverlay({
  result,
  onClose,
}: {
  result: AdventureMapInteractionOpenResult;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const rewardChips = buildRewardChipsFromRewards(result.rewards, false, t);
  const tierTone = getLootTierTone(result.lootTier);

  return (
    <div className="pointer-events-auto fixed inset-0 z-[95] grid place-items-center bg-black/58 px-4 backdrop-blur-sm">
      <div className="frontline-motion-reward relative w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-[34px] border border-[#f5d498]/24 bg-[linear-gradient(180deg,rgba(53,35,13,0.94),rgba(7,8,13,0.96))] p-5 text-center shadow-[0_28px_90px_rgba(0,0,0,0.58)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,196,81,0.24),transparent_32%),radial-gradient(circle_at_50%_58%,rgba(255,231,164,0.1),transparent_46%)]" />
        <div className="pointer-events-none absolute inset-x-10 top-3 h-px bg-[linear-gradient(90deg,transparent,rgba(255,232,170,0.58),transparent)]" />
        <div className="relative">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[28px] border border-[#f5d498]/24 bg-[linear-gradient(180deg,rgba(245,196,81,0.18),rgba(9,8,12,0.84))] shadow-[0_16px_34px_rgba(0,0,0,0.42)]">
            <ProgressionIcon name="reward_chest" size="xl" className="h-24 w-24" />
          </div>
          <div className="mt-4 flex justify-center">
            <ScreenBadge tone={tierTone}>{getLootTierLabel(result.lootTier, t)}</ScreenBadge>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">{result.lootTitle}</h2>
          <p className="mx-auto mt-2 max-w-[34rem] text-sm leading-6 text-white/62">{t("adventure.cacheRevealBody")}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {rewardChips.map((chip) => (
              <RewardChip key={`${chip.label}-${chip.value}`} {...chip} compact={false} />
            ))}
          </div>
          <SceneButton onClick={onClose} className="mt-6 px-6 py-3">
            {t("common.continue")}
          </SceneButton>
        </div>
      </div>
    </div>
  );
}
