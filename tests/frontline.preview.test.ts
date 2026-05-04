import { describe, expect, it } from "vitest";
import { FRONTLINE_PRESETS } from "@/features/frontline/data";
import { createDefaultFrontlineLoadout, createFrontlineBattleState } from "@/features/frontline/engine";
import { previewCardOutcome } from "@/features/frontline/preview";

function makeState() {
  return createFrontlineBattleState({
    seed: 77,
    allyLoadout: createDefaultFrontlineLoadout(),
    enemyPreset: FRONTLINE_PRESETS[0],
  });
}

describe("frontline preview", () => {
  it("returns null for an unknown card id", () => {
    const state = makeState();
    expect(previewCardOutcome(state, "ally", "unknown_card_id", "left")).toBeNull();
  });

  it("describes a hero_strike buff on the chosen lane", () => {
    const state = makeState();
    const preview = previewCardOutcome(state, "ally", "order_guard_wall", "left");
    expect(preview).not.toBeNull();
    expect(preview!.kind).toBe("buff");
    expect(preview!.scope).toBe("single");
    expect(preview!.amount).toBeGreaterThan(0);
    expect(preview!.targetName).toBe(state.lanes.left.allyHero!.name);
  });

  it("describes front_shot damage against the enemy hero with hp delta", () => {
    const state = makeState();
    const enemy = state.lanes.left.enemyHero!;
    const preview = previewCardOutcome(state, "ally", "order_focus_fire", "left");
    expect(preview).not.toBeNull();
    expect(preview!.kind).toBe("damage");
    expect(preview!.amount).toBeGreaterThan(0);
    expect(preview!.targetName).toBe(enemy.name);
    expect(preview!.targetHpBefore).toBe(enemy.hp);
    expect(preview!.targetHpAfter).toBeLessThan(preview!.targetHpBefore!);
  });

  it("flags a front_shot that goes straight to the core when the lane is open", () => {
    const state = makeState();
    state.lanes.left.enemyHero = null;
    const preview = previewCardOutcome(state, "ally", "order_focus_fire", "left");
    expect(preview).not.toBeNull();
    expect(preview!.kind).toBe("core");
    expect(preview!.note).toBe("to_core");
  });

  it("describes rally as an all-allies buff", () => {
    const state = makeState();
    const preview = previewCardOutcome(state, "ally", "tactic_battle_hymn");
    expect(preview).not.toBeNull();
    expect(preview!.kind).toBe("buff");
    expect(preview!.scope).toBe("all");
    expect(preview!.amount).toBeGreaterThan(0);
  });

  it("clamps heal_front to hero maxHp", () => {
    const state = makeState();
    const hero = state.lanes.left.allyHero!;
    hero.hp = Math.max(1, hero.maxHp - 2);
    const preview = previewCardOutcome(state, "ally", "tactic_sanctuary", "left");
    expect(preview).not.toBeNull();
    expect(preview!.kind).toBe("heal");
    expect(preview!.amount).toBeLessThanOrEqual(hero.maxHp - hero.hp + 1);
    expect(preview!.targetHpAfter).toBe(hero.maxHp);
  });

  it("describes stun_front against the targeted enemy hero", () => {
    const state = makeState();
    const enemy = state.lanes.left.enemyHero!;
    const preview = previewCardOutcome(state, "ally", "tactic_smokescreen", "left");
    expect(preview).not.toBeNull();
    expect(preview!.kind).toBe("stun");
    expect(preview!.targetName).toBe(enemy.name);
    expect(preview!.amount).toBeGreaterThanOrEqual(1);
  });

  it("describes summon_wolf as a summon with the support hp", () => {
    const state = makeState();
    const preview = previewCardOutcome(state, "ally", "summon_wolf", "left");
    expect(preview).not.toBeNull();
    expect(preview!.kind).toBe("summon");
    expect(preview!.scope).toBe("single");
    expect(preview!.amount).toBeGreaterThan(0);
    expect(preview!.targetName).toBeTruthy();
  });
});
