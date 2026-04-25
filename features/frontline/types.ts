import type { FrontlineCardKind, FrontlineLane, FrontlineSide, Rarity } from "@/lib/types";

export type FrontlineLeaderPower =
  | { type: "beam"; damage: number; healCore?: number }
  | { type: "rally"; atk: number; shield: number };

export type FrontlineLeaderDef = {
  id: string;
  name: string;
  title: string;
  factionTone: "dawn" | "shadow";
  coreHp: number;
  power: {
    name: string;
    description: string;
    cost: number;
    cooldown: number;
    effect: FrontlineLeaderPower;
  };
};

export type FrontlineHeroTrait =
  | { type: "none" }
  | { type: "bulwark"; shield: number }
  | { type: "flurry"; atk: number }
  | { type: "breach"; extra: number }
  | { type: "mend"; heal: number }
  | { type: "ambush"; bonusVsWounded: number }
  | { type: "chant"; atkAura: number }
  | { type: "lifesteal"; heal: number }
  | { type: "venom"; damage: number };

export type FrontlineHeroDef = {
  heroId: string;
  name: string;
  role: string;
  family: "hero" | "enemy";
  tier: number;
  rarity: Rarity;
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
  trait: FrontlineHeroTrait;
};

export type FrontlineSupportEffect =
  | { type: "strike"; damage: number }
  | { type: "shield"; amount: number }
  | { type: "mark"; damage: number };

export type FrontlineSupportDef = {
  id: string;
  name: string;
  maxHp: number;
  atk: number;
  duration: number;
  intercepts: boolean;
  effect?: FrontlineSupportEffect;
};

export type FrontlineCardEffect =
  | { type: "hero_strike"; atk: number; strikeFirst?: boolean; shield?: number }
  | { type: "front_shot"; damage: number }
  | { type: "rally"; atk: number; shield?: number }
  | { type: "heal_front"; heal: number; coreHeal?: number }
  | { type: "stun_front"; turns: number }
  | { type: "execute_front"; damage: number; bonusOpenCore?: number }
  | { type: "summon"; supportId: string };

export type FrontlineCardDef = {
  id: string;
  kind: FrontlineCardKind;
  name: string;
  cost: number;
  description: string;
  target: "ally_front" | "enemy_front" | "any_front" | "none";
  effect: FrontlineCardEffect;
  level?: number;
};

export type FrontlineCardProfileMap = Partial<Record<string, FrontlineCardDef>>;
export type FrontlineSupportProfileMap = Partial<Record<string, FrontlineSupportDef>>;

export type FrontlinePreset = {
  id: string;
  name: string;
  leaderId: string;
  squad: [string, string, string];
  deck: string[];
  rewardSeed: {
    gold: number;
    dust: number;
    gems: number;
    accountXp: number;
  };
};

export type FrontlineHeroState = {
  heroId: string;
  side: FrontlineSide;
  lane: FrontlineLane;
  name: string;
  role: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
  shield: number;
  alive: boolean;
  stun: number;
  tempAtk: number;
  tempShield: number;
  strikeFirst: boolean;
};

export type FrontlineSupportState = {
  id: string;
  side: FrontlineSide;
  lane: FrontlineLane;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  duration: number;
  intercepts: boolean;
  effect?: FrontlineSupportEffect;
};

export type FrontlineLaneState = {
  allyHero: FrontlineHeroState | null;
  enemyHero: FrontlineHeroState | null;
  allySupport: FrontlineSupportState | null;
  enemySupport: FrontlineSupportState | null;
};

export type FrontlineDeckState = {
  leaderId: string;
  deck: string[];
  hand: string[];
  discard: string[];
  command: number;
  powerCooldown: number;
  usedLeaderPower: boolean;
};

export type FrontlineEventKind =
  | "card"
  | "power"
  | "damage"
  | "heal"
  | "shield"
  | "summon"
  | "breach"
  | "ko"
  | "stun"
  | "round";

export type FrontlineEvent = {
  id: string;
  kind: FrontlineEventKind;
  side?: FrontlineSide;
  lane?: FrontlineLane;
  label: string;
  amount?: number;
  emphasis?: "high" | "mid" | "low";
};

export type FrontlineBattleState = {
  seed: number;
  round: number;
  turn: FrontlineSide;
  winner: FrontlineSide | "draw" | null;
  maxRounds: number;
  eventSeq: number;
  lanes: Record<FrontlineLane, FrontlineLaneState>;
  allyCoreHp: number;
  enemyCoreHp: number;
  allyCoreMaxHp: number;
  enemyCoreMaxHp: number;
  allyDeck: FrontlineDeckState;
  enemyDeck: FrontlineDeckState;
  allyCardProfiles?: FrontlineCardProfileMap;
  allySupportProfiles?: FrontlineSupportProfileMap;
  allyLeaderUsed: boolean;
  enemyLeaderUsed: boolean;
  selectedCardId: string | null;
  selectedLeaderPower: boolean;
  events: FrontlineEvent[];
  lastResolution: string[];
};
