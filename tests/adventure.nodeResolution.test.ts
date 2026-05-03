import { describe, expect, it } from "vitest";
import { ADVENTURE_BY_ID } from "@/data/adventure";
import {
  getAdventureChestClaimRewards,
  getAdventureNodeDefinition,
  getAdventureNodeRewardPreview,
  getAdventureNodeType,
  getAdventureVictoryRewards,
  isAdventureCombatNode,
} from "@/features/adventure/nodeResolution";

describe("Adventure node resolution", () => {
  it("treats chest nodes as claim nodes instead of combat nodes", () => {
    const chest = ADVENTURE_BY_ID.c1l3;
    const definition = getAdventureNodeDefinition(chest);

    expect(definition.type).toBe("chest");
    expect(isAdventureCombatNode(definition.type)).toBe(false);
    expect(getAdventureChestClaimRewards(chest, undefined)?.frontlineCards).toEqual([
      { cardId: "order_shadow_dive" },
    ]);
  });

  it("does not allow chest rewards to be claimed repeatedly", () => {
    const chest = ADVENTURE_BY_ID.c1l7;

    expect(getAdventureChestClaimRewards(chest, { cleared: true, firstClearTaken: true, claimed: true })).toBeNull();
    expect(getAdventureNodeRewardPreview(chest, { cleared: true, firstClearTaken: true, claimed: true })).toEqual({});
  });

  it("uses reduced rewards for battle replays", () => {
    const battle = ADVENTURE_BY_ID.c1l1;
    const firstClear = getAdventureVictoryRewards(battle, true);
    const replay = getAdventureVictoryRewards(battle, false);

    expect(getAdventureNodeType(battle)).toBe("battle");
    expect(firstClear.gold).toBe(80);
    expect(firstClear.gems).toBe(20);
    expect(replay.gold).toBeLessThan(firstClear.gold ?? 0);
    expect(replay.gems).toBeUndefined();
    expect(replay.shards).toBeUndefined();
  });

  it("differentiates elite and boss repeat policies", () => {
    const elite = getAdventureNodeDefinition(ADVENTURE_BY_ID.c1l5);
    const boss = getAdventureNodeDefinition(ADVENTURE_BY_ID.c1l12);

    expect(elite.type).toBe("elite");
    expect(elite.repeatPolicy).toBe("reduced");
    expect(elite.nodeRule?.label).toBe("Wolf-pack ambush");
    expect(boss.type).toBe("boss");
    expect(boss.repeatPolicy).toBe("free_no_reward");
    expect(getAdventureVictoryRewards(ADVENTURE_BY_ID.c1l12, false)).toEqual({});
  });
});
