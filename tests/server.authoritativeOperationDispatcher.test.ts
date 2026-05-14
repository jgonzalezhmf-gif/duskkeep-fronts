import { describe, expect, it, vi } from "vitest";
import {
  claimAdventureBattleResultAuthoritatively,
  claimAdventureNodeRewardAuthoritatively,
  claimDailyLoginAuthoritatively,
  claimMissionAuthoritatively,
  levelUpHeroAuthoritatively,
  openAdventureMapInteractionAuthoritatively,
  purchaseShopOfferAuthoritatively,
  saveFrontlineLoadoutAuthoritatively,
  skillUpHeroAuthoritatively,
  starUpHeroAuthoritatively,
  syncLocalSnapshotAuthoritatively,
  upgradeFrontlineCardAuthoritatively,
  upgradeFrontlineFortressAuthoritatively,
} from "@/features/server/authoritativeOperationDispatcher";

describe("authoritative operation dispatcher", () => {
  it("falls back to local snapshot sync when there is no Supabase session", async () => {
    const result = await syncLocalSnapshotAuthoritatively("1", { resources: { gold: 500 } }, {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("returns normalized snapshot after server-backed local sync", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          profileId: "11111111-1111-4111-8111-111111111111",
          imported: true,
          normalizedSnapshot: {
            account: { name: "Commander", level: 4, xp: 300 },
            resources: { gold: 1200, dust: 250, gems: 50, arenaTickets: 5, adventureKeys: 1 },
          },
        },
      }),
    });

    const result = await syncLocalSnapshotAuthoritatively("1", { resources: { gold: 1200 } }, {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      profileId: "11111111-1111-4111-8111-111111111111",
      imported: true,
      normalizedSnapshot: {
        account: { name: "Commander", level: 4, xp: 300 },
        resources: { gold: 1200, dust: 250, gems: 50, arenaTickets: 5, adventureKeys: 1 },
      },
    });
  });

  it("does not fallback when the connected server rejects local sync", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "invalid_request", reason: "Invalid snapshot shape" }),
    });

    const result = await syncLocalSnapshotAuthoritatively("1", { resources: { gold: 500 } }, {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Invalid snapshot shape",
    });
  });

  it("falls back to local mission claims when there is no Supabase session", async () => {
    const result = await claimMissionAuthoritatively("d_battles_3", "daily:2026-05-12", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("returns authoritative mission rewards and resources", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          missionId: "d_battles_3",
          cycleKey: "daily:2026-05-12",
          rewardsGranted: { gold: 100, dust: 20, accountXp: 10 },
          resources: {
            gold: 600,
            dust: 70,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await claimMissionAuthoritatively("d_battles_3", "daily:2026-05-12", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      missionId: "d_battles_3",
      cycleKey: "daily:2026-05-12",
      rewards: { gold: 100, dust: 20, accountXp: 10 },
      resources: {
        gold: 600,
        dust: 70,
        gems: 50,
        arenaTickets: 5,
        adventureKeys: 0,
      },
    });
  });

  it("falls back to local card upgrades when there is no Supabase session", async () => {
    const result = await upgradeFrontlineCardAuthoritatively("order_guard_wall", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("falls back to local Frontline fortress upgrades when there is no Supabase session", async () => {
    const result = await upgradeFrontlineFortressAuthoritatively("keep", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("falls back to local hero level ups when there is no Supabase session", async () => {
    const result = await levelUpHeroAuthoritatively("bran", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("falls back to local hero star ups when there is no Supabase session", async () => {
    const result = await starUpHeroAuthoritatively("bran", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("falls back to local hero skill ups when there is no Supabase session", async () => {
    const result = await skillUpHeroAuthoritatively("bran", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("returns authoritative hero skill level and resources after enhancing a skill", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          heroId: "bran",
          skillLevel: 3,
          costPaid: { dust: 250 },
          resources: {
            gold: 500,
            dust: 150,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await skillUpHeroAuthoritatively("bran", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      heroId: "bran",
      skillLevel: 3,
      costPaid: { dust: 250 },
      resources: {
        gold: 500,
        dust: 150,
        gems: 50,
        arenaTickets: 5,
        adventureKeys: 0,
      },
    });
  });

  it("does not fallback when the connected server rejects a hero skill up", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "insufficient_resources", reason: "Not enough Arcane Dust" }),
    });

    const result = await skillUpHeroAuthoritatively("bran", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Not enough Arcane Dust",
    });
  });

  it("rejects mismatched authoritative hero skill up responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          heroId: "kara",
          skillLevel: 2,
          costPaid: { dust: 100 },
          resources: {
            gold: 500,
            dust: 400,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await skillUpHeroAuthoritatively("bran", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Server response hero mismatch",
    });
  });

  it("returns authoritative hero stars and remaining shards after starring up a hero", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          heroId: "bran",
          stars: 3,
          shards: 5,
          shardsSpent: 20,
          resources: {
            gold: 500,
            dust: 50,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await starUpHeroAuthoritatively("bran", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      heroId: "bran",
      stars: 3,
      shards: 5,
      shardsSpent: 20,
      resources: {
        gold: 500,
        dust: 50,
        gems: 50,
        arenaTickets: 5,
        adventureKeys: 0,
      },
    });
  });

  it("does not fallback when the connected server rejects a hero star up", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "insufficient_resources", reason: "Not enough shards" }),
    });

    const result = await starUpHeroAuthoritatively("bran", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Not enough shards",
    });
  });

  it("rejects mismatched authoritative hero star up responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          heroId: "kara",
          stars: 2,
          shards: 0,
          shardsSpent: 10,
          resources: {
            gold: 500,
            dust: 50,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await starUpHeroAuthoritatively("bran", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Server response hero mismatch",
    });
  });

  it("returns authoritative hero level and resources after leveling a hero", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          heroId: "bran",
          level: 4,
          costPaid: { gold: 125 },
          resources: {
            gold: 375,
            dust: 50,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await levelUpHeroAuthoritatively("bran", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      heroId: "bran",
      level: 4,
      costPaid: { gold: 125 },
      resources: {
        gold: 375,
        dust: 50,
        gems: 50,
        arenaTickets: 5,
        adventureKeys: 0,
      },
    });
  });

  it("does not fallback when the connected server rejects a hero level up", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "insufficient_resources", reason: "Not enough gold" }),
    });

    const result = await levelUpHeroAuthoritatively("bran", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Not enough gold",
    });
  });

  it("rejects mismatched authoritative hero level up responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          heroId: "kara",
          level: 2,
          costPaid: { gold: 75 },
          resources: {
            gold: 425,
            dust: 50,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await levelUpHeroAuthoritatively("bran", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Server response hero mismatch",
    });
  });

  it("returns authoritative card level and resources after upgrading a Frontline card", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          cardId: "order_guard_wall",
          level: 2,
          costPaid: { gold: 135, dust: 20 },
          resources: {
            gold: 365,
            dust: 30,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await upgradeFrontlineCardAuthoritatively("order_guard_wall", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      cardId: "order_guard_wall",
      level: 2,
      costPaid: { gold: 135, dust: 20 },
      resources: {
        gold: 365,
        dust: 30,
        gems: 50,
        arenaTickets: 5,
        adventureKeys: 0,
      },
    });
  });

  it("returns authoritative Frontline fortress state after upgrading a building", async () => {
    const frontlineFortress = {
      buildings: { keep: 2, treasury: 1, barracks: 1 },
      integrity: 100,
      garrison: ["bran", "kara", "mira"],
      lastResolvedAt: null,
      nextAttackAt: "2026-05-14T20:00:00.000Z",
      raidsResolved: 0,
      lastReport: null,
    };
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          buildingId: "keep",
          level: 2,
          costPaid: { gold: 120, dust: 8 },
          resources: {
            gold: 380,
            dust: 42,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
          frontlineFortress,
        },
      }),
    });

    const result = await upgradeFrontlineFortressAuthoritatively("keep", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      buildingId: "keep",
      level: 2,
      costPaid: { gold: 120, dust: 8 },
      resources: {
        gold: 380,
        dust: 42,
        gems: 50,
        arenaTickets: 5,
        adventureKeys: 0,
      },
      frontlineFortress,
    });
  });

  it("does not fallback when the connected server rejects a Frontline fortress upgrade", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "insufficient_resources", reason: "Not enough resources" }),
    });

    const result = await upgradeFrontlineFortressAuthoritatively("keep", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Not enough resources",
    });
  });

  it("rejects mismatched authoritative Frontline fortress upgrade responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          buildingId: "treasury",
          level: 2,
          costPaid: { gold: 110, dust: 0 },
          resources: {
            gold: 390,
            dust: 50,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
          frontlineFortress: {
            buildings: { keep: 1, treasury: 2, barracks: 1 },
            integrity: 100,
            garrison: ["bran", "kara", "mira"],
            lastResolvedAt: null,
            nextAttackAt: "2026-05-14T20:00:00.000Z",
            raidsResolved: 0,
            lastReport: null,
          },
        },
      }),
    });

    const result = await upgradeFrontlineFortressAuthoritatively("keep", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Server response building mismatch",
    });
  });

  it("does not fallback when the connected server rejects a card upgrade", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "insufficient_resources", reason: "Not enough resources" }),
    });

    const result = await upgradeFrontlineCardAuthoritatively("order_guard_wall", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Not enough resources",
    });
  });

  it("rejects mismatched authoritative card upgrade responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          cardId: "order_twin_slash",
          level: 2,
          costPaid: { gold: 135, dust: 20 },
          resources: {
            gold: 365,
            dust: 30,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await upgradeFrontlineCardAuthoritatively("order_guard_wall", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Server response card mismatch",
    });
  });

  it("does not fallback when the connected server rejects a mission claim", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "locked", reason: "Mission is not complete" }),
    });

    const result = await claimMissionAuthoritatively("d_battles_3", "daily:2026-05-12", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Mission is not complete",
    });
  });

  it("rejects mismatched authoritative mission responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          missionId: "d_adv_2",
          cycleKey: "daily:2026-05-12",
          rewardsGranted: { gold: 150 },
          resources: {
            gold: 650,
            dust: 50,
            gems: 55,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await claimMissionAuthoritatively("d_battles_3", "daily:2026-05-12", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Server response mission mismatch",
    });
  });

  it("falls back to local daily login claims when there is no Supabase session", async () => {
    const result = await claimDailyLoginAuthoritatively("2026-05-11", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("returns authoritative daily login rewards and resources", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          dayKey: "2026-05-11",
          streak: 2,
          rewardsGranted: { gold: 200, dust: 30 },
          resources: {
            gold: 700,
            dust: 80,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await claimDailyLoginAuthoritatively("2026-05-11", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      dayKey: "2026-05-11",
      streak: 2,
      rewards: { gold: 200, dust: 30 },
      resources: {
        gold: 700,
        dust: 80,
        gems: 50,
        arenaTickets: 5,
        adventureKeys: 0,
      },
    });
  });

  it("does not fallback when the connected server rejects a daily login claim", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "already_claimed", reason: "Daily reward already claimed" }),
    });

    const result = await claimDailyLoginAuthoritatively("2026-05-11", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Daily reward already claimed",
    });
  });

  it("falls back to local loadout saves when there is no Supabase session", async () => {
    const result = await saveFrontlineLoadoutAuthoritatively(
      {
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
      {
        tokenProvider: async () => null,
      },
    );

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("returns the authoritative loadout snapshot after a server-backed save", async () => {
    const loadout = {
      leaderId: "leader_aurora",
      squad: ["bran", "kara", "mira"] as [string, string, string],
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
    };
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          ...loadout,
          updatedAt: "2026-05-11T22:00:00.000Z",
        },
      }),
    });

    const result = await saveFrontlineLoadoutAuthoritatively(loadout, {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      loadout,
      updatedAt: "2026-05-11T22:00:00.000Z",
    });
  });

  it("does not fallback when the connected server rejects a loadout save", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "invalid_loadout", reason: "Invalid deck shape" }),
    });

    const result = await saveFrontlineLoadoutAuthoritatively(
      {
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
      {
        tokenProvider: async () => "valid-token-value",
        fetcher,
      },
    );

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Invalid deck shape",
    });
  });

  it("keeps unsupported shop offers on the local path", async () => {
    const result = await purchaseShopOfferAuthoritatively("daily_raid_payout", {
      tokenProvider: async () => "valid-token-value",
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "unsupported_offer" });
  });

  it("falls back to local mode when there is no Supabase session", async () => {
    const result = await purchaseShopOfferAuthoritatively("adventure_key_ring", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("falls back to local mode when the authoritative API is disabled", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ ok: false, code: "not_found", reason: "Server-authoritative API is disabled" }),
    });

    const result = await purchaseShopOfferAuthoritatively("adventure_key_ring", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "api_disabled" });
  });

  it("returns authoritative resources after a server-backed purchase", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          offerId: "adventure_key_ring",
          resources: {
            gold: 500,
            dust: 50,
            gems: 5,
            arenaTickets: 5,
            adventureKeys: 1,
          },
        },
      }),
    });

    const result = await purchaseShopOfferAuthoritatively("adventure_key_ring", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      resources: {
        gold: 500,
        dust: 50,
        gems: 5,
        arenaTickets: 5,
        adventureKeys: 1,
      },
    });
  });

  it("does not fallback when the server rejects a connected purchase", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "daily_limit_reached", reason: "Daily limit reached" }),
    });

    const result = await purchaseShopOfferAuthoritatively("adventure_key_ring", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Daily limit reached",
    });
  });

  it("does not fallback on generic server not-found responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ ok: false, code: "not_found", reason: "Shop offer is not supported by the server yet" }),
    });

    const result = await purchaseShopOfferAuthoritatively("adventure_key_ring", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Shop offer is not supported by the server yet",
    });
  });

  it("falls back to local cache opening when there is no Supabase session", async () => {
    const result = await openAdventureMapInteractionAuthoritatively("c1-lower-cache", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("returns authoritative cache loot and resources after opening a map interaction", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          interactionId: "c1-lower-cache",
          status: "claimed",
          lootId: "road-cache-common-supplies",
          lootTier: "common",
          lootTitle: "Roadside Supplies",
          rewardsGranted: { gold: 220, dust: 25, accountXp: 8 },
          resources: {
            gold: 720,
            dust: 75,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 0,
          },
          resetAvailableAt: "2026-05-12T05:00:00.000Z",
        },
      }),
    });

    const result = await openAdventureMapInteractionAuthoritatively("c1-lower-cache", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      result: {
        interactionId: "c1-lower-cache",
        lootId: "road-cache-common-supplies",
        lootTier: "common",
        lootTitle: "Roadside Supplies",
        rewards: { gold: 220, dust: 25, accountXp: 8 },
      },
      resources: {
        gold: 720,
        dust: 75,
        gems: 50,
        arenaTickets: 5,
        adventureKeys: 0,
      },
      resetAvailableAt: "2026-05-12T05:00:00.000Z",
    });
  });

  it("does not fallback when the connected server rejects cache opening", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "insufficient_resources", reason: "Adventure key required" }),
    });

    const result = await openAdventureMapInteractionAuthoritatively("c1-lower-cache", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Adventure key required",
    });
  });

  it("falls back to local node claims when there is no Supabase session", async () => {
    const result = await claimAdventureNodeRewardAuthoritatively("c1l3", {
      tokenProvider: async () => null,
    });

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("returns authoritative node rewards and resources after a chest node claim", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          nodeId: "c1l3",
          status: "claimed",
          rewardsGranted: {
            gold: 120,
            dust: 20,
            gems: 15,
            accountXp: 14,
            frontlineCards: [{ cardId: "order_shadow_dive" }],
          },
          resources: {
            gold: 620,
            dust: 70,
            gems: 65,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await claimAdventureNodeRewardAuthoritatively("c1l3", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      nodeId: "c1l3",
      rewards: {
        gold: 120,
        dust: 20,
        gems: 15,
        accountXp: 14,
        frontlineCards: [{ cardId: "order_shadow_dive" }],
      },
      resources: {
        gold: 620,
        dust: 70,
        gems: 65,
        arenaTickets: 5,
        adventureKeys: 0,
      },
    });
  });

  it("does not fallback when the connected server rejects a node reward claim", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "already_claimed", reason: "Adventure node reward already claimed" }),
    });

    const result = await claimAdventureNodeRewardAuthoritatively("c1l3", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Adventure node reward already claimed",
    });
  });

  it("rejects mismatched authoritative node reward responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          nodeId: "c1l7",
          rewardsGranted: { gold: 120 },
          resources: {
            gold: 620,
            dust: 70,
            gems: 65,
            arenaTickets: 5,
            adventureKeys: 0,
          },
        },
      }),
    });

    const result = await claimAdventureNodeRewardAuthoritatively("c1l3", {
      tokenProvider: async () => "valid-token-value",
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Server response node mismatch",
    });
  });

  it("falls back to local adventure battle claims when there is no Supabase session", async () => {
    const result = await claimAdventureBattleResultAuthoritatively(
      {
        nodeId: "c1l2",
        battleSeed: 123,
        winner: "ally",
        turns: 7,
        battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
      },
      {
        tokenProvider: async () => null,
      },
    );

    expect(result).toEqual({ ok: false, mode: "local", reason: "missing_session" });
  });

  it("returns authoritative adventure battle rewards and progress flags", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          nodeId: "c1l2",
          winner: "ally",
          firstClear: true,
          rewardsGranted: { gold: 80, dust: 10, accountXp: 12, adventureKeys: 1 },
          resources: {
            gold: 580,
            dust: 60,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 1,
          },
          unlockedNodeIds: ["c1l3", "c1l7"],
        },
      }),
    });

    const result = await claimAdventureBattleResultAuthoritatively(
      {
        nodeId: "c1l2",
        battleSeed: 123,
        winner: "ally",
        turns: 7,
        battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
      },
      {
        tokenProvider: async () => "valid-token-value",
        fetcher,
      },
    );

    expect(result).toEqual({
      ok: true,
      mode: "authoritative",
      nodeId: "c1l2",
      winner: "ally",
      firstClear: true,
      rewards: { gold: 80, dust: 10, accountXp: 12, adventureKeys: 1 },
      resources: {
        gold: 580,
        dust: 60,
        gems: 50,
        arenaTickets: 5,
        adventureKeys: 1,
      },
      unlockedNodeIds: ["c1l3", "c1l7"],
    });
  });

  it("does not fallback when the connected server rejects an adventure battle claim", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, code: "locked", reason: "Adventure node is locked" }),
    });

    const result = await claimAdventureBattleResultAuthoritatively(
      {
        nodeId: "c1l2",
        battleSeed: 123,
        winner: "ally",
        turns: 7,
        battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
      },
      {
        tokenProvider: async () => "valid-token-value",
        fetcher,
      },
    );

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Adventure node is locked",
    });
  });

  it("rejects mismatched authoritative adventure battle responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authoritative: true,
        result: {
          nodeId: "c1l5",
          winner: "ally",
          firstClear: true,
          rewardsGranted: { gold: 80 },
          resources: {
            gold: 580,
            dust: 60,
            gems: 50,
            arenaTickets: 5,
            adventureKeys: 1,
          },
          unlockedNodeIds: [],
        },
      }),
    });

    const result = await claimAdventureBattleResultAuthoritatively(
      {
        nodeId: "c1l2",
        battleSeed: 123,
        winner: "ally",
        turns: 7,
        battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
      },
      {
        tokenProvider: async () => "valid-token-value",
        fetcher,
      },
    );

    expect(result).toEqual({
      ok: false,
      mode: "authoritative",
      reason: "Server response node mismatch",
    });
  });
});
