// Tactical turn-based combat — state, units, abilities, actions.

import type { Rarity } from "@/lib/types";

export type Pos = { x: number; y: number };
export const posKey = (p: Pos) => `${p.x},${p.y}`;

export type AbilityKind =
  | "dmg_single"
  | "dmg_aoe"
  | "heal_aoe"
  | "buff_atk_self"
  | "shield_self"
  | "stun"
  | "dash_strike";

export type TacticalAbility = {
  id: string;
  name: string;
  description: string;
  kind: AbilityKind;
  range: number; // in tiles (Manhattan)
  radius?: number; // for aoe
  cooldown: number; // rounds
  power?: number; // multiplier on ATK (for damage/heal)
  turns?: number; // for buff/stun
};

export type TacticalBuffs = {
  atkPct: number;
  atkTurns: number;
  defPct: number;
  defTurns: number;
  shield: number;
  stun: number;
};

export type TacticalUnit = {
  uid: string;
  side: "ally" | "enemy";
  heroId: string;
  level: number;
  stars: number;
  skillLevel: number;
  name: string;
  emoji: string;
  rarity: Rarity;
  role: string;
  pos: Pos;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  move: number;
  range: number;
  ability: TacticalAbility;
  cooldown: number;
  buffs: TacticalBuffs;
  hasMoved: boolean;
  hasActed: boolean; // attacked / used ability / skipped
  alive: boolean;
};

export type ActionMode = "idle" | "move" | "attack" | "ability";

export type TacticalState = {
  grid: { w: number; h: number };
  obstacles: Pos[];
  units: TacticalUnit[];
  round: number;
  side: "ally" | "enemy";
  selectedUid: string | null;
  mode: ActionMode;
  log: string[];
  winner: null | "ally" | "enemy" | "draw";
  seed: number;
  flash?: {
    uid: string;
    kind: "hit" | "heal" | "shield" | "buff" | "summon" | "ability" | "death";
    amount?: number;
    label?: string;
    t: number;
  };
};

export type TacticalInit = {
  allies: { heroId: string; level: number; stars: number; skillLevel?: number }[];
  enemies: { heroId: string; level: number; stars: number; skillLevel?: number }[];
  seed: number;
  obstacles?: Pos[];
};
