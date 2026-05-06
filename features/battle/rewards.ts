import type { Rewards } from "@/lib/types";

export function mergeRewards(...all: (Rewards | undefined)[]): Rewards {
  const out: Rewards = {};
  const shardMap = new Map<string, number>();
  const frontlineCardIds = new Set<string>();
  for (const r of all) {
    if (!r) continue;
    out.gold = (out.gold ?? 0) + (r.gold ?? 0);
    out.dust = (out.dust ?? 0) + (r.dust ?? 0);
    out.gems = (out.gems ?? 0) + (r.gems ?? 0);
    out.xp = (out.xp ?? 0) + (r.xp ?? 0);
    out.accountXp = (out.accountXp ?? 0) + (r.accountXp ?? 0);
    out.arenaTickets = (out.arenaTickets ?? 0) + (r.arenaTickets ?? 0);
    out.adventureKeys = (out.adventureKeys ?? 0) + (r.adventureKeys ?? 0);
    for (const s of r.shards ?? []) {
      shardMap.set(s.heroId, (shardMap.get(s.heroId) ?? 0) + s.amount);
    }
    for (const card of r.frontlineCards ?? []) {
      frontlineCardIds.add(card.cardId);
    }
  }
  if (shardMap.size) out.shards = Array.from(shardMap.entries()).map(([heroId, amount]) => ({ heroId, amount }));
  if (frontlineCardIds.size) out.frontlineCards = Array.from(frontlineCardIds).map((cardId) => ({ cardId }));
  // clean empties
  if (!out.gold) delete out.gold;
  if (!out.dust) delete out.dust;
  if (!out.gems) delete out.gems;
  if (!out.xp) delete out.xp;
  if (!out.accountXp) delete out.accountXp;
  if (!out.arenaTickets) delete out.arenaTickets;
  if (!out.adventureKeys) delete out.adventureKeys;
  return out;
}

export function describeRewards(r: Rewards): string {
  const parts: string[] = [];
  if (r.gold) parts.push(`${r.gold} gold`);
  if (r.dust) parts.push(`${r.dust} dust`);
  if (r.gems) parts.push(`${r.gems} gems`);
  if (r.adventureKeys) parts.push(`${r.adventureKeys} adventure keys`);
  if (r.arenaTickets) parts.push(`${r.arenaTickets} 🎟 tickets`);
  if (r.xp) parts.push(`${r.xp} hero XP`);
  if (r.accountXp) parts.push(`${r.accountXp} account XP`);
  if (r.frontlineCards?.length) parts.push(r.frontlineCards.map((card) => `${card.cardId} card`).join(", "));
  if (r.shards?.length) parts.push(r.shards.map((s) => `${s.amount}× ${s.heroId} shards`).join(", "));
  return parts.join(" · ");
}
