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
  /** If set, the card can only be played this many times per battle. Once
   *  the limit is reached every copy still in deck/hand is removed (no
   *  reshuffle). Designed for high-impact cards (summons, signatures). */
  usesPerBattle?: number;
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
  bossId?: string;
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
  /** Card ids that hit their usesPerBattle limit and are removed from the
   *  draw pool for the rest of the battle. */
  exhaustedCardIds: string[];
  /** How many times each card id has been played this battle. */
  cardUseCounts: Record<string, number>;
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
  | "round"
  | "boss_signature";

export type FrontlineEvent = {
  id: string;
  kind: FrontlineEventKind;
  side?: FrontlineSide;
  lane?: FrontlineLane;
  label: string;
  amount?: number;
  emphasis?: "high" | "mid" | "low";
  signature?: "charge" | "cast" | "exhaust";
  signatureId?: string;
  subKind?: "hero" | "support";
  /** Hero trait that triggered this event, if any (bulwark, flurry, breach,
   *  mend, ambush, chant, lifesteal, venom). UI uses it to show a trait
   *  activation badge on the actor. */
  trait?: Exclude<FrontlineHeroTrait["type"], "none">;
};

export type FrontlineBattleModifiers = {
  enemyCoreBonus?: number;
  enemyStartingCommandBonus?: number;
};

export type FrontlineBossSegmentId = "head" | "core" | "blade";

export type FrontlineBossSegmentConfig = {
  lane: FrontlineLane;
  segmentId: FrontlineBossSegmentId;
  titleKey: string;
  weakpoint?: boolean;
};

export type FrontlineBossSignature =
  | { type: "inferno_wave"; cadenceRounds: number; damagePerHero: number }
  | { type: "ember_crown"; minSegmentsAlive: number; atkBonus: number }
  | { type: "cinder_mark"; damagePerStack: number }
  | { type: "twilight_veil"; cadenceRounds: number; cardCostBonus: number; durationTurns: number }
  | { type: "soul_drain"; healPerHit: number }
  | { type: "veil_armor"; minSegmentsAlive: number; damageReduction: number };

export type FrontlineBossConfig = {
  id: string;
  nameKey: string;
  assetKey: string;
  segments: FrontlineBossSegmentConfig[];
  signatures: FrontlineBossSignature[];
};

export type FrontlineBossState = {
  id: string;
  infernoCountdown: number;
  scorch: Partial<Record<FrontlineLane, number>>;
  twilightCountdown: number;
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
  enemyStartCommandBonus: number;
  bossState: FrontlineBossState | null;
  playerCardCostMod: number;
  playerCardCostModTurnsLeft: number;
  /** When set during a traced run, every visible event also pushes a deep-copy snapshot of the state at that point. UI uses these to keep the rendered board in sync with the animation playback. Internal — never persisted. */
  _trace?: FrontlineSnapshot[];
};

export type FrontlineSnapshot = {
  eventId: string;
  state: FrontlineBattleState;
};

export type FrontlineTracedResult = {
  final: FrontlineBattleState;
  snapshots: FrontlineSnapshot[];
};
