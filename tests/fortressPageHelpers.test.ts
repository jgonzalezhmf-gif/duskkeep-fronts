import { describe, expect, it } from "vitest";
import { buildFortressLoopSteps } from "@/app/fortress/fortressPageHelpers";

describe("fortress page helpers", () => {
  it("highlights an incomplete garrison and a pending raid", () => {
    expect(
      buildFortressLoopSteps({
        raidReady: false,
        garrisonFilled: 2,
        upgradeReady: false,
        nextAttackLabel: "7h 59m",
      }),
    ).toMatchObject([
      {
        id: "garrison",
        icon: "garrison",
        tone: "attention",
        value: "2/3",
      },
      {
        id: "upgrade",
        icon: "keep",
        tone: "waiting",
        valueKey: "fortressScreen.loop.gatherResources",
      },
      {
        id: "raid",
        icon: "raid",
        tone: "waiting",
        value: "7h 59m",
      },
    ]);
  });

  it("marks a full garrison, affordable upgrade and ready raid as ready", () => {
    expect(
      buildFortressLoopSteps({
        raidReady: true,
        garrisonFilled: 3,
        upgradeReady: true,
        nextAttackLabel: "Ready",
      }).map((step) => [step.id, step.tone, step.value ?? step.valueKey]),
    ).toEqual([
      ["garrison", "ready", "3/3"],
      ["upgrade", "ready", "fortressScreen.loop.upgradeReady"],
      ["raid", "ready", "Ready"],
    ]);
  });
});
