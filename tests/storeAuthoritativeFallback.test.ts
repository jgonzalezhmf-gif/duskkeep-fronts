import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_ONLINE_PERSISTENCE_UNAVAILABLE_NOTICE,
  AUTH_SESSION_EXPIRED_NOTICE,
} from "@/features/server/sessionSecurity";
import {
  claimAdventureBattleResultAuthoritatively,
  claimAdventureNodeRewardAuthoritatively,
  claimDailyLoginAuthoritatively,
  claimMissionAuthoritatively,
  levelUpHeroAuthoritatively,
  openAdventureMapInteractionAuthoritatively,
  purchaseShopOfferAuthoritatively,
  recordArenaResultAuthoritatively,
  recordEventResultAuthoritatively,
  recordLadderResultAuthoritatively,
  resolveFrontlineFortressRaidAuthoritatively,
  saveFrontlineLoadoutAuthoritatively,
  skillUpHeroAuthoritatively,
  starUpHeroAuthoritatively,
  syncLocalSnapshotAuthoritatively,
  upgradeFrontlineCardAuthoritatively,
  upgradeFrontlineFortressAuthoritatively,
} from "@/features/server/authoritativeOperationDispatcher";
import { loadServerPlayerSnapshot } from "@/features/server/serverPlayerSnapshot";
import { useGameStore } from "@/lib/store";

vi.mock("@/features/server/authoritativeOperationDispatcher", () => ({
  claimAdventureBattleResultAuthoritatively: vi.fn(),
  claimAdventureNodeRewardAuthoritatively: vi.fn(),
  claimDailyLoginAuthoritatively: vi.fn(),
  claimMissionAuthoritatively: vi.fn(),
  levelUpHeroAuthoritatively: vi.fn(),
  openAdventureMapInteractionAuthoritatively: vi.fn(),
  purchaseShopOfferAuthoritatively: vi.fn(),
    recordArenaResultAuthoritatively: vi.fn(),
    recordEventResultAuthoritatively: vi.fn(),
    recordLadderResultAuthoritatively: vi.fn(),
    resolveFrontlineFortressRaidAuthoritatively: vi.fn(),
  saveFrontlineLoadoutAuthoritatively: vi.fn(),
  skillUpHeroAuthoritatively: vi.fn(),
  starUpHeroAuthoritatively: vi.fn(),
  syncLocalSnapshotAuthoritatively: vi.fn(),
  upgradeFrontlineCardAuthoritatively: vi.fn(),
  upgradeFrontlineFortressAuthoritatively: vi.fn(),
}));

vi.mock("@/features/server/serverPlayerSnapshot", () => ({
  loadServerPlayerSnapshot: vi.fn(),
}));

const mockedDailyLogin = vi.mocked(claimDailyLoginAuthoritatively);
const mockedAdventureNode = vi.mocked(claimAdventureNodeRewardAuthoritatively);
const mockedMission = vi.mocked(claimMissionAuthoritatively);
const mockedPurchase = vi.mocked(purchaseShopOfferAuthoritatively);
const mockedCardUpgrade = vi.mocked(upgradeFrontlineCardAuthoritatively);
const mockedFortressUpgrade = vi.mocked(upgradeFrontlineFortressAuthoritatively);
const mockedFortressRaid = vi.mocked(resolveFrontlineFortressRaidAuthoritatively);
const mockedArenaResult = vi.mocked(recordArenaResultAuthoritatively);
const mockedEventResult = vi.mocked(recordEventResultAuthoritatively);
const mockedLadderResult = vi.mocked(recordLadderResultAuthoritatively);
const mockedHeroLevelUp = vi.mocked(levelUpHeroAuthoritatively);
const mockedHeroStarUp = vi.mocked(starUpHeroAuthoritatively);
const mockedHeroSkillUp = vi.mocked(skillUpHeroAuthoritatively);

