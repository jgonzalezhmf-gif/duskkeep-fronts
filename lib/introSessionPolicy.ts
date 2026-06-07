export const INTRO_SEEN_SESSION_KEY = "duskkeep:intro-seen-session";
export const INTRO_SEEN_SESSION_EVENT = "duskkeep:intro-seen-session-updated";

type IntroSessionStorage = Pick<Storage, "getItem" | "setItem">;
type IntroSessionEventTarget = Pick<EventTarget, "dispatchEvent">;

export function shouldShowEntryIntro({
  hydrated,
  introEligible,
  forceIntro,
  introDismissed,
  introSeenThisSession,
}: {
  hydrated: boolean;
  introEligible: boolean;
  forceIntro: boolean;
  introDismissed: boolean;
  introSeenThisSession: boolean;
}) {
  if (!hydrated || !introEligible || introDismissed) return false;
  if (forceIntro) return true;
  return !introSeenThisSession;
}

export function readIntroSeenForSession(storage = getSessionStorage()) {
  return readSessionFlag(INTRO_SEEN_SESSION_KEY, storage);
}

export function markIntroSeenForSession(storage = getSessionStorage(), eventTarget = getWindowEventTarget()) {
  const written = writeSessionFlag(INTRO_SEEN_SESSION_KEY, storage);
  if (written) notifyIntroSeenForSession(eventTarget);
  return written;
}

function readSessionFlag(key: string, storage: IntroSessionStorage | null) {
  if (!storage) return false;

  try {
    return storage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string, storage: IntroSessionStorage | null) {
  if (!storage) return false;

  try {
    storage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}

function getSessionStorage(): IntroSessionStorage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

function notifyIntroSeenForSession(eventTarget: IntroSessionEventTarget | null) {
  if (!eventTarget) return false;

  try {
    return eventTarget.dispatchEvent(new Event(INTRO_SEEN_SESSION_EVENT));
  } catch {
    return false;
  }
}

function getWindowEventTarget(): IntroSessionEventTarget | null {
  if (typeof window === "undefined") return null;
  return window;
}
