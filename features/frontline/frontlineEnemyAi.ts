import type { FrontlineLane } from "@/lib/types";
import { FRONTLINE_LANES } from "./data";
import type { FrontlineBattleState, FrontlineCardDef } from "./types";
import { getHeroInLane, getSupportInLane } from "./frontlineBattleAccessors";
import { validCardTargets } from "./frontlineCardRules";

function enemyPreferredLanes(state: FrontlineBattleState) {
  return [...FRONTLINE_LANES].sort((left, right) => {
    const leftTarget = getHeroInLane(state, "ally", left);
    const rightTarget = getHeroInLane(state, "ally", right);
    const leftScore = left === "center" ? 4 : 0;
    const rightScore = right === "center" ? 4 : 0;
    const leftHp = leftTarget?.hp ?? 0;
    const rightHp = rightTarget?.hp ?? 0;
    return leftHp - rightHp || rightScore - leftScore;
  });
}

function chooseEnemyTarget(state: FrontlineBattleState, card: FrontlineCardDef): FrontlineLane | null {
  const valid = validCardTargets(state, "enemy", card.id);
  if (!valid.length) return null;
  const preferred = enemyPreferredLanes(state);
  for (const lane of preferred) {
    if (valid.includes(lane)) return lane;
  }
  return valid[0];
}

function findOpenAllyLane(state: FrontlineBattleState): FrontlineLane | undefined {
  return FRONTLINE_LANES.find(
    (lane) => !getHeroInLane(state, "ally", lane) && !getSupportInLane(state, "ally", lane),
  );
}

function findHighestThreatAllyLane(state: FrontlineBattleState, minAtk = 5): FrontlineLane | undefined {
  let bestLane: FrontlineLane | undefined;
  let bestScore = -Infinity;
  for (const lane of FRONTLINE_LANES) {
    const hero = getHeroInLane(state, "ally", lane);
    if (!hero?.alive || hero.stun > 0) continue;
    const atk = hero.atk + hero.tempAtk;
    if (atk < minAtk) continue;
    if (atk > bestScore) {
      bestScore = atk;
      bestLane = lane;
    }
  }
  return bestLane;
}

export function chooseEnemyAction(
  state: FrontlineBattleState,
  playable: FrontlineCardDef[],
): { card: FrontlineCardDef; lane: FrontlineLane | undefined } | null {
  const executeCard = playable.find((card) => card.effect.type === "execute_front");
  if (executeCard) {
    const openLane = findOpenAllyLane(state);
    if (openLane) return { card: executeCard, lane: openLane };
  }

  const healCard = playable.find((card) => card.effect.type === "heal_front");
  if (healCard) {
    const lowLane = FRONTLINE_LANES.find((lane) => {
      const hero = getHeroInLane(state, "enemy", lane);
      return hero && hero.hp <= hero.maxHp / 2;
    });
    if (lowLane) return { card: healCard, lane: lowLane };
  }

  const stunCard = playable.find((card) => card.effect.type === "stun_front");
  if (stunCard) {
    const threatLane = findHighestThreatAllyLane(state);
    if (threatLane) return { card: stunCard, lane: threatLane };
  }

  const buffCard = playable.find((card) => card.effect.type === "rally");
  if (buffCard) {
    const hasDamageFollowup = playable.some(
      (card) =>
        card !== buffCard &&
        (card.effect.type === "front_shot" || card.effect.type === "execute_front" || card.effect.type === "hero_strike"),
    );
    if (hasDamageFollowup) return { card: buffCard, lane: undefined };
  }

  const summonCard = playable.find((card) => card.kind === "summon");
  if (summonCard) {
    const openSummonLane = FRONTLINE_LANES.find((lane) => !getSupportInLane(state, "enemy", lane));
    if (openSummonLane) return { card: summonCard, lane: openSummonLane };
  }

  const ranked = [...playable].sort(
    (left, right) => right.cost - left.cost || left.id.localeCompare(right.id),
  );
  for (const card of ranked) {
    const target = card.target === "none" ? undefined : chooseEnemyTarget(state, card) ?? undefined;
    if (card.target !== "none" && !target) continue;
    return { card, lane: target };
  }

  return null;
}
