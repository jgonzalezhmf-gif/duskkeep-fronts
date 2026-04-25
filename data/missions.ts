import type { Mission } from "@/lib/types";

export const DAILY_MISSIONS: Mission[] = [
  {
    id: "d_battles_3", kind: "daily", name: "Combatant",
    description: "Win 3 battles", goal: 3, metric: "battles_won",
    rewards: { gold: 100, dust: 20, accountXp: 10 },
  },
  {
    id: "d_adv_2", kind: "daily", name: "Adventurer",
    description: "Clear 2 adventure levels", goal: 2, metric: "adventure_levels_cleared",
    rewards: { gold: 150, gems: 5, accountXp: 10 },
  },
  {
    id: "d_upgrade_1", kind: "daily", name: "Smith",
    description: "Upgrade a hero 1 time", goal: 1, metric: "heroes_upgraded",
    rewards: { gold: 80, dust: 15 },
  },
  {
    id: "d_arena_1", kind: "daily", name: "Gladiator",
    description: "Play 1 arena battle", goal: 1, metric: "arena_battles",
    rewards: { gold: 100, gems: 5 },
  },
];

export const WEEKLY_MISSIONS: Mission[] = [
  {
    id: "w_battles_20", kind: "weekly", name: "Veteran",
    description: "Win 20 battles this week", goal: 20, metric: "battles_won",
    rewards: { gold: 1000, dust: 200, gems: 20, accountXp: 50 },
  },
  {
    id: "w_adv_10", kind: "weekly", name: "Trailblazer",
    description: "Clear 10 adventure levels", goal: 10, metric: "adventure_levels_cleared",
    rewards: { gold: 800, gems: 30, accountXp: 50 },
  },
  {
    id: "w_events_3", kind: "weekly", name: "Event Hunter",
    description: "Play 3 event battles", goal: 3, metric: "events_played",
    rewards: { gold: 500, gems: 20 },
  },
];

export const ALL_MISSIONS = [...DAILY_MISSIONS, ...WEEKLY_MISSIONS];
