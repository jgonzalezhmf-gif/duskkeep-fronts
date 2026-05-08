import { getAdventureNodeType } from "@/features/adventure/nodeResolution";
import type { FrontlineBattleModifiers } from "@/features/frontline/types";
import { ACCOUNT_XP_PER_LEVEL } from "@/lib/constants";
import type { AdventureLevel } from "@/lib/types";
import type { FrontlineEncounterBadgeKind } from "./FrontlineBattle";
import type { FrontlineBattleBackgroundKey } from "./frontlineVisualAssets";

export function deriveEncounterBadge(adventureLevel: AdventureLevel | null | undefined): FrontlineEncounterBadgeKind | null {
  if (!adventureLevel) return null;
  const nodeType = getAdventureNodeType(adventureLevel);
  if (nodeType === "boss" || nodeType === "elite" || nodeType === "danger") return nodeType;
  return null;
}

export function encounterModifiers(badge: FrontlineEncounterBadgeKind | null): FrontlineBattleModifiers | undefined {
  if (badge === "boss") return { enemyCoreBonus: 5, enemyStartingCommandBonus: 1 };
  if (badge === "elite") return { enemyCoreBonus: 2 };
  return undefined;
}

export function resolveBattleBackgroundKey(
  adventureLevel: Pick<AdventureLevel, "chapter"> | null | undefined,
  encounterKind: FrontlineEncounterBadgeKind | null,
  enemyBossId: string | undefined,
): FrontlineBattleBackgroundKey | null {
  const chapter = adventureLevel?.chapter ?? 1;
  if (chapter !== 1 && enemyBossId !== "the_eclipse") return null;
  if (enemyBossId === "the_eclipse" || encounterKind === "boss") return "ch1_boss_eclipse_gate";
  if (encounterKind === "elite" || encounterKind === "danger") return "ch1_battle_ruins";
  return "ch1_battle_road";
}

export function projectAccountProgress(level: number, xp: number, gain: number) {
  let nextLevel = level;
  let nextXp = xp + gain;
  while (nextXp >= ACCOUNT_XP_PER_LEVEL * nextLevel) {
    nextXp -= ACCOUNT_XP_PER_LEVEL * nextLevel;
    nextLevel += 1;
  }
  return { level: nextLevel, xp: nextXp };
}

export function accountProgressPercent(level: number, xp: number) {
  return Math.max(0, Math.min(100, (xp / (ACCOUNT_XP_PER_LEVEL * level)) * 100));
}
