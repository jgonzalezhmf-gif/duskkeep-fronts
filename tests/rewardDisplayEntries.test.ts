import { describe, expect, it } from "vitest";

import { getRewardDisplayEntries } from "@/lib/rewardDisplayEntries";

describe("getRewardDisplayEntries", () => {
  it("ignores empty and zero rewards", () => {
    expect(getRewardDisplayEntries(null)).toEqual([]);
    expect(getRewardDisplayEntries({})).toEqual([]);
    expect(getRewardDisplayEntries({ gold: 0, dust: 0, gems: 0 })).toEqual([]);
  });

  it("keeps the shared display order for reward feedback", () => {
    expect(
      getRewardDisplayEntries({
        frontlineCards: [{ cardId: "order_shadow_dive" }],
        shards: [{ heroId: "lyria", amount: 3 }],
        accountXp: 12,
        adventureKeys: 1,
        arenaTickets: 2,
        gems: 4,
        dust: 5,
        gold: 100,
      }),
    ).toEqual([
      { kind: "gold", labelKey: "resources.gold", value: 100 },
      { kind: "dust", labelKey: "resources.dust", value: 5 },
      { kind: "gems", labelKey: "resources.gems", value: 4 },
      { kind: "tickets", labelKey: "resources.tickets", value: 2 },
      { kind: "keys", labelKey: "resources.adventureKeys", value: 1 },
      { kind: "xp", labelKey: "frontline.accountXp", value: 12 },
      { kind: "shards", labelKey: "shop.categoryShort.shards", value: 3 },
      { kind: "cards", labelKey: "frontline.cardUnlocks", value: 1 },
    ]);
  });

  it("uses xp when accountXp is absent", () => {
    expect(getRewardDisplayEntries({ xp: 7 })).toEqual([{ kind: "xp", labelKey: "frontline.accountXp", value: 7 }]);
  });
});
