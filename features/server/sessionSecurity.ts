export const AUTH_IDLE_TIMEOUT_MS = 60 * 60 * 1000;
export const AUTH_ACTIVITY_THROTTLE_MS = 15 * 1000;

export function hasAuthIdleSessionExpired({
  linked,
  lastActivityAt,
  now,
  idleTimeoutMs = AUTH_IDLE_TIMEOUT_MS,
}: {
  linked: boolean;
  lastActivityAt: number;
  now: number;
  idleTimeoutMs?: number;
}) {
  return linked && now - lastActivityAt >= idleTimeoutMs;
}

export function shouldRecordAuthActivity({
  lastRecordedAt,
  now,
  throttleMs = AUTH_ACTIVITY_THROTTLE_MS,
}: {
  lastRecordedAt: number;
  now: number;
  throttleMs?: number;
}) {
  return now - lastRecordedAt >= throttleMs;
}
