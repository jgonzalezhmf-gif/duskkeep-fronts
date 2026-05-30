import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("quality workflow", () => {
  it("runs the required MVP quality gates in CI", () => {
    const workflow = readFileSync(".github/workflows/quality.yml", "utf8");

    expect(workflow).toContain("npm ci");
    expect(workflow).toContain("npm run check");
    expect(workflow).toContain("npm run test");
    expect(workflow).toContain("npm run build");
    expect(workflow).toContain("npm run audit:high");
    expect(workflow).toContain("npm run audit:build");
    expect(workflow).toContain("npm run check:performance");
  });
});
