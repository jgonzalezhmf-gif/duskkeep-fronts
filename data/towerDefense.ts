import type { Rewards } from "@/lib/types";

export type TDWave = {
  /** Enemies spawning on this wave. Each entry: [heroId, level] */
  enemies: { heroId: string; level: number; delay: number }[];
  /** Tick delay before the next wave starts. */
  preparationTicks: number;
};

export type TDEventDef = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  /** One-time completion per rotation (24h for alpha). */
  unlockAccountLevel: number;
  lanes: number; // 4
  laneLength: number; // 6 (excluding castle column)
  castleHp: number;
  waves: TDWave[];
  rewards: Rewards;
  firstClearRewards?: Rewards;
};

export const TD_EVENTS: TDEventDef[] = [
  {
    id: "td_fortress_siege",
    name: "Fortress Siege",
    description: "Position your heroes on the walls. Survive three waves of raiders.",
    emoji: "🏯",
    unlockAccountLevel: 6,
    lanes: 4,
    laneLength: 6,
    castleHp: 300,
    waves: [
      {
        preparationTicks: 2,
        enemies: [
          { heroId: "ren", level: 5, delay: 0 },
          { heroId: "kara", level: 5, delay: 2 },
          { heroId: "ren", level: 5, delay: 3 },
          { heroId: "tovi", level: 5, delay: 4 },
        ],
      },
      {
        preparationTicks: 3,
        enemies: [
          { heroId: "bran", level: 6, delay: 0 },
          { heroId: "kara", level: 6, delay: 1 },
          { heroId: "vex", level: 6, delay: 2 },
          { heroId: "ren", level: 6, delay: 3 },
          { heroId: "kara", level: 6, delay: 5 },
        ],
      },
      {
        preparationTicks: 3,
        enemies: [
          { heroId: "ursa", level: 8, delay: 0 },
          { heroId: "drak", level: 7, delay: 1 },
          { heroId: "lyria", level: 7, delay: 2 },
          { heroId: "fenra", level: 7, delay: 3 },
          { heroId: "morr", level: 8, delay: 5 },
        ],
      },
    ],
    rewards: { gold: 300, dust: 50, accountXp: 20 },
    firstClearRewards: { gems: 50, shards: [{ heroId: "ursa", amount: 4 }] },
  },
];

export const TD_EVENT_BY_ID: Record<string, TDEventDef> = Object.fromEntries(
  TD_EVENTS.map((e) => [e.id, e]),
);
