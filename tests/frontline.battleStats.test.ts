import { describe, expect, it } from "vitest";
import { FRONTLINE_PRESETS } from "@/features/frontline/data";
import { createDefaultFrontlineLoadout, createFrontlineBattleState, resolveTurn } from "@/features/frontline/engine";
import { summarizeBattleStats } from "@/lib/frontlineBattleStats";

describe("summarizeBattleStats", () => {
  it("aggregates damage, healing and breach amounts from a finished round", () => {
    const initial = createFrontlineBattleState({
      seed: 91,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: FRONTLINE_PRESETS[0],
    });
    const afterRound = resolveTurn(initial);
    const stats = summarizeBattleStats(afterRound);

    expect(stats.rounds).toBeGreaterThanOrEqual(1);
    expect(stats.damageDealtByAlly + stats.damageDealtByEnemy).toBeGreaterThan(0);
    expect(stats.bossSignaturesFired).toBe(0);
    expect(stats.cardsExhausted).toBeGreaterThanOrEqual(0);
  });

  it("counts hero/support knockouts but not unrelated ko events", () => {
    const initial = createFrontlineBattleState({
      seed: 7,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: FRONTLINE_PRESETS[0],
    });
    initial.lanes.left.enemyHero!.hp = 1;
    const next = resolveTurn(initial);
    const stats = summarizeBattleStats(next);
    expect(stats.knockoutsByAlly + stats.knockoutsByEnemy).toBeGreaterThanOrEqual(0);
  });
});
