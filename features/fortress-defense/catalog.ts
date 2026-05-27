import type { FortressDefenseActionConfig, FortressDefenseActionId, FortressDefenseEnemy, FortressDefenseLane, FortressDefenseRange } from "./types";

export const FORTRESS_DEFENSE_ACTIONS: Record<FortressDefenseActionId, FortressDefenseActionConfig> = {
  castle_shot: {
    id: "castle_shot",
    label: "Castle shot",
    role: "core",
    tone: "gold",
    summary: "Focused shot from the keep.",
    requiresTarget: true,
    targetType: "enemy",
    cooldownTurns: 1,
  },
  deploy_guard: {
    id: "deploy_guard",
    label: "Deploy guard",
    role: "core",
    tone: "steel",
    summary: "Place a garrison guard near the gate.",
    requiresTarget: true,
    targetType: "slot",
    cooldownTurns: 4,
    maxCharges: 2,
  },
  deploy_archer: {
    id: "deploy_archer",
    label: "Deploy archer",
    role: "core",
    tone: "gold",
    summary: "Place a ranged garrison archer near the gate.",
    requiresTarget: true,
    targetType: "slot",
    cooldownTurns: 4,
    maxCharges: 2,
  },
  blade_rush: {
    id: "blade_rush",
    label: "Blade rush",
    role: "guard",
    tone: "ember",
    summary: "Kara strikes a target and follows through with a second cut.",
    requiresTarget: true,
    targetType: "enemy",
    cooldownTurns: 2,
  },
  bulwark: {
    id: "bulwark",
    label: "Bulwark",
    role: "guard",
    tone: "steel",
    summary: "Raise guard and absorb the next breach.",
    requiresTarget: false,
    targetType: "castle",
    cooldownTurns: 3,
  },
  volley: {
    id: "volley",
    label: "Arrow volley",
    role: "guard",
    tone: "gold",
    summary: "Hit every attacker on the approach.",
    requiresTarget: false,
    targetType: "allEnemies",
    cooldownTurns: 2,
  },
  arcane_barrage: {
    id: "arcane_barrage",
    label: "Arcane barrage",
    role: "guard",
    tone: "arcane",
    summary: "Blast clustered attackers with unstable magic.",
    requiresTarget: false,
    targetType: "allEnemies",
    cooldownTurns: 3,
  },
  traps: {
    id: "traps",
    label: "Shadow trap",
    role: "guard",
    tone: "ember",
    summary: "Place a trap on the approach.",
    requiresTarget: true,
    targetType: "slot",
    cooldownTurns: 3,
  },
  mend: {
    id: "mend",
    label: "Mend walls",
    role: "guard",
    tone: "emerald",
    summary: "Recover castle integrity during the assault.",
    requiresTarget: false,
    targetType: "castle",
    cooldownTurns: 4,
    maxCharges: 2,
  },
  war_chant: {
    id: "war_chant",
    label: "War chant",
    role: "guard",
    tone: "gold",
    summary: "Build morale and empower the next castle orders.",
    requiresTarget: false,
    targetType: "none",
    cooldownTurns: 2,
  },
};

export function createFortressWaveEnemies(
  wave: number,
  seed: number,
  raidPressure: number,
): FortressDefenseEnemy[] {
  const pressure = raidPressure + wave;
  const count = Math.min(5, 2 + wave + (raidPressure >= 7 ? 1 : 0));
  const templates: Array<Omit<FortressDefenseEnemy, "id" | "hp" | "wave" | "range" | "lane" | "slowedTurns" | "stunnedTurns">> = [
    { name: "Ash raider", maxHp: 32 + pressure, armor: 1, moveSpeed: 1, attackRange: 1, attackDamage: 7 + wave, archetype: "raider", kind: "skirmisher" },
    { name: "Bone archer", maxHp: 26 + pressure, armor: 0, moveSpeed: 1, attackRange: 3, attackDamage: 5 + wave, archetype: "archer", kind: "acolyte" },
    { name: "Gate brute", maxHp: 54 + pressure * 2, armor: 2, moveSpeed: 1, attackRange: 1, attackDamage: 10 + wave * 2, archetype: "brute", kind: "brute" },
    { name: "Ash scout", maxHp: 22 + pressure, armor: 0, moveSpeed: 1, attackRange: 1, attackDamage: 4 + wave, archetype: "scout", kind: "skirmisher" },
    { name: "Siege horror", maxHp: 76 + pressure * 3, armor: 3, moveSpeed: 1, attackRange: 1, attackDamage: 14 + wave * 2, archetype: "siege_horror", kind: "siege" },
  ];
  const wavePlans = [
    [0, 3, 1],
    [0, 1, 2, 3],
    [1, 2, 4, 0, 3],
  ];
  const plan = wavePlans[Math.min(wavePlans.length - 1, wave - 1)];
  const lanes: FortressDefenseLane[] = ["top", "middle", "bottom"];

  return Array.from({ length: count }, (_, index) => {
    const template = templates[plan[(seed + index) % plan.length]];
    const maxHp = Math.round(template.maxHp * (1 + wave * 0.08));
    const startRange = startingRangeForEnemy(template.archetype, wave, index);
    return {
      ...template,
      id: `w${wave}-${index}-${template.kind}`,
      wave,
      maxHp,
      hp: maxHp,
      range: startRange,
      lane: lanes[(seed + wave + index) % lanes.length],
      slowedTurns: 0,
      stunnedTurns: 0,
    };
  });
}

function startingRangeForEnemy(
  archetype: FortressDefenseEnemy["archetype"],
  wave: number,
  index: number,
): FortressDefenseRange {
  if (archetype === "archer") return wave >= 3 && index % 2 === 0 ? 4 : 5;
  if (archetype === "scout") return 5;
  if (archetype === "siege_horror") return 5;
  return (wave >= 2 && index % 2 === 1 ? 4 : 5) as FortressDefenseRange;
}
