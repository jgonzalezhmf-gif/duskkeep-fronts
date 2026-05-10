"use client";

import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import { getRewardDisplayEntries, type RewardDisplayEntryKind } from "@/lib/rewardDisplayEntries";
import type { Rewards } from "@/lib/types";

type RewardBurstEntry = {
  kind: RewardDisplayEntryKind;
  icon: "gold" | "dust" | "gem" | "tickets" | "power" | "heroes" | "rewards" | "adventure_key";
  tone: "gold" | "violet" | "sky" | "ember" | "emerald";
  label: string;
  value: number;
};

const BURST_META: Record<RewardDisplayEntryKind, Pick<RewardBurstEntry, "icon" | "tone">> = {
  gold: { icon: "gold", tone: "gold" },
  dust: { icon: "dust", tone: "violet" },
  gems: { icon: "gem", tone: "sky" },
  tickets: { icon: "tickets", tone: "ember" },
  keys: { icon: "adventure_key", tone: "gold" },
  xp: { icon: "power", tone: "emerald" },
  shards: { icon: "heroes", tone: "violet" },
  cards: { icon: "power", tone: "emerald" },
};

function rewardEntries(rewards: Rewards, t: (key: string) => string): RewardBurstEntry[] {
  return getRewardDisplayEntries(rewards).map((entry) => ({
    ...entry,
    ...BURST_META[entry.kind],
    label: t(entry.labelKey),
  }));
}

export type RewardBurstOverlayProps = {
  rewards?: Rewards | null;
  active?: boolean;
  compact?: boolean;
  className?: string;
};

export function RewardBurstOverlay({
  rewards,
  active = true,
  compact,
  className,
}: RewardBurstOverlayProps) {
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
              key={`${entry.kind}-${entry.value}`}
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
