import type { AuthChangeEvent, Session, SupabaseClient } from "@supabase/supabase-js";
import { isRegistrationPasswordFormatValid } from "@/features/server/authPasswordPolicy";
import { getSupabasePublicConfig } from "@/features/server/supabasePublicConfig";

let browserClient: SupabaseClient | null = null;
let browserClientPromise: Promise<SupabaseClient | null> | null = null;

export const SUPABASE_AUTH_EMAIL_MAX_LENGTH = 254;
export const SUPABASE_AUTH_PASSWORD_MAX_LENGTH = 1_024;

export type SupabaseSessionSnapshot =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | {
      status: "authenticated";
      userId: string;
      email: string | null;
      expiresAt: number | null;
      isAnonymous: boolean;
    };

export type SupabaseAuthResult =
  | { ok: true; session: SupabaseSessionSnapshot }
  | { ok: false; reason: SupabaseAuthFailureReason };

export type SupabaseAuthFailureReason = "unconfigured" | "invalid_credentials" | "rate_limited" | "auth_error";
export type SupabaseOAuthResult = { ok: true } | { ok: false; reason: "unconfigured" | "auth_error" };
export type SupabasePasswordRecoveryResult = { ok: true } | { ok: false; reason: "unconfigured" | "rate_limited" | "auth_error" };
export type SupabasePasswordUpdateResult = { ok: true; session: SupabaseSessionSnapshot } | { ok: false; reason: SupabaseAuthFailureReason };
export type SupabaseGuestUpgradeEmailResult =
  | { ok: true; session: SupabaseSessionSnapshot }
  | { ok: false; reason: SupabaseAuthFailureReason };
export type SupabasePasswordSetupRedirectResult =
  | { ok: true; session: SupabaseSessionSnapshot }
  | { ok: false; reason: SupabaseAuthFailureReason };

export type SupabasePasswordCredentials = {
  email: string;
  password: string;
};

export type PreparedSupabasePasswordCredentials = {
  email: string;
  password: string;
};

export async function getSupabaseBrowserClient() {
  if (typeof window === "undefined") return null;

  const publicConfig = getSupabasePublicConfig();
  if (!publicConfig.ok) return null;

  if (browserClient) return browserClient;

  browserClientPromise ??= import("@supabase/supabase-js").then(({ createClient }) => {
    browserClient = createClient(publicConfig.config.url, publicConfig.config.anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
    return browserClient;
  });

  return browserClientPromise;
}

export async function getSupabaseSessionSnapshot(): Promise<SupabaseSessionSnapshot> {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { status: "unconfigured" };

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    if (isInvalidRefreshTokenError(error.message)) await clearStaleSupabaseSession(supabase);
    return { status: "anonymous" };
  }

  return toSupabaseSessionSnapshot(data.session);
}

export async function getSupabaseAccessToken() {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    if (isInvalidRefreshTokenError(error.message)) await clearStaleSupabaseSession(supabase);
    return null;
  }

  return data.session?.access_token ?? null;
}

export async function signInSupabaseWithPassword({
  email,
  password,
}: SupabasePasswordCredentials): Promise<SupabaseAuthResult> {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };
  const credentials = prepareSupabasePasswordCredentials({ email, password });
  if (!credentials) return { ok: false, reason: "invalid_credentials" };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
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
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };
  const credentials = prepareSupabasePasswordCredentials({ email, password });
  if (!credentials || !isRegistrationPasswordFormatValid(credentials.password)) return { ok: false, reason: "auth_error" };

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
  });
  if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };

  return {
    ok: true,
    session: toSupabaseSessionSnapshot(data.session),
  };
}

export async function signInSupabaseAnonymously(): Promise<SupabaseAuthResult> {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const current = await getSupabaseSessionSnapshot();
  if (current.status === "authenticated") {
    return { ok: true, session: current };
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };

  return {
    ok: true,
    session: toSupabaseSessionSnapshot(data.session),
  };
}

