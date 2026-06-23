import type { TacticalState } from "@/features/tactical/types";
import { createEntropyToken } from "@/lib/clientEntropy";
import type { Notification, NotificationKind } from "@/lib/storeTypes";
import type { Resources } from "@/lib/types";

export function addNotificationState(
  notifications: Notification[],
  kind: NotificationKind,
  message: string,
  id: string,
) {
  return [...notifications, { id, kind, message }];
}

export function dismissNotificationState(notifications: Notification[], id: string) {
  return notifications.filter((notification) => notification.id !== id);
}

export function createNotificationId(now = Date.now(), suffix = createEntropyToken(6).slice(0, 8)) {
  return `${now}:${suffix}`;
}

export function nextStoreSeed(lastSeed: number) {
  return (lastSeed * 1664525 + 1013904223) >>> 0;
}

export function markEventCompletedState({
  eventCompletions,
  eventsPlayed,
  eventId,
  today,
}: {
  eventCompletions: Record<string, string>;
  eventsPlayed: Record<string, number>;
  eventId: string;
  today: string;
}) {
  return {
    eventCompletions: { ...eventCompletions, [eventId]: today },
    eventsPlayed: { ...eventsPlayed, [eventId]: (eventsPlayed[eventId] ?? 0) + 1 },
  };
}

export function refreshShopState(shopRefreshedAt: string | null, today: string) {
  if (shopRefreshedAt === today) return null;
  return { shopRefreshedAt: today, dailyShopPurchases: {} };
}

export function refreshArenaTicketsState({
  arenaTicketsRefreshedAt,
  resources,
  today,
  dailyArenaTickets,
}: {
  arenaTicketsRefreshedAt: string | null;
  resources: Resources;
  today: string;
  dailyArenaTickets: number;
}) {
  if (arenaTicketsRefreshedAt === today) return null;
  return {
    arenaTicketsRefreshedAt: today,
    resources: { ...resources, arenaTickets: Math.max(resources.arenaTickets, dailyArenaTickets) },
  };
}

export function saveBattleState(levelId: string, state: TacticalState) {
  if (state.winner) return { savedBattle: null };
  return { savedBattle: { levelId, state } };
}

export function setOnboardingStepState(onboarding: { step: number; completed: boolean }, step: number) {
  return { ...onboarding, step };
}

export function completeOnboardingState() {
  return { step: 99, completed: true };
}
