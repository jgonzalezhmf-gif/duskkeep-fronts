"use client";

import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import type { Rewards } from "@/lib/types";

type RewardBurstEntry = {
  icon: "gold" | "dust" | "gem" | "tickets" | "power" | "heroes" | "rewards" | "adventure_key";
  tone: "gold" | "violet" | "sky" | "ember" | "emerald";
  label: string;
  value: number;
};

function rewardEntries(rewards: Rewards, t: (key: string) => string): RewardBurstEntry[] {
  const entries: RewardBurstEntry[] = [];
  if (rewards.gold) entries.push({ icon: "gold", tone: "gold", label: t("resources.gold"), value: rewards.gold });
  if (rewards.dust) entries.push({ icon: "dust", tone: "violet", label: t("resources.dust"), value: rewards.dust });
  if (rewards.gems) entries.push({ icon: "gem", tone: "sky", label: t("resources.gems"), value: rewards.gems });
  if (rewards.arenaTickets) entries.push({ icon: "tickets", tone: "ember", label: t("resources.tickets"), value: rewards.arenaTickets });
  if (rewards.adventureKeys) entries.push({ icon: "adventure_key", tone: "gold", label: t("resources.adventureKeys"), value: rewards.adventureKeys });
  if (rewards.accountXp || rewards.xp) entries.push({ icon: "power", tone: "emerald", label: t("frontline.accountXp"), value: rewards.accountXp ?? rewards.xp ?? 0 });
  const shardTotal = rewards.shards?.reduce((sum, shard) => sum + shard.amount, 0) ?? 0;
  if (shardTotal) entries.push({ icon: "heroes", tone: "violet", label: t("shop.categoryShort.shards"), value: shardTotal });
  if (rewards.frontlineCards?.length) entries.push({ icon: "power", tone: "emerald", label: t("frontline.cardUnlocks"), value: rewards.frontlineCards.length });
  return entries;
}

export function RewardBurstOverlay({
  rewards,
  active = true,
  compact,
  className,
}: {
  rewards?: Rewards | null;
  active?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  if (!active || !rewards) return null;
  const entries = rewardEntries(rewards, t);
  if (!entries.length) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-[5] grid place-items-center", className)}>
      <div
        className={cn(
          "frontline-reward-burst flex max-w-[92%] flex-col items-center gap-3 rounded-[30px] border border-[#ffe6a8]/26 bg-[radial-gradient(circle_at_50%_0%,rgba(255,236,178,0.26),transparent_44%),linear-gradient(180deg,rgba(22,16,9,0.88),rgba(7,9,14,0.72))] px-3 py-3 shadow-[0_24px_70px_rgba(0,0,0,0.42),0_0_34px_rgba(245,196,81,0.16)] backdrop-blur-md",
          compact && "scale-95",
        )}
      >
        <ProgressionIcon name="reward_chest" size={compact ? "md" : "lg"} />
        <div className="flex flex-wrap justify-center gap-2">
          {entries.slice(0, compact ? 3 : 5).map((entry) => (
            <GameRewardToken
              key={`${entry.icon}-${entry.value}`}
              icon={entry.icon}
              tone={entry.tone}
              label={entry.label}
              value={entry.value}
              size="sm"
              featured
            />
          ))}
        </div>
      </div>
    </div>
  );
}
