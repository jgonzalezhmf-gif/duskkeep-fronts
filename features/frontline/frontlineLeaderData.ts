import { getLeader } from "@/data/leaders";
import type { FrontlineLeaderDef } from "./types";

const leader = (leaderId: string) => getLeader(leaderId);

export const FRONTLINE_LEADERS: FrontlineLeaderDef[] = [
  {
    id: "leader_aurora",
    name: leader("leader_aurora").name,
    title: leader("leader_aurora").title,
    factionTone: "dawn",
    coreHp: 25,
    power: {
      name: "Solar Lance",
      description: "Blast a chosen front and steady your core.",
      cost: 2,
      cooldown: 2,
      effect: { type: "beam", damage: 6, healCore: 2 },
    },
  },
  {
    id: "leader_morrow",
    name: leader("leader_morrow").name,
    title: leader("leader_morrow").title,
    factionTone: "shadow",
    coreHp: 24,
    power: {
      name: "Night Command",
      description: "All allied heroes surge for the current clash.",
      cost: 2,
      cooldown: 2,
      effect: { type: "rally", atk: 2, shield: 2 },
    },
  },
];

export const FRONTLINE_LEADER_BY_ID = Object.fromEntries(
  FRONTLINE_LEADERS.map((entry) => [entry.id, entry]),
);
