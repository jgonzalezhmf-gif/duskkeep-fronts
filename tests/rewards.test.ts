import { describe, it, expect } from "vitest";
import { mergeRewards, describeRewards } from "@/features/battle/rewards";

describe("rewards", () => {
  it("merges numeric resources", () => {
    const r = mergeRewards({ gold: 100, dust: 20 }, { gold: 50, gems: 5, adventureKeys: 1 });
    expect(r.gold).toBe(150);
    expect(r.dust).toBe(20);
    expect(r.gems).toBe(5);
    expect(r.adventureKeys).toBe(1);
  });
  it("merges shards by heroId", () => {
    const r = mergeRewards(
      { shards: [{ heroId: "bran", amount: 2 }] },
      { shards: [{ heroId: "bran", amount: 3 }, { heroId: "kara", amount: 1 }] },
    );
    expect(r.shards).toEqual(
      expect.arrayContaining([
        { heroId: "bran", amount: 5 },
        { heroId: "kara", amount: 1 },
      ]),
    );
  });
  it("preserves unique Frontline card unlock rewards", () => {
    const r = mergeRewards(
      { frontlineCards: [{ cardId: "order_shadow_dive" }] },
      { frontlineCards: [{ cardId: "order_shadow_dive" }, { cardId: "summon_totem" }] },
    );
    expect(r.frontlineCards).toEqual([
      { cardId: "order_shadow_dive" },
      { cardId: "summon_totem" },
    ]);
  });
  it("describes rewards to a short string", () => {
    const s = describeRewards({ gold: 100, gems: 5 });
    expect(s).toContain("100 gold");
    expect(s).toContain("5 gems");
  });
});
