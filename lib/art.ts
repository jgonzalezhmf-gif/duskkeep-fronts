export const LEADER_PORTRAITS = {
  leader_aurora: "/art/portraits/leader-aurora.png",
  leader_morrow: "/art/portraits/leader-morrow.png",
  leader_elowen: "/art/portraits/leader-elowen.png",
} as const;

export const HERO_PORTRAITS = {
  bran: "/art/portraits/bran.png",
  kara: "/art/portraits/kara.png",
  vex: "/art/portraits/vex.png",
  mira: "/art/portraits/mira.png",
  tovi: "/art/portraits/tovi.png",
} as const;

const BATTLE_BACKDROPS = [
  "/art/battle-cavern.png",
  "/art/battle-forest.png",
  "/art/battle-desert.png",
  "/art/battle-volcanic.png",
  "/art/battle-ruins.png",
] as const;

export function getLeaderPortrait(id: string) {
  return LEADER_PORTRAITS[id as keyof typeof LEADER_PORTRAITS] ?? null;
}

export function getHeroPortrait(id: string) {
  return HERO_PORTRAITS[id as keyof typeof HERO_PORTRAITS] ?? null;
}

export function getUnitPortrait(id: string) {
  return getLeaderPortrait(id) ?? getHeroPortrait(id);
}

export function getBattleBackdrop(seed: number) {
  return BATTLE_BACKDROPS[Math.abs(seed) % BATTLE_BACKDROPS.length];
}
