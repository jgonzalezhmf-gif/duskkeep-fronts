import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import { FRONTLINE_UNIT_BY_ID } from "./data";
import type {
  FrontlineBossConfig,
  FrontlineBossState,
  FrontlineHeroState,
  FrontlineLaneState,
} from "./types";
import type { FrontlineHeroProfileMap } from "./heroProfile";

export function initBossState(boss: FrontlineBossConfig | null): FrontlineBossState | null {
  if (!boss) return null;
  const inferno = boss.signatures.find((sig) => sig.type === "inferno_wave");
  const veil = boss.signatures.find((sig) => sig.type === "twilight_veil");
  return {
    id: boss.id,
    infernoCountdown: inferno && inferno.type === "inferno_wave" ? inferno.cadenceRounds : 0,
    twilightCountdown: veil && veil.type === "twilight_veil" ? veil.cadenceRounds : 0,
    scorch: {},
  };
}

function resolveHeroDefinition(heroId: string, side: FrontlineSide, allyHeroProfiles?: FrontlineHeroProfileMap) {
  return side === "ally" ? allyHeroProfiles?.[heroId] ?? FRONTLINE_UNIT_BY_ID[heroId] : FRONTLINE_UNIT_BY_ID[heroId];
}

function buildHeroState(
  heroId: string,
  side: FrontlineSide,
  lane: FrontlineLane,
  allyHeroProfiles?: FrontlineHeroProfileMap,
): FrontlineHeroState {
  const definition = resolveHeroDefinition(heroId, side, allyHeroProfiles);
  if (!definition) {
    throw new Error(`Unknown frontline combatant ${heroId}`);
  }
  return {
    heroId,
    side,
    lane,
    name: definition.name,
    role: definition.role,
    hp: definition.maxHp,
    maxHp: definition.maxHp,
    atk: definition.atk,
    def: definition.def,
    speed: definition.speed,
    shield: 0,
    alive: true,
    stun: 0,
    tempAtk: 0,
    tempShield: 0,
    strikeFirst: false,
  };
}

export function createEmptyLanes(
  allySquad: [string, string, string],
  enemySquad: [string, string, string],
  allyHeroProfiles?: FrontlineHeroProfileMap,
) {
  return {
    left: {
      allyHero: buildHeroState(allySquad[0], "ally", "left", allyHeroProfiles),
      enemyHero: buildHeroState(enemySquad[0], "enemy", "left"),
      allySupport: null,
      enemySupport: null,
    },
    center: {
      allyHero: buildHeroState(allySquad[1], "ally", "center", allyHeroProfiles),
      enemyHero: buildHeroState(enemySquad[1], "enemy", "center"),
      allySupport: null,
      enemySupport: null,
    },
    right: {
      allyHero: buildHeroState(allySquad[2], "ally", "right", allyHeroProfiles),
      enemyHero: buildHeroState(enemySquad[2], "enemy", "right"),
      allySupport: null,
      enemySupport: null,
    },
  } satisfies Record<FrontlineLane, FrontlineLaneState>;
}
