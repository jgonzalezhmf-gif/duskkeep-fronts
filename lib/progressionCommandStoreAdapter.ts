import type { GameActions, GameState } from "@/lib/storeTypes";
import type { ProgressionCommandPatch, ProgressionCommandResult } from "@/lib/progressionCommands";

export type ProgressionStoreSet = (
  partial:
    | Partial<GameState & GameActions>
    | ((state: GameState & GameActions) => Partial<GameState & GameActions>),
) => void;

export type ProgressionStoreGet = () => GameState & GameActions;

export function applyProgressionCommandResultToStore(
  result: ProgressionCommandResult,
  set: ProgressionStoreSet,
  get: ProgressionStoreGet,
) {
  if (!result.ok) {
    emitProgressionNotifications(result, get);
    return false;
  }

  set((st) => ({
    ...toProgressionStorePatch(result.patch),
    ...(hasHeroesUpgradedEffect(result) ? { heroesUpgraded: st.heroesUpgraded + 1 } : {}),
  }));

  for (const effect of result.effects) {
    if (effect.missionProgress) {
      get().updateMissionProgress(effect.missionProgress.metric, effect.missionProgress.amount);
    }
  }
  emitProgressionNotifications(result, get);
  return true;
}

function toProgressionStorePatch(patch: ProgressionCommandPatch): Partial<GameState> {
  return {
    ...(patch.heroes ? { heroes: patch.heroes } : {}),
    ...(patch.resources ? { resources: patch.resources } : {}),
    ...(patch.frontlineCardLevels ? { frontlineCardLevels: patch.frontlineCardLevels } : {}),
    ...(patch.fortress ? { fortress: patch.fortress } : {}),
    ...(patch.frontlineFortress ? { frontlineFortress: patch.frontlineFortress } : {}),
  };
}

function hasHeroesUpgradedEffect(result: ProgressionCommandResult) {
  return result.effects.some((effect) => effect.missionProgress?.metric === "heroes_upgraded");
}

function emitProgressionNotifications(result: ProgressionCommandResult, get: ProgressionStoreGet) {
  for (const effect of result.effects) {
    if (effect.notification) {
      get().pushNotification(effect.notification.kind, effect.notification.message);
    }
  }
}
