import type { HomeLandmarkId } from "@/lib/homeLandmarkAssets";

export const HOME_DESIGN_WIDTH = 1920;
export const HOME_DESIGN_HEIGHT = 1080;
export const HOME_DESIGN_RATIO = HOME_DESIGN_WIDTH / HOME_DESIGN_HEIGHT;

export const HOME_WORLD_BACKGROUND = {
  strategy: "contain",
  width: HOME_DESIGN_WIDTH,
  height: HOME_DESIGN_HEIGHT,
  x: 0,
  y: 0,
} as const;

export type HomeLandmarkLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  hotspotDx: number;
  hotspotDy: number;
  labelDx: number;
  labelDy: number;
  hotspotWidth: number;
  hotspotHeight: number;
  plaqueWidth: number;
  zIndex: number;
};

export const HOME_LANDMARK_LAYOUT: Record<HomeLandmarkId, HomeLandmarkLayout> = {
  fortress: {
    x: 960,
    y: 508,
    width: 635,
    height: 365,
    hotspotDx: 0,
    hotspotDy: -162,
    labelDx: 0,
    labelDy: 204,
    hotspotWidth: 590,
    hotspotHeight: 350,
    plaqueWidth: 198,
    zIndex: 6,
  },
  arena: {
    x: 250,
    y: 514,
    width: 440,
    height: 320,
    hotspotDx: 0,
    hotspotDy: -150,
    labelDx: 0,
    labelDy: 184,
    hotspotWidth: 430,
    hotspotHeight: 310,
    plaqueWidth: 154,
    zIndex: 4,
  },
  adventure: {
    x: 1608,
    y: 572,
    width: 395,
    height: 305,
    hotspotDx: 0,
    hotspotDy: -154,
    labelDx: 0,
    labelDy: 176,
    hotspotWidth: 375,
    hotspotHeight: 300,
    plaqueWidth: 178,
    zIndex: 5,
  },
  events: {
    x: 344,
    y: 810,
    width: 385,
    height: 284,
    hotspotDx: 0,
    hotspotDy: -128,
    labelDx: 0,
    labelDy: 164,
    hotspotWidth: 345,
    hotspotHeight: 268,
    plaqueWidth: 160,
    zIndex: 5,
  },
  deck: {
    x: 953,
    y: 898,
    width: 355,
    height: 220,
    hotspotDx: 0,
    hotspotDy: -108,
    labelDx: 0,
    labelDy: 92,
    hotspotWidth: 315,
    hotspotHeight: 205,
    plaqueWidth: 155,
    zIndex: 5,
  },
  market: {
    x: 1574,
    y: 848,
    width: 430,
    height: 285,
    hotspotDx: 0,
    hotspotDy: -132,
    labelDx: 0,
    labelDy: 158,
    hotspotWidth: 390,
    hotspotHeight: 260,
    plaqueWidth: 158,
    zIndex: 5,
  },
};

export const HOME_CTA_LAYOUT = {
  desktopBottom: "4.65rem",
  mobileBottom: "6.85rem",
  mobileScale: 0.84,
} as const;

export function toPx(value: number) {
  return `${value}px`;
}
