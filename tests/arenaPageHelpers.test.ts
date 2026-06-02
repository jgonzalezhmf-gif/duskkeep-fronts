import { describe, expect, it } from "vitest";
import { buildArenaModeIntel } from "@/app/arena/arenaPageHelpers";

describe("arena mode intel helpers", () => {
  it("keeps ladder framed as the no-ticket persistent queue", () => {
    expect(
      buildArenaModeIntel({
        mode: "ladder",
        tickets: 0,
        loadoutReady: true,
        ladderDailyWins: 2,
        ladderKeyProgress: 40,
      }),
    ).toMatchObject({
      icon: "ladder",
      ready: true,
      statusKey: "arenaScreen.modeIntel.queueReady",
      primaryValueKey: "arenaScreen.ladder.noTicketCost",
      secondaryValue: "2/5",
      tertiaryValue: "40%",
    });
  });

  it("marks Arena Trials as blocked when tickets are missing", () => {
    expect(
      buildArenaModeIntel({
        mode: "trials",
        tickets: 0,
        loadoutReady: true,
        ladderDailyWins: 0,
        ladderKeyProgress: 0,
      }),
    ).toMatchObject({
      icon: "arena_draft",
      ready: false,
      statusKey: "arenaScreen.floor.noTickets",
      primaryValue: "0",
      secondaryValueKey: "arenaScreen.trials.modeMeta",
      tertiaryValueKey: "arenaScreen.trials.specialReward",
    });
  });
});
