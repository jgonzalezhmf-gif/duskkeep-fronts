import { describe, expect, it } from "vitest";
import { parseServerPlayerSnapshotRpcResult } from "@/features/server/serverPlayerSnapshot";

describe("server player snapshot", () => {
  it("parses the normalized RPC response without leaking tokens or operation internals", () => {
    const parsed = parseServerPlayerSnapshotRpcResult({
      ok: true,
      authoritative: true,
      result: {
        profileId: "profile-1",
        snapshot: {
          account: { name: "Commander", level: 3, xp: 120, updatedAt: "2026-05-14T00:00:00.000Z" },
          resources: { gold: 700, dust: 80, gems: 55, arenaTickets: 4, adventureKeys: 2 },
          heroes: [{ heroId: "bran", level: 3 }],
          frontlineCardUnlocks: { order_guard_wall: true },
          frontlineCardLevels: { order_guard_wall: 2 },
          frontlineLoadout: {
            leaderId: "leader_aurora",
            squad: ["bran", "kara", "mira"],
            deck: [
              "order_guard_wall",
              "order_twin_slash",
              "order_focus_fire",
              "tactic_battle_hymn",
              "tactic_sanctuary",
              "tactic_smokescreen",
              "summon_wolf",
              "summon_barrier",
            ],
          },
          frontlineFortress: {
            buildings: { keep: 2, treasury: 1, barracks: 1 },
            integrity: 100,
            garrison: ["bran", "kara", "mira"],
            lastResolvedAt: null,
            nextAttackAt: "2026-05-14T20:00:00.000Z",
            raidsResolved: 0,
            lastReport: null,
          },
          adventureProgress: { c1l2: { status: "cleared" } },
          adventureMapClaims: {},
          missionsProgress: {},
          dailyLoginClaims: {},
          shopPurchases: [],
          battleStats: { battlesWon: 4, arenaWins: 2, arenaLosses: 1 },
          eventsPlayed: { gold_rush: 3 },
          eventCompletions: { gold_rush: "2026-05-14" },
          access_token: "must-not-survive",
        },
      },
    });

    expect(parsed).toMatchObject({
      ok: true,
      authoritative: true,
      result: {
        profileId: "profile-1",
        snapshot: {
          account: { name: "Commander", level: 3, xp: 120 },
          resources: { gold: 700, dust: 80, gems: 55, arenaTickets: 4, adventureKeys: 2 },
          frontlineCardUnlocks: { order_guard_wall: true },
          frontlineCardLevels: { order_guard_wall: 2 },
          frontlineFortress: {
            buildings: { keep: 2, treasury: 1, barracks: 1 },
            integrity: 100,
          },
          battleStats: { battlesWon: 4, arenaWins: 2, arenaLosses: 1 },
          eventsPlayed: { gold_rush: 3 },
          eventCompletions: { gold_rush: "2026-05-14" },
        },
      },
    });
    expect(JSON.stringify(parsed)).not.toContain("access_token");
    expect(JSON.stringify(parsed)).not.toContain("must-not-survive");
  });

  it("maps RPC auth and not-found failures to generic client reasons", () => {
    expect(parseServerPlayerSnapshotRpcResult({ ok: false, code: "unauthenticated", reason: "Authentication required" })).toEqual({
      ok: false,
      reason: "unauthenticated",
    });
    expect(parseServerPlayerSnapshotRpcResult({ ok: false, code: "not_found", reason: "Profile not found" })).toEqual({
      ok: false,
      reason: "not_found",
    });
  });

  it("rejects malformed authoritative responses", () => {
    expect(parseServerPlayerSnapshotRpcResult(null)).toEqual({ ok: false, reason: "invalid_response" });
    expect(parseServerPlayerSnapshotRpcResult({ ok: true, authoritative: false })).toEqual({
      ok: false,
      reason: "invalid_response",
    });
    expect(
      parseServerPlayerSnapshotRpcResult({
        ok: true,
        authoritative: true,
        result: { profileId: "profile-1", snapshot: { account: {}, resources: {} } },
      }),
    ).toEqual({ ok: false, reason: "invalid_response" });
  });
});
