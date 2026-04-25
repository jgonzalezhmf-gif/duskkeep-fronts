export const TEAM_SIZE = 4;
export const DECK_SIZE = 8;
export const MAX_LEVEL = 60;
export const MAX_STARS = 6;
export const ACCOUNT_XP_PER_LEVEL = 100;
export const DAILY_ARENA_TICKETS = 5;

// Hero level costs (gold per level-up)
export const LEVEL_UP_GOLD = (level: number) => 50 + level * 25;
// Stat scaling per level
export const LEVEL_STAT_MULT = (level: number) => 1 + (level - 1) * 0.08;
// Shards required for next star (index = current stars 1..5)
export const SHARDS_FOR_STAR = [0, 10, 20, 40, 80, 160, 320];
// Star multiplier for stats
export const STAR_STAT_MULT = (stars: number) => 1 + (stars - 1) * 0.15;

// Skill Enhancement (Arcane Dust)
export const MAX_SKILL_LEVEL = 5;
// Dust cost to go from skillLevel N to N+1 (index = current skill level)
export const SKILL_UP_DUST = [0, 100, 250, 500, 1000];
// Each skill level adds +8% to the active ability multiplier
export const SKILL_MULTIPLIER_BONUS = 0.08;
// At skill level 5, cooldown is reduced by 1 turn
export const SKILL_COOLDOWN_REDUCTION_AT_MAX = 1;
