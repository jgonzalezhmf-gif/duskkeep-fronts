import type { FrontlineBattleState } from "@/features/frontline/types";

export type FrontlineBattleStats = {
  rounds: number;
  damageDealtByAlly: number;
  damageDealtByEnemy: number;
  healingByAlly: number;
  shieldByAlly: number;
  knockoutsByAlly: number;
  knockoutsByEnemy: number;
  bossSignaturesFired: number;
  cardsExhausted: number;
  breachesByAlly: number;
  breachesByEnemy: number;
};

export function summarizeBattleStats(state: FrontlineBattleState): FrontlineBattleStats {
  const stats: FrontlineBattleStats = {
    rounds: state.round,
    damageDealtByAlly: 0,
    damageDealtByEnemy: 0,
    healingByAlly: 0,
    shieldByAlly: 0,
    knockoutsByAlly: 0,
    knockoutsByEnemy: 0,
    bossSignaturesFired: 0,
    cardsExhausted: 0,
    breachesByAlly: 0,
    breachesByEnemy: 0,
  };

  for (const event of state.events) {
    const amount = event.amount ?? 0;
    if (event.kind === "damage") {
      if (event.side === "ally") stats.damageDealtByAlly += amount;
      else if (event.side === "enemy") stats.damageDealtByEnemy += amount;
    } else if (event.kind === "heal" && event.side === "ally") {
      stats.healingByAlly += amount;
    } else if (event.kind === "shield" && event.side === "ally") {
      stats.shieldByAlly += amount;
    } else if (event.kind === "ko") {
      if (event.subKind === "support" || event.subKind === "hero") {
        if (event.side === "ally") stats.knockoutsByAlly += 1;
        else if (event.side === "enemy") stats.knockoutsByEnemy += 1;
      }
    } else if (event.kind === "breach") {
      if (event.side === "ally") stats.breachesByAlly += amount;
      else if (event.side === "enemy") stats.breachesByEnemy += amount;
    } else if (event.kind === "boss_signature" && event.signature === "cast") {
      stats.bossSignaturesFired += 1;
    } else if (event.kind === "card" && event.signature === "exhaust") {
      stats.cardsExhausted += 1;
    }
  }

  return stats;
}
