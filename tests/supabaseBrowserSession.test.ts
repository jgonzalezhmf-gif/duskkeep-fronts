import { describe, expect, it } from "vitest";
import {
  classifySupabaseAuthError,
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

  it("classifies common auth errors without leaking raw messages", () => {
    expect(classifySupabaseAuthError("Invalid login credentials")).toBe("invalid_credentials");
    expect(classifySupabaseAuthError("Too many requests")).toBe("rate_limited");
    expect(classifySupabaseAuthError("Unexpected provider error")).toBe("auth_error");
  });
});
