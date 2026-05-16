import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOTS = ["app", "components"];
const SENSITIVE_LOCAL_ACTIONS = [
  "claimAdventureMapInteraction",
  "claimAdventureNode",
  "claimDailyLogin",
  "claimMission",
  "levelUpHero",
  "purchaseOffer",
  "resolveFrontlineFortressRaid",
  "skillUpHero",
  "starUpHero",
  "upgradeFrontlineCard",
  "upgradeFrontlineFortress",
];

const violations = [];

for (const root of ROOTS) {
  for (const filePath of walk(root)) {
    if (!/\.(ts|tsx)$/.test(filePath)) continue;
    inspectFile(filePath);
  }
}

if (violations.length > 0) {
  console.error("Store boundary check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Store boundary check passed.");

function inspectFile(filePath) {
  const source = readFileSync(filePath, "utf8");
  const displayPath = relative(process.cwd(), filePath);

  findMatches(source, /useGameStore\.setState\b/g, (line) => {
    violations.push(`${displayPath}:${line} uses useGameStore.setState outside the store. Route sensitive changes through store actions.`);
  });

  for (const action of SENSITIVE_LOCAL_ACTIONS) {
    const pattern = new RegExp(`useGameStore\\s*\\(\\s*\\(?\\s*\\w+\\s*\\)?\\s*=>\\s*\\w+\\.${action}\\b`, "g");
    findMatches(source, pattern, (line) => {
      violations.push(`${displayPath}:${line} selects local sensitive action "${action}". Use "${action}OnlineFirst" from UI code.`);
    });
  }
}

function findMatches(source, pattern, onMatch) {
  let match;
  while ((match = pattern.exec(source)) !== null) {
    onMatch(lineOf(source, match.index));
  }
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      yield* walk(fullPath);
      continue;
    }
    yield fullPath;
  }
}
