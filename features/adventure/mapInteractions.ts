import type { AdventureProgressEntry } from "@/features/adventure/nodeResolution";
import { hashSeed, createRng } from "@/lib/rng";
import { mergeRewards } from "@/lib/rewards";
import type { Resources, Rewards } from "@/lib/types";

export type AdventureMapInteractionKind = "keyChest";
export type AdventureMapInteractionStatus = "locked" | "needs_key" | "ready" | "claimed";
export type AdventureMapInteractionLootTier = "common" | "rare" | "epic" | "legendary";

export const ADVENTURE_KEY_UNLOCK_LEVEL_ID = "c1l2";
export const ADVENTURE_MAP_INTERACTION_RESET_HOURS = 8;

export type AdventureMapInteractionLootEntry = {
  id: string;
  tier: AdventureMapInteractionLootTier;
  title: string;
  weight: number;
  rewards: Rewards;
};

export type AdventureMapInteractionDefinition = {
  id: string;
  chapter: number;
  kind: AdventureMapInteractionKind;
  title: string;
  description: string;
  keyCost: number;
  unlockAfter: string[];
  lootTable: AdventureMapInteractionLootEntry[];
  resetEveryHours?: number;
};

export type AdventureMapInteractionClaim = {
  claimed: boolean;
  claimedAt?: string;
  lootId?: string;
  lootTier?: AdventureMapInteractionLootTier;
  lootTitle?: string;
  rewards?: Rewards;
  resetAvailableAt?: string;
};

export type AdventureMapInteractionOpenResult = {
  interactionId: string;
  lootId: string;
  lootTier: AdventureMapInteractionLootTier;
  lootTitle: string;
  rewards: Rewards;
};

export const ADVENTURE_MAP_INTERACTIONS: AdventureMapInteractionDefinition[] = [
  {
    id: "c1-lower-cache",
    chapter: 1,
    kind: "keyChest",
    title: "Eclipse Road Cache",
    description: "A sealed roadside cache. Clear the broken mill route, spend a map key, and claim the supplies inside.",
    keyCost: 1,
    unlockAfter: ["c1l2"],
    resetEveryHours: ADVENTURE_MAP_INTERACTION_RESET_HOURS,
    lootTable: [
      {
        id: "road-cache-common-supplies",
        tier: "common",
        title: "Roadside Supplies",
        weight: 50,
        rewards: { gold: 220, dust: 25, accountXp: 8 },
      },
      {
        id: "road-cache-rare-gem-purse",
        tier: "rare",
        title: "Gem-Sealed Purse",
        weight: 30,
        rewards: { gems: 18, accountXp: 10 },
      },
      {
        id: "road-cache-epic-war-cache",
        tier: "epic",
        title: "War Cache",
        weight: 15,
        rewards: { gold: 420, dust: 70, shards: [{ heroId: "vex", amount: 4 }], accountXp: 16 },
      },
      {
        id: "road-cache-legendary-frontline-vault",
        tier: "legendary",
        title: "Frontline Vault",
        weight: 5,
        rewards: { gems: 35, dust: 95, frontlineCards: [{ cardId: "war_drums" }], accountXp: 24 },
      },
    ],
  },
];

export const ADVENTURE_MAP_INTERACTIONS_BY_ID: Record<string, AdventureMapInteractionDefinition> = Object.fromEntries(
  ADVENTURE_MAP_INTERACTIONS.map((interaction) => [interaction.id, interaction]),
);

export function getAdventureMapInteraction(id: string | undefined | null) {
  if (!id) return null;
  return ADVENTURE_MAP_INTERACTIONS_BY_ID[id] ?? null;
}

export function isAdventureMapInteractionUnlocked(
  interaction: AdventureMapInteractionDefinition,
  progress: Record<string, AdventureProgressEntry | undefined>,
) {
  return interaction.unlockAfter.every((levelId) => {
    const entry = progress[levelId];
    return Boolean(entry?.cleared || entry?.claimed);
  });
}

export function isAdventureKeySystemUnlocked(progress: Record<string, AdventureProgressEntry | undefined>) {
  const entry = progress[ADVENTURE_KEY_UNLOCK_LEVEL_ID];
  return Boolean(entry?.cleared || entry?.claimed || entry?.firstClearTaken);
}

export function getAdventureMapInteractionStatus({
  interaction,
  progress,
  resources,
  claim,
  now = new Date(),
}: {
  interaction: AdventureMapInteractionDefinition;
  progress: Record<string, AdventureProgressEntry | undefined>;
  resources: Pick<Resources, "adventureKeys">;
  claim?: AdventureMapInteractionClaim;
  now?: Date;
}): AdventureMapInteractionStatus {
  if (isAdventureMapInteractionClaimActive(interaction, claim, now)) return "claimed";
  if (!isAdventureMapInteractionUnlocked(interaction, progress)) return "locked";
  if ((resources.adventureKeys ?? 0) < interaction.keyCost) return "needs_key";
  return "ready";
}

export function canClaimAdventureMapInteraction(args: Parameters<typeof getAdventureMapInteractionStatus>[0]) {
  return getAdventureMapInteractionStatus(args) === "ready";
}

export function rollAdventureMapInteractionLoot(
  interaction: AdventureMapInteractionDefinition,
  seed = hashSeed(`${interaction.id}:${Date.now()}:${Math.random()}`),
): AdventureMapInteractionOpenResult {
  const table = interaction.lootTable.filter((entry) => entry.weight > 0);
  if (!table.length) {
    return {
      interactionId: interaction.id,
      lootId: `${interaction.id}-empty`,
      lootTier: "common",
      lootTitle: interaction.title,
      rewards: {},
    };
  }
  const rng = createRng(seed);
  const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng.next() * totalWeight;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) {
      return toOpenResult(interaction.id, entry);
    }
  }
  return toOpenResult(interaction.id, table[table.length - 1]);
}

export function getAdventureMapInteractionRewardPreview(interaction: AdventureMapInteractionDefinition): Rewards {
  return mergeRewards(...interaction.lootTable.map((entry) => entry.rewards));
}

export function getAdventureMapInteractionResetAvailableAt(
  interaction: AdventureMapInteractionDefinition,
  claim?: AdventureMapInteractionClaim,
) {
  if (!claim?.claimedAt || !interaction.resetEveryHours) return null;
  if (claim.resetAvailableAt) return claim.resetAvailableAt;
  const claimedAt = Date.parse(claim.claimedAt);
  if (!Number.isFinite(claimedAt)) return null;
  return new Date(claimedAt + interaction.resetEveryHours * 60 * 60 * 1000).toISOString();
}

export function isAdventureMapInteractionClaimActive(
  interaction: AdventureMapInteractionDefinition,
  claim: AdventureMapInteractionClaim | undefined,
  now = new Date(),
) {
  if (!claim?.claimed) return false;
  const resetAvailableAt = getAdventureMapInteractionResetAvailableAt(interaction, claim);
  if (!resetAvailableAt) return true;
  const resetAt = Date.parse(resetAvailableAt);
  if (!Number.isFinite(resetAt)) return true;
  return resetAt > now.getTime();
}

function toOpenResult(interactionId: string, entry: AdventureMapInteractionLootEntry): AdventureMapInteractionOpenResult {
  return {
    interactionId,
    lootId: entry.id,
    lootTier: entry.tier,
    lootTitle: entry.title,
    rewards: entry.rewards,
  };
}
