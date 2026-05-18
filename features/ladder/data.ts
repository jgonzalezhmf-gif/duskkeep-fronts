import type { Rewards } from "@/lib/types";

export type LadderLeague = "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master" | "grandmaster";
export type LadderDivision = "iii" | "ii" | "i";
export type LadderRewardMode = "normal" | "reduced" | "draw" | "loss";

export type LadderRank = {
  league: LadderLeague;
  division: LadderDivision;
  minPoints: number;
  maxPoints: number;
  enabled: boolean;
};

export type LadderOpponent = {
  id: string;
  ownerName: string;
  league: LadderLeague;
  division: LadderDivision;
  style: string;
  presetId: string;
  power: number;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  previewRewards: Rewards;
};

export type LadderState = {
  seasonId: string;
  points: number;
  league: LadderLeague;
  division: LadderDivision;
  keyProgress: number;
  dailyRewardedWins: number;
  dailyCycleKey: string | null;
};

export const LADDER_SEASON_ID = "alpha_s1";
export const LADDER_DAILY_NORMAL_WIN_LIMIT = 5;

export const LADDER_RANKS: LadderRank[] = [
  { league: "bronze", division: "iii", minPoints: 0, maxPoints: 99, enabled: true },
  { league: "bronze", division: "ii", minPoints: 100, maxPoints: 199, enabled: true },
  { league: "bronze", division: "i", minPoints: 200, maxPoints: 300, enabled: true },
  { league: "silver", division: "iii", minPoints: 301, maxPoints: 399, enabled: false },
  { league: "silver", division: "ii", minPoints: 400, maxPoints: 499, enabled: false },
  { league: "silver", division: "i", minPoints: 500, maxPoints: 599, enabled: false },
  { league: "gold", division: "iii", minPoints: 600, maxPoints: 699, enabled: false },
  { league: "gold", division: "ii", minPoints: 700, maxPoints: 799, enabled: false },
  { league: "gold", division: "i", minPoints: 800, maxPoints: 899, enabled: false },
  { league: "platinum", division: "iii", minPoints: 900, maxPoints: 999, enabled: false },
  { league: "platinum", division: "ii", minPoints: 1000, maxPoints: 1099, enabled: false },
  { league: "platinum", division: "i", minPoints: 1100, maxPoints: 1199, enabled: false },
  { league: "diamond", division: "iii", minPoints: 1200, maxPoints: 1299, enabled: false },
  { league: "diamond", division: "ii", minPoints: 1300, maxPoints: 1399, enabled: false },
  { league: "diamond", division: "i", minPoints: 1400, maxPoints: 1499, enabled: false },
  { league: "master", division: "iii", minPoints: 1500, maxPoints: 1599, enabled: false },
  { league: "master", division: "ii", minPoints: 1600, maxPoints: 1699, enabled: false },
  { league: "master", division: "i", minPoints: 1700, maxPoints: 1799, enabled: false },
  { league: "grandmaster", division: "iii", minPoints: 1800, maxPoints: 1899, enabled: false },
  { league: "grandmaster", division: "ii", minPoints: 1900, maxPoints: 1999, enabled: false },
  { league: "grandmaster", division: "i", minPoints: 2000, maxPoints: 9999, enabled: false },
];

export const LADDER_BRONZE_OPPONENTS: LadderOpponent[] = [
  {
    id: "ladder_bronze_iii_iron_vow",
    ownerName: "Iron Vow",
    league: "bronze",
    division: "iii",
    style: "Balanced starter loadout",
    presetId: "bonewood_scouts",
    power: 105,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: { gold: 60, dust: 4, accountXp: 4 },
  },
  {
    id: "ladder_bronze_ii_ash_squire",
    ownerName: "Ash Squire",
    league: "bronze",
    division: "ii",
    style: "Pressure and cheap tactics",
    presetId: "bonewood_raiders",
    power: 135,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: { gold: 75, dust: 6, accountXp: 5 },
  },
  {
    id: "ladder_bronze_i_dusk_knight",
    ownerName: "Dusk Knight",
    league: "bronze",
    division: "i",
    style: "Sustain line with core pressure",
    presetId: "rotwood_pack",
    power: 165,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: { gold: 90, dust: 8, accountXp: 6 },
  },
];

export function createDefaultLadderState(): LadderState {
  return {
    seasonId: LADDER_SEASON_ID,
    points: 0,
    league: "bronze",
    division: "iii",
    keyProgress: 0,
    dailyRewardedWins: 0,
    dailyCycleKey: null,
  };
}

export function getLadderRankForPoints(points: number): LadderRank {
  const safePoints = Math.max(0, Math.floor(points));
  return LADDER_RANKS.find((rank) => safePoints >= rank.minPoints && safePoints <= rank.maxPoints) ?? LADDER_RANKS[0];
}

export function ladderRankLabel(rank: Pick<LadderRank, "league" | "division">) {
  return `${rank.league[0].toUpperCase()}${rank.league.slice(1)} ${rank.division.toUpperCase()}`;
}

export function getLadderOpponentForPoints(points: number) {
  const rank = getLadderRankForPoints(points);
  return LADDER_BRONZE_OPPONENTS.find(
    (opponent) => opponent.league === rank.league && opponent.division === rank.division,
  ) ?? LADDER_BRONZE_OPPONENTS[0];
}
