import type { CombatAssetIconName } from "@/lib/iconAssets";
import type { FortressDefenseEnemy } from "@/features/fortress-defense/engine";
import type { TranslateFn } from "./fortressPageHelpers";

export function fortressDefenseEnemyIcon(kind: FortressDefenseEnemy["kind"]): CombatAssetIconName {
  if (kind === "siege") return "danger";
  if (kind === "brute") return "attack";
  if (kind === "acolyte") return "skill";
  return "move";
}

export function fortressDefenseEnemyDisplayName(enemy: FortressDefenseEnemy, t: TranslateFn) {
  return t(`fortressScreen.defense.enemyKinds.${enemy.kind}`);
}

export function fortressDefenseEnemyVisualId(enemy: FortressDefenseEnemy) {
  if (enemy.archetype === "archer") return "enemy_bone_archer";
  if (enemy.archetype === "brute") return "enemy_ember_ogre";
  if (enemy.archetype === "siege_horror" || enemy.archetype === "catapult") return "enemy_plague_troll";
  if (enemy.archetype === "scout") return "enemy_blood_duelist";
  return "enemy_rotmaw";
}
