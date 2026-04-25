import type { LeaderDef } from "@/lib/types";

export const LEADERS: LeaderDef[] = [
  {
    id: "leader_aurora",
    name: "Aurora",
    title: "Warden of Dawnkeep",
    emoji: "👑",
    rarity: "legendary",
    faction: "order",
    baseHp: 110,
    baseAtk: 16,
    baseDef: 18,
    power: {
      id: "aurora_lance",
      name: "Solar Lance",
      description: "Strike an enemy unit for focused radiant damage.",
      cost: 2,
      cooldown: 2,
      effect: { type: "blast", damage: 26 },
    },
  },
  {
    id: "leader_morrow",
    name: "Morrow",
    title: "Hex Marshal",
    emoji: "🜂",
    rarity: "epic",
    faction: "shadow",
    baseHp: 100,
    baseAtk: 18,
    baseDef: 14,
    power: {
      id: "morrow_rally",
      name: "Night Command",
      description: "Rally all allied units with a brief attack surge.",
      cost: 2,
      cooldown: 3,
      effect: { type: "rally", atkPct: 0.22, turns: 2 },
    },
  },
  {
    id: "leader_elowen",
    name: "Elowen",
    title: "Mist Architect",
    emoji: "🌙",
    rarity: "epic",
    faction: "arcane",
    baseHp: 96,
    baseAtk: 14,
    baseDef: 14,
    power: {
      id: "elowen_grace",
      name: "Moonwell Grace",
      description: "Restore health to an allied unit or your core.",
      cost: 2,
      cooldown: 2,
      effect: { type: "heal", amount: 28 },
    },
  },
];

export const LEADER_BY_ID = Object.fromEntries(LEADERS.map((leader) => [leader.id, leader]));
export const STARTER_LEADER_ID = LEADERS[0].id;

export function getLeader(id: string): LeaderDef {
  const leader = LEADER_BY_ID[id];
  if (!leader) throw new Error(`Unknown leader: ${id}`);
  return leader;
}
