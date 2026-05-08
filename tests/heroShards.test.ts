import { describe, expect, it } from "vitest";
import { applyHeroShardRewards, HERO_SHARDS_TO_UNLOCK } from "@/lib/heroShards";
import type { PlayerHero } from "@/lib/types";

const unlockedHero: PlayerHero = {
  heroId: "bran",
  level: 3,
  stars: 1,
  shards: 2,
  xp: 40,
  skillLevel: 2,
};

const lockedHero: PlayerHero = {
  heroId: "lyria",
  level: 0,
  stars: 0,
  shards: 7,
  xp: 0,
  skillLevel: 1,
};

describe("hero shard rewards", () => {
  it("returns null when no shard reward is present", () => {
    expect(applyHeroShardRewards([unlockedHero], undefined)).toBeNull();
    expect(applyHeroShardRewards([unlockedHero], [])).toBeNull();
  });

  it("creates a locked hero when the reward is below the unlock threshold", () => {
    expect(applyHeroShardRewards([], [{ heroId: "ursa", amount: 4 }])).toEqual([
      {
        heroId: "ursa",
        level: 0,
        stars: 0,
        shards: 4,
        xp: 0,
        skillLevel: 1,
      },
    ]);
  });

  it("creates an unlocked hero and carries excess shards when the reward reaches the threshold", () => {
    expect(applyHeroShardRewards([], [{ heroId: "ursa", amount: HERO_SHARDS_TO_UNLOCK + 3 }])).toEqual([
      {
        heroId: "ursa",
        level: 1,
        stars: 1,
        shards: 3,
        xp: 0,
        skillLevel: 1,
      },
    ]);
  });

  it("unlocks an existing locked hero when combined shards reach the threshold", () => {
    expect(applyHeroShardRewards([lockedHero], [{ heroId: "lyria", amount: 5 }])).toEqual([
      {
        ...lockedHero,
        level: 1,
        stars: 1,
        shards: 2,
      },
    ]);
  });

  it("adds shards to an already unlocked hero without changing level or stars", () => {
    expect(applyHeroShardRewards([unlockedHero], [{ heroId: "bran", amount: 6 }])).toEqual([
      {
        ...unlockedHero,
        shards: 8,
      },
    ]);
  });
});
