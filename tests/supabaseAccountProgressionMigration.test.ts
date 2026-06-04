import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = "supabase/migrations/20260604211500_normalize_account_progress.sql";

describe("Supabase account progression migration", () => {
  it("normalizes account XP into server-owned account levels for rewards and existing profiles", () => {
    const migration = readFileSync(MIGRATION_PATH, "utf8");

    expect(migration).toContain("create or replace function public.normalize_account_progress");
    expect(migration).toContain("while v_xp >= 100 * v_level loop");
    expect(migration).toContain("public.normalize_account_progress(v_account_level, v_account_xp + v_reward_account_xp)");
    expect(migration).toContain("create or replace function public.grant_reward_bundle");
    expect(migration).toContain("update public.profiles as profile_to_repair");
  });
});
