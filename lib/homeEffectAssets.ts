export const HOME_EFFECT_IDS = [
  "flame_loop",
  "flag_red_loop",
  "portal_blue_loop",
  "crystal_purple_loop",
  "blue_flame_loop",
  "purple_flame_loop",
  "lantern_warm_loop",
  "candle_loop",
  "banner_red_loop",
  "crow_fly_loop",
  "clouds_dark_layer",
] as const;

export type HomeEffectId = (typeof HOME_EFFECT_IDS)[number];

export type HomeEffectAnchorName =
  | "bottom-center"
  | "center"
  | "left-center"
  | "top-center"
  | "pole-bottom";

export type HomeEffectRenderMode = "animated" | "staticFirstFrame" | "staticWithLocalAnimation" | "disabled";

type HomeEffectAsset = {
  src: string;
  webpSrc?: string;
  expectedFile: string;
  frameCount: number;
  staticSrc?: string;
  staticWebpSrc?: string;
  animatedSrc?: string;
  animatedWebpSrc?: string;
  compatibilitySrcs?: string[];
  anchor: {
    name: HomeEffectAnchorName;
    xPercent: number;
    yPercent: number;
  };
  renderMode: HomeEffectRenderMode;
  pipelineNote?: string;
  disabledReason?: string;
};

