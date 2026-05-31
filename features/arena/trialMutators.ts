import type { FrontlineBattleModifiers } from "@/features/frontline/types";

export type ArenaTrialMutatorId = "breach_weather" | "plague_mist" | "storm_oath";

export type ArenaTrialMutator = {
  labelKey: string;
  descriptionKey: string;
  modifiers: FrontlineBattleModifiers;
};

export const ARENA_TRIAL_MUTATORS: Record<ArenaTrialMutatorId, ArenaTrialMutator> = {
  breach_weather: {
    labelKey: "arenaScreen.trialMutators.breach_weather.label",
    descriptionKey: "arenaScreen.trialMutators.breach_weather.description",
    modifiers: { enemyStartingCommandBonus: 1 },
  },
  plague_mist: {
    labelKey: "arenaScreen.trialMutators.plague_mist.label",
    descriptionKey: "arenaScreen.trialMutators.plague_mist.description",
    modifiers: { enemyCoreBonus: 2 },
  },
  storm_oath: {
    labelKey: "arenaScreen.trialMutators.storm_oath.label",
    descriptionKey: "arenaScreen.trialMutators.storm_oath.description",
    modifiers: { enemyCoreBonus: 4, enemyStartingCommandBonus: 1 },
  },
};

export const ARENA_TRIAL_MUTATOR_BY_RIVAL_ID: Record<string, ArenaTrialMutatorId> = {
  arena_bonewood: "breach_weather",
  arena_plague: "plague_mist",
  arena_ember: "storm_oath",
};

export function getArenaTrialMutatorForRival(rivalId: string) {
  const mutatorId = ARENA_TRIAL_MUTATOR_BY_RIVAL_ID[rivalId];
  return mutatorId ? ARENA_TRIAL_MUTATORS[mutatorId] : null;
}

export function arenaTrialModifiersForRival(rivalId: string): FrontlineBattleModifiers | undefined {
  return getArenaTrialMutatorForRival(rivalId)?.modifiers;
}
