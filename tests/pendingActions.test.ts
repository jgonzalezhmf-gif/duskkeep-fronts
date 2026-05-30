import { describe, expect, it } from "vitest";
import {
  createPendingActionKey,
  finishPendingAction,
  isPendingAction,
  startPendingAction,
} from "@/lib/pendingActions";

describe("pending action helpers", () => {
  it("creates stable scoped keys", () => {
    expect(createPendingActionKey("shop.purchase", "starter_pack")).toBe("shop.purchase:starter_pack");
    expect(createPendingActionKey("arena.result")).toBe("arena.result");
  });

  it("does not start the same pending action twice", () => {
    const first = startPendingAction([], "shop.purchase:starter_pack");
    const second = startPendingAction(first.activeKeys, "shop.purchase:starter_pack");

    expect(first.started).toBe(true);
    expect(second.started).toBe(false);
    expect(second.activeKeys).toEqual(["shop.purchase:starter_pack"]);
  });

  it("tracks and clears independent pending actions", () => {
    const active = startPendingAction(["shop.purchase:starter_pack"], "mission.claim:daily_1").activeKeys;

    expect(isPendingAction(active, "mission.claim:daily_1")).toBe(true);
    expect(finishPendingAction(active, "shop.purchase:starter_pack")).toEqual(["mission.claim:daily_1"]);
  });
});
