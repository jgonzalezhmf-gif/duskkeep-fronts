// Tactical profiles per hero. Each hero gets move/range and a tactical ability.
// These are the *gameplay* numbers for the tactical engine — distinct from the
// base stats in data/heroes.ts (which drive hp/atk/def scaling).

import type { TacticalAbility } from "./types";

export type TacticalProfile = {
  move: number;
  range: number;
  frontline: boolean; // placement hint
  ability: TacticalAbility;
};

export const TACTICAL: Record<string, TacticalProfile> = {
  bran: {
    move: 2, range: 1, frontline: true,
    ability: {
      id: "bran_shield", name: "Bulwark",
      description: "Shield self for 24% max HP, then hold the frontline.",
      kind: "shield_self", range: 0, cooldown: 3, power: 0.24, turns: 2,
    },
  },
  kara: {
    move: 3, range: 1, frontline: true,
    ability: {
      id: "kara_dash", name: "Dash Strike",
      description: "Leap adjacent to a target and strike for 220% ATK.",
      kind: "dash_strike", range: 4, cooldown: 2, power: 2.2,
    },
  },
  vex: {
    move: 3, range: 4, frontline: false,
    ability: {
      id: "vex_pierce", name: "Piercing Shot",
      description: "Long-range single shot for 260% ATK.",
      kind: "dmg_single", range: 5, cooldown: 2, power: 2.6,
    },
  },
  lyria: {
    move: 2, range: 3, frontline: false,
    ability: {
      id: "lyria_burst", name: "Arcane Burst",
      description: "AoE magic burst — 130% ATK in a 3-tile cross.",
      kind: "dmg_aoe", range: 3, radius: 1, cooldown: 3, power: 1.3,
    },
  },
  mira: {
    move: 3, range: 2, frontline: false,
    ability: {
      id: "mira_light", name: "Sacred Light",
      description: "Heal allies in 3-tile area for 180% ATK.",
      kind: "heal_aoe", range: 3, radius: 1, cooldown: 2, power: 1.8,
    },
  },
  drak: {
    move: 4, range: 1, frontline: true,
    ability: {
      id: "drak_shadow", name: "Shadow Step",
      description: "Dash to an enemy and strike for 280% ATK.",
      kind: "dash_strike", range: 5, cooldown: 3, power: 2.8,
    },
  },
  morr: {
    move: 2, range: 3, frontline: false,
    ability: {
      id: "morr_hex", name: "Death Hex",
      description: "Burst a tile for 220% magic damage.",
      kind: "dmg_aoe", range: 4, radius: 1, cooldown: 3, power: 2.2,
    },
  },
  ursa: {
    move: 2, range: 1, frontline: true,
    ability: {
      id: "ursa_roar", name: "Stoneheart Roar",
      description: "Shield self for 28% max HP and hold the choke point.",
      kind: "shield_self", range: 0, cooldown: 3, power: 0.28, turns: 2,
    },
  },
  fenra: {
    move: 3, range: 2, frontline: true,
    ability: {
      id: "fenra_pack", name: "Pack Strike",
      description: "Cross AoE around target for 110% ATK.",
      kind: "dmg_aoe", range: 3, radius: 1, cooldown: 2, power: 1.1,
    },
  },
  sol: {
    move: 3, range: 3, frontline: false,
    ability: {
      id: "sol_dawn", name: "Dawn",
      description: "Heal all allies in a 3-tile area for 250% ATK.",
      kind: "heal_aoe", range: 4, radius: 2, cooldown: 4, power: 2.5,
    },
  },
  noct: {
    move: 2, range: 4, frontline: false,
    ability: {
      id: "noct_eclipse", name: "Eclipse",
      description: "Massive AoE for 200% magic damage.",
      kind: "dmg_aoe", range: 5, radius: 2, cooldown: 4, power: 2.0,
    },
  },
  ren: {
    move: 3, range: 3, frontline: false,
    ability: {
      id: "ren_trick", name: "Trick Shot",
      description: "Stuns an enemy for 1 turn + 80% ATK.",
      kind: "stun", range: 4, cooldown: 3, power: 0.8, turns: 1,
    },
  },
  tovi: {
    move: 3, range: 2, frontline: false,
    ability: {
      id: "tovi_empower", name: "Empower",
      description: "Self +40% ATK for 2 turns.",
      kind: "buff_atk_self", range: 0, cooldown: 3, power: 0.4, turns: 2,
    },
  },
  grom: {
    move: 2, range: 1, frontline: true,
    ability: {
      id: "grom_cleave", name: "Earthcleave",
      description: "Hit all adjacent enemies for 150% ATK.",
      kind: "dmg_aoe", range: 1, radius: 1, cooldown: 3, power: 1.5,
    },
  },
};

export function getTacticalProfile(heroId: string): TacticalProfile {
  const p = TACTICAL[heroId];
  if (p) return p;
  // Safe default if a hero is missing a profile
  return {
    move: 3, range: 1, frontline: false,
    ability: {
      id: "default", name: "Strike",
      description: "Basic strike", kind: "dmg_single", range: 1, cooldown: 2, power: 1.5,
    },
  };
}
