import type { Rewards } from "@/lib/types";

export type EventBattleWinner = "ally" | "enemy" | "draw";

export function planLocalEventResult({
  eventCompletions,
  eventId,
  winner,
  rewards,
  today,
}: {
  eventCompletions: Record<string, string>;
  eventId: string;
  winner: EventBattleWinner;
  rewards: Rewards;
  today: string;
}) {
  const won = winner === "ally";
  const firstClear = won && eventCompletions[eventId] !== today;
  return {
    won,
    firstClear,
    rewards: firstClear ? rewards : {},
  };
}
