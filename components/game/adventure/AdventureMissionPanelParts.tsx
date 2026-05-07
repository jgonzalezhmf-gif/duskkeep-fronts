"use client";

import type { Rewards } from "@/lib/types";
import { cn } from "@/lib/cn";
import { getAdventureNodeAsset, type AdventureNodeAssetId } from "@/lib/adventureMapAssets";
import type { AdventureMapInteractionDefinition, AdventureMapInteractionLootTier, AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";
import { FRONTLINE_CARD_BY_ID } from "@/features/frontline/data";
import { isAdventureClaimed, isAdventureCombatNode, type AdventureNodeDefinition, type AdventureNodeType, type AdventureProgressEntry } from "@/features/adventure/nodeResolution";
import GameIcon from "@/components/game/shared/GameIcon";
import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { CombatIcon } from "@/components/game/shared/CombatIcon";
import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import { frontlineCardName } from "@/lib/i18n/frontlineText";
import type { AdventureNodeState, TranslateFn } from "./AdventureCampaignTypes";

type RewardChipData = {
  icon: "gold" | "gem" | "dust" | "rewards" | "deck" | "adventure_key";
  label: string;
  value: string;
  tone: "gold" | "sky" | "violet" | "emerald";
};

export function getMissionStatusLabel(
  node: AdventureNodeState,
  definition: AdventureNodeDefinition,
  progress: AdventureProgressEntry | undefined,
  firstClearAvailable: boolean,
  t: TranslateFn,
) {
  if (node.locked || definition.type === "locked") {
    return node.lvl.unlockAccountLevel ? t("adventure.unlocksAtLevel", { level: node.lvl.unlockAccountLevel }) : t("adventure.routeSealed");
  }
  if (isAdventureClaimed(definition.type, progress) || node.claimed) return t("adventure.claimedNode");
  if (node.pausedHere) return t("adventure.pausedEncounter");
  if (firstClearAvailable) return t("adventure.firstClear");
  if (node.cleared) {
    if (definition.repeatPolicy === "reduced") return t("adventure.replayReduced");
    if (definition.repeatPolicy === "free_no_reward") return t("adventure.practiceNoReward");
    return t("adventure.clearedEncounter");
  }
  if (definition.type === "chest") return t("adventure.rewardCache");
  if (definition.type === "boss") return t("adventure.bossEncounter");
  if (definition.type === "elite") return t("adventure.eliteEncounter");
  return t("adventure.battleEncounter");
}

export function getMissionObjective(node: AdventureNodeState, definition: AdventureNodeDefinition, t: TranslateFn) {
  if (node.locked || definition.type === "locked") return t("adventure.objectives.locked");
  if (definition.type === "chest") return t("adventure.cacheOpenHint");
  if (definition.type === "boss") return t("adventure.objectives.boss");
  if (definition.type === "elite") return t("adventure.objectives.elite");
  if (definition.type === "merchant") return "Future merchant node prepared for campaign shops.";
  if (definition.type === "shrine") return "Future shrine node prepared for blessings.";
  if (definition.type === "event" || definition.type === "secret") return "Future event node prepared for non-combat route choices.";
  return t("adventure.objectives.battle");
}

export function getMissionCta(
  node: AdventureNodeState,
  definition: AdventureNodeDefinition,
  progress: AdventureProgressEntry | undefined,
  t: TranslateFn,
) {
  if (node.locked || definition.type === "locked") return { label: t("adventure.lockedCta"), disabled: true };
  if (isAdventureClaimed(definition.type, progress) || node.claimed) return { label: t("adventure.claimedNode"), disabled: true };
  if (definition.type === "chest") return { label: t("adventure.openChest"), disabled: false };
  if (definition.type === "elite") return { label: t("adventure.challengeElite"), disabled: false };
  if (definition.type === "boss") return { label: t("adventure.faceBoss"), disabled: false };
  if (!isAdventureCombatNode(definition.type)) return { label: t("adventure.notReady"), disabled: true };
  return { label: node.pausedHere ? t("adventure.resumeMission") : t("adventure.startAdventure"), disabled: false };
}

export function getInteractionStatusLabel(status: AdventureMapInteractionStatus, t: TranslateFn) {
  if (status === "claimed") return t("adventure.claimedNode");
  if (status === "locked") return t("adventure.routeSealed");
  if (status === "needs_key") return t("adventure.needsKey");
  return t("adventure.cacheReady");
}

export function formatInteractionResetRemaining(resetAvailableAt: string) {
  const remainingMs = Math.max(0, Date.parse(resetAvailableAt) - Date.now());
  const totalMinutes = Math.ceil(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function getInteractionCta(
  interaction: AdventureMapInteractionDefinition,
  status: AdventureMapInteractionStatus,
  t: TranslateFn,
) {
  if (status === "claimed") return { label: t("adventure.claimedNode"), disabled: true };
  if (status === "locked") return { label: t("adventure.lockedCta"), disabled: true };
  if (status === "needs_key") return { label: t("adventure.needsKey"), disabled: true };
  return { label: interaction.kind === "keyChest" ? t("adventure.openMapCache") : t("adventure.openChest"), disabled: false };
}

export function getLootTierLabel(tier: AdventureMapInteractionLootTier, t: TranslateFn) {
  if (tier === "legendary") return t("adventure.lootLegendary").replace(" 5%", "");
  if (tier === "epic") return t("adventure.lootEpic").replace(" 15%", "");
  if (tier === "rare") return t("adventure.lootRare").replace(" 30%", "");
  return t("adventure.lootCommon").replace(" 50%", "");
}

export function getLootTierTone(tier: AdventureMapInteractionLootTier): "neutral" | "gold" | "emerald" | "sky" | "ember" {
  if (tier === "legendary") return "gold";
  if (tier === "epic") return "ember";
  if (tier === "rare") return "sky";
  return "neutral";
}

export function getNodeTypeLabel(type: AdventureNodeDefinition["type"]) {
  const labels: Record<AdventureNodeDefinition["type"], string> = {
    battle: "Battle",
    elite: "Elite",
    boss: "Boss",
    chest: "Chest",
    shrine: "Shrine",
    merchant: "Merchant",
    event: "Event",
    secret: "Secret",
    danger: "Danger",
    locked: "Locked",
  };
  return labels[type];
}

export function getRepeatPolicyLabel(definition: AdventureNodeDefinition, clearedOrClaimed: boolean, t?: TranslateFn) {
  const tr = t ?? ((key: string) => key);
  if (definition.type === "chest") return clearedOrClaimed ? tr("adventure.claimedNode") : tr("adventure.claimOnce");
  if (definition.repeatPolicy === "reduced") return clearedOrClaimed ? tr("adventure.replayReduced") : tr("adventure.firstClear");
  if (definition.repeatPolicy === "free_no_reward") return clearedOrClaimed ? tr("adventure.practiceOnly") : tr("adventure.firstClear");
  if (definition.repeatPolicy === "ticket_cost") return "Ticket cost";
  return clearedOrClaimed ? tr("adventure.completed") : tr("adventure.firstClear");
}

export function MissionFact({ label, value, icon }: { label: string; value: string; icon: "adventure" | "battle" | "fortress" | "power" | "rewards" | "adventure_key" }) {
  return (
    <div className="min-w-0 rounded-[15px] border border-white/10 bg-white/[0.035] px-2.5 py-1.5">
      <div className="flex items-center gap-1.5">
        {icon === "power" ? (
          <CombatIcon name="leader_power" size="sm" className="h-7 w-7 rounded-[10px]" />
        ) : icon === "adventure_key" ? (
          <ResourceIcon kind="adventure_key" size="small" className="h-7 w-7" />
        ) : (
          <GameIcon kind={icon} tone="steel" size="sm" className="h-7 w-7 rounded-[10px]" />
        )}
        <div className="min-w-0">
          <div className="text-[8px] font-black uppercase tracking-[0.12em] text-white/42">{label}</div>
          <div className="mt-0.5 truncate text-[11px] font-black text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

export function MissionNodeAssetBadge({
  nodeType,
  locked,
  claimed,
}: {
  nodeType: AdventureNodeType;
  locked: boolean;
  claimed: boolean;
}) {
  const assetId = getMissionNodeAssetId(nodeType, locked, claimed);
  const asset = getAdventureNodeAsset(assetId);

  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.36),rgba(5,7,12,0.72))] shadow-[0_10px_22px_rgba(0,0,0,0.28)]">
      <span className="pointer-events-none absolute inset-[12%] rounded-full bg-black/18 blur-sm" />
      {asset ? (
        <img
          src={asset.src}
          alt=""
          aria-hidden
          loading="lazy"
          className={cn(
            "relative z-[1] h-[118%] w-[118%] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.44)]",
            locked ? "opacity-70 grayscale-[0.25]" : "",
            claimed ? "opacity-86" : "",
            nodeType === "boss" ? "scale-[1.1]" : "",
          )}
        />
      ) : (
        <GameIcon kind={locked ? "shield" : nodeType === "boss" || nodeType === "elite" || nodeType === "danger" ? "battle" : claimed || nodeType === "chest" ? "rewards" : "adventure"} tone="steel" size="sm" className="relative z-[1] h-8 w-8 rounded-[10px] bg-transparent" />
      )}
    </span>
  );
}

function getMissionNodeAssetId(nodeType: AdventureNodeType, locked: boolean, claimed: boolean): AdventureNodeAssetId {
  if (locked) return "locked";
  if (claimed) return "cleared";
  if (nodeType === "locked") return "locked";
  return nodeType;
}

export function EnemyCommanderRow({ name, portrait, label }: { name: string; portrait?: string | null; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] border border-[#f5d498]/14 bg-[#f5c451]/8 px-2 py-1.5">
      {portrait ? (
        <img
          src={portrait}
          alt=""
          className="h-10 w-9 shrink-0 rounded-[12px] border border-[#f5d498]/18 bg-black/24 object-cover shadow-[0_8px_18px_rgba(0,0,0,0.24)]"
          loading="lazy"
          aria-hidden
        />
      ) : null}
      <div className="min-w-0">
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#f5d498]/62">{label}</div>
        <div className="truncate text-[11px] font-black text-white">{name}</div>
      </div>
    </div>
  );
}

export function EnemyRow({ name, portrait, role, stats }: { name: string; portrait?: string; role: string; stats: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-black/16 px-2 py-1.5">
      <div className="grid h-10 w-9 shrink-0 place-items-end overflow-hidden rounded-[11px] border border-rose-200/14 bg-black/24">
        {portrait ? (
          <img src={portrait} alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-full w-full object-contain object-bottom drop-shadow-[0_9px_12px_rgba(0,0,0,0.44)]" />
        ) : (
          <GameIcon kind="battle" tone="ember" size="sm" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] font-black text-white">{name}</div>
        <div className="mt-0.5 truncate text-[10px] uppercase tracking-[0.1em] text-white/42">{role}</div>
      </div>
      <div className="hidden text-[9px] font-black uppercase tracking-[0.08em] text-rose-100/58 sm:block">{stats}</div>
    </div>
  );
}

export function RewardChip({
  icon,
  label,
  value,
  tone,
  compact,
}: RewardChipData & {
  compact?: boolean;
}) {
  return (
    <GameRewardToken
      icon={icon}
      label={label}
      value={value}
      tone={tone}
      size={compact ? "sm" : "md"}
      featured={icon === "gold" || icon === "gem" || icon === "dust"}
    />
  );
}

export function buildRewardChipsFromRewards(rewards: Rewards, firstClearAvailable: boolean, t: TranslateFn): RewardChipData[] {
  const chips: RewardChipData[] = [];
  if (rewards.gold) chips.push({ icon: "gold", label: t("adventure.reward.gold"), value: `${rewards.gold}`, tone: "gold" });
  if (rewards.dust) chips.push({ icon: "dust", label: t("adventure.reward.dust"), value: `${rewards.dust}`, tone: "violet" });
  if (rewards.gems) chips.push({ icon: "gem", label: t("adventure.reward.gems"), value: `${rewards.gems}`, tone: "sky" });
  if (rewards.accountXp) chips.push({ icon: "rewards", label: "Account XP", value: `${rewards.accountXp}`, tone: "emerald" });
  if (rewards.xp) chips.push({ icon: "rewards", label: "Hero XP", value: `${rewards.xp}`, tone: "emerald" });
  if (rewards.adventureKeys) chips.push({ icon: "adventure_key", label: t("resources.adventureKeys"), value: `${rewards.adventureKeys}`, tone: "gold" });
  if (firstClearAvailable && (rewards.frontlineCards?.length || rewards.shards?.length)) {
    chips.push({ icon: "rewards", label: t("adventure.reward.firstClear"), value: t("adventure.reward.bonusCache"), tone: "emerald" });
  }
  for (const unlock of rewards.frontlineCards ?? []) {
    const card = FRONTLINE_CARD_BY_ID[unlock.cardId];
    if (!card) continue;
    chips.push({ icon: "deck", label: t("frontline.cardUnlocks"), value: frontlineCardName(t, card), tone: "sky" });
  }
  return chips;
}
