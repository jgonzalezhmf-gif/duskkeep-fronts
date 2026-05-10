export type HomeLandmarkId = "fortress" | "adventure" | "arena" | "market" | "events" | "deck";
export type HomeBackgroundId = "world_base";

type HomeLandmarkAsset = {
  src: string;
  webpSrc?: string;
  expectedFile: string;
  expectedWebpFile?: string;
};

export const HOME_LANDMARK_ASSETS: Partial<Record<HomeLandmarkId, HomeLandmarkAsset>> = {
  fortress: {
    src: "/assets/home/landmarks/fortress.png",
    webpSrc: "/assets/home/landmarks/fortress.webp",
    expectedFile: "fortress.png",
    expectedWebpFile: "fortress.webp",
  },
  adventure: {
    src: "/assets/home/landmarks/adventure_gate.png",
    webpSrc: "/assets/home/landmarks/adventure_gate.webp",
    expectedFile: "adventure_gate.png",
    expectedWebpFile: "adventure_gate.webp",
  },
  arena: {
    src: "/assets/home/landmarks/arena.png",
    webpSrc: "/assets/home/landmarks/arena.webp",
    expectedFile: "arena.png",
    expectedWebpFile: "arena.webp",
  },
  market: {
    src: "/assets/home/landmarks/market.png",
    webpSrc: "/assets/home/landmarks/market.webp",
    expectedFile: "market.png",
    expectedWebpFile: "market.webp",
  },
  events: {
    src: "/assets/home/landmarks/events_shrine.png",
    webpSrc: "/assets/home/landmarks/events_shrine.webp",
    expectedFile: "events_shrine.png",
    expectedWebpFile: "events_shrine.webp",
  },
  deck: {
    src: "/assets/home/landmarks/deck_hall_clean.png",
    webpSrc: "/assets/home/landmarks/deck_hall_clean.webp",
    expectedFile: "deck_hall_clean.png",
    expectedWebpFile: "deck_hall_clean.webp",
  },
};

export function getHomeLandmarkAsset(id: HomeLandmarkId) {
  return HOME_LANDMARK_ASSETS[id] ?? null;
}

export const HOME_BACKGROUND_ASSETS: Partial<Record<HomeBackgroundId, HomeLandmarkAsset>> = {
  world_base: {
    src: "/assets/home/home_world_base.png",
    webpSrc: "/assets/home/home_world_base.webp",
    expectedFile: "home_world_base.png",
    expectedWebpFile: "home_world_base.webp",
  },
};

export function getHomeBackgroundAsset(id: HomeBackgroundId = "world_base") {
  return HOME_BACKGROUND_ASSETS[id] ?? null;
}
