import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CLIENT_SENSITIVE_MUTATION_BLOCKED_NOTICE } from "@/lib/storeAuthoritativeFallback";
import { useGameStore } from "@/lib/store";

describe("server-authoritative local mutation guard", () => {
  const originalPersistence = process.env.NEXT_PUBLIC_PERSISTENCE;

  beforeEach(() => {
    useGameStore.getState().resetAll();
    useGameStore.setState({ notifications: [] });
  });

  afterEach(() => {
    if (originalPersistence === undefined) {
      delete process.env.NEXT_PUBLIC_PERSISTENCE;
      return;
    }
    process.env.NEXT_PUBLIC_PERSISTENCE = originalPersistence;
  });

  it("blocks direct local resource rewards for server-backed guest sessions", () => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "supabase";
    useGameStore.setState({
      accountLinkMode: "guest",
      resources: { gold: 100, dust: 10, gems: 5, arenaTickets: 3, adventureKeys: 0 },
    });

    useGameStore.getState().awardRewards({ gold: 999, dust: 999, gems: 999, adventureKeys: 3 }, "tampered reward");

    expect(useGameStore.getState().resources).toEqual({ gold: 100, dust: 10, gems: 5, arenaTickets: 3, adventureKeys: 0 });
    expect(useGameStore.getState().notifications).toContainEqual(
      expect.objectContaining({ kind: "error", message: CLIENT_SENSITIVE_MUTATION_BLOCKED_NOTICE }),
    );
  });

  it("blocks direct local spending and shop purchases when Supabase is the persistence mode", () => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "supabase";
    useGameStore.setState({
      accountLinkMode: "linked",
      resources: { gold: 500, dust: 50, gems: 500, arenaTickets: 5, adventureKeys: 0 },
      adventureProgress: { c1l2: { cleared: true, firstClearTaken: true } },
    });

    const spendResult = useGameStore.getState().spend({ gems: 45 });
    const purchaseResult = useGameStore.getState().purchaseOffer("adventure_key_ring");

    expect(spendResult).toBe(false);
    expect(purchaseResult).toEqual({ ok: false, reason: "Server validation required" });
    expect(useGameStore.getState().resources).toEqual({ gold: 500, dust: 50, gems: 500, arenaTickets: 5, adventureKeys: 0 });
    expect(useGameStore.getState().dailyShopPurchases.adventure_key_ring).toBeUndefined();
  });

  it("blocks local Arena ticket spending when Supabase is the persistence mode", () => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "supabase";
    useGameStore.setState({
      accountLinkMode: "guest",
      resources: { gold: 100, dust: 10, gems: 5, arenaTickets: 5, adventureKeys: 0 },
    });

    const spendResult = useGameStore.getState().spend({ arenaTickets: 1 });

    expect(spendResult).toBe(false);
    expect(useGameStore.getState().resources.arenaTickets).toBe(5);
  });

  it("blocks local progression counters in Supabase mode", () => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "supabase";
    useGameStore.setState({
      accountLinkMode: "guest",
      battlesWon: 0,
      arenaWins: 0,
      arenaLosses: 0,
    });

    useGameStore.getState().recordBattleResult(true, "arena");

    expect(useGameStore.getState().battlesWon).toBe(0);
    expect(useGameStore.getState().arenaWins).toBe(0);
    expect(useGameStore.getState().arenaLosses).toBe(0);
  });

  it("keeps local mutation available when the app is configured for local persistence", () => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "local";
    useGameStore.setState({
      accountLinkMode: "guest",
      resources: { gold: 100, dust: 10, gems: 5, arenaTickets: 3, adventureKeys: 0 },
    });

    useGameStore.getState().awardRewards({ gold: 25, dust: 5 }, "local reward");

    expect(useGameStore.getState().resources.gold).toBe(125);
    expect(useGameStore.getState().resources.dust).toBe(15);
  });

  it("keeps local Arena ticket spending available in local persistence", () => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "local";
    useGameStore.setState({
      accountLinkMode: "guest",
      resources: { gold: 100, dust: 10, gems: 5, arenaTickets: 5, adventureKeys: 0 },
    });

    const spendResult = useGameStore.getState().spend({ arenaTickets: 1 });

    expect(spendResult).toBe(true);
    expect(useGameStore.getState().resources.arenaTickets).toBe(4);
  });
});