export async function upgradeAnonymousSupabaseUserWithPassword({
  email,
  password,
}: SupabasePasswordCredentials): Promise<SupabaseAuthResult> {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };
  const credentials = prepareSupabasePasswordCredentials({ email, password });
  if (!credentials) return { ok: false, reason: "auth_error" };

  const currentSession = await supabase.auth.getSession();
  let session = currentSession.data.session;
  if (!session) {
    const anonymous = await supabase.auth.signInAnonymously();
    if (anonymous.error) return { ok: false, reason: classifySupabaseAuthError(anonymous.error.message) };
    session = anonymous.data.session;
  }

  if (!shouldAllowAnonymousUserUpgrade(toSupabaseSessionSnapshot(session))) {
    return { ok: false, reason: "auth_error" };
  }

  const { error } = await supabase.auth.updateUser({
    email: credentials.email,
    password: credentials.password,
  });
  if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };

  await supabase.auth.refreshSession();

  return {
    ok: true,
    session: await getSupabaseSessionSnapshot(),
  };
}

export async function requestAnonymousSupabaseEmailLink(email: string, redirectTo?: string): Promise<SupabaseGuestUpgradeEmailResult> {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };
  const normalizedEmail = normalizeSupabaseAuthEmail(email);
  if (!normalizedEmail) return { ok: false, reason: "auth_error" };

  const currentSession = await supabase.auth.getSession();
  let session = currentSession.data.session;
  if (!session) {
    const anonymous = await supabase.auth.signInAnonymously();
    if (anonymous.error) return { ok: false, reason: classifySupabaseAuthError(anonymous.error.message) };
    session = anonymous.data.session;
  }

  if (!shouldAllowAnonymousUserUpgrade(toSupabaseSessionSnapshot(session))) {
    return { ok: false, reason: "auth_error" };
  }

  const safeRedirectTo = normalizeSupabaseAuthRedirectTo(createGuestUpgradeEmailRedirectTo(redirectTo));
  const { error } = await supabase.auth.updateUser(
    { email: normalizedEmail },
    safeRedirectTo ? { emailRedirectTo: safeRedirectTo } : undefined,
  );
  if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };

  return {
    ok: true,
    session: await getSupabaseSessionSnapshot(),
  };
}

export async function signInSupabaseWithGoogle(redirectTo?: string): Promise<SupabaseOAuthResult> {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };
  const safeRedirectTo = normalizeSupabaseAuthRedirectTo(redirectTo);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: safeRedirectTo ? { redirectTo: safeRedirectTo } : undefined,
  });
  if (error) return { ok: false, reason: "auth_error" };

  return { ok: true };
}

export async function requestSupabasePasswordRecovery(email: string, redirectTo?: string): Promise<SupabasePasswordRecoveryResult> {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };
  const normalizedEmail = normalizeSupabaseAuthEmail(email);
  if (!normalizedEmail) return { ok: true };
  const safeRedirectTo = normalizeSupabaseAuthRedirectTo(redirectTo);

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: safeRedirectTo,
  });
  if (error) {
    const reason = classifySupabaseAuthError(error.message);
    return { ok: false, reason: reason === "rate_limited" ? "rate_limited" : "auth_error" };
  }

  return { ok: true };
}

export async function updateSupabasePassword(password: string): Promise<SupabasePasswordUpdateResult> {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };
  if (!isSupabaseAuthPasswordWithinBounds(password)) return { ok: false, reason: "auth_error" };

  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };

  return {
    ok: true,
    session: toSupabaseSessionSnapshot(data.user ? (await supabase.auth.getSession()).data.session : null),
  };
}

export async function completeSupabasePasswordSetupRedirect(): Promise<SupabasePasswordSetupRedirectResult> {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };
  if (typeof window === "undefined") return { ok: false, reason: "auth_error" };

  const code = new URLSearchParams(window.location.search).get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };
    return { ok: true, session: toSupabaseSessionSnapshot(data.session) };
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };
    return { ok: true, session: toSupabaseSessionSnapshot(data.session) };
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) return { ok: false, reason: classifySupabaseAuthError(error.message) };
  if (!data.session) return { ok: false, reason: "auth_error" };
  return { ok: true, session: toSupabaseSessionSnapshot(data.session) };
}

export async function signOutSupabase(): Promise<{ ok: true } | { ok: false; reason: "unconfigured" | "auth_error" }> {
  const supabase = await getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { error } = await supabase.auth.signOut();
  if (error && isInvalidRefreshTokenError(error.message)) {
    await clearStaleSupabaseSession(supabase);
    return { ok: true };
  }
  if (error) return { ok: false, reason: "auth_error" };
  return { ok: true };
}

