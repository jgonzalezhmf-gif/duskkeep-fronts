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
} from "@/features/server/authoritativeOperationDispatcher";
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
}));

const mockedDailyLogin = vi.mocked(claimDailyLoginAuthoritatively);
const mockedAdventureNode = vi.mocked(claimAdventureNodeRewardAuthoritatively);
const mockedPurchase = vi.mocked(purchaseShopOfferAuthoritatively);

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

  it("keeps local fallback available for linked accounts when the API is disabled", async () => {
    useGameStore.setState({ accountLinkMode: "linked" });
    mockedAdventureNode.mockResolvedValueOnce({ ok: false, mode: "local", reason: "api_disabled" });

    const result = await useGameStore.getState().claimAdventureNodeOnlineFirst("c1l3");

    expect(useGameStore.getState().accountLinkMode).toBe("linked");
    expect(result === null || typeof result === "object").toBe(true);
  });
});
