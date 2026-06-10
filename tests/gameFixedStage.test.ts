import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  GAME_FIXED_STAGE_ENV_FLAG,
  isGameFixedStageEnabled,
} from "@/lib/gameFixedStage";

describe("Game fixed stage", () => {
  it("is enabled by default for MVP presentation builds", () => {
    expect(isGameFixedStageEnabled(undefined)).toBe(true);
    expect(isGameFixedStageEnabled("true")).toBe(true);
    expect(isGameFixedStageEnabled("1")).toBe(true);
  });

  it("can be disabled with explicit rollback values", () => {
    for (const value of ["false", "0", "off", "disabled", "no", " FALSE "]) {
      expect(isGameFixedStageEnabled(value)).toBe(false);
    }
  });

  it("wraps immersive routes from AppShell without touching the non-immersive shell", () => {
    const source = readFileSync(resolve("components/ui/AppShell.tsx"), "utf8");

    expect(source).toContain("GameFixedStage");
    expect(source).toContain("immersive ? <GameFixedStage>{shell}</GameFixedStage> : shell");
  });

  it("documents the rollback flag and canvas-like frame CSS", () => {
    const envExample = readFileSync(resolve(".env.example"), "utf8");
    const css = readFileSync(resolve("app/globals.css"), "utf8");

    expect(envExample).toContain(GAME_FIXED_STAGE_ENV_FLAG);
    expect(css).toContain(".game-fixed-stage__surface");
    expect(css).toContain("width: min(100vw, calc(100dvh * 16 / 9))");
    expect(css).toContain("height: 100dvh");
    expect(css).toContain("min-aspect-ratio: 16 / 10");
  });
});
