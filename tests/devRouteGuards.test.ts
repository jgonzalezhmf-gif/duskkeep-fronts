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
        headers: headers({ "sec-fetch-site": "same-origin", "content-type": "application/json" }),
        nodeEnv: "development",
      }),
    ).toBeNull();
    expect(
      getDevSaveRouteRejectedResponse({
        featureName: "Home effects",
        headers: headers({ "content-type": "application/json" }),
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

  it("requires JSON content type for dev save requests", async () => {
    const response = getDevSaveRouteRejectedResponse({
      featureName: "Home effects",
      headers: headers({ "content-type": "text/plain" }),
      nodeEnv: "development",
    });

    expect(response?.status).toBe(415);
    await expect(response?.json()).resolves.toEqual({
      ok: false,
      message: "Dev save requests must use application/json.",
    });
  });

  it("blocks oversized dev save requests before parsing JSON", async () => {
    const response = getDevSaveRouteRejectedResponse({
      featureName: "Adventure map layout",
      headers: headers({ "content-type": "application/json", "content-length": String(512 * 1024 + 1) }),
      nodeEnv: "development",
    });

    expect(response?.status).toBe(413);
    await expect(response?.json()).resolves.toEqual({
      ok: false,
      message: "Dev save request body is too large.",
    });
  });
});
