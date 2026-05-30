import { describe, expect, it } from "vitest";
import {
  getInternalNavigationTarget,
  getNavigationTargetLabelKey,
  isPlainNavigationClick,
} from "@/lib/navigationTransition";

describe("navigation transition helpers", () => {
  it("detects internal screen navigation targets", () => {
    const target = getInternalNavigationTarget("http://127.0.0.1:3000/arena", "http://127.0.0.1:3000/");

    expect(target).toEqual({
      href: "/arena",
      labelKey: "nav.arena",
    });
  });

  it("ignores external, same-screen and hash-only links", () => {
    expect(getInternalNavigationTarget("https://example.com/arena", "http://127.0.0.1:3000/")).toBeNull();
    expect(getInternalNavigationTarget("http://127.0.0.1:3000/shop", "http://127.0.0.1:3000/shop")).toBeNull();
    expect(getInternalNavigationTarget("http://127.0.0.1:3000/shop#offers", "http://127.0.0.1:3000/shop")).toBeNull();
  });

  it("labels known destinations by route family", () => {
    expect(getNavigationTargetLabelKey("/adventure/ch1-node-1")).toBe("nav.adventure");
    expect(getNavigationTargetLabelKey("/missions")).toBe("nav.quests");
    expect(getNavigationTargetLabelKey("/battle")).toBe("frontline.command");
  });

  it("only treats unmodified primary clicks as same-tab navigation", () => {
    expect(isPlainNavigationClick({ button: 0 })).toBe(true);
    expect(isPlainNavigationClick({ button: 1 })).toBe(false);
    expect(isPlainNavigationClick({ button: 0, ctrlKey: true })).toBe(false);
  });
});
