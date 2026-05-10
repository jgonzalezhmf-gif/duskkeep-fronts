export type HomeLandmarkId = "fortress" | "adventure" | "arena" | "market" | "events" | "deck";
export type HomeBackgroundId = "world_base";

type HomeLandmarkAsset = {
  src: string;
  webpSrc?: string;
  webpSrcSet?: string;
  sizes?: string;
  expectedFile: string;
  expectedWebpFile?: string;
};

export const HOME_LANDMARK_ASSETS: Partial<Record<HomeLandmarkId, HomeLandmarkAsset>> = {
  fortress: {
    src: "/assets/home/landmarks/fortress.png",
    webpSrc: "/assets/home/landmarks/fortress.webp",
    webpSrcSet: "/assets/home/landmarks/fortress_640.webp 640w, /assets/home/landmarks/fortress.webp 1024w",
    sizes: "(max-width: 768px) 34vw, 280px",
    expectedFile: "fortress.png",
    expectedWebpFile: "fortress.webp",
  },
  adventure: {
    src: "/assets/home/landmarks/adventure_gate.png",
    webpSrc: "/assets/home/landmarks/adventure_gate.webp",
    webpSrcSet: "/assets/home/landmarks/adventure_gate_640.webp 640w, /assets/home/landmarks/adventure_gate.webp 1313w",
    sizes: "(max-width: 768px) 34vw, 280px",
    expectedFile: "adventure_gate.png",
    expectedWebpFile: "adventure_gate.webp",
  },
  arena: {
    src: "/assets/home/landmarks/arena.png",
    webpSrc: "/assets/home/landmarks/arena.webp",
    webpSrcSet: "/assets/home/landmarks/arena_640.webp 640w, /assets/home/landmarks/arena.webp 1536w",
    sizes: "(max-width: 768px) 34vw, 280px",
    expectedFile: "arena.png",
    expectedWebpFile: "arena.webp",
  },
  market: {
    src: "/assets/home/landmarks/market.png",
    webpSrc: "/assets/home/landmarks/market.webp",
    webpSrcSet: "/assets/home/landmarks/market_640.webp 640w, /assets/home/landmarks/market.webp 949w",
    sizes: "(max-width: 768px) 34vw, 280px",
    expectedFile: "market.png",
    expectedWebpFile: "market.webp",
  },
  events: {
    src: "/assets/home/landmarks/events_shrine.png",
    webpSrc: "/assets/home/landmarks/events_shrine.webp",
    webpSrcSet: "/assets/home/landmarks/events_shrine_640.webp 640w, /assets/home/landmarks/events_shrine.webp 1536w",
    sizes: "(max-width: 768px) 34vw, 280px",
    expectedFile: "events_shrine.png",
    expectedWebpFile: "events_shrine.webp",
  },
  deck: {
    src: "/assets/home/landmarks/deck_hall_clean.png",
    webpSrc: "/assets/home/landmarks/deck_hall_clean.webp",
    webpSrcSet: "/assets/home/landmarks/deck_hall_clean_640.webp 640w, /assets/home/landmarks/deck_hall_clean.webp 1536w",
    sizes: "(max-width: 768px) 34vw, 280px",
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
    webpSrcSet: "/assets/home/home_world_base_1280.webp 1280w, /assets/home/home_world_base.webp 1672w",
    sizes: "(max-width: 900px) 100vw, 1080px",
    expectedFile: "home_world_base.png",
    expectedWebpFile: "home_world_base.webp",
  },
};

export function getHomeBackgroundAsset(id: HomeBackgroundId = "world_base") {
  return HOME_BACKGROUND_ASSETS[id] ?? null;
}
