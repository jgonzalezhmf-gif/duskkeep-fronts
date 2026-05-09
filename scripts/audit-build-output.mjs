import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const NEXT_ROOT = path.join(ROOT, ".next");
const STATIC_ROOT = path.join(NEXT_ROOT, "static");
const SERVER_APP_ROOT = path.join(NEXT_ROOT, "server", "app");
const TOP_LIMIT = Number.parseInt(process.argv[2] ?? "20", 10);

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  if (!(await exists(directory))) return [];
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

function relative(file) {
  return path.relative(ROOT, file.path).replaceAll("\\", "/");
}

function printTop(title, files, limit = TOP_LIMIT) {
  console.log(title);
  for (const file of files.sort((a, b) => b.bytes - a.bytes).slice(0, limit)) {
    console.log(`${formatKb(file.bytes).padStart(10)}  ${relative(file)}`);
  }
}

const staticFiles = await walk(STATIC_ROOT);
const serverAppFiles = await walk(SERVER_APP_ROOT);
const staticTotal = staticFiles.reduce((sum, file) => sum + file.bytes, 0);
const serverAppTotal = serverAppFiles.reduce((sum, file) => sum + file.bytes, 0);
const routeHtml = serverAppFiles.filter((file) => file.path.endsWith(".html"));

console.log("Next build output audit");
console.log(`Static files: ${staticFiles.length} (${formatMb(staticTotal)})`);
console.log(`Server app files: ${serverAppFiles.length} (${formatMb(serverAppTotal)})`);
console.log("");
printTop(`Top ${Math.min(TOP_LIMIT, staticFiles.length)} static files:`, staticFiles);
console.log("");
printTop(`Top ${Math.min(TOP_LIMIT, routeHtml.length)} prerendered route HTML files:`, routeHtml);
