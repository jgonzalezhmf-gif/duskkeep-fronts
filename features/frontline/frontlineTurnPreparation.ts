import type { FrontlineSide } from "@/lib/types";
import type { FrontlineBattleState } from "./types";
import { ownDeck, setOwnDeck } from "./frontlineBattleAccessors";
import { drawInto } from "./frontlineDeckState";
import { pushEvent } from "./frontlineEvents";
import { cloneState } from "./frontlineStateClone";
import { consumeCinderMark, tickBossSignatures } from "./frontlineBossSignatures";

const COMMAND_PER_TURN = 3;
const DRAW_PER_TURN = 2;

export function prepareTurn(state: FrontlineBattleState, side: FrontlineSide) {
  const next = cloneState(state);
  next.turn = side;
  next.selectedCardId = null;
  next.selectedLeaderPower = false;
  const deck = drawInto(ownDeck(next, side), DRAW_PER_TURN, next.seed + next.round * (side === "ally" ? 23 : 47));
  deck.command = COMMAND_PER_TURN;
  if (side === "enemy" && next.enemyStartCommandBonus > 0) {
    deck.command += next.enemyStartCommandBonus;
    next.enemyStartCommandBonus = 0;
  }
  deck.usedLeaderPower = false;
  deck.powerCooldown = Math.max(0, deck.powerCooldown - 1);
  setOwnDeck(next, side, deck);
  if (side === "ally") next.allyLeaderUsed = false;
  else next.enemyLeaderUsed = false;
  pushEvent(next, { kind: "round", side, label: `${side === "ally" ? "Player" : "Enemy"} turn ${next.round}`, emphasis: "low" });
  if (side === "ally") consumeCinderMark(next);
  if (side === "ally" && next.playerCardCostModTurnsLeft > 0) {
    next.playerCardCostModTurnsLeft -= 1;
    if (next.playerCardCostModTurnsLeft === 0) next.playerCardCostMod = 0;
  }
  if (side === "enemy") tickBossSignatures(next);
  return next;
}

export function setupEnemyPhase(state: FrontlineBattleState): FrontlineBattleState {
  const next = cloneState(state);
  next.turn = "enemy";
  next.selectedCardId = null;
  next.selectedLeaderPower = false;
  const deck = drawInto(ownDeck(next, "enemy"), DRAW_PER_TURN, next.seed + next.round * 47);
  deck.command = COMMAND_PER_TURN;
  if (next.enemyStartCommandBonus > 0) {
    deck.command += next.enemyStartCommandBonus;
    next.enemyStartCommandBonus = 0;
  }
  deck.usedLeaderPower = false;
  deck.powerCooldown = Math.max(0, deck.powerCooldown - 1);
  setOwnDeck(next, "enemy", deck);
  next.enemyLeaderUsed = false;
  pushEvent(next, { kind: "round", side: "enemy", label: `Enemy turn ${next.round}`, emphasis: "low" });
  return next;
}
