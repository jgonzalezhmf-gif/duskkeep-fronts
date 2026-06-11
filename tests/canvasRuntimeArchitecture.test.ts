import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migratedAdventureHelperImport =
  /["']@\/components\/game\/adventure\/(?:AdventureMapGeometry|AdventureCampaignVisualNodes|AdventureCampaignTypes|adventureMapLayout|adventureMapSchema|AdventureMapStateHelpers|adventureMapChapterOneProps)["']/;

describe("Canvas runtime architecture boundaries", () => {
  it("keeps the Adventure canvas adapter independent from component-folder internals", () => {
    const source = readFileSync(
      join(process.cwd(), "features/canvas-runtime/adventureAdapter.ts"),
      "utf8",
    );

    expect(source).not.toMatch(/from\s+["']@\/components\/game\/adventure\//);
  });

  it("keeps the neutral Adventure feature helpers independent from component-folder internals", () => {
    for (const filePath of collectSourceFiles(join(process.cwd(), "features/adventure"))) {
      const source = readFileSync(filePath, "utf8");
      expect(source).not.toMatch(/from\s+["']@\/components\/game\/adventure\//);
      expect(source).not.toMatch(/from\s+["']react["']/);
    }
  });

  it("prevents non-component code from importing migrated Adventure helper shims", () => {
    for (const root of ["app", "data", "features", "lib", "tests"]) {
      for (const filePath of collectSourceFiles(join(process.cwd(), root))) {
        const source = readFileSync(filePath, "utf8");
        expect(source).not.toMatch(migratedAdventureHelperImport);
      }
    }
  });
});

function collectSourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return collectSourceFiles(path);
    return /\.(?:ts|tsx)$/.test(entry) ? [path] : [];
  });
}
