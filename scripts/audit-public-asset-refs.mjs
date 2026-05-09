import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ASSET_ROOT = path.join(process.cwd(), "public", "assets");
const SOURCE_ROOTS = ["app", "components", "data", "docs", "features", "lib", "scripts", "tests"];
const SOURCE_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
]);

const limit = Number.parseInt(process.argv[2] ?? "50", 10);

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(directory, filter) {
  if (!(await pathExists(directory))) {
    return [];
  }

  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath, filter)));
    } else if (entry.isFile() && filter(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function toProjectPath(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll("\\", "/");
}

function toPublicUrl(filePath) {
  return `/${toProjectPath(filePath).replace(/^public\//, "")}`;
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const assetFiles = await walkFiles(ASSET_ROOT, () => true);
const sourceFiles = (
  await Promise.all(
    SOURCE_ROOTS.map((root) =>
      walkFiles(path.join(process.cwd(), root), (filePath) => SOURCE_EXTENSIONS.has(path.extname(filePath))),
    ),
  )
).flat();

const sourceText = (
  await Promise.all(
    sourceFiles.map(async (filePath) => {
      try {
        return await readFile(filePath, "utf8");
      } catch {
        return "";
      }
    }),
  )
).join("\n");

const candidates = [];
for (const filePath of assetFiles) {
  const info = await stat(filePath);
  const basename = path.basename(filePath);
  const publicUrl = toPublicUrl(filePath);
  const projectPath = toProjectPath(filePath);
  const referenced =
    sourceText.includes(basename) ||
    sourceText.includes(publicUrl) ||
    sourceText.includes(projectPath) ||
    sourceText.includes(projectPath.replace(/^public\//, ""));

  if (!referenced) {
    candidates.push({ path: projectPath, bytes: info.size });
  }
}

candidates.sort((a, b) => b.bytes - a.bytes);

console.log(`Scanned public assets: ${assetFiles.length}`);
console.log(`Scanned source files: ${sourceFiles.length}`);
console.log(`Unreferenced candidates: ${candidates.length}`);
console.log("Review manually before moving or deleting; dynamic paths can be false positives.");
for (const candidate of candidates.slice(0, limit)) {
  console.log(`${formatMb(candidate.bytes).padStart(9)}  ${candidate.path}`);
}
