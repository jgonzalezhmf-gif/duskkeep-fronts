import type { MutableRefObject } from "react";

export type FrontlineTimerRef = MutableRefObject<ReturnType<typeof setTimeout> | null>;

export function clearFrontlineTimer(timerRef: FrontlineTimerRef) {
  if (timerRef.current) clearTimeout(timerRef.current);
}
