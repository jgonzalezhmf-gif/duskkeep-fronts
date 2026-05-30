import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FRONTLINE_CARD_POOL, FRONTLINE_PRESET_BY_ID, FRONTLINE_UNIT_BY_ID } from "@/features/frontline/data";
import {
  getLadderOpponentsForPoints,
  LADDER_BRONZE_OPPONENTS,
  LADDER_OPPONENTS,
  selectLadderOpponentForMatch,
} from "@/features/ladder/data";

describe("ladder opponent catalog", () => {
  it("offers multiple active Bronze commander variants per division", () => {
    expect(getLadderOpponentsForPoints(0)).toHaveLength(3);
    expect(getLadderOpponentsForPoints(100)).toHaveLength(3);
    expect(getLadderOpponentsForPoints(200)).toHaveLength(3);
  });

  it("uses player-like heroes and player card decks for active Ladder opponents", () => {
    for (const opponent of LADDER_BRONZE_OPPONENTS) {
      const preset = FRONTLINE_PRESET_BY_ID[opponent.presetId];

      expect(preset, opponent.id).toBeTruthy();
      expect(preset?.squad.every((heroId) => FRONTLINE_UNIT_BY_ID[heroId]?.family === "hero")).toBe(true);
      expect(preset?.deck.every((cardId) => FRONTLINE_CARD_POOL.includes(cardId))).toBe(true);
    }
  });

  it("keeps every Ladder opponent mapped to its own Frontline preset", () => {
    for (const opponent of LADDER_OPPONENTS) {
      expect(FRONTLINE_PRESET_BY_ID[opponent.presetId]?.id).toBe(opponent.presetId);
    }
  });

  it("selects a deterministic same-division opponent from matchmaking entropy", () => {
    expect(selectLadderOpponentForMatch(0, 0).id).toBe("ladder_bronze_iii_iron_vow");
    expect(selectLadderOpponentForMatch(0, 1).id).toBe("ladder_bronze_iii_candle_warden");
    expect(selectLadderOpponentForMatch(0, 2).id).toBe("ladder_bronze_iii_mistbound_recruit");
    expect(selectLadderOpponentForMatch(100, 1).id).toBe("ladder_bronze_ii_gate_hound");
    expect(selectLadderOpponentForMatch(200, 2).id).toBe("ladder_bronze_i_oath_ember");
  });

  it("keeps the Supabase Ladder opponent migration aligned with the frontend catalog", () => {
    const migration = readFileSync("supabase/migrations/20260529183500_ladder_player_like_opponents.sql", "utf8");

    for (const opponent of LADDER_OPPONENTS) {
      expect(migration, opponent.id).toContain(`'${opponent.id}'`);
      expect(migration, opponent.presetId).toContain(`'${opponent.presetId}'`);
    }
  });
});
