import { describe, expect, it } from "vitest";
import { shouldHideOnboardingTourOnPathname } from "@/lib/onboardingVisibility";

describe("onboarding visibility", () => {
  it("keeps the onboarding tour off game screens where it can block primary content", () => {
    for (const pathname of [
      "/adventure",
      "/adventure/c1l1",
      "/missions",
      "/roster",
      "/battle",
      "/deck",
      "/shop",
      "/fortress",
      "/arena",
      "/events",
      "/team",
    ]) {
      expect(shouldHideOnboardingTourOnPathname(pathname), pathname).toBe(true);
    }
  });

  it("allows the onboarding tour on Home", () => {
    expect(shouldHideOnboardingTourOnPathname("/")).toBe(false);
  });

  it("does not hide on unrelated routes that only share a prefix", () => {
    expect(shouldHideOnboardingTourOnPathname("/shopkeeper")).toBe(false);
  });
});
