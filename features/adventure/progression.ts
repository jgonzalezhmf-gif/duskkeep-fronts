import { ADVENTURE, ADVENTURE_BY_ID } from "@/data/adventure";
import { ADVENTURE_MAP_CHAPTER_LAYOUTS } from "@/components/game/adventure/adventureMapLayout";
import type { AdventureProgressEntry } from "@/features/adventure/nodeResolution";
import type { AdventureLevel } from "@/lib/types";

export function isAdventureChapterDemoLocked(chapter: number) {
  return chapter > 1;
}

export function getAdventureLevelUnlockTargets(level: AdventureLevel) {
  const explicitTargets = level.unlocks?.filter((id) => ADVENTURE_BY_ID[id]);
  if (explicitTargets?.length) return explicitTargets;

  const layout = ADVENTURE_MAP_CHAPTER_LAYOUTS[level.chapter];
  const layoutNode = layout?.nodes.find((node) => node.id === level.id);
  const layoutTargets = layoutNode?.connectsTo?.filter((id) => ADVENTURE_BY_ID[id]);
  if (layoutTargets?.length) return layoutTargets;

  const routeTargets = layout?.routes?.filter((route) => route.from === level.id && ADVENTURE_BY_ID[route.to]).map((route) => route.to);
  if (routeTargets?.length) return routeTargets;

  const chapterLevels = ADVENTURE.filter((entry) => entry.chapter === level.chapter).sort((a, b) => a.index - b.index);
  const nextLevel = chapterLevels.find((entry) => entry.index === level.index + 1);
  return nextLevel ? [nextLevel.id] : [];
}

export function getAdventureUnlockedLevelIds(
  progress: Record<string, AdventureProgressEntry | undefined>,
  accountLevel: number,
) {
  const unlocked = new Set<string>();
  const firstDemoLevel = ADVENTURE.filter((level) => !isAdventureChapterDemoLocked(level.chapter)).sort((a, b) =>
    a.chapter === b.chapter ? a.index - b.index : a.chapter - b.chapter,
  )[0];

  if (firstDemoLevel && (firstDemoLevel.unlockAccountLevel ?? 0) <= accountLevel) {
    unlocked.add(firstDemoLevel.id);
  }

  for (const level of ADVENTURE) {
    const levelProgress = progress[level.id];
    if (!levelProgress?.cleared && !levelProgress?.claimed) continue;

    unlocked.add(level.id);
    for (const targetId of getAdventureLevelUnlockTargets(level)) {
      const target = ADVENTURE_BY_ID[targetId];
      if (!target || isAdventureChapterDemoLocked(target.chapter)) continue;
      if ((target.unlockAccountLevel ?? 0) > accountLevel) continue;
      unlocked.add(targetId);
    }
  }

  return unlocked;
}

export function isAdventureLevelUnlocked(
  level: AdventureLevel,
  progress: Record<string, AdventureProgressEntry | undefined>,
  accountLevel: number,
) {
  if (isAdventureChapterDemoLocked(level.chapter)) return false;
  if ((level.unlockAccountLevel ?? 0) > accountLevel) return false;
  if (progress[level.id]?.cleared || progress[level.id]?.claimed) return true;
  return getAdventureUnlockedLevelIds(progress, accountLevel).has(level.id);
}
