import { describe, expect, it } from "vitest";
import { hasAuthIdleSessionExpired, shouldRecordAuthActivity } from "@/features/server/sessionSecurity";

describe("auth session security helpers", () => {
  it("expires linked sessions only after the idle timeout", () => {
    expect(
      hasAuthIdleSessionExpired({
        linked: true,
        lastActivityAt: 1_000,
        now: 5_000,
        idleTimeoutMs: 4_000,
      }),
    ).toBe(true);

    expect(
      hasAuthIdleSessionExpired({
        linked: true,
        lastActivityAt: 1_000,
        now: 4_999,
        idleTimeoutMs: 4_000,
      }),
    ).toBe(false);
  });

  it("does not expire guest or undecided sessions", () => {
    expect(
      hasAuthIdleSessionExpired({
        linked: false,
        lastActivityAt: 1_000,
        now: 99_000,
        idleTimeoutMs: 4_000,
      }),
    ).toBe(false);
  });

  it("throttles activity writes", () => {
    expect(shouldRecordAuthActivity({ lastRecordedAt: 1_000, now: 14_999, throttleMs: 14_000 })).toBe(false);
    expect(shouldRecordAuthActivity({ lastRecordedAt: 1_000, now: 15_000, throttleMs: 14_000 })).toBe(true);
  });
});
