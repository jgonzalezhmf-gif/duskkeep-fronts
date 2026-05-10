import type { FrontlinePreset } from "@/features/frontline/types";

export type FrontlineLeaderPortraitId =
  | "leader_aurora"
  | "leader_morrow"
  | "enemy_warlord"
  | "enemy_cultist"
  | "enemy_plague_lord"
  | "enemy_shadow_commander"
  | "crown_of_ashes";

export type FrontlineLeaderPortraitAsset = {
  src: string;
  webpSrc?: string;
  thumbnailWebpSrc?: string;
};

export const FRONTLINE_LEADER_PORTRAIT_ASSETS: Record<FrontlineLeaderPortraitId, FrontlineLeaderPortraitAsset> = {
  leader_aurora: {
    src: "/assets/frontline/leaders/aurora_valeborn.png",
    webpSrc: "/assets/frontline/leaders/aurora_valeborn.webp",
    thumbnailWebpSrc: "/assets/frontline/leaders/aurora_valeborn_128.webp",
  },
  leader_morrow: {
    src: "/assets/frontline/leaders/morrow_blackveil.png",
    webpSrc: "/assets/frontline/leaders/morrow_blackveil.webp",
    thumbnailWebpSrc: "/assets/frontline/leaders/morrow_blackveil_128.webp",
  },
  enemy_warlord: { src: "/assets/frontline/leaders/enemy_warlord.png", webpSrc: "/assets/frontline/leaders/enemy_warlord.webp" },
  enemy_cultist: { src: "/assets/frontline/leaders/enemy_cultist.png", webpSrc: "/assets/frontline/leaders/enemy_cultist.webp" },
  enemy_plague_lord: { src: "/assets/frontline/leaders/enemy_plague_lord.png", webpSrc: "/assets/frontline/leaders/enemy_plague_lord.webp" },
  enemy_shadow_commander: { src: "/assets/frontline/leaders/enemy_shadow_commander.png", webpSrc: "/assets/frontline/leaders/enemy_shadow_commander.webp" },
  crown_of_ashes: { src: "/assets/frontline/leaders/crown_of_ashes_leader.png", webpSrc: "/assets/frontline/leaders/crown_of_ashes_leader.webp" },
};

const ENEMY_PRESET_PORTRAITS: Partial<Record<string, FrontlineLeaderPortraitId>> = {
  bonewood_scouts: "enemy_warlord",
  bonewood_raiders: "enemy_warlord",
  rotwood_pack: "enemy_plague_lord",
  plague_pack: "enemy_plague_lord",
  bloodcourt_ambush: "enemy_shadow_commander",
  ember_vanguard: "enemy_warlord",
  ember_court: "enemy_shadow_commander",
  eclipse_court: "enemy_cultist",
  ashen_warband: "enemy_shadow_commander",
  ogre_siege_line: "enemy_plague_lord",
  void_eclipse_guard: "enemy_cultist",
  crown_of_ashes: "crown_of_ashes",
};

export function getFrontlineLeaderPortraitSrc(id: string | null | undefined) {
  return getFrontlineLeaderPortraitAsset(id)?.src ?? null;
}

export function getFrontlineLeaderPortraitAsset(id: string | null | undefined) {
  if (!id) return null;
  return FRONTLINE_LEADER_PORTRAIT_ASSETS[id as FrontlineLeaderPortraitId] ?? null;
}

export function getFrontlineEnemyLeaderPortraitForPreset(preset: Pick<FrontlinePreset, "id" | "name" | "bossId"> | null | undefined) {
  if (!preset) return FRONTLINE_LEADER_PORTRAIT_ASSETS.enemy_warlord.src;
  const portraitId = resolveEnemyLeaderPortraitId(preset);
  return FRONTLINE_LEADER_PORTRAIT_ASSETS[portraitId].src;
}

export function resolveEnemyLeaderPortraitId(preset: Pick<FrontlinePreset, "id" | "name" | "bossId">): FrontlineLeaderPortraitId {
  if (preset.bossId === "crown_of_ashes" || preset.id === "crown_of_ashes") return "crown_of_ashes";
  const explicit = ENEMY_PRESET_PORTRAITS[preset.id];
  if (explicit) return explicit;

  const signature = `${preset.id} ${preset.name}`.toLowerCase();
  if (signature.includes("plague") || signature.includes("rot") || signature.includes("ogre")) return "enemy_plague_lord";
  if (signature.includes("cult") || signature.includes("void") || signature.includes("eclipse")) return "enemy_cultist";
  if (signature.includes("shadow") || signature.includes("assassin") || signature.includes("court")) return "enemy_shadow_commander";
  return "enemy_warlord";
}
