import { describe, expect, it } from "vitest";
import { createDefaultFrontlineLoadout } from "@/features/frontline/engine";
import {
  getFrontlinePresetForArenaOpponent,
} from "@/features/frontline/encounterPresets";
import {
  normalizeFrontlineReplayContext,
  resolveFrontlineBattlePresetForOperation,
  validateFrontlineBattleReplayPayload,
} from "@/features/server/authoritativeBattleReplayGuard";
import type { ServerOperationPayload } from "@/features/server/authoritativeOperations";

function validArenaPayload(): ServerOperationPayload<"recordArenaResult"> {
  return {
    opponentId: "arena_bonewood",
    battleSeed: 77,
    winner: "ally",
    turns: 2,
    battleSummary: {
      schemaVersion: 1,
      engineVersion: "frontline-v1",
      seed: 77,
      round: 2,
      maxRounds: 8,
      winner: "ally",
      allyCoreHp: 21,
      enemyCoreHp: 0,
      lanes: [
        { lane: "left", allyHp: 19, enemyHp: 0, allyAlive: true, enemyAlive: false },
        { lane: "center", allyHp: 22, enemyHp: 0, allyAlive: true, enemyAlive: false },
        { lane: "right", allyHp: 18, enemyHp: 0, allyAlive: true, enemyAlive: false },
      ],
      recentEvents: [],
      actionLog: [
        { seq: 1, round: 1, side: "ally", action: "play_card", cardId: "tactic_battle_hymn" },
        { seq: 2, round: 1, side: "ally", action: "resolve_turn" },
      ],
    },
  };
}

describe("authoritative battle replay guard", () => {
  it("normalizes RLS-loaded replay context rows", () => {
    const context = normalizeFrontlineReplayContext({
      loadoutRow: {
        leader_id: "leader_aurora",
        squad: ["bran", "kara", "mira"],
        deck: createDefaultFrontlineLoadout().deck,
      },
      heroRows: [{ hero_id: "bran", level: 2, stars: 1, shards: 0, xp: 0, skill_level: 1, unlocked: true }],
      cardRows: [{ card_id: "tactic_battle_hymn", level: 1, unlocked: true }],
      enemyPreset: getFrontlinePresetForArenaOpponent("arena_bonewood"),
    });

    expect(context?.loadout.leaderId).toBe("leader_aurora");
    expect(context?.playerHeroes[0]?.heroId).toBe("bran");
    expect(context?.cardLevels.tactic_battle_hymn).toBe(1);
  });

  it("resolves battle presets by operation id without trusting client preset input", () => {
    expect(resolveFrontlineBattlePresetForOperation("recordArenaResult", validArenaPayload())?.id).toBe(
      "bonewood_raiders",
    );
    expect(
      resolveFrontlineBattlePresetForOperation("recordEventResult", {
        eventId: "gold_rush",
        battleSeed: 77,
        winner: "ally",
        turns: 2,
        battleSummary: validArenaPayload().battleSummary,
      })?.id,
    ).toBe("bonewood_raiders");
    expect(
      resolveFrontlineBattlePresetForOperation("claimAdventureBattleResult", {
        nodeId: "c1l1",
        battleSeed: 77,
        winner: "ally",
        turns: 2,
        battleSummary: validArenaPayload().battleSummary,
      })?.id,
    ).toBe("bonewood_scouts");
  });

  it("rejects replay-ready payloads whose declared summary diverges from replay output", () => {
    const context = normalizeFrontlineReplayContext({
      loadoutRow: {
        leader_id: "leader_aurora",
        squad: ["bran", "kara", "mira"],
        deck: createDefaultFrontlineLoadout().deck,
      },
      heroRows: [],
      cardRows: [],
      enemyPreset: getFrontlinePresetForArenaOpponent("arena_bonewood"),
    });
    expect(context).not.toBeNull();
    if (!context) return;

    const payload = validArenaPayload();
    payload.battleSummary.enemyCoreHp = 999;

    expect(validateFrontlineBattleReplayPayload("recordArenaResult", payload, context)).toMatchObject({
      ok: false,
      code: "invalid_request",
    });
  });

  it("rejects battle payloads that are not replay-ready", () => {
    const context = normalizeFrontlineReplayContext({
      loadoutRow: {
        leader_id: "leader_aurora",
        squad: ["bran", "kara", "mira"],
        deck: createDefaultFrontlineLoadout().deck,
      },
      heroRows: [],
      cardRows: [],
      enemyPreset: getFrontlinePresetForArenaOpponent("arena_bonewood"),
    });
    expect(context).not.toBeNull();
    if (!context) return;

    expect(
      validateFrontlineBattleReplayPayload(
        "recordArenaResult",
        {
          opponentId: "arena_bonewood",
          battleSeed: 77,
          winner: "ally",
          turns: 2,
          battleSummary: { allyCoreHp: 21, enemyCoreHp: 0 },
        },
        context,
      ),
    ).toMatchObject({
      ok: false,
      code: "invalid_request",
    });
  });
});