export const HOME_EFFECT_ASSETS: Partial<Record<HomeEffectId, HomeEffectAsset>> = {
  flame_loop: {
    src: "/assets/home/effects/flame_loop.png",
    webpSrc: "/assets/home/effects/flame_loop.webp",
    expectedFile: "flame_loop.png",
    frameCount: 6,
    compatibilitySrcs: [
      "/assets/home/effects/flame_loop_aligned.png",
      "/assets/home/effects/flame_loop_aligned.webp",
      "/assets/home/effects/flame_loop_world_aligned.png",
      "/assets/home/effects/flame_loop_world_aligned.webp",
    ],
    anchor: { name: "bottom-center", xPercent: 50, yPercent: 100 },
    renderMode: "animated",
    pipelineNote: "Keeps aligned compatibility sheets available for Home QA/HMR sessions that may still reference previous world-stage flame variants.",
  },
  flag_red_loop: {
    src: "/assets/home/effects/flag_red_loop.png",
    expectedFile: "flag_red_loop.png",
    frameCount: 5,
    staticSrc: "/assets/home/effects/flag_red_pole.png",
    staticWebpSrc: "/assets/home/effects/flag_red_pole.webp",
    animatedSrc: "/assets/home/effects/flag_red_cloth_loop.png",
    animatedWebpSrc: "/assets/home/effects/flag_red_cloth_loop.webp",
    anchor: { name: "pole-bottom", xPercent: 50, yPercent: 100 },
    renderMode: "animated",
    pipelineNote: "Layered pole + cloth loop. Keeps pole visually stable.",
  },
  portal_blue_loop: {
    src: "/assets/home/effects/portal_blue_loop.png",
    webpSrc: "/assets/home/effects/portal_blue_loop.webp",
    expectedFile: "portal_blue_loop.png",
    frameCount: 6,
    anchor: { name: "center", xPercent: 50, yPercent: 50 },
    renderMode: "animated",
  },
  crystal_purple_loop: {
    src: "/assets/home/effects/crystal_purple_loop.png",
    webpSrc: "/assets/home/effects/crystal_purple_loop.webp",
    expectedFile: "crystal_purple_loop.png",
    frameCount: 6,
    anchor: { name: "bottom-center", xPercent: 50, yPercent: 100 },
    renderMode: "animated",
  },
  blue_flame_loop: {
    src: "/assets/home/effects/blue_flame_loop.png",
    expectedFile: "blue_flame_loop.png",
    frameCount: 6,
    animatedSrc: "/assets/home/effects/blue_flame_loop_aligned.png",
    animatedWebpSrc: "/assets/home/effects/blue_flame_loop_aligned.webp",
    anchor: { name: "bottom-center", xPercent: 50, yPercent: 100 },
    renderMode: "animated",
    pipelineNote: "Uses a normalized spritesheet.",
  },
  purple_flame_loop: {
    src: "/assets/home/effects/purple_flame_loop.png",
    expectedFile: "purple_flame_loop.png",
    frameCount: 6,
    animatedSrc: "/assets/home/effects/purple_flame_loop_base_aligned.png",
    animatedWebpSrc: "/assets/home/effects/purple_flame_loop_base_aligned.webp",
    anchor: { name: "bottom-center", xPercent: 50, yPercent: 100 },
    renderMode: "animated",
    pipelineNote: "Uses a normalized spritesheet.",
  },
  lantern_warm_loop: {
    src: "/assets/home/effects/lantern_warm_loop.png",
    webpSrc: "/assets/home/effects/lantern_warm_loop.webp",
    expectedFile: "lantern_warm_loop.png",
    frameCount: 6,
    anchor: { name: "center", xPercent: 50, yPercent: 50 },
    renderMode: "staticWithLocalAnimation",
    pipelineNote: "Original sheet has 6 frames. Full animated object shifts laterally, so Home renders the first frame plus a local internal lantern flicker.",
  },
  candle_loop: {
    src: "/assets/home/effects/candle_loop.png",
    webpSrc: "/assets/home/effects/candle_loop.webp",
    expectedFile: "candle_loop.png",
    frameCount: 6,
    anchor: { name: "bottom-center", xPercent: 50, yPercent: 100 },
    renderMode: "staticWithLocalAnimation",
    pipelineNote: "Original sheet has 6 frames. Full animated object shifts laterally, so Home renders the first frame plus a local candle flicker.",
  },
  banner_red_loop: {
    src: "/assets/home/effects/banner_red_loop.png",
    expectedFile: "banner_red_loop.png",
    frameCount: 5,
    staticSrc: "/assets/home/effects/flag_red_pole.png",
    staticWebpSrc: "/assets/home/effects/flag_red_pole.webp",
    animatedSrc: "/assets/home/effects/flag_red_cloth_loop.png",
    animatedWebpSrc: "/assets/home/effects/flag_red_cloth_loop.webp",
    anchor: { name: "pole-bottom", xPercent: 50, yPercent: 100 },
    renderMode: "animated",
    pipelineNote: "Uses the stable layered red-flag pipeline because banner_red_loop contains painted background and drifts when used directly.",
  },
  crow_fly_loop: {
    src: "/assets/home/effects/crow_fly_loop.png",
    webpSrc: "/assets/home/effects/crow_fly_loop.webp",
    expectedFile: "crow_fly_loop.png",
    frameCount: 6,
    anchor: { name: "center", xPercent: 50, yPercent: 50 },
    renderMode: "animated",
    pipelineNote: "Ambient sky sprite. Keep small and occasional so it reads as distant crows.",
  },
  clouds_dark_layer: {
    src: "/assets/home/effects/clouds_dark_layer.png",
    webpSrc: "/assets/home/effects/clouds_dark_layer.webp",
    expectedFile: "clouds_dark_layer.png",
    frameCount: 1,
    anchor: { name: "center", xPercent: 50, yPercent: 50 },
    renderMode: "animated",
    pipelineNote: "Ambient world effect. It is not a spritesheet; HomeEffectSprite drifts the single cloud layer inside its editable QA box.",
  },
};

export function getHomeEffectAsset(id: HomeEffectId) {
  return HOME_EFFECT_ASSETS[id] ?? null;
}

export function getHomeEffectRenderAsset(id: HomeEffectId) {
  const asset = getHomeEffectAsset(id);
  if (!asset || asset.renderMode === "disabled") {
    return null;
  }

  return {
    effect: id,
    asset,
    requestedAsset: asset,
  };
}
