import type { AdventureProgressEntry } from "@/features/adventure/nodeResolution";
import type { Resources, Rewards } from "@/lib/types";

export type AdventureMapInteractionKind = "keyChest";
export type AdventureMapInteractionStatus = "locked" | "needs_key" | "ready" | "claimed";

export type AdventureMapInteractionDefinition = {
  id: string;
  chapter: number;
  kind: AdventureMapInteractionKind;
  title: string;
  description: string;
  keyCost: number;
  unlockAfter: string[];
  rewards: Rewards;
};

export type AdventureMapInteractionClaim = {
  claimed: boolean;
  claimedAt?: string;
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
    rewards: { gold: 300, dust: 40, accountXp: 12 },
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

export function getAdventureMapInteractionStatus({
  interaction,
  progress,
  resources,
  claim,
}: {
  interaction: AdventureMapInteractionDefinition;
  progress: Record<string, AdventureProgressEntry | undefined>;
  resources: Pick<Resources, "adventureKeys">;
  claim?: AdventureMapInteractionClaim;
}): AdventureMapInteractionStatus {
  if (claim?.claimed) return "claimed";
  if (!isAdventureMapInteractionUnlocked(interaction, progress)) return "locked";
  if ((resources.adventureKeys ?? 0) < interaction.keyCost) return "needs_key";
  return "ready";
}

export function canClaimAdventureMapInteraction(args: Parameters<typeof getAdventureMapInteractionStatus>[0]) {
  return getAdventureMapInteractionStatus(args) === "ready";
}
