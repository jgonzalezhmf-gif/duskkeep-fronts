import type { PlayerHero } from "@/lib/types";

export function isPlayerHeroUnlocked(playerHero: PlayerHero | undefined | null) {
  return Boolean(playerHero && playerHero.stars > 0 && playerHero.unlocked !== false);
}
