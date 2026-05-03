export const HOME_ATMOSPHERE_ASSETS = {
  cloudsDarkLayer: {
    src: "/assets/home/effects/clouds_dark_layer.png",
    expectedFile: "clouds_dark_layer.png",
  },
  crowFlyLoop: {
    src: "/assets/home/effects/crow_fly_loop.png",
    expectedFile: "crow_fly_loop.png",
    frameCount: 6,
  },
} as const;

export function getHomeCloudLayerAsset() {
  return HOME_ATMOSPHERE_ASSETS.cloudsDarkLayer;
}

export function getHomeCrowFlyAsset() {
  return HOME_ATMOSPHERE_ASSETS.crowFlyLoop;
}
