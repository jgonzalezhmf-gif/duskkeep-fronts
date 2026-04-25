import type { Rewards } from "@/lib/types";

// 7-day login track. Day index is 1-based.
export const DAILY_LOGIN: { day: number; rewards: Rewards; label: string }[] = [
  { day: 1, rewards: { gold: 150 }, label: "Welcome" },
  { day: 2, rewards: { gold: 200, dust: 30 }, label: "Day 2" },
  { day: 3, rewards: { gems: 25 }, label: "Day 3" },
  { day: 4, rewards: { gold: 300, dust: 50 }, label: "Day 4" },
  { day: 5, rewards: { shards: [{ heroId: "mira", amount: 4 }] }, label: "Day 5" },
  { day: 6, rewards: { gems: 40, dust: 60 }, label: "Day 6" },
  {
    day: 7,
    rewards: { gold: 1000, gems: 80, shards: [{ heroId: "noct", amount: 5 }] },
    label: "Day 7 — Big Reward!",
  },
];
