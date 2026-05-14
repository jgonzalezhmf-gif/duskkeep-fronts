import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { INTRO_ASSETS, INTRO_SPRITE_ASSETS } from "@/lib/introAssets";

describe("intro assets", () => {
  it("uses registered WebP layers that exist in public assets", () => {
    const assets = Object.values(INTRO_ASSETS);

    // Six core layers drive the cinematic (sky, fog, fortress, boss, lightning, crest).
    expect(assets.length).toBe(6);
    for (const asset of assets) {
      expect(asset.src.endsWith(".webp")).toBe(true);
      const publicPath = join(process.cwd(), "public", asset.src.replace(/^\//, ""));
      expect(existsSync(publicPath), `${asset.src} should exist`).toBe(true);
    }
  });

  it("keeps the intro payload compact enough for first run", () => {
    const totalBytes = Object.values(INTRO_ASSETS).reduce((sum, asset) => {
      const publicPath = join(process.cwd(), "public", asset.src.replace(/^\//, ""));
      return sum + statSync(publicPath).size;
    }, 0);

    expect(totalBytes).toBeLessThan(750 * 1024);
  });

  it("uses registered sprite loops that exist in public assets", () => {
    const sprites = Object.values(INTRO_SPRITE_ASSETS);

    expect(sprites.length).toBe(1);
    for (const sprite of sprites) {
      expect(sprite.frameCount).toBeGreaterThan(1);
      expect(sprite.loopMs).toBeGreaterThan(0);
      const publicPath = join(process.cwd(), "public", sprite.src.replace(/^\//, ""));
      expect(existsSync(publicPath), `${sprite.src} should exist`).toBe(true);
    }
  });
});
