import type { PlayerHero, Rewards } from "@/lib/types";

export const HERO_SHARDS_TO_UNLOCK = 10;

type HeroShardRewards = NonNullable<Rewards["shards"]>;

function createHeroFromShards(heroId: string, amount: number): PlayerHero {
  if (amount >= HERO_SHARDS_TO_UNLOCK) {
    return {
      heroId,
      level: 1,
      stars: 1,
      shards: amount - HERO_SHARDS_TO_UNLOCK,
      xp: 0,
      skillLevel: 1,
    };
  }

  return {
    heroId,
    level: 0,
    stars: 0,
    shards: amount,
    xp: 0,
    skillLevel: 1,
  };
}

function applyShardReward(hero: PlayerHero, amount: number): PlayerHero {
  const combinedShards = hero.shards + amount;

  if (hero.stars === 0 && combinedShards >= HERO_SHARDS_TO_UNLOCK) {
    return {
      ...hero,
      level: 1,
      stars: 1,
      shards: combinedShards - HERO_SHARDS_TO_UNLOCK,
    };
  }

  return {
    ...hero,
    shards: combinedShards,
  };
}

export function applyHeroShardRewards(heroes: PlayerHero[], shards: HeroShardRewards | undefined): PlayerHero[] | null {
  if (!shards?.length) return null;

  const nextHeroes = heroes.slice();

  for (const shard of shards) {
    const heroIndex = nextHeroes.findIndex((hero) => hero.heroId === shard.heroId);

    if (heroIndex === -1) {
      nextHeroes.push(createHeroFromShards(shard.heroId, shard.amount));
      continue;
    }

    nextHeroes[heroIndex] = applyShardReward(nextHeroes[heroIndex], shard.amount);
  }

  return nextHeroes;
}
