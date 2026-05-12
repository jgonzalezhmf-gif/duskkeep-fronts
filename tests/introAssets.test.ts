import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { INTRO_ASSETS } from "@/lib/introAssets";

describe("intro assets", () => {
  it("uses registered WebP layers that exist in public assets", () => {
    const assets = Object.values(INTRO_ASSETS);

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
});
