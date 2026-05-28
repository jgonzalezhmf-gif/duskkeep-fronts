import { describe, expect, it } from "vitest";
import { getFrontlineFortressOutcomeNotification } from "@/lib/frontlineFortressNotifications";

describe("frontline fortress notifications", () => {
  it("maps fortress outcomes to stable notification copy and severity", () => {
    expect(getFrontlineFortressOutcomeNotification("full_repel")).toEqual({
      kind: "success",
      message: "Fortress held the line",
    });
    expect(getFrontlineFortressOutcomeNotification("partial_hold")).toEqual({
      kind: "success",
      message: "Fortress held with damage",
    });
    expect(getFrontlineFortressOutcomeNotification("breach")).toEqual({
      kind: "error",
      message: "Fortress was breached",
    });
  });
});
