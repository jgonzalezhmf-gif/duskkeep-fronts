import { describe, expect, it } from "vitest";
import {
  classifySupabaseAuthError,
  isSupabaseAuthPasswordWithinBounds,
  normalizeSupabaseAuthEmail,
  prepareSupabasePasswordCredentials,
  SUPABASE_AUTH_EMAIL_MAX_LENGTH,
  SUPABASE_AUTH_PASSWORD_MAX_LENGTH,
  shouldAllowAnonymousUserUpgrade,
  toSupabaseSessionSnapshot,
} from "@/features/server/supabaseBrowserSession";

describe("Supabase browser session helpers", () => {
  it("does not expose access tokens in session snapshots", () => {
    const snapshot = toSupabaseSessionSnapshot({
      access_token: "secret-access-token",
      refresh_token: "secret-refresh-token",
      expires_at: 1810000000,
      expires_in: 3600,
      token_type: "bearer",
      user: {
        id: "user-1",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "2026-05-14T00:00:00.000Z",
        email: "player@example.com",
      },
    });

    expect(snapshot).toEqual({
      status: "authenticated",
      userId: "user-1",
      email: "player@example.com",
      expiresAt: 1810000000,
      isAnonymous: false,
    });
    expect(JSON.stringify(snapshot)).not.toContain("secret");
  });

  it("marks anonymous Supabase sessions without exposing tokens", () => {
    const snapshot = toSupabaseSessionSnapshot({
      access_token: "secret-access-token",
      refresh_token: "secret-refresh-token",
      expires_at: 1810000000,
      expires_in: 3600,
      token_type: "bearer",
      user: {
        id: "anonymous-user-1",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "2026-05-14T00:00:00.000Z",
        is_anonymous: true,
      },
    });

    expect(snapshot).toEqual({
      status: "authenticated",
      userId: "anonymous-user-1",
      email: null,
      expiresAt: 1810000000,
      isAnonymous: true,
    });
    expect(JSON.stringify(snapshot)).not.toContain("secret");
  });

  it("normalizes anonymous sessions", () => {
    expect(toSupabaseSessionSnapshot(null)).toEqual({ status: "anonymous" });
  });

  it("allows guest upgrade only for authenticated anonymous sessions", () => {
    expect(
      shouldAllowAnonymousUserUpgrade({
        status: "authenticated",
        userId: "guest-1",
        email: null,
        expiresAt: 1810000000,
        isAnonymous: true,
      }),
    ).toBe(true);

    expect(
      shouldAllowAnonymousUserUpgrade({
        status: "authenticated",
        userId: "linked-1",
        email: "player@example.com",
        expiresAt: 1810000000,
        isAnonymous: false,
      }),
    ).toBe(false);

    expect(shouldAllowAnonymousUserUpgrade({ status: "anonymous" })).toBe(false);
    expect(shouldAllowAnonymousUserUpgrade({ status: "unconfigured" })).toBe(false);
  });

  it("classifies common auth errors without leaking raw messages", () => {
    expect(classifySupabaseAuthError("Invalid login credentials")).toBe("invalid_credentials");
    expect(classifySupabaseAuthError("Too many requests")).toBe("rate_limited");
    expect(classifySupabaseAuthError("Unexpected provider error")).toBe("auth_error");
  });

  it("normalizes and bounds password credentials before Supabase calls", () => {
    expect(normalizeSupabaseAuthEmail("  player@example.com  ")).toBe("player@example.com");
    expect(normalizeSupabaseAuthEmail("")).toBeNull();
    expect(normalizeSupabaseAuthEmail("a".repeat(SUPABASE_AUTH_EMAIL_MAX_LENGTH + 1))).toBeNull();

    expect(isSupabaseAuthPasswordWithinBounds("password")).toBe(true);
    expect(isSupabaseAuthPasswordWithinBounds("")).toBe(false);
    expect(isSupabaseAuthPasswordWithinBounds("x".repeat(SUPABASE_AUTH_PASSWORD_MAX_LENGTH + 1))).toBe(false);

    expect(prepareSupabasePasswordCredentials({ email: "  player@example.com  ", password: "password" })).toEqual({
      email: "player@example.com",
      password: "password",
    });
    expect(prepareSupabasePasswordCredentials({ email: "", password: "password" })).toBeNull();
    expect(prepareSupabasePasswordCredentials({ email: "player@example.com", password: "" })).toBeNull();
  });
});
