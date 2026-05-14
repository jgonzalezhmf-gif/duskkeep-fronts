type IntroAssetEntry = {
  src: string;
  expectedFile: string;
};

type IntroSpriteEntry = IntroAssetEntry & {
  frameCount: number;
  loopMs: number;
};

export const INTRO_ASSETS = {
  eclipseSky: {
    src: "/assets/intro/intro_eclipse_sky.webp",
    expectedFile: "intro_eclipse_sky.webp",
  },
  fortressLayer: {
    src: "/assets/intro/intro_fortress_layer.webp",
    expectedFile: "intro_fortress_layer.webp",
  },
  fogLayer: {
    src: "/assets/intro/intro_fog_layer.webp",
    expectedFile: "intro_fog_layer.webp",
  },
  lightningBolt: {
    src: "/assets/intro/intro_lightning_bolt.webp",
    expectedFile: "intro_lightning_bolt.webp",
  },
  bossShadow: {
    src: "/assets/intro/intro_boss_shadow.webp",
    expectedFile: "intro_boss_shadow.webp",
  },
  titleCrest: {
    src: "/assets/intro/intro_title_crest.webp",
    expectedFile: "intro_title_crest.webp",
  },
} as const satisfies Record<string, IntroAssetEntry>;

export const INTRO_SPRITE_ASSETS = {
  crowLoop: {
    src: "/assets/home/effects/crow_fly_loop.webp",
    expectedFile: "crow_fly_loop.webp",
    frameCount: 6,
    loopMs: 720,
  },
} as const satisfies Record<string, IntroSpriteEntry>;

export type IntroAssetKey = keyof typeof INTRO_ASSETS;
export type IntroSpriteAssetKey = keyof typeof INTRO_SPRITE_ASSETS;

export function getIntroAsset(key: IntroAssetKey) {
  return INTRO_ASSETS[key];
}

export function getIntroSpriteAsset(key: IntroSpriteAssetKey) {
  return INTRO_SPRITE_ASSETS[key];
}
