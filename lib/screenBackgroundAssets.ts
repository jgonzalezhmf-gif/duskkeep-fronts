export const SCREEN_BACKGROUND_IDS = ["market", "deck", "fortress", "events", "arena", "adventure"] as const;

export type ScreenBackgroundId = (typeof SCREEN_BACKGROUND_IDS)[number];

type ScreenBackgroundAsset = {
  src: string;
  expectedFile: string;
  alt: string;
  position?: string;
};

export const SCREEN_BACKGROUND_ASSETS: Record<ScreenBackgroundId, ScreenBackgroundAsset> = {
  market: {
    src: "/assets/backgrounds/market_bg.png",
    expectedFile: "market_bg.png",
    alt: "Dark fantasy market backdrop",
    position: "50% 50%",
  },
  deck: {
    src: "/assets/backgrounds/deck_bg.png",
    expectedFile: "deck_bg.png",
    alt: "War room deck builder backdrop",
    position: "50% 50%",
  },
  fortress: {
    src: "/assets/backgrounds/fortress_bg.png",
    expectedFile: "fortress_bg.png",
    alt: "Fortress command hall backdrop",
    position: "50% 48%",
  },
  events: {
    src: "/assets/backgrounds/events_bg.png",
    expectedFile: "events_bg.png",
    alt: "Mystic event ritual backdrop",
    position: "50% 48%",
  },
  arena: {
    src: "/assets/backgrounds/arena_bg.png",
    expectedFile: "arena_bg.png",
    alt: "Dark arena coliseum backdrop",
    position: "50% 48%",
  },
  adventure: {
    src: "/assets/backgrounds/adventure_bg.png",
    expectedFile: "adventure_bg.png",
    alt: "Dark campaign map backdrop",
    position: "50% 50%",
  },
};

export function getScreenBackgroundAsset(screen: ScreenBackgroundId) {
  return SCREEN_BACKGROUND_ASSETS[screen] ?? null;
}
