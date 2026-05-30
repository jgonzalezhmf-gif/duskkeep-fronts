import { spawnSync as defaultSpawnSync } from "node:child_process";
import process from "node:process";

const DEFAULT_RUN_TIMEOUT_MS = 300_000;

export function resolveRunTimeoutMs(env = process.env) {
  const parsed = Number.parseInt(env.SCREENSHOT_RUN_TIMEOUT_MS ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RUN_TIMEOUT_MS;
}

export function createTimeoutError(label, timeoutMs) {
  return new Error(`${label} timed out after ${timeoutMs}ms`);
}

export function terminateProcessTree(
  child,
  {
    platform = process.platform,
    spawnSync = defaultSpawnSync,
    killProcess = process.kill,
    signal = "SIGTERM",
  } = {},
) {
  if (!child || child.killed || !child.pid) return;

  if (platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  try {
    killProcess(-child.pid, signal);
  } catch {
    child.kill(signal);
  }
}

export async function withTimeout(promise, { label, timeoutMs, onTimeout }) {
  let timeout = null;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(async () => {
      await onTimeout?.();
      reject(createTimeoutError(label, timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
