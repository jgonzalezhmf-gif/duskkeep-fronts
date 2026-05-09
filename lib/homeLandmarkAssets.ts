export type HomeLandmarkId = "fortress" | "adventure" | "arena" | "market" | "events" | "deck";
export type HomeBackgroundId = "world_base";

type HomeLandmarkAsset = {
  src: string;
  expectedFile: string;
};

export const HOME_LANDMARK_ASSETS: Partial<Record<HomeLandmarkId, HomeLandmarkAsset>> = {
  fortress: {
    src: "/assets/home/landmarks/fortress.png",
    expectedFile: "fortress.png",
  },
  adventure: {
    src: "/assets/home/landmarks/adventure_gate.png",
    expectedFile: "adventure_gate.png",
  },
  arena: {
    src: "/assets/home/landmarks/arena.png",
    expectedFile: "arena.png",
  },
  market: {
    src: "/assets/home/landmarks/market.png",
    expectedFile: "market.png",
  },
  events: {
    src: "/assets/home/landmarks/events_shrine.png",
    expectedFile: "events_shrine.png",
  },
  deck: {
    src: "/assets/home/landmarks/deck_hall_clean.png",
    expectedFile: "deck_hall_clean.png",
  },
};

export function getHomeLandmarkAsset(id: HomeLandmarkId) {
  return HOME_LANDMARK_ASSETS[id] ?? null;
}

export const HOME_BACKGROUND_ASSETS: Partial<Record<HomeBackgroundId, HomeLandmarkAsset>> = {
  world_base: {
    src: "/assets/home/home_world_base.png",
    expectedFile: "home_world_base.png",
  },
};

export function getHomeBackgroundAsset(id: HomeBackgroundId = "world_base") {
  return HOME_BACKGROUND_ASSETS[id] ?? null;
}
