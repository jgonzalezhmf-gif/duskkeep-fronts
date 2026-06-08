import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FRONTLINE_BATTLE_VIEWPORT_MAX_WIDTH,
  FRONTLINE_BATTLE_VIEWPORT_PADDING,
  getFrontlineBattleViewportClassName,
} from "@/components/game/frontline/FrontlineBattleViewport";

describe("frontline battle viewport", () => {
  it("defines one shared frame for all standard Frontline combat modes", () => {
    const className = getFrontlineBattleViewportClassName();

    expect(className).toContain(FRONTLINE_BATTLE_VIEWPORT_MAX_WIDTH);
    expect(className).toContain(FRONTLINE_BATTLE_VIEWPORT_PADDING);
    expect(className).toContain("min-h-dvh");
    expect(className).not.toContain("max-w-[1480px]");
  });

  it("allows local overlays without replacing the shared frame", () => {
    expect(getFrontlineBattleViewportClassName("isolate")).toContain("isolate");
    expect(getFrontlineBattleViewportClassName("isolate")).toContain(FRONTLINE_BATTLE_VIEWPORT_MAX_WIDTH);
  });

  it("is used by all standard Frontline battle entry points", () => {
    const files = [
      "components/game/frontline/BattlePageBattleView.tsx",
      "app/arena/page.tsx",
      "app/events/page.tsx",
    ];

    for (const file of files) {
      const source = readFileSync(resolve(file), "utf8");
      expect(source).toContain("FrontlineBattleViewport");
      expect(source).not.toContain("max-w-[1480px]");
    }
  });

  it("keeps the standard battle backdrop on a viewport-fixed cover plane", () => {
    const source = readFileSync(resolve("components/game/frontline/FrontlineBattleShell.tsx"), "utf8");

    expect(source).toContain("fixed inset-0");
    expect(source).toContain("bg-cover bg-center");
    expect(source).not.toContain("bg-contain");
  });
});
