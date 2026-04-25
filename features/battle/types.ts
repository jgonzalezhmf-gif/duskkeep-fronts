import type { Ability, DamageType, Hero } from "@/lib/types";

export type Side = "ally" | "enemy";

export type Unit = {
  uid: string;
  side: Side;
  hero: Hero;
  level: number;
  stars: number;
  skillLevel: number;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  cooldown: number; // remaining turns until active is ready
  stun: number; // turns of stun remaining
  shield: number; // absorbing HP
  atkBuffPct: number;
  atkBuffTurns: number;
  defBuffPct: number;
  defBuffTurns: number;
  power: number;
};

export type BattleInput = {
  allies: { heroId: string; level: number; stars: number; skillLevel?: number }[];
  enemies: { heroId: string; level: number; stars: number; skillLevel?: number }[];
  seed: number;
};

export type BattleEvent =
  | { type: "battle_start"; allies: Unit[]; enemies: Unit[] }
  | { type: "turn"; uid: string; actor: string }
  | { type: "basic_attack"; from: string; to: string; damage: number; crit: boolean }
  | { type: "ability"; from: string; ability: Ability; targets: string[] }
  | { type: "damage"; from: string; to: string; damage: number; damageType: DamageType; crit: boolean }
  | { type: "heal"; from: string; to: string; amount: number }
  | { type: "shield_applied"; on: string; amount: number }
  | { type: "buff"; on: string; kind: "atk" | "def"; pct: number; turns: number }
  | { type: "stun_applied"; on: string; turns: number }
  | { type: "passive_trigger"; on: string; kind: string; amount?: number }
  | { type: "death"; uid: string }
  | { type: "battle_end"; winner: Side | "draw"; turns: number };

export type BattleResult = {
  winner: Side | "draw";
  turns: number;
  events: BattleEvent[];
  endState: { allies: Unit[]; enemies: Unit[] };
};