export function subscribeToSupabaseSession(
  listener: (session: SupabaseSessionSnapshot) => void,
): { unsubscribe: () => void } | null {
  if (typeof window === "undefined" || !getSupabasePublicConfig().ok) return null;

  let cancelled = false;
  let subscription: { unsubscribe: () => void } | null = null;
  void getSupabaseBrowserClient().then((supabase) => {
    if (!supabase || cancelled) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      listener(toSupabaseSessionSnapshot(session));
    });
    subscription = data.subscription;
    if (cancelled) subscription.unsubscribe();
  });

  return {
    unsubscribe: () => {
      cancelled = true;
      subscription?.unsubscribe();
    },
  };
}

export function subscribeToSupabaseAuthEvents(
  listener: (event: AuthChangeEvent, session: SupabaseSessionSnapshot) => void,
): { unsubscribe: () => void } | null {
  if (typeof window === "undefined" || !getSupabasePublicConfig().ok) return null;

  let cancelled = false;
  let subscription: { unsubscribe: () => void } | null = null;
  void getSupabaseBrowserClient().then((supabase) => {
    if (!supabase || cancelled) return;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      listener(event, toSupabaseSessionSnapshot(session));
    });
    subscription = data.subscription;
    if (cancelled) subscription.unsubscribe();
  });

  return {
    unsubscribe: () => {
      cancelled = true;
      subscription?.unsubscribe();
    },
  };
}

export function toSupabaseSessionSnapshot(session: Session | null): SupabaseSessionSnapshot {
  if (!session) return { status: "anonymous" };

  return {
    status: "authenticated",
    userId: session.user.id,
    email: session.user.email ?? null,
    expiresAt: session.expires_at ?? null,
    isAnonymous: session.user.is_anonymous === true,
  };
}

export function shouldAllowAnonymousUserUpgrade(session: SupabaseSessionSnapshot) {
  return session.status === "authenticated" && session.isAnonymous;
}

export function normalizeSupabaseAuthEmail(email: string) {
  const normalized = email.trim();
  if (!normalized || normalized.length > SUPABASE_AUTH_EMAIL_MAX_LENGTH) return null;
  return normalized;
}

export function isSupabaseAuthPasswordWithinBounds(password: string) {
  return password.length > 0 && password.length <= SUPABASE_AUTH_PASSWORD_MAX_LENGTH;
}

export function prepareSupabasePasswordCredentials({
  email,
  password,
}: SupabasePasswordCredentials): PreparedSupabasePasswordCredentials | null {
  const normalizedEmail = normalizeSupabaseAuthEmail(email);
  if (!normalizedEmail || !isSupabaseAuthPasswordWithinBounds(password)) return null;
  return { email: normalizedEmail, password };
}

export function normalizeSupabaseAuthRedirectTo(redirectTo?: string, allowedOrigin = getCurrentBrowserOrigin()) {
  if (!redirectTo || !allowedOrigin) return undefined;

  try {
    const allowed = new URL(allowedOrigin);
    const target = new URL(redirectTo, allowed.origin);
    const safeProtocol = target.protocol === "http:" || target.protocol === "https:";
    if (!safeProtocol || target.origin !== allowed.origin) return undefined;
    return target.toString();
  } catch {
    return undefined;
  }
}

export function createGuestUpgradeEmailRedirectTo(origin?: string) {
  if (!origin) return undefined;
  try {
    const url = new URL(origin);
    url.searchParams.set("guestUpgrade", "confirm");
    return url.toString();
  } catch {
    return undefined;
  }
}

export function classifySupabaseAuthError(message: string): SupabaseAuthFailureReason {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid") || normalized.includes("credentials")) return "invalid_credentials";
  if (normalized.includes("rate") || normalized.includes("too many")) return "rate_limited";
  return "auth_error";
}

export function isInvalidRefreshTokenError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("refresh token") && (normalized.includes("invalid") || normalized.includes("not found"));
}

async function clearStaleSupabaseSession(supabase: SupabaseClient) {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Best-effort cleanup only. The caller still treats the session as anonymous.
  }
}

function getCurrentBrowserOrigin() {
  if (typeof window === "undefined") return undefined;
  return window.location.origin;
}