describe("store authoritative fallback policy", () => {
  const originalPersistence = process.env.NEXT_PUBLIC_PERSISTENCE;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "local";
    vi.clearAllMocks();
    useGameStore.getState().resetAll();
    useGameStore.setState({ notifications: [] });

    vi.mocked(claimAdventureBattleResultAuthoritatively).mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedAdventureNode.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedDailyLogin.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedMission.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    vi.mocked(openAdventureMapInteractionAuthoritatively).mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedPurchase.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedFortressRaid.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedArenaResult.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedEventResult.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedLadderResult.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    vi.mocked(saveFrontlineLoadoutAuthoritatively).mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    vi.mocked(syncLocalSnapshotAuthoritatively).mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedCardUpgrade.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedFortressUpgrade.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedHeroLevelUp.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedHeroStarUp.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedHeroSkillUp.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    vi.mocked(loadServerPlayerSnapshot).mockResolvedValue({ ok: false, reason: "unconfigured" });
  });

  afterEach(() => {
    if (originalPersistence === undefined) {
      delete process.env.NEXT_PUBLIC_PERSISTENCE;
      return;
    }
    process.env.NEXT_PUBLIC_PERSISTENCE = originalPersistence;
  });

  it("blocks local reward fallback for linked accounts when the Supabase session is missing", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedDailyLogin.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeResources = useGameStore.getState().resources;

    const result = await useGameStore.getState().claimDailyLoginOnlineFirst();

    expect(result).toBeNull();
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
    expect(useGameStore.getState().notifications).toContainEqual(
      expect.objectContaining({ kind: "info", message: AUTH_SESSION_EXPIRED_NOTICE }),
    );
  });

  it("blocks linked account purchases instead of spending resources locally when the session is missing", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { ...useGameStore.getState().resources, gems: 200 },
      adventureProgress: { c1l2: { cleared: true, firstClearTaken: true } },
    });
    mockedPurchase.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeResources = useGameStore.getState().resources;

    const result = await useGameStore.getState().purchaseOfferOnlineFirst("adventure_key_ring");

    expect(result).toEqual({ ok: false, reason: "missing_session", authoritative: true });
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().dailyShopPurchases.adventure_key_ring).toBeUndefined();
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
  });

  it("blocks linked account purchases when the server catalog rejects the offer", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { ...useGameStore.getState().resources, gems: 500 },
    });
    mockedPurchase.mockResolvedValueOnce({ ok: false, mode: "authoritative", reason: "Shop offer is not available" });
    const beforeResources = useGameStore.getState().resources;

    const result = await useGameStore.getState().purchaseOfferOnlineFirst("daily_command_drill");

    expect(result).toEqual({ ok: false, reason: "Shop offer is not available", authoritative: true });
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().dailyShopPurchases.daily_command_drill).toBeUndefined();
  });

  it("keeps local fallback available for guest accounts without a Supabase session", async () => {
    useGameStore.setState({ accountLinkMode: "guest" });
    mockedDailyLogin.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeGold = useGameStore.getState().resources.gold;

    const result = await useGameStore.getState().claimDailyLoginOnlineFirst();

    expect(result).not.toBeNull();
    expect(useGameStore.getState().accountLinkMode).toBe("guest");
    expect(useGameStore.getState().resources.gold).toBeGreaterThanOrEqual(beforeGold);
  });

  it("blocks guest local fallback when Supabase persistence expects server-backed guests", async () => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "supabase";
    useGameStore.setState({ accountLinkMode: "guest" });
    mockedDailyLogin.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeResources = useGameStore.getState().resources;

    const result = await useGameStore.getState().claimDailyLoginOnlineFirst();

    expect(result).toBeNull();
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
    expect(useGameStore.getState().notifications).toContainEqual(
      expect.objectContaining({ kind: "info", message: AUTH_SESSION_EXPIRED_NOTICE }),
    );
  });

  it("keeps local shop purchases available for guest accounts without a Supabase session", async () => {
    useGameStore.setState({
      accountLinkMode: "guest",
      resources: { ...useGameStore.getState().resources, gold: 500 },
    });
    mockedPurchase.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });

    const result = await useGameStore.getState().purchaseOfferOnlineFirst("daily_command_drill");

    expect(result).toEqual({ ok: true });
    expect(useGameStore.getState().dailyShopPurchases.daily_command_drill).toBe(1);
    expect(useGameStore.getState().resources.gold).toBeLessThan(500);
  });

  it("rehydrates the server snapshot after authoritative shop rewards that affect progression", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedPurchase.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      resources: { gold: 150, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
      requiresSnapshotRefresh: true,
    });
    vi.mocked(loadServerPlayerSnapshot).mockResolvedValueOnce({
      ok: true,
      authoritative: true,
      result: {
        profileId: "profile-1",
        snapshot: {
          account: { name: "Commander", level: 1, xp: 8 },
          resources: { gold: 150, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
          heroes: [{ heroId: "bran", level: 1, stars: 1, shards: 0, xp: 70, skillLevel: 1 }],
          frontlineCardUnlocks: {},
          frontlineCardLevels: {},
          frontlineLoadout: null,
          frontlineFortress: null,
          adventureProgress: {},
          adventureMapClaims: {},
          missionsProgress: {},
          dailyLoginClaims: {},
          shopPurchases: [],
        },
      },
    });

    const result = await useGameStore.getState().purchaseOfferOnlineFirst("daily_command_drill");

    expect(result).toEqual({ ok: true, authoritative: true });
    expect(loadServerPlayerSnapshot).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().account.xp).toBe(8);
    expect(useGameStore.getState().heroes.find((hero) => hero.heroId === "bran")?.xp).toBe(70);
  });

  it("rehydrates the server snapshot after opening an authoritative adventure map chest", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { gold: 100, dust: 10, gems: 5, arenaTickets: 5, adventureKeys: 1 },
      adventureProgress: { c1l2: { cleared: true, firstClearTaken: true } },
    });
    vi.mocked(openAdventureMapInteractionAuthoritatively).mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      result: {
        interactionId: "c1-lower-cache",
        lootId: "road-cache-rare-gem-purse",
        lootTier: "rare",
        lootTitle: "Gem-Sealed Purse",
        rewards: { gems: 18, accountXp: 10 },
      },
      resources: { gold: 100, dust: 10, gems: 23, arenaTickets: 5, adventureKeys: 0 },
      resetAvailableAt: "2026-05-16T18:00:00.000Z",
    });
    vi.mocked(loadServerPlayerSnapshot).mockResolvedValueOnce({
      ok: true,
      authoritative: true,
      result: {
        profileId: "profile-1",
        snapshot: {
          account: { name: "Commander", level: 1, xp: 10 },
          resources: { gold: 100, dust: 10, gems: 23, arenaTickets: 5, adventureKeys: 0 },
          heroes: [],
          frontlineCardUnlocks: {},
          frontlineCardLevels: {},
          frontlineLoadout: null,
          frontlineFortress: null,
          adventureProgress: { c1l2: { cleared: true, firstClearTaken: true } },
          adventureMapClaims: {
            "c1-lower-cache": {
              claimed: true,
              claimedAt: "2026-05-16T10:00:00.000Z",
              resetAvailableAt: "2026-05-16T18:00:00.000Z",
              lootId: "road-cache-rare-gem-purse",
              lootTier: "rare",
              lootTitle: "Gem-Sealed Purse",
              rewards: { gems: 18, accountXp: 10 },
            },
          },
          missionsProgress: {},
          dailyLoginClaims: {},
          shopPurchases: [],
        },
      },
    });

    const result = await useGameStore.getState().claimAdventureMapInteractionOnlineFirst("c1-lower-cache");

    expect(result).toEqual({
      interactionId: "c1-lower-cache",
      lootId: "road-cache-rare-gem-purse",
      lootTier: "rare",
      lootTitle: "Gem-Sealed Purse",
      rewards: { gems: 18, accountXp: 10 },
    });
    expect(loadServerPlayerSnapshot).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().resources).toEqual({ gold: 100, dust: 10, gems: 23, arenaTickets: 5, adventureKeys: 0 });
    expect(useGameStore.getState().adventureMapClaims["c1-lower-cache"]).toEqual(
      expect.objectContaining({
        claimed: true,
        lootTier: "rare",
        rewards: { gems: 18, accountXp: 10 },
        resetAvailableAt: "2026-05-16T18:00:00.000Z",
      }),
    );
  });

  it("blocks linked account card upgrades when the session is missing", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { ...useGameStore.getState().resources, gold: 1000, dust: 1000 },
    });
    mockedCardUpgrade.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeResources = useGameStore.getState().resources;

    const result = await useGameStore.getState().upgradeFrontlineCardOnlineFirst("order_guard_wall");

    expect(result).toEqual({ ok: false, reason: "missing_session", authoritative: true });
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().frontlineCardLevels.order_guard_wall).toBeUndefined();
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
  });

  it("blocks linked account Frontline fortress upgrades when the session is missing", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { ...useGameStore.getState().resources, gold: 1000, dust: 1000 },
    });
    mockedFortressUpgrade.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeResources = useGameStore.getState().resources;
    const beforeFortress = useGameStore.getState().frontlineFortress;

    const result = await useGameStore.getState().upgradeFrontlineFortressOnlineFirst("keep");

    expect(result).toEqual({ ok: false, reason: "missing_session", authoritative: true });
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().frontlineFortress).toEqual(beforeFortress);
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
  });

  it("blocks linked account Frontline fortress raids when the session is missing", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedFortressRaid.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeResources = useGameStore.getState().resources;
    const beforeFortress = useGameStore.getState().frontlineFortress;

    const result = await useGameStore.getState().resolveFrontlineFortressRaidOnlineFirst();

    expect(result).toBeNull();
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().frontlineFortress).toEqual(beforeFortress);
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
  });

  it("blocks linked account Arena results when the session is missing", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedArenaResult.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeResources = useGameStore.getState().resources;

    const result = await useGameStore.getState().recordArenaResultOnlineFirst({
      opponentId: "arena_bonewood",
      battleSeed: 123,
      winner: "ally",
      turns: 6,
      battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
      rewards: { gold: 120, gems: 3, accountXp: 8 },
      source: "Arena",
      ticketAlreadySpent: false,
    });

    expect(result).toBeNull();
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().arenaWins).toBe(0);
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
  });

  it("counts local Ladder results as Arena-risk mission progress", async () => {
    useGameStore.setState({ accountLinkMode: "guest" });

    const result = await useGameStore.getState().recordLadderResultOnlineFirst({
      opponentId: "ladder_bronze_iii_iron_vow",
      battleSeed: 123,
      winner: "enemy",
      turns: 6,
      battleSummary: { allyCoreHp: 0, enemyCoreHp: 12 },
      rewards: { gold: 9999 },
      source: "Ladder",
    });

    expect(result).toMatchObject({ authoritative: false, pointsDelta: -10 });
    expect(useGameStore.getState().missionsProgress.d_battles_3.progress).toBe(1);
    expect(useGameStore.getState().missionsProgress.d_arena_1.progress).toBe(1);
    expect(useGameStore.getState().missionsProgress.w_battles_20.progress).toBe(1);
  });

  it("does not award local Adventure draw rewards to linked accounts", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    const beforeResources = useGameStore.getState().resources;

    const result = await useGameStore.getState().claimAdventureBattleResultOnlineFirst({
      levelId: "c1l2",
      battleSeed: 123,
      winner: "draw",
      turns: 12,
      battleSummary: { allyCoreHp: 5, enemyCoreHp: 5 },
    });

    expect(result).toEqual({ rewards: { gold: 0, dust: 0, gems: 0, accountXp: 0 }, firstClear: false });
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(vi.mocked(claimAdventureBattleResultAuthoritatively)).not.toHaveBeenCalled();
  });

  it("keeps local Adventure draw rewards available for guest accounts", async () => {
    useGameStore.setState({ accountLinkMode: "guest" });
    const beforeResources = useGameStore.getState().resources;

    const result = await useGameStore.getState().claimAdventureBattleResultOnlineFirst({
      levelId: "c1l2",
      battleSeed: 123,
      winner: "draw",
      turns: 12,
      battleSummary: { allyCoreHp: 5, enemyCoreHp: 5 },
    });

    expect(result).toEqual({ rewards: { gold: 20, dust: 2, gems: 0, accountXp: 1 }, firstClear: false });
    expect(useGameStore.getState().resources.gold).toBe(beforeResources.gold + 20);
    expect(useGameStore.getState().resources.dust).toBe(beforeResources.dust + 2);
  });

  it("blocks linked account Event results when the session is missing", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedEventResult.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeResources = useGameStore.getState().resources;

    const result = await useGameStore.getState().recordEventResultOnlineFirst({
      eventId: "gold_rush",
      battleSeed: 123,
      winner: "ally",
      turns: 7,
      battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
      rewards: { gold: 400, xp: 60, accountXp: 12 },
      source: "Gold Rush",
    });

    expect(result).toBeNull();
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().eventCompletions.gold_rush).toBeUndefined();
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
  });

  it("claims hero upgrade missions through the authoritative mission RPC", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      missionsProgress: {
        d_upgrade_1: {
          progress: 1,
          claimed: false,
          resetAt: "2026-05-15T00:00:00.000Z",
        },
      },
    });
    mockedMission.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      missionId: "d_upgrade_1",
      cycleKey: "daily:2026-05-14",
      rewards: { gold: 80, dust: 15 },
      resources: { gold: 580, dust: 65, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });

    const result = await useGameStore.getState().claimMissionOnlineFirst("d_upgrade_1");

    expect(mockedMission).toHaveBeenCalledWith("d_upgrade_1", expect.stringMatching(/^daily:/));
    expect(result).toEqual({ gold: 80, dust: 15 });
    expect(useGameStore.getState().resources).toEqual({ gold: 580, dust: 65, gems: 50, arenaTickets: 5, adventureKeys: 0 });
    expect(useGameStore.getState().missionsProgress.d_upgrade_1.claimed).toBe(true);
  });

  it("refreshes the server snapshot after authoritative daily rewards for linked accounts", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedDailyLogin.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      dayKey: "2026-05-16",
      streak: 2,
      rewards: { gold: 100, accountXp: 10 },
      resources: { gold: 600, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });
    vi.mocked(loadServerPlayerSnapshot).mockResolvedValueOnce({
      ok: true,
      authoritative: true,
      result: {
        profileId: "profile-1",
        snapshot: {
          account: { name: "Commander", level: 2, xp: 15 },
          resources: { gold: 600, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
          heroes: [],
          frontlineCardUnlocks: {},
          frontlineCardLevels: {},
          frontlineLoadout: null,
          frontlineFortress: null,
          adventureProgress: {},
          adventureMapClaims: {},
          missionsProgress: {},
          dailyLoginClaims: {},
          shopPurchases: [],
        },
      },
    });

    const result = await useGameStore.getState().claimDailyLoginOnlineFirst();

    expect(result).toEqual({ gold: 100, accountXp: 10 });
    expect(loadServerPlayerSnapshot).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().account.level).toBe(2);
    expect(useGameStore.getState().account.xp).toBe(15);
    expect(useGameStore.getState().resources.gold).toBe(600);
  });

  it("refreshes the server snapshot after authoritative mission claims for server-backed guests", async () => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "supabase";
    useGameStore.setState({
      accountLinkMode: "guest",
      missionsProgress: {
        d_upgrade_1: {
          progress: 1,
          claimed: false,
          resetAt: "2026-05-16T00:00:00.000Z",
        },
      },
    });
    mockedMission.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      missionId: "d_upgrade_1",
      cycleKey: "daily:2026-05-16",
      rewards: { gold: 80, dust: 15 },
      resources: { gold: 580, dust: 65, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });
    vi.mocked(loadServerPlayerSnapshot).mockResolvedValueOnce({
      ok: true,
      authoritative: true,
      result: {
        profileId: "profile-guest",
        snapshot: {
          account: { name: "Guest Commander", level: 1, xp: 0 },
          resources: { gold: 580, dust: 65, gems: 50, arenaTickets: 5, adventureKeys: 0 },
          heroes: [],
          frontlineCardUnlocks: {},
          frontlineCardLevels: {},
          frontlineLoadout: null,
          frontlineFortress: null,
          adventureProgress: {},
          adventureMapClaims: {},
          missionsProgress: {},
          dailyLoginClaims: {},
          shopPurchases: [],
        },
      },
    });

    const result = await useGameStore.getState().claimMissionOnlineFirst("d_upgrade_1");

    expect(result).toEqual({ gold: 80, dust: 15 });
    expect(loadServerPlayerSnapshot).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().resources).toEqual({ gold: 580, dust: 65, gems: 50, arenaTickets: 5, adventureKeys: 0 });
  });

  it("blocks linked account mission claims when the session is missing", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      missionsProgress: {
        d_arena_1: {
          progress: 1,
          claimed: false,
          resetAt: "2026-05-15T00:00:00.000Z",
        },
      },
    });
    mockedMission.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeResources = useGameStore.getState().resources;

    const result = await useGameStore.getState().claimMissionOnlineFirst("d_arena_1");

    expect(result).toBeNull();
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().missionsProgress.d_arena_1.claimed).toBe(false);
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
  });

  it("blocks linked account roadmap rewards until they have a server operation", () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      adventureProgress: { c1l1: { cleared: true, firstClearTaken: true } },
    });
    const beforeResources = useGameStore.getState().resources;

    const result = useGameStore.getState().claimRoadmapStep("r_first_win");

    expect(result).toBeNull();
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().roadmapClaimed.r_first_win).toBeUndefined();
    expect(useGameStore.getState().notifications).toContainEqual(
      expect.objectContaining({ kind: "error", message: "Roadmap rewards require server validation" }),
    );
  });

  it("blocks linked account milestone rewards until they have a server operation", () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      account: { ...useGameStore.getState().account, level: 2 },
    });
    const beforeResources = useGameStore.getState().resources;

    const result = useGameStore.getState().claimMilestone(2);

    expect(result).toBeNull();
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().milestonesClaimed[2]).toBeUndefined();
    expect(useGameStore.getState().notifications).toContainEqual(
      expect.objectContaining({ kind: "error", message: "Milestone rewards require server validation" }),
    );
  });

  it("keeps local roadmap and milestone rewards available for guest accounts", () => {
    useGameStore.setState({
      accountLinkMode: "guest",
      account: { ...useGameStore.getState().account, level: 2 },
      adventureProgress: { c1l1: { cleared: true, firstClearTaken: true } },
    });

    expect(useGameStore.getState().claimRoadmapStep("r_first_win")).toEqual({ gold: 150, gems: 10, accountXp: 10 });
    expect(useGameStore.getState().claimMilestone(2)).toEqual({ gold: 200, gems: 20 });
    expect(useGameStore.getState().roadmapClaimed.r_first_win).toBe(true);
    expect(useGameStore.getState().milestonesClaimed[2]).toBe(true);
  });

  it("blocks linked account hero level ups when the session is missing", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { ...useGameStore.getState().resources, gold: 1000 },
    });
    mockedHeroLevelUp.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeResources = useGameStore.getState().resources;
    const beforeHero = useGameStore.getState().heroes.find((hero) => hero.heroId === "bran");

    const result = await useGameStore.getState().levelUpHeroOnlineFirst("bran");

    expect(result).toEqual({ ok: false, reason: "missing_session", authoritative: true });
    expect(useGameStore.getState().resources).toEqual(beforeResources);
    expect(useGameStore.getState().heroes.find((hero) => hero.heroId === "bran")).toEqual(beforeHero);
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
  });

  it("blocks linked account hero star ups when the session is missing", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedHeroStarUp.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeHero = useGameStore.getState().heroes.find((hero) => hero.heroId === "bran");

    const result = await useGameStore.getState().starUpHeroOnlineFirst("bran");

    expect(result).toEqual({ ok: false, reason: "missing_session", authoritative: true });
    expect(useGameStore.getState().heroes.find((hero) => hero.heroId === "bran")).toEqual(beforeHero);
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
  });

  it("blocks linked account hero skill ups when the session is missing", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedHeroSkillUp.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeHero = useGameStore.getState().heroes.find((hero) => hero.heroId === "bran");

    const result = await useGameStore.getState().skillUpHeroOnlineFirst("bran");

    expect(result).toEqual({ ok: false, reason: "missing_session", authoritative: true });
    expect(useGameStore.getState().heroes.find((hero) => hero.heroId === "bran")).toEqual(beforeHero);
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
  });

  it("applies authoritative hero skill ups without trusting local dust", async () => {
    useGameStore.setState({ accountLinkMode: "linked", resources: { gold: 500, dust: 1, gems: 50, arenaTickets: 5, adventureKeys: 0 } });
    mockedHeroSkillUp.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      heroId: "bran",
      skillLevel: 3,
      costPaid: { dust: 250 },
      resources: { gold: 500, dust: 150, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });

    const result = await useGameStore.getState().skillUpHeroOnlineFirst("bran");

    expect(result).toEqual({ ok: true, authoritative: true });
    expect(useGameStore.getState().heroes.find((hero) => hero.heroId === "bran")).toMatchObject({ skillLevel: 3 });
    expect(useGameStore.getState().resources).toEqual({ gold: 500, dust: 150, gems: 50, arenaTickets: 5, adventureKeys: 0 });
  });

  it("applies authoritative hero star ups without trusting local shards", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedHeroStarUp.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      heroId: "bran",
      stars: 3,
      shards: 5,
      shardsSpent: 20,
      resources: { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });

    const result = await useGameStore.getState().starUpHeroOnlineFirst("bran");

    expect(result).toEqual({ ok: true, authoritative: true });
    expect(useGameStore.getState().heroes.find((hero) => hero.heroId === "bran")).toMatchObject({ stars: 3, shards: 5 });
    expect(useGameStore.getState().resources).toEqual({ gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 });
  });

  it("applies authoritative hero level ups without trusting local resources", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { gold: 1, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });
    mockedHeroLevelUp.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      heroId: "bran",
      level: 2,
      costPaid: { gold: 75 },
      resources: { gold: 425, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });

    const result = await useGameStore.getState().levelUpHeroOnlineFirst("bran");

    expect(result).toEqual({ ok: true, authoritative: true });
    expect(useGameStore.getState().heroes.find((hero) => hero.heroId === "bran")?.level).toBe(2);
    expect(useGameStore.getState().resources).toEqual({ gold: 425, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 });
  });

  it("applies authoritative card upgrades without trusting local resources", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { gold: 1, dust: 1, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });
    mockedCardUpgrade.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      cardId: "order_guard_wall",
      level: 2,
      costPaid: { gold: 135, dust: 20 },
      resources: { gold: 365, dust: 30, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });

    const result = await useGameStore.getState().upgradeFrontlineCardOnlineFirst("order_guard_wall");

    expect(result).toEqual({ ok: true, authoritative: true });
    expect(useGameStore.getState().frontlineCardLevels.order_guard_wall).toBe(2);
    expect(useGameStore.getState().resources).toEqual({ gold: 365, dust: 30, gems: 50, arenaTickets: 5, adventureKeys: 0 });
  });

  it("applies authoritative Frontline fortress upgrades without trusting local resources", async () => {
    const frontlineFortress = {
      ...useGameStore.getState().frontlineFortress,
      buildings: { keep: 2, treasury: 1, barracks: 1 },
    };
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { gold: 1, dust: 1, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });
    mockedFortressUpgrade.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      buildingId: "keep",
      level: 2,
      costPaid: { gold: 120, dust: 8 },
      resources: { gold: 380, dust: 42, gems: 50, arenaTickets: 5, adventureKeys: 0 },
      frontlineFortress,
    });

    const result = await useGameStore.getState().upgradeFrontlineFortressOnlineFirst("keep");

    expect(result).toEqual({ ok: true, authoritative: true });
    expect(useGameStore.getState().frontlineFortress.buildings.keep).toBe(2);
    expect(useGameStore.getState().resources).toEqual({ gold: 380, dust: 42, gems: 50, arenaTickets: 5, adventureKeys: 0 });
  });

  it("applies authoritative Frontline fortress raid rewards without trusting local timing or rewards", async () => {
    const report = {
      resolvedAt: "2026-05-15T00:00:00.000Z",
      outcome: "full_repel" as const,
      attackPower: 52,
      defensePower: 76,
      integrityDelta: 0,
      rewards: { gold: 95, dust: 8, gems: 0 },
    };
    const frontlineFortress = {
      ...useGameStore.getState().frontlineFortress,
      nextAttackAt: "2026-05-15T08:00:00.000Z",
      lastResolvedAt: report.resolvedAt,
      raidsResolved: 1,
      lastReport: report,
    };
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { gold: 1, dust: 1, gems: 1, arenaTickets: 5, adventureKeys: 0 },
    });
    mockedFortressRaid.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      report,
      resources: { gold: 595, dust: 58, gems: 50, arenaTickets: 5, adventureKeys: 0 },
      frontlineFortress,
    });

    const result = await useGameStore.getState().resolveFrontlineFortressRaidOnlineFirst();

    expect(result).toEqual(report);
    expect(useGameStore.getState().frontlineFortress.lastReport).toEqual(report);
    expect(useGameStore.getState().resources).toEqual({ gold: 595, dust: 58, gems: 50, arenaTickets: 5, adventureKeys: 0 });
  });

  it("applies authoritative Arena results without trusting local ticket or rewards", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { gold: 1, dust: 1, gems: 1, arenaTickets: 99, adventureKeys: 0 },
    });
    mockedArenaResult.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      opponentId: "arena_bonewood",
      winner: "ally",
      rewards: { gold: 120, gems: 3, accountXp: 8 },
      resources: { gold: 620, dust: 50, gems: 53, arenaTickets: 4, adventureKeys: 0 },
      arenaWins: 1,
      arenaLosses: 0,
    });

    const result = await useGameStore.getState().recordArenaResultOnlineFirst({
      opponentId: "arena_bonewood",
      battleSeed: 123,
      winner: "ally",
      turns: 6,
      battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
      rewards: { gold: 9999, gems: 9999 },
      source: "Arena",
      ticketAlreadySpent: false,
    });

    expect(result).toEqual({
      rewards: { gold: 120, gems: 3, accountXp: 8 },
      authoritative: true,
      resources: { gold: 620, dust: 50, gems: 53, arenaTickets: 4, adventureKeys: 0 },
    });
    expect(useGameStore.getState().resources).toEqual({ gold: 620, dust: 50, gems: 53, arenaTickets: 4, adventureKeys: 0 });
    expect(useGameStore.getState().arenaWins).toBe(1);
    expect(useGameStore.getState().arenaLosses).toBe(0);
  });

  it("announces an authoritative account level-up once after the server snapshot confirms it", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      account: { ...useGameStore.getState().account, level: 1, xp: 90 },
      resources: { gold: 1, dust: 1, gems: 1, arenaTickets: 99, adventureKeys: 0 },
    });

    mockedArenaResult
      .mockResolvedValueOnce({
        ok: true,
        mode: "authoritative",
        opponentId: "arena_bonewood",
        winner: "ally",
        rewards: { gold: 120, gems: 3, accountXp: 10 },
        resources: { gold: 620, dust: 50, gems: 53, arenaTickets: 4, adventureKeys: 0 },
        arenaWins: 1,
        arenaLosses: 0,
      })
      .mockResolvedValueOnce({
        ok: true,
        mode: "authoritative",
        opponentId: "arena_bonewood",
        winner: "ally",
        rewards: { gold: 120, gems: 3, accountXp: 5 },
        resources: { gold: 740, dust: 50, gems: 56, arenaTickets: 3, adventureKeys: 0 },
        arenaWins: 2,
        arenaLosses: 0,
      });
    vi.mocked(loadServerPlayerSnapshot)
      .mockResolvedValueOnce({
        ok: true,
        authoritative: true,
        result: {
          profileId: "profile-1",
          snapshot: {
            account: { name: "Commander", level: 2, xp: 0 },
            resources: { gold: 620, dust: 50, gems: 53, arenaTickets: 4, adventureKeys: 0 },
            heroes: [],
            frontlineCardUnlocks: {},
            frontlineCardLevels: {},
            frontlineLoadout: null,
            frontlineFortress: null,
            adventureProgress: {},
            adventureMapClaims: {},
            missionsProgress: {},
            dailyLoginClaims: {},
            shopPurchases: [],
          },
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        authoritative: true,
        result: {
          profileId: "profile-1",
          snapshot: {
            account: { name: "Commander", level: 2, xp: 5 },
            resources: { gold: 740, dust: 50, gems: 56, arenaTickets: 3, adventureKeys: 0 },
            heroes: [],
            frontlineCardUnlocks: {},
            frontlineCardLevels: {},
            frontlineLoadout: null,
            frontlineFortress: null,
            adventureProgress: {},
            adventureMapClaims: {},
            missionsProgress: {},
            dailyLoginClaims: {},
            shopPurchases: [],
          },
        },
      });

    await useGameStore.getState().recordArenaResultOnlineFirst({
      opponentId: "arena_bonewood",
      battleSeed: 123,
      winner: "ally",
      turns: 6,
      battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
      rewards: { gold: 9999 },
      source: "Arena",
      ticketAlreadySpent: false,
    });

    expect(useGameStore.getState().account).toMatchObject({ level: 2, xp: 0 });
    expect(useGameStore.getState().pendingUnlockLevel).toBe(2);

    useGameStore.getState().ackPendingUnlock();

    await useGameStore.getState().recordArenaResultOnlineFirst({
      opponentId: "arena_bonewood",
      battleSeed: 456,
      winner: "ally",
      turns: 6,
      battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
      rewards: { gold: 9999 },
      source: "Arena",
      ticketAlreadySpent: false,
    });

    expect(useGameStore.getState().account).toMatchObject({ level: 2, xp: 5 });
    expect(useGameStore.getState().pendingUnlockLevel).toBeNull();
  });

  it("applies authoritative Event results without trusting local rewards", async () => {
    useGameStore.setState({
      accountLinkMode: "linked",
      account: { ...useGameStore.getState().account, level: 4 },
      resources: { gold: 1, dust: 1, gems: 1, arenaTickets: 5, adventureKeys: 0 },
    });
    mockedEventResult.mockResolvedValueOnce({
      ok: true,
      mode: "authoritative",
      eventId: "gold_rush",
      winner: "ally",
      firstClear: true,
      rewards: { gold: 400, xp: 60, accountXp: 12 },
      resources: { gold: 900, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });

    const result = await useGameStore.getState().recordEventResultOnlineFirst({
      eventId: "gold_rush",
      battleSeed: 123,
      winner: "ally",
      turns: 7,
      battleSummary: { allyCoreHp: 12, enemyCoreHp: 0 },
      rewards: { gems: 9999 },
      source: "Gold Rush",
    });

    expect(result).toEqual({
      rewards: { gold: 400, xp: 60, accountXp: 12 },
      firstClear: true,
      authoritative: true,
      resources: { gold: 900, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    });
    expect(useGameStore.getState().resources).toEqual({ gold: 900, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 });
    expect(useGameStore.getState().eventCompletions.gold_rush).toBeTruthy();
  });

  it("blocks linked account local fallback when the server-authoritative API is disabled", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedAdventureNode.mockResolvedValueOnce({ ok: false, mode: "local", reason: "api_disabled" });
    const beforeProgress = useGameStore.getState().adventureProgress;

    const result = await useGameStore.getState().claimAdventureNodeOnlineFirst("c1l3");

    expect(useGameStore.getState().accountLinkMode).toBe("linked");
    expect(result).toBeNull();
    expect(useGameStore.getState().adventureProgress).toEqual(beforeProgress);
    expect(useGameStore.getState().notifications).toContainEqual(
      expect.objectContaining({ kind: "error", message: AUTH_ONLINE_PERSISTENCE_UNAVAILABLE_NOTICE }),
    );
  });

  it("applies server snapshots without using local data as authority", async () => {
    useGameStore.setState({
      accountLinkMode: "guest",
      resources: { gold: 1, dust: 1, gems: 1, arenaTickets: 1, adventureKeys: 0 },
      adventureProgress: { c1l4: { cleared: true, firstClearTaken: true } },
    });
    vi.mocked(loadServerPlayerSnapshot).mockResolvedValueOnce({
      ok: true,
      authoritative: true,
      result: {
        profileId: "profile-1",
        snapshot: {
          account: { name: "Server Commander", level: 4, xp: 240 },
          resources: { gold: 650, dust: 80, gems: 55, arenaTickets: 5, adventureKeys: 1 },
          heroes: [],
          frontlineCardUnlocks: {},
          frontlineCardLevels: {},
          frontlineLoadout: null,
          frontlineFortress: null,
          adventureProgress: {},
          adventureMapClaims: {},
          missionsProgress: {},
          dailyLoginClaims: {},
          shopPurchases: [],
        },
      },
    });

    const result = await useGameStore.getState().loadServerSnapshotOnlineFirst();

    expect(result).toEqual({ ok: true, authoritative: true });
    expect(useGameStore.getState().account.name).toBe("Server Commander");
    expect(useGameStore.getState().resources).toEqual({ gold: 650, dust: 80, gems: 55, arenaTickets: 5, adventureKeys: 1 });
    expect(useGameStore.getState().adventureProgress).toEqual({});
  });

  it("blocks linked accounts when server snapshot loading has no session", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    vi.mocked(loadServerPlayerSnapshot).mockResolvedValueOnce({ ok: false, reason: "unauthenticated" });

    const result = await useGameStore.getState().loadServerSnapshotOnlineFirst();

    expect(result).toEqual({ ok: false, reason: "unauthenticated", authoritative: true });
    expect(useGameStore.getState().accountLinkMode).toBe("undecided");
    expect(useGameStore.getState().notifications).toContainEqual(
      expect.objectContaining({ kind: "info", message: AUTH_SESSION_EXPIRED_NOTICE }),
    );
  });
});
