export type RewardGrantNotification = {
  kind: "success";
  message: string;
};

export function getRewardGrantNotifications({
  source,
  unlockedFrontlineCardCount,
}: {
  source?: string;
  unlockedFrontlineCardCount: number;
}): RewardGrantNotification[] {
  const notifications: RewardGrantNotification[] = [];

  if (unlockedFrontlineCardCount > 0) {
    notifications.push({ kind: "success", message: "Frontline card unlocked" });
  }
  if (source) {
    notifications.push({ kind: "success", message: `Rewards from ${source}` });
  }

  return notifications;
}
