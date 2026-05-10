import type { Rewards } from "@/lib/types";

export type RewardDisplayEntryKind = "gold" | "dust" | "gems" | "tickets" | "keys" | "xp" | "shards" | "cards";

export type RewardDisplayEntry = {
  kind: RewardDisplayEntryKind;
  labelKey: string;
  value: number;
};

export function getRewardDisplayEntries(rewards: Rewards | null | undefined): RewardDisplayEntry[] {
  if (!rewards) return [];

  const entries: RewardDisplayEntry[] = [];
  if (rewards.gold) entries.push({ kind: "gold", labelKey: "resources.gold", value: rewards.gold });
  if (rewards.dust) entries.push({ kind: "dust", labelKey: "resources.dust", value: rewards.dust });
  if (rewards.gems) entries.push({ kind: "gems", labelKey: "resources.gems", value: rewards.gems });
  if (rewards.arenaTickets) entries.push({ kind: "tickets", labelKey: "resources.tickets", value: rewards.arenaTickets });
  if (rewards.adventureKeys) entries.push({ kind: "keys", labelKey: "resources.adventureKeys", value: rewards.adventureKeys });

  const xp = rewards.accountXp ?? rewards.xp ?? 0;
  if (xp) entries.push({ kind: "xp", labelKey: "frontline.accountXp", value: xp });

  const shards = rewards.shards?.reduce((sum, shard) => sum + shard.amount, 0) ?? 0;
  if (shards) entries.push({ kind: "shards", labelKey: "shop.categoryShort.shards", value: shards });

  const cardUnlocks = rewards.frontlineCards?.length ?? 0;
  if (cardUnlocks) entries.push({ kind: "cards", labelKey: "frontline.cardUnlocks", value: cardUnlocks });

  return entries;
}
