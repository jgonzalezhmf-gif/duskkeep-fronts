export const FORTRESS_DEFENSE_BALANCE = {
  maxWaves: 3,
  range: {
    min: 1,
    max: 5,
  },
  actions: {
    castleShot: {
      damage: 34,
      closeRangeBonus: 6,
    },
    bladeRush: {
      damage: 42,
      closeRangeBonus: 14,
      followUpDamage: 16,
    },
    volley: {
      damage: 12,
    },
    bulwark: {
      castleShield: 40,
      guardShield: 14,
    },
    arcaneBarrage: {
      damage: 18,
    },
    trap: {
      damage: 22,
      slow: 1,
      stunTurns: 2,
    },
    mend: {
      castleHeal: 30,
      guardHeal: 14,
    },
    warChant: {
      morale: 6,
      inspiredTurns: 2,
      damageBonus: 4,
    },
    deployGuard: {
      hp: 24,
    },
    deployArcher: {
      hp: 16,
    },
  },
  guards: {
    maxActive: 6,
    maxPerLane: 2,
    counterDamage: 10,
    archerCounterDamage: 8,
    counterReach: 1,
  },
} as const;
