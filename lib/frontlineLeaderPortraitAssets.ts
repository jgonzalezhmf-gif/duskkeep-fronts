import type { FrontlinePreset } from "@/features/frontline/types";

export type FrontlineLeaderPortraitId =
  | "leader_aurora"
  | "leader_morrow"
  | "enemy_warlord"
  | "enemy_cultist"
  | "enemy_plague_lord"
  | "enemy_shadow_commander"
  | "crown_of_ashes";

export const FRONTLINE_LEADER_PORTRAIT_ASSETS: Record<FrontlineLeaderPortraitId, string> = {
  leader_aurora: "/assets/frontline/leaders/aurora_valeborn.png",
  leader_morrow: "/assets/frontline/leaders/morrow_blackveil.png",
  enemy_warlord: "/assets/frontline/leaders/enemy_warlord.png",
  enemy_cultist: "/assets/frontline/leaders/enemy_cultist.png",
  enemy_plague_lord: "/assets/frontline/leaders/enemy_plague_lord.png",
  enemy_shadow_commander: "/assets/frontline/leaders/enemy_shadow_commander.png",
  crown_of_ashes: "/assets/frontline/leaders/crown_of_ashes_leader.png",
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
  if (!id) return null;
  return FRONTLINE_LEADER_PORTRAIT_ASSETS[id as FrontlineLeaderPortraitId] ?? null;
}

export function getFrontlineEnemyLeaderPortraitForPreset(preset: Pick<FrontlinePreset, "id" | "name" | "bossId"> | null | undefined) {
  if (!preset) return FRONTLINE_LEADER_PORTRAIT_ASSETS.enemy_warlord;
  const portraitId = resolveEnemyLeaderPortraitId(preset);
  return FRONTLINE_LEADER_PORTRAIT_ASSETS[portraitId];
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
