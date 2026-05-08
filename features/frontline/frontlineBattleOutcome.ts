import type { FrontlineBattleState } from "./types";

export function battleResolved(state: FrontlineBattleState) {
  return state.allyCoreHp <= 0 || state.enemyCoreHp <= 0 || Boolean(state.winner);
}

export function determineWinner(state: FrontlineBattleState) {
  if (state.allyCoreHp <= 0 && state.enemyCoreHp <= 0) return "draw";
  if (state.enemyCoreHp <= 0) return "ally";
  if (state.allyCoreHp <= 0) return "enemy";
  if (state.round >= state.maxRounds && state.turn === "enemy") {
    if (state.allyCoreHp === state.enemyCoreHp) return "draw";
    return state.allyCoreHp > state.enemyCoreHp ? "ally" : "enemy";
  }
  return null;
}
