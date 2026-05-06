// Shared domain types — used by engine, UI, persistence and seeds.

export type Rarity = "common" | "rare" | "epic" | "legendary";
export type Faction = "order" | "shadow" | "wild" | "arcane";
export type Role = "tank" | "fighter" | "archer" | "mage" | "support" | "summoner";
export type DamageType = "physical" | "magic" | "true";
export type CardKind = "hero" | "spell";

export type Stats = {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  // crit chance 0..1
  crit: number;
};

export type AbilityKind = "active" | "passive";
export type TargetKind =
  | "enemy_single"
  | "enemy_lowest_hp"
  | "enemy_all"
  | "ally_single"
  | "ally_lowest_hp"
  | "self";

export type Ability = {
  id: string;
  name: string;
  kind: AbilityKind;
  cooldown?: number; // turns. 0/undefined = every turn.
  target?: TargetKind;
  // Effect descriptor — engine reads this declaratively.
  effect: AbilityEffect;
  description: string;
};

export type AbilityEffect =
  | { type: "damage"; multiplier: number; damageType: DamageType; aoe?: boolean }
  | { type: "heal"; multiplier: number; aoe?: boolean }
  | { type: "buff_atk"; pct: number; turns: number }
  | { type: "buff_def"; pct: number; turns: number }
  | { type: "shield"; pct: number; turns: number }
  | { type: "stun"; turns: number }
  | { type: "passive_thorns"; pct: number }
  | { type: "passive_lifesteal"; pct: number }
  | { type: "passive_regen"; pct: number };

export type Hero = {
  id: string;
  name: string;
  rarity: Rarity;
  faction: Faction;
  role: Role;
  baseStats: Stats;
  active: Ability;
  passive: Ability;
  tags: string[];
  emoji: string;
};

export type PlayerHero = {
  heroId: string;
  level: number;
  stars: number; // 1..6
  shards: number; // toward next star
  xp: number;
  skillLevel: number; // 1..5 — enhanced via Arcane Dust
};

export type Resources = {
  gold: number;
  dust: number;
  gems: number;
  arenaTickets: number;
  adventureKeys: number;
};

export type AdventureLevel = {
  id: string;
  chapter: number;
  index: number;
  name: string;
  /** Explicit Duskkeep Fronts enemy preset used by Adventure/pre-combat/Combat. */
  frontlinePresetId?: string;
  enemyTeam: EnemyTemplate[];
  rewards: Rewards;
  firstClearRewards?: Rewards;
  unlockAccountLevel?: number;
  /** Optional graph targets unlocked when this level is completed. */
  unlocks?: string[];
  recommendedPower: number;
  /** Optional obstacles on the tactical grid (6x8, y goes top→bottom). */
  obstacles?: { x: number; y: number }[];
};

export type EnemyTemplate = {
  heroId: string;
  level: number;
  stars: number;
};

export type Rewards = {
  gold?: number;
  dust?: number;
  gems?: number;
  xp?: number;
  accountXp?: number;
  arenaTickets?: number;
  adventureKeys?: number;
  shards?: { heroId: string; amount: number }[];
  frontlineCards?: { cardId: string }[];
};

export type MissionKind = "daily" | "weekly";

export type Mission = {
  id: string;
  kind: MissionKind;
  name: string;
  description: string;
  goal: number;
  metric: MissionMetric;
  rewards: Rewards;
};

export type MissionProgress = {
  progress: number;
  claimed: boolean;
  resetAt: string;
};

export type CardRef = {
  id: string;
  name: string;
  kind: CardKind;
  cost: number;
  rarity: Rarity;
  emoji: string;
  description: string;
};

export type HeroCard = CardRef & {
  kind: "hero";
  heroId: string;
  summonEffects?: SummonEffect[];
};

export type SummonEffect =
  | { type: "damage_nearest_enemy"; amount: number; fallbackCore?: boolean; sameRow?: boolean }
  | { type: "damage_enemy_core"; amount: number }
  | { type: "shield_self"; amount: number }
  | { type: "shield_core"; amount: number }
  | { type: "heal_lowest_ally"; amount: number; includeCore?: boolean }
  | { type: "buff_allies"; atkPct: number; turns: number }
  | { type: "stun_nearest_enemy"; turns: number; sameRow?: boolean };

export type SpellEffect =
  | { type: "damage_aoe"; damage: number; radius: number }
  | { type: "heal_aoe"; amount: number; radius: number }
  | { type: "buff_allies"; atkPct: number; turns: number }
  | { type: "damage_line"; damage: number }
  | { type: "shield_leader"; amount: number };

export type SpellCard = CardRef & {
  kind: "spell";
  effect: SpellEffect;
};

export type DeckCard = HeroCard | SpellCard;

export type LeaderPowerEffect =
  | { type: "blast"; damage: number }
  | { type: "heal"; amount: number }
  | { type: "shield"; amount: number }
  | { type: "rally"; atkPct: number; turns: number };

export type LeaderPower = {
  id: string;
  name: string;
  description: string;
  cost: number;
  cooldown: number;
  effect: LeaderPowerEffect;
};

export type LeaderDef = {
  id: string;
  name: string;
  title: string;
  emoji: string;
  rarity: Rarity;
  faction: Faction;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  power: LeaderPower;
};

export type FortressBuildingDef = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  maxLevel: number;
  baseCost: { gold?: number; dust?: number; gems?: number };
  scaling: number;
  bonusText: string;
};

export type FortressState = {
  level: number;
  style: "dawnkeep" | "wildgrove" | "ashenhold";
  buildings: Record<string, number>;
  lastCollectedAt: string | null;
};

export type MissionMetric =
  | "battles_won"
  | "adventure_levels_cleared"
  | "arena_battles"
  | "heroes_upgraded"
  | "events_played";

export type EventDef = {
  id: string;
  name: string;
  description: string;
  startsAt: string; // ISO; for alpha we treat as always-on rotating
  endsAt: string;
  enemyTeam: EnemyTemplate[];
  rewards: Rewards;
  emoji: string;
};

export type ShopOffer = {
  id: string;
  name: string;
  description: string;
  cost: { gems?: number; gold?: number };
  contents: Rewards;
  oneTime?: boolean;
  emoji: string;
};

export type ArenaSnapshot = {
  id: string;
  ownerName: string;
  power: number;
  team: { heroId: string; level: number; stars: number }[];
};

export type AccountState = {
  name: string;
  level: number;
  xp: number;
  createdAt: string;
};

export type FrontlineSide = "ally" | "enemy";
export type FrontlineLane = "left" | "center" | "right";
export type FrontlineCardKind = "order" | "tactic" | "summon";

export type FrontlineLoadout = {
  leaderId: string;
  squad: [string | null, string | null, string | null];
  deck: (string | null)[];
};

export type FrontlineFortressBuildingId = "keep" | "treasury" | "barracks";
export type FrontlineFortressOutcome = "full_repel" | "partial_hold" | "breach";

export type FrontlineFortressReport = {
  resolvedAt: string;
  outcome: FrontlineFortressOutcome;
  attackPower: number;
  defensePower: number;
  integrityDelta: number;
  rewards: Rewards;
};

export type FrontlineFortressState = {
  buildings: Record<FrontlineFortressBuildingId, number>;
  integrity: number;
  garrison: [string | null, string | null, string | null];
  lastResolvedAt: string | null;
  nextAttackAt: string | null;
  raidsResolved: number;
  lastReport: FrontlineFortressReport | null;
};
