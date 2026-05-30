import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium, devices } from "@playwright/test";
import { resolveRunTimeoutMs, terminateProcessTree, withTimeout } from "./capture-screens-runtime.mjs";

const STORAGE_KEY = "duskkeep-fronts:player:v1";
const DEFAULT_BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const DEFAULT_AUTO_PORT = process.env.SCREENSHOT_PORT || "3004";

const argMap = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.split("=");
    return [key, value ?? true];
  }),
);

const startServer = argMap.has("--start-server");
const baseUrl = startServer ? `http://127.0.0.1:${DEFAULT_AUTO_PORT}` : DEFAULT_BASE_URL;
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputRoot = path.resolve("tmp", "playwright-screenshots", timestamp);
const requestedChannel = process.env.PLAYWRIGHT_CHANNEL || null;
const requestedExecutablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || null;
const requestedHeadless = process.env.PLAYWRIGHT_HEADLESS !== "0";
const runTimeoutMs = resolveRunTimeoutMs(process.env);

const viewports = [
  {
    slug: "desktop",
    label: "Desktop 1440x900",
    contextOptions: {
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    },
  },
  {
    slug: "mobile",
    label: "Pixel 7",
    contextOptions: {
      ...devices["Pixel 7"],
    },
  },
];

const scenarios = [
  { slug: "home", path: "/", readyText: "Kingdom Map" },
  { slug: "adventure-ch1", path: "/adventure", readyText: "Campaign Route" },
  {
    slug: "adventure-ch2",
    path: "/adventure",
    readyText: "Campaign Route",
    afterOpen: async (page) => {
      const chapterTwo = page.getByRole("button", { name: /Ashes of the Pact/i }).first();
      if (await chapterTwo.isVisible().catch(() => false)) {
        await chapterTwo.click();
        await page.waitForTimeout(700);
      }
    },
  },
  { slug: "shop-featured", path: "/shop", readyText: "Royal Market" },
  {
    slug: "shop-daily",
    path: "/shop",
    readyText: "Royal Market",
    afterOpen: async (page) => {
      await maybeClick(page, "button", /Daily/i, 700);
    },
  },
  { slug: "deck", path: "/deck", readyText: /Deck|War Room|Cards/i },
  { slug: "roster", path: "/roster", readyText: /Hero Hall|Hero Gallery/i },
  { slug: "missions", path: "/missions", readyText: /Command Log/i },
  { slug: "fortress", path: "/fortress", readyText: "Fortress View" },
  { slug: "arena", path: "/arena", readyText: /Arena|Coliseum/i },
  { slug: "battle-pre", path: "/battle", readyText: "Battle Gate" },
  {
    slug: "battle-live",
    path: "/battle",
    readyText: "Battle Gate",
    afterOpen: async (page) => {
      await maybeClick(page, "button", /Auto-build deck/i);
      await maybeClick(page, "button", /Start deck battle/i, 1200);
      await waitForLiveBattle(page);
      await deployHeroForShot(page);
    },
  },
];

let browser = null;
let devServer = null;
let activeCommand = null;
let cleanupStarted = false;

