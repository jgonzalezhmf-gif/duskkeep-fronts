import type { Rewards } from "@/lib/types";

// Account-level milestones. Each reward is claimed once when reaching that
// account level. Connected to the LevelUpModal and HomePage "next unlock" UI.
export type AccountMilestone = {
  level: number;
  title: string;
  unlock: string; // short user-facing unlock description
  rewards: Rewards;
};

export const MILESTONES: AccountMilestone[] = [
  {
    level: 2,
    title: "Recruit",
    unlock: "Daily missions unlocked",
    rewards: { gold: 200, gems: 20 },
  },
  {
    level: 3,
    title: "Initiate",
    unlock: "Arena tier 1 opens",
    rewards: { gold: 250, gems: 20, dust: 40 },
  },
  {
    level: 4,
    title: "Veteran",
    unlock: "Events rotate daily",
    rewards: { gold: 300, gems: 30, shards: [{ heroId: "kara", amount: 5 }] },
  },
  {
    level: 5,
    title: "Captain",
    unlock: "Shop refresh + starter pack ends",
    rewards: { gold: 400, gems: 40, dust: 80 },
  },
  {
    level: 6,
    title: "Commander",
    unlock: "Chapter 2 — Ashes of the Pact",
    rewards: { gold: 500, gems: 50, shards: [{ heroId: "lyria", amount: 6 }] },
  },
  {
    level: 8,
    title: "Vanguard",
    unlock: "Tower Defense event unlocked",
    rewards: { gold: 700, gems: 70, dust: 150 },
  },
  {
    level: 10,
    title: "Warlord",
    unlock: "Arena tier 2 + shop legendary offers",
    rewards: { gold: 1000, gems: 100, shards: [{ heroId: "sol", amount: 5 }] },
  },
  {
    level: 12,
    title: "Eclipse Breaker",
    unlock: "Legendary summoning kits",
    rewards: { gold: 1500, gems: 150, dust: 300 },
  },
  {
    level: 15,
    title: "Legend",
    unlock: "Full roster available",
    rewards: { gold: 2000, gems: 200, shards: [{ heroId: "noct", amount: 8 }] },
  },
];

export const MILESTONES_BY_LEVEL = Object.fromEntries(
  MILESTONES.map((m) => [m.level, m]),
);

export function nextMilestone(level: number) {
  return MILESTONES.find((m) => m.level > level);
}

export function pastMilestones(level: number) {
  return MILESTONES.filter((m) => m.level <= level);
}
