import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_ASSETS_ROOT = path.join(ROOT, "public", "assets");
const NEXT_STATIC_ROOT = path.join(ROOT, ".next", "static");
const SERVER_APP_ROOT = path.join(ROOT, ".next", "server", "app");

const BUDGETS = {
  publicAssetsBytes: 112 * 1024 * 1024,
  nextStaticBytes: 3 * 1024 * 1024,
  serverAppBytes: 1 * 1024 * 1024,
  maxRouteHtmlBytes: 80 * 1024,
};

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  if (!(await exists(directory))) {
    return [];
  }

  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      const info = await stat(fullPath);
      files.push({ path: fullPath, bytes: info.size });
    }
  }
  return files;
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replaceAll("\\", "/");
}

function checkBudget(label, actual, budget, formatter = formatMb) {
  const ok = actual <= budget;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${formatter(actual)} / ${formatter(budget)}`);
  return ok;
}

const publicAssets = await walk(PUBLIC_ASSETS_ROOT);
const nextStatic = await walk(NEXT_STATIC_ROOT);
const serverApp = await walk(SERVER_APP_ROOT);
const routeHtml = serverApp.filter((file) => file.path.endsWith(".html"));

const publicAssetsTotal = publicAssets.reduce((sum, file) => sum + file.bytes, 0);
const nextStaticTotal = nextStatic.reduce((sum, file) => sum + file.bytes, 0);
const serverAppTotal = serverApp.reduce((sum, file) => sum + file.bytes, 0);
const largestRouteHtml = routeHtml.reduce((largest, file) => (file.bytes > largest.bytes ? file : largest), {
  path: "",
  bytes: 0,
});

const checks = [
  checkBudget("public/assets total", publicAssetsTotal, BUDGETS.publicAssetsBytes),
  checkBudget(".next/static total", nextStaticTotal, BUDGETS.nextStaticBytes),
  checkBudget(".next/server/app total", serverAppTotal, BUDGETS.serverAppBytes),
  checkBudget(
    `largest route HTML${largestRouteHtml.path ? ` (${relative(largestRouteHtml.path)})` : ""}`,
    largestRouteHtml.bytes,
    BUDGETS.maxRouteHtmlBytes,
    formatKb,
  ),
];

if (!checks.every(Boolean)) {
  console.error("Performance budget failed. Update the baseline intentionally or reduce asset/build weight.");
  process.exit(1);
}