async function main() {
  await mkdir(outputRoot, { recursive: true });

  if (startServer) {
    devServer = await bootDevServer(baseUrl);
  }

  browser = await launchBrowser();
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    outputRoot,
    scenarios: [],
  };

  try {
    for (const view of viewports) {
      const viewDir = path.join(outputRoot, view.slug);
      await mkdir(viewDir, { recursive: true });
      const context = await browser.newContext(view.contextOptions);
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      await prepareFreshState(page);

      for (const scenario of scenarios) {
        const runtimeIssues = [];
        const consoleErrors = [];
        const onPageError = (error) => {
          runtimeIssues.push(error instanceof Error ? error.message : String(error));
        };
        const onConsole = (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        };
        page.on("pageerror", onPageError);
        page.on("console", onConsole);

        const shotPath = path.join(viewDir, `${scenario.slug}.png`);
        const finalUrl = `${baseUrl}${scenario.path}`;
        const entry = {
          viewport: view.slug,
          label: view.label,
          scenario: scenario.slug,
          url: finalUrl,
          file: shotPath,
          status: "ok",
        };

        try {
          await page.goto(finalUrl, { waitUntil: "networkidle" });
          await dismissOverlays(page);
          await waitForReady(page, scenario.readyText);
          if (scenario.afterOpen) {
            await scenario.afterOpen(page);
            await dismissOverlays(page);
          }
          if (consoleErrors.length) entry.consoleErrors = consoleErrors;
          if (runtimeIssues.length) entry.pageErrors = runtimeIssues;
          await page.screenshot({ path: shotPath, fullPage: false });
        } catch (error) {
          entry.status = "error";
          entry.error = error instanceof Error ? error.message : String(error);
          if (consoleErrors.length) entry.consoleErrors = consoleErrors;
          if (runtimeIssues.length) entry.pageErrors = runtimeIssues;
          const fallbackPath = path.join(viewDir, `${scenario.slug}.error.png`);
          entry.errorFile = fallbackPath;
          await page.screenshot({ path: fallbackPath, fullPage: false }).catch(() => {});
        }

        manifest.scenarios.push(entry);
        page.off("pageerror", onPageError);
        page.off("console", onConsole);
      }

      await context.close();
    }
  } finally {
    await cleanupRuntime();
  }

  await writeFile(path.join(outputRoot, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Screenshots written to ${outputRoot}`);
}

async function cleanupRuntime() {
  if (cleanupStarted) return;
  cleanupStarted = true;

  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }

  if (devServer) {
    terminateProcessTree(devServer);
    devServer = null;
  }

  if (activeCommand) {
    terminateProcessTree(activeCommand);
    activeCommand = null;
  }
}

async function prepareFreshState(page) {
  await page.addInitScript((storageKey) => {
    try {
      window.localStorage.removeItem(storageKey);
      window.localStorage.setItem("codex:hideOverlays", "1");
    } catch {}
  }, STORAGE_KEY);
}

async function dismissOverlays(page) {
  await maybeClick(page, "button", /^Skip$/i);
  await maybeClick(page, "button", /^Continue$/i);
  await page.keyboard.press("Escape").catch(() => {});
}

async function maybeClick(page, role, name, delayAfter = 500) {
  const locator = page.getByRole(role, { name }).first();
  if (await locator.isVisible().catch(() => false)) {
    try {
      await locator.click();
    } catch {
      await locator.click({ force: true });
    }
    await page.waitForTimeout(delayAfter);
    return true;
  }
  return false;
}

async function waitForReady(page, readyText) {
  if (!readyText) {
    await page.waitForTimeout(700);
    return;
  }
  if (readyText instanceof RegExp) {
    await page.getByText(readyText).first().waitFor({ state: "visible" }).catch(() => page.waitForTimeout(800));
    return;
  }
  await page.getByText(readyText, { exact: false }).first().waitFor({ state: "visible" }).catch(() => page.waitForTimeout(800));
}

async function waitForLiveBattle(page) {
  const indicators = [
    page.getByText(/Turn\s+\d+/i).first(),
    page.getByText(/Attacking|Defending/i).first(),
    page.getByRole("button", { name: /End turn/i }).first(),
  ];

  for (const locator of indicators) {
    try {
      await locator.waitFor({ state: "visible", timeout: 5000 });
      await page.waitForTimeout(900);
      return;
    } catch {}
  }

  await page.waitForTimeout(1800);
}

async function deployHeroForShot(page) {
  const heroCard = page.locator("[data-card-kind='hero'][data-playable='true']").first();
  if (!(await heroCard.isVisible().catch(() => false))) {
    await page.waitForTimeout(600);
    return;
  }

  await heroCard.click().catch(async () => {
    await heroCard.click({ force: true });
  });
  await page.waitForTimeout(350);

  const summonTile = page.locator("[data-highlight-kind='summon']").first();
  if (await summonTile.isVisible().catch(() => false)) {
    await summonTile.click().catch(async () => {
      await summonTile.click({ force: true });
    });
    await page.waitForTimeout(900);
    return;
  }

  await page.waitForTimeout(600);
}

async function bootDevServer(url) {
  const port = new URL(url).port;
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const buildIdPath = path.resolve(".next", "BUILD_ID");
  if (!existsSync(buildIdPath)) {
    await runCommand(npmCmd, ["run", "build"]);
  }
  const child = spawn(npmCmd, ["run", "start"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    detached: process.platform !== "win32",
    env: {
      ...process.env,
      PORT: port,
    },
  });

  const shutdown = () => {
    terminateProcessTree(child);
  };
  process.on("exit", shutdown);
  process.on("SIGINT", () => {
    shutdown();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    shutdown();
    process.exit(143);
  });

  await waitForServer(url, 60000);
  return child;
}

async function launchBrowser() {
  const baseOptions = {
    headless: requestedHeadless,
  };

  if (requestedExecutablePath) {
    return chromium.launch({
      ...baseOptions,
      executablePath: requestedExecutablePath,
    });
  }

  if (requestedChannel) {
    return chromium.launch({
      ...baseOptions,
      channel: requestedChannel,
    });
  }

  try {
    return await chromium.launch(baseOptions);
  } catch (error) {
    if (process.platform !== "win32") throw error;

    const fallbacks = ["msedge", "chrome"];
    for (const channel of fallbacks) {
      try {
        console.warn(`Default Chromium launch failed, retrying with Playwright channel "${channel}"...`);
        return await chromium.launch({
          ...baseOptions,
          channel,
        });
      } catch {}
    }

    throw error;
  }
}

async function runCommand(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      detached: process.platform !== "win32",
      env: process.env,
    });
    activeCommand = child;
    child.on("exit", (code) => {
      if (activeCommand === child) activeCommand = null;
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${command} ${args.join(" ")}`));
    });
    child.on("error", (error) => {
      if (activeCommand === child) activeCommand = null;
      reject(error);
    });
  });
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for dev server at ${url}`);
}

withTimeout(main(), {
  label: "Screenshot capture",
  timeoutMs: runTimeoutMs,
  onTimeout: cleanupRuntime,
}).catch(async (error) => {
  console.error(error);
  await cleanupRuntime();
  process.exit(1);
});
