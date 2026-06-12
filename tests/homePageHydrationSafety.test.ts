import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Home page hydration safety", () => {
  it("does not read tab-scoped intro storage during the render-phase state initializer", () => {
    const source = readFileSync(join(process.cwd(), "components/game/HomePageClient.tsx"), "utf8");

    expect(source).not.toMatch(/useState\(\(\)\s*=>[^;]*readIntroSeenForSession\(/s);
  });
});
