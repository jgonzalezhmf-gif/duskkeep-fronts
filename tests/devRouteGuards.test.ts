import { describe, expect, it } from "vitest";

import { getDevSaveRouteDisabledResponse } from "@/app/api/dev/devRouteGuards";

describe("dev route guards", () => {
  it("allows save routes outside production", () => {
    expect(getDevSaveRouteDisabledResponse("Home effects", "development")).toBeNull();
    expect(getDevSaveRouteDisabledResponse("Home effects", "test")).toBeNull();
  });

  it("blocks save routes in production with a feature-specific message", async () => {
    const response = getDevSaveRouteDisabledResponse("Adventure map layout", "production");

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({
      ok: false,
      message: "Saving Adventure map layout is disabled in production.",
    });
  });
});
