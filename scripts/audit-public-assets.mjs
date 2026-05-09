import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const ASSET_ROOT = path.join(process.cwd(), "public", "assets");
const TOP_LIMIT = Number.parseInt(process.argv[2] ?? "25", 10);

async function walk(directory) {
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

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const files = await walk(ASSET_ROOT);
const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
const topFiles = files.sort((a, b) => b.bytes - a.bytes).slice(0, TOP_LIMIT);

console.log(`Public asset files: ${files.length}`);
console.log(`Public asset total: ${formatMb(totalBytes)}`);
console.log(`Top ${topFiles.length} assets:`);
for (const file of topFiles) {
  console.log(`${formatMb(file.bytes).padStart(9)}  ${path.relative(process.cwd(), file.path).replaceAll("\\", "/")}`);
}
