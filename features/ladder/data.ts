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

const BRONZE_III_REWARDS: Rewards = { gold: 60, dust: 4, accountXp: 4 };
const BRONZE_II_REWARDS: Rewards = { gold: 75, dust: 6, accountXp: 5 };
const BRONZE_I_REWARDS: Rewards = { gold: 90, dust: 8, accountXp: 6 };

export const LADDER_BRONZE_OPPONENTS: LadderOpponent[] = [
  {
    id: "ladder_bronze_iii_iron_vow",
    ownerName: "Iron Vow",
    league: "bronze",
    division: "iii",
    style: "Balanced recruit commander",
    presetId: "ladder_bronze_iii_iron_vow",
    power: 105,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: BRONZE_III_REWARDS,
  },
  {
    id: "ladder_bronze_iii_candle_warden",
    ownerName: "Candle Warden",
    league: "bronze",
    division: "iii",
    style: "Defensive sustain recruit",
    presetId: "ladder_bronze_iii_candle_warden",
    power: 108,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: BRONZE_III_REWARDS,
  },
  {
    id: "ladder_bronze_iii_mistbound_recruit",
    ownerName: "Mistbound Recruit",
    league: "bronze",
    division: "iii",
    style: "Fast archer skirmish",
    presetId: "ladder_bronze_iii_mistbound_recruit",
    power: 112,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: BRONZE_III_REWARDS,
  },
  {
    id: "ladder_bronze_ii_ash_squire",
    ownerName: "Ash Squire",
    league: "bronze",
    division: "ii",
    style: "Pressure and cheap tactics",
    presetId: "ladder_bronze_ii_ash_squire",
    power: 135,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: BRONZE_II_REWARDS,
  },
  {
    id: "ladder_bronze_ii_gate_hound",
    ownerName: "Gate Hound",
    league: "bronze",
    division: "ii",
    style: "Tank and healer midgame",
    presetId: "ladder_bronze_ii_gate_hound",
    power: 140,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: BRONZE_II_REWARDS,
  },
  {
    id: "ladder_bronze_ii_thorn_signal",
    ownerName: "Thorn Signal",
    league: "bronze",
    division: "ii",
    style: "Rally control loadout",
    presetId: "ladder_bronze_ii_thorn_signal",
    power: 145,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: BRONZE_II_REWARDS,
  },
  {
    id: "ladder_bronze_i_dusk_knight",
    ownerName: "Dusk Knight",
    league: "bronze",
    division: "i",
    style: "Sustain line with core pressure",
    presetId: "ladder_bronze_i_dusk_knight",
    power: 165,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: BRONZE_I_REWARDS,
  },
  {
    id: "ladder_bronze_i_raven_bannerman",
    ownerName: "Raven Bannerman",
    league: "bronze",
    division: "i",
    style: "Burst and smoke pressure",
    presetId: "ladder_bronze_i_raven_bannerman",
    power: 172,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: BRONZE_I_REWARDS,
  },
  {
    id: "ladder_bronze_i_oath_ember",
    ownerName: "Oath Ember",
    league: "bronze",
    division: "i",
    style: "Aggressive blade commander",
    presetId: "ladder_bronze_i_oath_ember",
    power: 178,
    pointsWin: 25,
    pointsDraw: 5,
    pointsLoss: -10,
    previewRewards: BRONZE_I_REWARDS,
  },
];

export const LADDER_OPPONENTS: LadderOpponent[] = [
  ...LADDER_BRONZE_OPPONENTS,
];

export const LADDER_OPPONENT_BY_ID = Object.fromEntries(
  LADDER_OPPONENTS.map((opponent) => [opponent.id, opponent]),
) as Record<string, LadderOpponent | undefined>;

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

export function getLadderOpponentsForRank(rank: Pick<LadderRank, "league" | "division">) {
  return LADDER_OPPONENTS.filter(
    (opponent) => opponent.league === rank.league && opponent.division === rank.division,
  );
}

export function getLadderOpponentsForPoints(points: number) {
  return getLadderOpponentsForRank(getLadderRankForPoints(points));
}

export function getLadderOpponentForPoints(points: number) {
  return getLadderOpponentsForPoints(points)[0] ?? LADDER_OPPONENTS[0];
}

export function getLadderOpponentById(opponentId: string) {
  return LADDER_OPPONENT_BY_ID[opponentId] ?? null;
}

export function isLadderOpponentAvailableForPoints(opponentId: string, points: number) {
  return getLadderOpponentsForPoints(points).some((opponent) => opponent.id === opponentId);
}

export function selectLadderOpponentForMatch(points: number, entropy: number) {
  const candidates = getLadderOpponentsForPoints(points);
  if (!candidates.length) return getLadderOpponentForPoints(points);
  const index = Math.abs(Math.floor(entropy)) % candidates.length;
  return candidates[index];
}
