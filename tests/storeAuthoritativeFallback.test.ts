import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_SESSION_EXPIRED_NOTICE } from "@/features/server/sessionSecurity";
import {
  claimAdventureBattleResultAuthoritatively,
  claimAdventureNodeRewardAuthoritatively,
  claimDailyLoginAuthoritatively,
  claimMissionAuthoritatively,
  openAdventureMapInteractionAuthoritatively,
  purchaseShopOfferAuthoritatively,
  saveFrontlineLoadoutAuthoritatively,
  syncLocalSnapshotAuthoritatively,
  upgradeFrontlineCardAuthoritatively,
} from "@/features/server/authoritativeOperationDispatcher";
import { loadServerPlayerSnapshot } from "@/features/server/serverPlayerSnapshot";
import { useGameStore } from "@/lib/store";

vi.mock("@/features/server/authoritativeOperationDispatcher", () => ({
  claimAdventureBattleResultAuthoritatively: vi.fn(),
  claimAdventureNodeRewardAuthoritatively: vi.fn(),
  claimDailyLoginAuthoritatively: vi.fn(),
  claimMissionAuthoritatively: vi.fn(),
  openAdventureMapInteractionAuthoritatively: vi.fn(),
  purchaseShopOfferAuthoritatively: vi.fn(),
  saveFrontlineLoadoutAuthoritatively: vi.fn(),
  syncLocalSnapshotAuthoritatively: vi.fn(),
  upgradeFrontlineCardAuthoritatively: vi.fn(),
}));

vi.mock("@/features/server/serverPlayerSnapshot", () => ({
  loadServerPlayerSnapshot: vi.fn(),
}));

const mockedDailyLogin = vi.mocked(claimDailyLoginAuthoritatively);
const mockedAdventureNode = vi.mocked(claimAdventureNodeRewardAuthoritatively);
const mockedPurchase = vi.mocked(purchaseShopOfferAuthoritatively);
const mockedCardUpgrade = vi.mocked(upgradeFrontlineCardAuthoritatively);

describe("store authoritative fallback policy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.getState().resetAll();
    useGameStore.setState({ notifications: [] });

    vi.mocked(claimAdventureBattleResultAuthoritatively).mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedAdventureNode.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedDailyLogin.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    vi.mocked(claimMissionAuthoritatively).mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    vi.mocked(openAdventureMapInteractionAuthoritatively).mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedPurchase.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    vi.mocked(saveFrontlineLoadoutAuthoritatively).mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    vi.mocked(syncLocalSnapshotAuthoritatively).mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    mockedCardUpgrade.mockResolvedValue({ ok: false, mode: "local", reason: "api_disabled" });
    vi.mocked(loadServerPlayerSnapshot).mockResolvedValue({ ok: false, reason: "unconfigured" });
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

  it("keeps local fallback available for guest accounts without a Supabase session", async () => {
    useGameStore.setState({ accountLinkMode: "guest" });
    mockedDailyLogin.mockResolvedValueOnce({ ok: false, mode: "local", reason: "missing_session" });
    const beforeGold = useGameStore.getState().resources.gold;

    const result = await useGameStore.getState().claimDailyLoginOnlineFirst();

    expect(result).not.toBeNull();
    expect(useGameStore.getState().accountLinkMode).toBe("guest");
    expect(useGameStore.getState().resources.gold).toBeGreaterThanOrEqual(beforeGold);
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

  it("keeps local fallback available for linked accounts when the API is disabled", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedAdventureNode.mockResolvedValueOnce({ ok: false, mode: "local", reason: "api_disabled" });

    const result = await useGameStore.getState().claimAdventureNodeOnlineFirst("c1l3");

    expect(useGameStore.getState().accountLinkMode).toBe("linked");
    expect(result === null || typeof result === "object").toBe(true);
  });

  it("applies server snapshots without using local data as authority", async () => {
    useGameStore.setState({ accountLinkMode: "guest", resources: { gold: 1, dust: 1, gems: 1, arenaTickets: 1, adventureKeys: 0 } });
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
