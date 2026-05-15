import { describe, expect, it } from "vitest";
import {
  getPublicEnvironmentSafetyIssues,
  isPublicEnvironmentSafe,
} from "@/features/server/publicEnvironmentSafety";

function jwtWithRole(role: string) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("public environment safety", () => {
  it("accepts the expected public runtime keys", () => {
    expect(
      isPublicEnvironmentSafe({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: jwtWithRole("anon"),
        NEXT_PUBLIC_PERSISTENCE: "supabase",
      }),
    ).toBe(true);
  });

  it("flags dangerous NEXT_PUBLIC variable names", () => {
    expect(
      getPublicEnvironmentSafetyIssues({
        NEXT_PUBLIC_SERVICE_ROLE_KEY: "placeholder",
        NEXT_PUBLIC_PRIVATE_KEY: "placeholder",
      }),
    ).toEqual([
      { key: "NEXT_PUBLIC_SERVICE_ROLE_KEY", reason: "dangerous_public_name" },
      { key: "NEXT_PUBLIC_PRIVATE_KEY", reason: "dangerous_public_name" },
    ]);
  });

  it("flags secret-looking values even under allowed public key names", () => {
    expect(
      getPublicEnvironmentSafetyIssues({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: jwtWithRole("service_role"),
        NEXT_PUBLIC_STRIPE_KEY: "sk_live_sensitive",
        NEXT_PUBLIC_KEY_TEXT: "-----BEGIN PRIVATE KEY-----abc",
      }),
    ).toEqual([
      { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", reason: "secret_like_value" },
      { key: "NEXT_PUBLIC_STRIPE_KEY", reason: "secret_like_value" },
      { key: "NEXT_PUBLIC_KEY_TEXT", reason: "secret_like_value" },
    ]);
  });

  it("ignores server-only variables because this guard protects public exposure", () => {
    expect(
      getPublicEnvironmentSafetyIssues({
        SUPABASE_SERVICE_ROLE_KEY: jwtWithRole("service_role"),
      }),
    ).toEqual([]);
  });
});
