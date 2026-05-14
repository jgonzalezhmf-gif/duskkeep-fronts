import { describe, expect, it } from "vitest";
import {
  getSupabasePublicConfig,
  isAllowedPublicSupabaseUrl,
  looksLikeSupabaseSecretKey,
} from "@/features/server/supabasePublicConfig";

function jwtWithRole(role: string) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("Supabase public config", () => {
  it("accepts HTTPS Supabase URLs and trims values", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: " https://project.supabase.co/ ",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: " anon-public-key ",
      }),
    ).toEqual({
      ok: true,
      config: {
        url: "https://project.supabase.co",
        anonKey: "anon-public-key",
      },
    });
  });

  it("accepts local HTTP Supabase URLs for development", () => {
    expect(isAllowedPublicSupabaseUrl(new URL("http://127.0.0.1:54321"))).toBe(true);
    expect(isAllowedPublicSupabaseUrl(new URL("http://localhost:54321"))).toBe(true);
  });

  it("rejects non-local HTTP URLs", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "http://example.com",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-public-key",
      }),
    ).toEqual({ ok: false, reason: "insecure_url" });
  });

  it("rejects secret or service-role keys in public env", () => {
    expect(looksLikeSupabaseSecretKey("sb_secret_value")).toBe(true);
    expect(looksLikeSupabaseSecretKey(jwtWithRole("service_role"))).toBe(true);
    expect(looksLikeSupabaseSecretKey(jwtWithRole("anon"))).toBe(false);
  });

  it("fails closed when required values are missing", () => {
    expect(getSupabasePublicConfig({ NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" })).toEqual({
      ok: false,
      reason: "missing_url",
    });
    expect(getSupabasePublicConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co" })).toEqual({
      ok: false,
      reason: "missing_anon_key",
    });
  });
});
