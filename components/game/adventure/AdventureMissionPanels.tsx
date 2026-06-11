"use client";

import type { Rewards } from "@/lib/types";
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
import { frontlinePresetName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { PendingActionLabel } from "@/components/game/shared/PendingActionFeedback";
import { SceneButton, ScreenBadge, ScreenPanel } from "@/components/game/screens/ScreenChrome";
import type { AdventureCampaignMeta, AdventureNodeState } from "@/features/adventure/campaignTypes";
import {
  EnemyCommanderRow,
  EnemyRow,
  MissionFact,
  MissionNodeAssetBadge,
  RewardChip,
  buildRewardChipsFromRewards,
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
  pending = false,
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
  pending?: boolean;
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
              <SceneButton onClick={onOpenBattle} disabled={cta.disabled || pending} className="pointer-events-auto min-w-[10.5rem] px-4 py-2.5">
                <PendingActionLabel pending={pending} pendingLabel={t("adventure.claiming")}>
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
