import { describe, expect, it } from "vitest";
import { planLocalArenaResult } from "@/features/arena/resultState";
import type { Resources } from "@/lib/types";

const resources: Resources = {
  gold: 100,
  dust: 10,
  gems: 5,
  arenaTickets: 1,
  adventureKeys: 0,
};

describe("arena local result planning", () => {
  it("requires an arena ticket when the battle did not spend one upfront", () => {
    expect(
      planLocalArenaResult({
        resources: { ...resources, arenaTickets: 0 },
        winner: "ally",
        rewards: { gold: 75 },
        source: "arena trial",
      }),
    ).toEqual({ ok: false, reason: "Arena ticket required" });
  });

  it("plans ticket spending and victory reward application", () => {
    expect(
      planLocalArenaResult({
        resources,
        winner: "ally",
        rewards: { gold: 75, dust: 5 },
        source: "arena trial",
      }),
    ).toEqual({
      ok: true,
      rewards: { gold: 75, dust: 5 },
      source: "arena trial",
      shouldSpendTicket: true,
      won: true,
    });
  });

  it("does not spend another ticket when it was already spent before battle", () => {
    expect(
      planLocalArenaResult({
        resources: { ...resources, arenaTickets: 0 },
        winner: "enemy",
        rewards: {},
        source: "arena trial",
        ticketAlreadySpent: true,
      }),
    ).toEqual({
      ok: true,
      rewards: {},
      source: "arena trial",
      shouldSpendTicket: false,
      won: false,
    });
  });
});
