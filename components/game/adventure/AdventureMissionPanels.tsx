"use client";

import type { Rewards } from "@/lib/types";
import {
  type AdventureMapInteractionClaim,
  type AdventureMapInteractionDefinition,
  type AdventureMapInteractionOpenResult,
  type AdventureMapInteractionStatus,
} from "@/features/adventure/mapInteractions";
import { getFrontlineAdventureSquad, getFrontlinePresetForAdventure } from "@/features/frontline/adventure";
import {
  getAdventureNodeDefinition,
  getAdventureNodeRewardPreview,
  isAdventureClaimed,
  isAdventureCombatNode,
  type AdventureNodeDefinition,
  type AdventureProgressEntry,
} from "@/features/adventure/nodeResolution";
import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import { getFrontlineEnemyLeaderPortraitForPreset } from "@/lib/frontlineLeaderPortraitAssets";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { frontlinePresetName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { SceneButton, ScreenBadge, ScreenPanel } from "@/components/game/screens/ScreenChrome";
import type { AdventureCampaignMeta, AdventureNodeState, TranslateFn } from "./AdventureCampaignTypes";
import {
  EnemyCommanderRow,
  EnemyRow,
  MissionFact,
  MissionNodeAssetBadge,
  RewardChip,
  buildRewardChipsFromRewards,
  formatInteractionResetRemaining,
  getInteractionCta,
  getInteractionStatusLabel,
  getLootTierLabel,
  getLootTierTone,
  getMissionCta,
  getMissionObjective,
  getMissionStatusLabel,
  getNodeTypeLabel,
  getRepeatPolicyLabel,
} from "./AdventureMissionPanelParts";

export function AdventureMissionPanel({
  meta,
  node,
  totalNodes,
  nodeDefinition,
  progress,
  claimedRewards,
  expanded = false,
  onToggleExpanded,
  onOpenBattle,
}: {
  meta: AdventureCampaignMeta;
  node: AdventureNodeState;
  totalNodes: number;
  nodeDefinition?: AdventureNodeDefinition;
  progress?: AdventureProgressEntry;
  claimedRewards?: Rewards | null;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  onOpenBattle: () => void;
}) {
  const { t } = useI18n();
  const definition = nodeDefinition ?? getAdventureNodeDefinition(node.lvl);
  const nodeType = definition.type;
  const nodeClaimed = isAdventureClaimed(nodeType, progress) || node.claimed;
  const combatNode = isAdventureCombatNode(nodeType);
  const firstClearAvailable = node.firstClearAvailable && !nodeClaimed;
  const tone =
    node.locked || nodeType === "locked"
      ? "neutral"
      : nodeClaimed || node.cleared
        ? "emerald"
        : nodeType === "boss"
          ? "ember"
          : nodeType === "elite" || nodeType === "danger"
            ? "sky"
            : "gold";
  const statusLabel = getMissionStatusLabel(node, definition, progress, firstClearAvailable, t);
  const frontlineSquad = getFrontlineAdventureSquad(node.lvl);
  const frontlinePreset = combatNode ? getFrontlinePresetForAdventure(node.lvl) : null;
  const enemyLeaderPortrait = getFrontlineEnemyLeaderPortraitForPreset(frontlinePreset);
  const enemyTotal = frontlineSquad.reduce((sum, enemy) => sum + enemy.maxHp + enemy.atk * 2 + enemy.def * 2 + enemy.tier * 6, 0);
  const objective = getMissionObjective(node, definition, t);
  const rewardPreview = claimedRewards ?? getAdventureNodeRewardPreview(node.lvl, progress);
  const rewardChips = buildRewardChipsFromRewards(rewardPreview, firstClearAvailable, t);
  const primaryReward = rewardChips[0];
  const cta = getMissionCta(node, definition, progress, t);
  const showEnemyFormation = combatNode;

  return (
    <ScreenPanel className="pointer-events-none overflow-hidden border-[#f5d498]/14 bg-[linear-gradient(180deg,rgba(12,15,22,0.74),rgba(6,8,12,0.88))] p-0 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-xl">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(245,196,81,0.14),transparent_22%),radial-gradient(circle_at_88%_0%,rgba(143,213,255,0.1),transparent_20%)]" />
        <div className="relative p-2.5">
          <div className="grid items-center gap-2 md:grid-cols-[minmax(17rem,1fr)_auto_auto_auto]">
            <div className="flex min-w-0 items-center gap-2.5">
              <MissionNodeAssetBadge nodeType={nodeType} locked={node.locked || nodeType === "locked"} claimed={nodeClaimed || node.cleared} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <ScreenBadge tone={tone}>{statusLabel}</ScreenBadge>
                  <ScreenBadge tone="sky">{getNodeTypeLabel(nodeType)}</ScreenBadge>
                  {combatNode ? <ScreenBadge tone="sky">{t("adventure.power")} {node.lvl.recommendedPower}</ScreenBadge> : null}
                </div>
                <h2 className="mt-1 truncate text-[1.05rem] font-black leading-tight text-white md:text-[1.2rem]">{node.lvl.name}</h2>
              </div>
            </div>

            <div className="grid gap-1.5 md:min-w-[8rem]">
              <MissionFact
                label={combatNode ? t("adventure.enemySquadPower") : t("adventure.nodeAction")}
                value={combatNode ? `${enemyTotal}` : nodeClaimed ? t("adventure.claimedNode") : t("adventure.noCombat")}
                icon={combatNode ? "power" : "rewards"}
              />
            </div>

            <div className="min-w-0">
              {primaryReward ? (
                <RewardChip key={`${primaryReward.label}-${primaryReward.value}`} compact {...primaryReward} />
              ) : (
                <ScreenBadge tone="neutral">{t("adventure.rewardOutlook")}</ScreenBadge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SceneButton onClick={onOpenBattle} disabled={cta.disabled} className="pointer-events-auto min-w-[10.5rem] px-4 py-2.5">
                {cta.label}
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
            <div className="mt-2 grid gap-2 border-t border-white/10 pt-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_17rem]">
              <div className="rounded-[16px] border border-white/10 bg-black/18 p-2.5">
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/44">{t("adventure.objective")}</div>
                <p className="mt-1 text-[11px] leading-4 text-white/62">{objective}</p>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <MissionFact label={t("adventure.terrain")} value={meta.terrainLabel} icon="fortress" />
                  <MissionFact label={t("adventure.routePace")} value={getRepeatPolicyLabel(definition, nodeClaimed || node.cleared, t)} icon="adventure" />
                </div>
                {definition.nodeRule ? (
                  <div className="mt-2 rounded-[12px] border border-[#f5d498]/12 bg-[#f5c451]/8 px-2.5 py-2 text-[10px] leading-4 text-[#f5d498]/72">
                    <span className="font-black uppercase tracking-[0.12em] text-[#f5d498]">{definition.nodeRule.label}</span> - {definition.nodeRule.description}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[16px] border border-white/10 bg-black/18 p-2.5">
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/44">{t("adventure.rewardOutlook")}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rewardChips.map((chip) => (
                    <RewardChip key={`${chip.label}-${chip.value}`} compact {...chip} />
                  ))}
                </div>
              </div>

              <div className="rounded-[16px] border border-white/10 bg-black/18 p-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/44">
                    {showEnemyFormation ? t("adventure.enemyFormation") : t("adventure.nodeAction")}
                  </div>
                  <ScreenBadge tone={tone}>{showEnemyFormation ? `${frontlineSquad.length} ${t("adventure.units")}` : getRepeatPolicyLabel(definition, nodeClaimed || node.cleared, t)}</ScreenBadge>
                </div>
                {showEnemyFormation ? <div className="mt-2 grid gap-1.5">
                  {frontlinePreset ? (
                    <EnemyCommanderRow
                      portrait={enemyLeaderPortrait}
                      label={t("frontline.enemy")}
                      name={frontlinePresetName(t, frontlinePreset)}
                    />
                  ) : null}
                  {frontlineSquad.map((enemy, index) => {
                    const visual = getFrontlineHeroVisualAsset(enemy.heroId);
                    return (
                      <EnemyRow
                        key={`${enemy.heroId}-${index}`}
                        name={enemy.name}
                        portrait={visual.standeeSrc ?? visual.portraitFallbackSrc ?? undefined}
                        role={enemy.role}
                        stats={`HP ${enemy.maxHp} / ATK ${enemy.atk} / DEF ${enemy.def}`}
                      />
                    );
                  })}
                </div> : (
                  <p className="mt-2 text-[11px] leading-4 text-white/58">
                    {nodeClaimed ? t("adventure.cacheAlreadyClaimed") : t("adventure.cacheOpenHint")}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ScreenPanel>
  );
}

export function AdventureMapInteractionPanel({
  interaction,
  status,
  resources,
  claimedResult,
  persistedClaim,
  expanded = false,
  onToggleExpanded,
  onClaim,
}: {
  interaction: AdventureMapInteractionDefinition;
  status: AdventureMapInteractionStatus;
  resources: { adventureKeys: number };
  claimedResult?: AdventureMapInteractionOpenResult | null;
  persistedClaim?: AdventureMapInteractionClaim;
  expanded?: boolean;
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
            <SceneButton onClick={onClaim} disabled={cta.disabled} className="pointer-events-auto min-w-[10rem] px-4 py-2.5">
              {cta.label}
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
