import { createClient, type AuthChangeEvent, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/features/server/supabasePublicConfig";

let browserClient: SupabaseClient | null = null;

export type SupabaseSessionSnapshot =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | {
      status: "authenticated";
      userId: string;
      email: string | null;
      expiresAt: number | null;
    };

export type SupabaseAuthResult =
  | { ok: true; session: SupabaseSessionSnapshot }
  | { ok: false; reason: SupabaseAuthFailureReason };

export type SupabaseAuthFailureReason = "unconfigured" | "invalid_credentials" | "rate_limited" | "auth_error";
export type SupabaseOAuthResult = { ok: true } | { ok: false; reason: "unconfigured" | "auth_error" };
export type SupabasePasswordRecoveryResult = { ok: true } | { ok: false; reason: "unconfigured" | "rate_limited" | "auth_error" };
export type SupabasePasswordUpdateResult = { ok: true; session: SupabaseSessionSnapshot } | { ok: false; reason: SupabaseAuthFailureReason };

export type SupabasePasswordCredentials = {
  email: string;
  password: string;
};

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") return null;

  const publicConfig = getSupabasePublicConfig();
  if (!publicConfig.ok) return null;

  browserClient ??= createClient(publicConfig.config.url, publicConfig.config.anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return browserClient;
}

export async function getSupabaseSessionSnapshot(): Promise<SupabaseSessionSnapshot> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { status: "unconfigured" };

  const { data, error } = await supabase.auth.getSession();
  if (error) return { status: "anonymous" };

  return toSupabaseSessionSnapshot(data.session);
}

export async function getSupabaseAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) return null;

  return data.session?.access_token ?? null;
}

export async function signInSupabaseWithPassword({
  email,
  password,
}: SupabasePasswordCredentials): Promise<SupabaseAuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };

  return {
    ok: true,
    session: toSupabaseSessionSnapshot(data.session),
  };
}

export async function signUpSupabaseWithPassword({
  email,
  password,
}: SupabasePasswordCredentials): Promise<SupabaseAuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });
  if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };

  return {
    ok: true,
    session: toSupabaseSessionSnapshot(data.session),
  };
}

export async function signInSupabaseWithGoogle(redirectTo?: string): Promise<SupabaseOAuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: redirectTo ? { redirectTo } : undefined,
  });
  if (error) return { ok: false, reason: "auth_error" };

  return { ok: true };
}

export async function requestSupabasePasswordRecovery(email: string, redirectTo?: string): Promise<SupabasePasswordRecoveryResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo,
  });
  if (error) {
    const reason = classifySupabaseAuthError(error.message);
    return { ok: false, reason: reason === "rate_limited" ? "rate_limited" : "auth_error" };
  }

  return { ok: true };
}

export async function updateSupabasePassword(password: string): Promise<SupabasePasswordUpdateResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };

  return {
    ok: true,
    session: toSupabaseSessionSnapshot(data.user ? (await supabase.auth.getSession()).data.session : null),
  };
}

export async function signOutSupabase(): Promise<{ ok: true } | { ok: false; reason: "unconfigured" | "auth_error" }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, reason: "auth_error" };
  return { ok: true };
}

export function subscribeToSupabaseSession(
  listener: (session: SupabaseSessionSnapshot) => void,
): { unsubscribe: () => void } | null {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    listener(toSupabaseSessionSnapshot(session));
  });
  return data.subscription;
}

export function subscribeToSupabaseAuthEvents(
  listener: (event: AuthChangeEvent, session: SupabaseSessionSnapshot) => void,
): { unsubscribe: () => void } | null {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    listener(event, toSupabaseSessionSnapshot(session));
  });
  return data.subscription;
}

export function toSupabaseSessionSnapshot(session: Session | null): SupabaseSessionSnapshot {
  if (!session) return { status: "anonymous" };

  return {
    status: "authenticated",
    userId: session.user.id,
    email: session.user.email ?? null,
    expiresAt: session.expires_at ?? null,
  };
}

export function classifySupabaseAuthError(message: string): SupabaseAuthFailureReason {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid") || normalized.includes("credentials")) return "invalid_credentials";
  if (normalized.includes("rate") || normalized.includes("too many")) return "rate_limited";
  return "auth_error";
}
