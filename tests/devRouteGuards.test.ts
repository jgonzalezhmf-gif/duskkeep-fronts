import { describe, expect, it } from "vitest";

import {
  getDevSaveRouteDisabledResponse,
  getDevSaveRouteRejectedResponse,
} from "@/app/api/dev/devRouteGuards";

function headers(values: Record<string, string | undefined>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    },
  };
}

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

  it("allows same-origin and non-browser dev save requests outside production", () => {
    expect(
      getDevSaveRouteRejectedResponse({
        featureName: "Home effects",
        headers: headers({ "sec-fetch-site": "same-origin" }),
        nodeEnv: "development",
      }),
    ).toBeNull();
    expect(
      getDevSaveRouteRejectedResponse({
        featureName: "Home effects",
        headers: headers({}),
        nodeEnv: "development",
      }),
    ).toBeNull();
  });

  it("blocks cross-site dev save requests outside production", async () => {
    const response = getDevSaveRouteRejectedResponse({
      featureName: "Home effects",
      headers: headers({ "sec-fetch-site": "cross-site" }),
      nodeEnv: "development",
    });

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({
      ok: false,
      message: "Cross-site dev save requests are not allowed.",
    });
  });
});
