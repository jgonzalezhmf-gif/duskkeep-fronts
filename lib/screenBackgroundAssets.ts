export const SCREEN_BACKGROUND_IDS = ["market", "deck", "fortress", "events", "arena", "adventure", "missions", "heroes"] as const;

export type ScreenBackgroundId = (typeof SCREEN_BACKGROUND_IDS)[number];

type ScreenBackgroundAsset = {
  src: string;
  expectedFile: string;
  alt: string;
  position?: string;
};

export const SCREEN_BACKGROUND_ASSETS: Record<ScreenBackgroundId, ScreenBackgroundAsset> = {
  market: {
    src: "/assets/backgrounds/market_bg.webp",
    expectedFile: "market_bg.webp",
    alt: "Dark fantasy market backdrop",
    position: "50% 50%",
  },
  deck: {
    src: "/assets/backgrounds/deck_bg.webp",
    expectedFile: "deck_bg.webp",
    alt: "War room deck builder backdrop",
    position: "50% 50%",
  },
  fortress: {
    src: "/assets/backgrounds/fortress_bg.webp",
    expectedFile: "fortress_bg.webp",
    alt: "Fortress command hall backdrop",
    position: "50% 48%",
  },
  events: {
    src: "/assets/backgrounds/events_bg.webp",
    expectedFile: "events_bg.webp",
    alt: "Mystic event ritual backdrop",
    position: "50% 48%",
  },
  arena: {
    src: "/assets/backgrounds/arena_bg.webp",
    expectedFile: "arena_bg.webp",
    alt: "Dark arena coliseum backdrop",
    position: "50% 48%",
  },
  adventure: {
    src: "/assets/backgrounds/adventure_bg.webp",
    expectedFile: "adventure_bg.webp",
    alt: "Dark campaign map backdrop",
    position: "50% 50%",
  },
  missions: {
    src: "/assets/backgrounds/missions_bg.webp",
    expectedFile: "missions_bg.webp",
    alt: "Dark command rewards board backdrop",
    position: "50% 48%",
  },
  heroes: {
    src: "/assets/backgrounds/heroes_bg.webp",
    expectedFile: "heroes_bg.webp",
    alt: "Dark hero roster hall backdrop",
    position: "50% 48%",
  },
};

export function getScreenBackgroundAsset(screen: ScreenBackgroundId) {
  return SCREEN_BACKGROUND_ASSETS[screen] ?? null;
}
