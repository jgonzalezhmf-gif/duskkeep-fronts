import { describe, expect, it } from "vitest";
import {
  INTRO_SEEN_SESSION_EVENT,
  INTRO_SEEN_SESSION_KEY,
  markIntroSeenForSession,
  readIntroSeenForSession,
  shouldShowEntryIntro,
} from "@/lib/introSessionPolicy";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

class MemoryEventTarget {
  readonly events: string[] = [];

  dispatchEvent(event: Event) {
    this.events.push(event.type);
    return true;
  }
}

describe("intro session policy", () => {
  it("shows the entry intro once per browser tab session", () => {
    expect(
      shouldShowEntryIntro({
        hydrated: true,
        introEligible: true,
        forceIntro: false,
        introDismissed: false,
        introSeenThisSession: false,
      }),
    ).toBe(true);

    expect(
      shouldShowEntryIntro({
        hydrated: true,
        introEligible: true,
        forceIntro: false,
        introDismissed: false,
        introSeenThisSession: true,
      }),
    ).toBe(false);
  });

  it("keeps force-intro available without showing behind hydration or QA gates", () => {
    expect(
      shouldShowEntryIntro({
        hydrated: true,
        introEligible: true,
        forceIntro: true,
        introDismissed: false,
        introSeenThisSession: true,
      }),
    ).toBe(true);
    expect(
      shouldShowEntryIntro({
        hydrated: false,
        introEligible: true,
        forceIntro: true,
        introDismissed: false,
        introSeenThisSession: false,
      }),
    ).toBe(false);
    expect(
      shouldShowEntryIntro({
        hydrated: true,
        introEligible: false,
        forceIntro: true,
        introDismissed: false,
        introSeenThisSession: false,
      }),
    ).toBe(false);
  });

  it("records intro completion in tab-scoped storage", () => {
    const storage = new MemoryStorage();

    expect(readIntroSeenForSession(storage)).toBe(false);

    markIntroSeenForSession(storage);

    expect(storage.getItem(INTRO_SEEN_SESSION_KEY)).toBe("1");
    expect(readIntroSeenForSession(storage)).toBe(true);
  });

  it("notifies the page when another auth flow marks the intro as completed", () => {
    const storage = new MemoryStorage();
    const eventTarget = new MemoryEventTarget();

    markIntroSeenForSession(storage, eventTarget);

    expect(eventTarget.events).toEqual([INTRO_SEEN_SESSION_EVENT]);
  });
});
