import { describe, expect, it } from "vitest";
import { buildDeckReadiness, buildPackageProfile } from "@/app/deck/deckPageHelpers";

const t = (key: string) => key;

describe("deck page helpers", () => {
  it("marks the war table ready only when leader, squad and deck are complete", () => {
    const readiness = buildDeckReadiness({
      leaderId: "leader_aurora",
      squadIds: ["bran", "kara", "mira"],
      deckIds: [
        "order_guard_wall",
        "order_twin_slash",
        "order_focus_fire",
        "tactic_battle_hymn",
        "tactic_sanctuary",
        "tactic_smokescreen",
        "summon_wolf",
        "summon_barrier",
      ],
      t,
    });

    expect(readiness.ready).toBe(true);
    expect(readiness.completed).toBe(3);
    expect(readiness.nextAction).toBe("deckScreen.readiness.readyCue");
  });

  it("points at the first missing readiness step", () => {
    const readiness = buildDeckReadiness({
      leaderId: "leader_aurora",
      squadIds: ["bran", null, null],
      deckIds: ["order_guard_wall"],
      t,
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.completed).toBe(1);
    expect(readiness.nextAction).toBe("deckScreen.readiness.squad");
  });

  it("summarizes package focus, command cost and empty slots", () => {
    const packageProfile = buildPackageProfile([
      "order_guard_wall",
      "order_twin_slash",
      "order_focus_fire",
      "order_shadow_dive",
      "summon_wolf",
    ]);

    expect(packageProfile.focus).toBe("orders");
    expect(packageProfile.missingSlots).toBe(3);
    expect(packageProfile.counts).toMatchObject({ orders: 4, tactics: 0, summons: 1 });
    expect(packageProfile.commandCost).toBeGreaterThan(0);
  });
});
