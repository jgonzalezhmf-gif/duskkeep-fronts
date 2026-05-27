import type { FrontlineFortressOutcome } from "@/lib/types";

export type FortressDefenseActionId =
  | "castle_shot"
  | "deploy_guard"
  | "deploy_archer"
  | "blade_rush"
  | "bulwark"
  | "volley"
  | "arcane_barrage"
  | "traps"
  | "mend"
  | "war_chant";

export type FortressDefenseStatus = "active" | "victory" | "breach";

export type FortressDefenseRange = 1 | 2 | 3 | 4 | 5;
export type FortressDefenseLane = "top" | "middle" | "bottom";
export type FortressDefenseEnemyArchetype = "raider" | "brute" | "archer" | "siege_horror" | "scout" | "catapult";
export type FortressDefenseEnemyTrait = "suicide" | "breach";
export type FortressDefenseTargetType = "none" | "enemy" | "lane" | "slot" | "castle" | "allEnemies";
export type FortressDefenseActionDisabledReason = "cooldown" | "charges" | "noTargets" | "fullHp" | "maxGuards";

export type FortressDefenseTarget =
  | { type: "none" }
  | { type: "enemy"; enemyId: string }
  | { type: "lane"; lane: FortressDefenseLane }
  | { type: "slot"; lane: FortressDefenseLane; range: FortressDefenseRange }
  | { type: "castle" }
  | { type: "allEnemies" };

export type FortressDefenseEnemy = {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  armor: number;
  range: FortressDefenseRange;
  moveSpeed: number;
  attackRange: FortressDefenseRange;
  attackDamage: number;
  archetype: FortressDefenseEnemyArchetype;
  lane: FortressDefenseLane;
  slowedTurns: number;
  stunnedTurns: number;
  traits?: FortressDefenseEnemyTrait[];
  wave: number;
  kind: "skirmisher" | "brute" | "acolyte" | "siege";
};

export type FortressDefenseGuardUnitType = "guard" | "archer";

export type FortressDefenseGuard = {
  id: string;
  name: string;
  unitType: FortressDefenseGuardUnitType;
  maxHp: number;
  hp: number;
  shield: number;
  inspiredTurns: number;
  lane: FortressDefenseLane;
  range: 1 | 2;
  deployedTurn: number;
};

export type FortressDefenseTrap = {
  id: string;
  name: string;
  lane: FortressDefenseLane;
  range: 2 | 3 | 4;
  damage: number;
  slow: number;
  stun: number;
  deployedTurn: number;
};

export type FortressDefenseActionRuntimeState = {
  currentCooldown: number;
  charges?: number;
  maxCharges?: number;
};

export type FortressDefenseActionStateMap = Partial<Record<FortressDefenseActionId, FortressDefenseActionRuntimeState>>;

export type FortressDefenseActionConfig = {
  id: FortressDefenseActionId;
  label: string;
  role: "core" | "guard";
  tone: "gold" | "steel" | "ember" | "arcane" | "emerald";
  summary: string;
  requiresTarget: boolean;
  targetType: FortressDefenseTargetType;
  cooldownTurns: number;
  maxCharges?: number;
};

export type FortressDefenseActionDef = FortressDefenseActionConfig & {
  currentCooldown: number;
  charges?: number;
  disabledReason?: FortressDefenseActionDisabledReason;
};

export type FortressDefenseLogEntry = {
  turn: number;
  title: string;
  detail: string;
  tone: "ally" | "enemy" | "system";
};

export type FortressDefenseState = {
  schemaVersion: 1;
  seed: number;
  status: FortressDefenseStatus;
  turn: number;
  wave: number;
  maxWaves: number;
  castleHp: number;
  maxCastleHp: number;
  shield: number;
  morale: number;
  raidPressure: number;
  enemies: FortressDefenseEnemy[];
  guards: FortressDefenseGuard[];
  traps: FortressDefenseTrap[];
  defeated: number;
  actionIds: FortressDefenseActionId[];
  actionStates: FortressDefenseActionStateMap;
  log: FortressDefenseLogEntry[];
};

export type FortressDefenseClaimPayload = {
  battleSeed: number;
  outcome: FrontlineFortressOutcome;
  turns: number;
  castleHp: number;
  maxCastleHp: number;
  enemiesDefeated: number;
  defenseSummary: {
    schemaVersion: 1;
    seed: number;
    turns: number;
    outcome: FrontlineFortressOutcome;
    castleHp: number;
    maxCastleHp: number;
    enemiesDefeated: number;
    wavesCleared: number;
    actionLog: Array<{
      turn: number;
      action: Exclude<FortressDefenseActionId, "deploy_guard" | "deploy_archer" | "blade_rush">;
      targetId?: string;
      castleHp: number;
      enemyCount: number;
    }>;
  };
};
