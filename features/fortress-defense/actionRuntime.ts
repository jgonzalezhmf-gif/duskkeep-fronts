import { FORTRESS_DEFENSE_ACTIONS } from "./catalog";
import type {
  FortressDefenseActionId,
  FortressDefenseActionRuntimeState,
  FortressDefenseActionStateMap,
  FortressDefenseState,
} from "./types";

export function getFortressDefenseActionState(
  state: FortressDefenseState,
  actionId: FortressDefenseActionId,
): FortressDefenseActionRuntimeState {
  const config = FORTRESS_DEFENSE_ACTIONS[actionId];
  const runtime = state.actionStates?.[actionId];
  const currentCooldown = Math.max(0, runtime?.currentCooldown ?? 0);
  if (config.maxCharges === undefined) return { currentCooldown };
  return {
    currentCooldown,
    maxCharges: config.maxCharges,
    charges: Math.max(0, Math.min(config.maxCharges, runtime?.charges ?? config.maxCharges)),
  };
}

export function createInitialActionStates(actionIds: FortressDefenseActionId[]): FortressDefenseActionStateMap {
  return Object.fromEntries(actionIds.map((actionId) => {
    const config = FORTRESS_DEFENSE_ACTIONS[actionId];
    return [
      actionId,
      config.maxCharges === undefined
        ? { currentCooldown: 0 }
        : { currentCooldown: 0, charges: config.maxCharges, maxCharges: config.maxCharges },
    ];
  }));
}

export function tickFortressDefenseActionCooldowns(state: FortressDefenseState): FortressDefenseActionStateMap {
  return Object.fromEntries(state.actionIds.map((actionId) => {
    const runtime = getFortressDefenseActionState(state, actionId);
    return [
      actionId,
      {
        ...runtime,
        currentCooldown: Math.max(0, runtime.currentCooldown - 1),
      },
    ];
  }));
}

export function markFortressDefenseActionUsed(
  state: FortressDefenseState,
  actionId: FortressDefenseActionId,
): FortressDefenseState {
  const runtime = getFortressDefenseActionState(state, actionId);
  state.actionStates = {
    ...state.actionStates,
    [actionId]: {
      ...runtime,
      currentCooldown: FORTRESS_DEFENSE_ACTIONS[actionId].cooldownTurns,
    },
  };
  return state;
}

export function consumeFortressDefenseActionCharge(
  state: FortressDefenseState,
  actionId: FortressDefenseActionId,
) {
  const runtime = getFortressDefenseActionState(state, actionId);
  if (runtime.maxCharges === undefined) return;
  state.actionStates = {
    ...state.actionStates,
    [actionId]: {
      ...runtime,
      charges: Math.max(0, (runtime.charges ?? runtime.maxCharges) - 1),
    },
  };
}
