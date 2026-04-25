import type { Rewards } from "@/lib/types";

// Beginner roadmap: sequential steps. The user always sees the *next* step,
// claims its reward, and unlocks the next one. Designed for ~3-4 hours of
// "something to do" early.
export type RoadmapStep = {
  id: string;
  title: string;
  hint: string;
  // condition metric (matched against state in store.ts)
  metric:
    | "adventure_clears" // cleared adventure level count
    | "heroes_upgraded"
    | "hero_stars"       // highest stars on any owned hero (stars>=goal)
    | "collection_size"  // number of unlocked (stars>0) heroes
    | "battles_won"
    | "arena_battles"
    | "events_played"
    | "shop_purchases"
    | "account_level";
  goal: number;
  rewards: Rewards;
};

export const ROADMAP: RoadmapStep[] = [
  {
    id: "r_first_win",
    title: "First Victory",
    hint: "Clear Adventure 1-1 to earn your first crown.",
    metric: "adventure_clears",
    goal: 1,
    rewards: { gold: 150, gems: 10, accountXp: 10 },
  },
  {
    id: "r_upgrade_1",
    title: "Train the Squad",
    hint: "Upgrade any hero once from the Roster.",
    metric: "heroes_upgraded",
    goal: 1,
    rewards: { gold: 120, dust: 30, accountXp: 8 },
  },
  {
    id: "r_adv_3",
    title: "Trailblazer",
    hint: "Clear 3 adventure levels.",
    metric: "adventure_clears",
    goal: 3,
    rewards: { gold: 200, gems: 15, shards: [{ heroId: "vex", amount: 5 }] },
  },
  {
    id: "r_arena_1",
    title: "Step Into the Arena",
    hint: "Fight once in the Arena.",
    metric: "arena_battles",
    goal: 1,
    rewards: { gold: 180, gems: 10, accountXp: 12 },
  },
  {
    id: "r_event_1",
    title: "Attend an Event",
    hint: "Play any event battle or tower defense wave.",
    metric: "events_played",
    goal: 1,
    rewards: { gold: 200, dust: 40, accountXp: 12 },
  },
  {
    id: "r_2_stars",
    title: "Rising Star",
    hint: "Reach 2★ on any hero.",
    metric: "hero_stars",
    goal: 2,
    rewards: { gold: 250, gems: 20 },
  },
  {
    id: "r_collect_5",
    title: "Collector",
    hint: "Unlock a 5th hero.",
    metric: "collection_size",
    goal: 5,
    rewards: { gold: 300, gems: 25, dust: 80 },
  },
  {
    id: "r_adv_7",
    title: "Veteran Path",
    hint: "Clear 7 adventure levels.",
    metric: "adventure_clears",
    goal: 7,
    rewards: { gold: 400, gems: 30, shards: [{ heroId: "drak", amount: 6 }] },
  },
  {
    id: "r_shop_1",
    title: "Shop Visit",
    hint: "Make a purchase in the Shop (starter pack counts).",
    metric: "shop_purchases",
    goal: 1,
    rewards: { gold: 300, gems: 20, accountXp: 15 },
  },
  {
    id: "r_acc_5",
    title: "Rank Up",
    hint: "Reach account level 5.",
    metric: "account_level",
    goal: 5,
    rewards: { gold: 500, gems: 40, dust: 100 },
  },
  {
    id: "r_adv_12",
    title: "Chapter 1 Complete",
    hint: "Clear all 12 levels of chapter 1.",
    metric: "adventure_clears",
    goal: 12,
    rewards: { gold: 800, gems: 60, shards: [{ heroId: "noct", amount: 4 }] },
  },
  {
    id: "r_3_stars",
    title: "Triple Star",
    hint: "Reach 3★ on any hero.",
    metric: "hero_stars",
    goal: 3,
    rewards: { gold: 700, gems: 50, dust: 200 },
  },
];

export const ROADMAP_BY_ID = Object.fromEntries(ROADMAP.map((r) => [r.id, r]));
