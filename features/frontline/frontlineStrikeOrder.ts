import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import type { FrontlineBattleState, FrontlineHeroState, FrontlineSupportState } from "./types";
import { initiativeForHero } from "./frontlineCombatantRules";

export type FrontlineActor =
  | { side: FrontlineSide; lane: FrontlineLane; kind: "hero"; hero: FrontlineHeroState }
  | { side: FrontlineSide; lane: FrontlineLane; kind: "support"; support: FrontlineSupportState };

export type FrontlineStrikeOrderEntry = {
  side: FrontlineSide;
  kind: "hero" | "support";
  initiative: number;
  name: string;
};

export function actorList(state: FrontlineBattleState, lane: FrontlineLane): FrontlineActor[] {
  const laneState = state.lanes[lane];
  const actors: FrontlineActor[] = [];
  const allyHero = laneState.allyHero;
  const enemyHero = laneState.enemyHero;
  const allySupport = laneState.allySupport;
  const enemySupport = laneState.enemySupport;
  if (allyHero?.alive) actors.push({ side: "ally", lane, kind: "hero", hero: allyHero });
  if (enemyHero?.alive) actors.push({ side: "enemy", lane, kind: "hero", hero: enemyHero });
  if (allySupport && allySupport.hp > 0 && allySupport.atk > 0) actors.push({ side: "ally", lane, kind: "support", support: allySupport });
  if (enemySupport && enemySupport.hp > 0 && enemySupport.atk > 0) actors.push({ side: "enemy", lane, kind: "support", support: enemySupport });

  actors.sort((left, right) => {
    const leftValue = left.kind === "hero" ? initiativeForHero(left.hero) : 1;
    const rightValue = right.kind === "hero" ? initiativeForHero(right.hero) : 1;
    if (leftValue === rightValue) {
      if (left.side === state.turn && right.side !== state.turn) return -1;
      if (right.side === state.turn && left.side !== state.turn) return 1;
      return left.side === "ally" ? -1 : 1;
    }
    return rightValue - leftValue;
  });
  return actors;
}

export function laneStrikeOrder(state: FrontlineBattleState, lane: FrontlineLane): FrontlineStrikeOrderEntry[] {
  return actorList(state, lane).map((actor) => ({
    side: actor.side,
    kind: actor.kind,
    initiative: actor.kind === "hero" ? initiativeForHero(actor.hero) : 1,
    name: actor.kind === "hero" ? actor.hero.name : actor.support.name,
  }));
}
