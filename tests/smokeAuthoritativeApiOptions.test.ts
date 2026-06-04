import { describe, expect, it } from "vitest";
import { parseServerActionRequest } from "@/features/server/authoritativeOperations";

const { buildSmokeAdventureBattleRequest, parseSmokeAuthoritativeApiArgs, resolveSmokeAuthMode } = await import(
  "../scripts/smoke-authoritative-api-options.mjs"
);

describe("smoke authoritative API options", () => {
  it("keeps password auth as the default for backwards-compatible local smokes", () => {
    const args = parseSmokeAuthoritativeApiArgs(["--base-url", "http://127.0.0.1:3000"]);

    expect(resolveSmokeAuthMode(args)).toBe("password");
  });

  it("supports anonymous auth for remote guest/proxy smokes", () => {
    const args = parseSmokeAuthoritativeApiArgs(["--auth", "anonymous"]);

    expect(resolveSmokeAuthMode(args)).toBe("anonymous");
  });

  it("also accepts the --anonymous shorthand", () => {
    const args = parseSmokeAuthoritativeApiArgs(["--anonymous"]);

    expect(resolveSmokeAuthMode(args)).toBe("anonymous");
  });

  it("rejects unsupported auth modes before touching Supabase", () => {
    const args = parseSmokeAuthoritativeApiArgs(["--auth", "service-role"]);

    expect(() => resolveSmokeAuthMode(args)).toThrow(/Unsupported authoritative smoke auth mode/);
  });

  it("builds an Adventure battle smoke payload accepted by the authoritative contract", () => {
    const request = buildSmokeAdventureBattleRequest({
      idempotencyKey: "api-smoke-test-battle-0001",
      battleSeed: 123,
    });

    const parsed = parseServerActionRequest(request.operationType, {
      idempotencyKey: request.idempotencyKey,
      payload: request.payload,
    });

    expect(parsed.ok).toBe(true);
  });
});
