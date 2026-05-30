"use client";

import {
  type AdventureMapInteractionClaim,
  type AdventureMapInteractionDefinition,
  type AdventureMapInteractionOpenResult,
  type AdventureMapInteractionStatus,
} from "@/features/adventure/mapInteractions";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { PendingActionLabel } from "@/components/game/shared/PendingActionFeedback";
import { SceneButton, ScreenBadge, ScreenPanel } from "@/components/game/screens/ScreenChrome";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  MissionFact,
  RewardChip,
  buildRewardChipsFromRewards,
  formatInteractionResetRemaining,
  getInteractionCta,
  getInteractionStatusLabel,
  getLootTierLabel,
  getLootTierTone,
} from "./AdventureMissionPanelParts";

export function AdventureMapInteractionPanel({
  interaction,
  status,
  resources,
  claimedResult,
  persistedClaim,
  expanded = false,
  pending = false,
  onToggleExpanded,
  onClaim,
}: {
  interaction: AdventureMapInteractionDefinition;
  status: AdventureMapInteractionStatus;
  resources: { adventureKeys: number };
  claimedResult?: AdventureMapInteractionOpenResult | null;
  persistedClaim?: AdventureMapInteractionClaim;
  expanded?: boolean;
  pending?: boolean;
  onToggleExpanded?: () => void;
  onClaim: () => void;
}) {
  const { t } = useI18n();
  const revealedRewards = claimedResult?.rewards ?? persistedClaim?.rewards ?? null;
  const rewardChips = revealedRewards ? buildRewardChipsFromRewards(revealedRewards, false, t) : [];
  const lootTier = claimedResult?.lootTier ?? persistedClaim?.lootTier ?? null;
  const lootTitle = claimedResult?.lootTitle ?? persistedClaim?.lootTitle ?? null;
  const statusLabel = getInteractionStatusLabel(status, t);
  const cta = getInteractionCta(interaction, status, t);
  const resetHint =
    status === "claimed" && persistedClaim?.resetAvailableAt
      ? t("adventure.cacheResetsIn", { time: formatInteractionResetRemaining(persistedClaim.resetAvailableAt) })
      : null;

  return (
    <ScreenPanel className="pointer-events-none overflow-hidden border-[#f5d498]/14 bg-[linear-gradient(180deg,rgba(20,15,8,0.76),rgba(6,8,12,0.88))] p-0 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-xl">
      <div className="relative p-2.5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(245,196,81,0.2),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(143,213,255,0.08),transparent_26%)]" />
        <div className="relative grid items-center gap-2 md:grid-cols-[minmax(18rem,1fr)_auto_auto_auto]">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-[#f5d498]/18 bg-[linear-gradient(180deg,rgba(245,196,81,0.18),rgba(11,8,5,0.82))] shadow-[0_10px_24px_rgba(0,0,0,0.32)]">
              <ProgressionIcon name="reward_chest" size="lg" className="h-11 w-11" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <ScreenBadge tone={status === "ready" ? "gold" : status === "claimed" ? "emerald" : "neutral"}>{statusLabel}</ScreenBadge>
                <ScreenBadge tone="sky">{t("adventure.mapCache")}</ScreenBadge>
              </div>
              <h2 className="mt-1 truncate text-[1.05rem] font-black leading-tight text-white md:text-[1.2rem]">{lootTitle ?? interaction.title}</h2>
              {resetHint ? <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#f5d498]/62">{resetHint}</p> : null}
            </div>
          </div>

          <MissionFact
            label={t("adventure.keyCost")}
            value={`${interaction.keyCost} / ${resources.adventureKeys ?? 0}`}
            icon="adventure_key"
          />

          <div className="min-w-0">
            {revealedRewards && rewardChips[0] ? (
              <RewardChip key={`${rewardChips[0].label}-${rewardChips[0].value}`} compact {...rewardChips[0]} />
            ) : (
              <div className="rounded-[15px] border border-[#f5d498]/16 bg-[#100c06]/54 px-3 py-2">
                <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#f5d498]/58">{t("adventure.rewardOutlook")}</div>
                <div className="mt-1 text-[12px] font-black uppercase tracking-[0.08em] text-[#ffe6a8]">{t("adventure.mysteryCache")}</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SceneButton onClick={onClaim} disabled={cta.disabled || pending} className="pointer-events-auto min-w-[10rem] px-4 py-2.5">
              <PendingActionLabel pending={pending} pendingLabel={t("adventure.openingCache")}>
                {cta.label}
              </PendingActionLabel>
            </SceneButton>
            <button
              type="button"
              onClick={onToggleExpanded}
              className="pointer-events-auto rounded-full border border-white/12 bg-white/[0.045] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/68 transition hover:border-[#f5d498]/28 hover:text-[#f5d498]"
            >
              {expanded ? t("options.close") : "Details"}
            </button>
          </div>
        </div>

        {expanded ? (
          <div className="relative mt-2 grid gap-2 border-t border-white/10 pt-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-[16px] border border-white/10 bg-black/18 p-2.5">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/44">{t("adventure.objective")}</div>
              <p className="mt-1 text-[11px] leading-4 text-white/62">{interaction.description}</p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-black/18 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/44">{t("adventure.rewardOutlook")}</div>
                {lootTier ? <ScreenBadge tone={getLootTierTone(lootTier)}>{getLootTierLabel(lootTier, t)}</ScreenBadge> : null}
              </div>
              {revealedRewards ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rewardChips.map((chip) => (
                    <RewardChip key={`${chip.label}-${chip.value}`} compact {...chip} />
                  ))}
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    <ScreenBadge tone="neutral">{t("adventure.lootCommon")}</ScreenBadge>
                    <ScreenBadge tone="sky">{t("adventure.lootRare")}</ScreenBadge>
                    <ScreenBadge tone="ember">{t("adventure.lootEpic")}</ScreenBadge>
                    <ScreenBadge tone="gold">{t("adventure.lootLegendary")}</ScreenBadge>
                  </div>
                  <p className="text-[10px] leading-4 text-white/48">{t("adventure.cacheUnknownHint")}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ScreenPanel>
  );
}
