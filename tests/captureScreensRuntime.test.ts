import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";

async function loadRuntime() {
  return import(pathToFileURL(`${process.cwd()}/scripts/capture-screens-runtime.mjs`).href);
}

describe("capture screens runtime helpers", () => {
  it("uses a safe default timeout and accepts explicit positive overrides", async () => {
    const { resolveRunTimeoutMs } = await loadRuntime();

    expect(resolveRunTimeoutMs({})).toBe(300_000);
    expect(resolveRunTimeoutMs({ SCREENSHOT_RUN_TIMEOUT_MS: "120000" })).toBe(120_000);
    expect(resolveRunTimeoutMs({ SCREENSHOT_RUN_TIMEOUT_MS: "0" })).toBe(300_000);
    expect(resolveRunTimeoutMs({ SCREENSHOT_RUN_TIMEOUT_MS: "not-a-number" })).toBe(300_000);
  });

  it("kills the spawned server process tree on Windows", async () => {
    const { terminateProcessTree } = await loadRuntime();
    const spawnSync = vi.fn();
    const child = { pid: 1234, killed: false, kill: vi.fn() };

    terminateProcessTree(child, { platform: "win32", spawnSync });

    expect(spawnSync).toHaveBeenCalledWith("taskkill", ["/pid", "1234", "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
    });
    expect(child.kill).not.toHaveBeenCalled();
  });

  it("kills the spawned server process group on Unix-like platforms", async () => {
    const { terminateProcessTree } = await loadRuntime();
    const killProcess = vi.fn();
    const child = { pid: 4321, killed: false, kill: vi.fn() };

    terminateProcessTree(child, { platform: "linux", killProcess });

    expect(killProcess).toHaveBeenCalledWith(-4321, "SIGTERM");
    expect(child.kill).not.toHaveBeenCalled();
  });

  it("falls back to child.kill when process-group termination fails", async () => {
    const { terminateProcessTree } = await loadRuntime();
    const killProcess = vi.fn(() => {
      throw new Error("missing process group");
    });
    const child = { pid: 4321, killed: false, kill: vi.fn() };

    terminateProcessTree(child, { platform: "linux", killProcess });

    expect(child.kill).toHaveBeenCalledWith("SIGTERM");
  });
});
