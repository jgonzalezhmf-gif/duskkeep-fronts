export const INTRO_SEEN_SESSION_KEY = "duskkeep:intro-seen-session";

type IntroSessionStorage = Pick<Storage, "getItem" | "setItem">;

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

export function markIntroSeenForSession(storage = getSessionStorage()) {
  return writeSessionFlag(INTRO_SEEN_SESSION_KEY, storage);
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
