"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  getSupabaseSessionSnapshot,
  requestSupabasePasswordRecovery,
  signInSupabaseWithGoogle,
  signInSupabaseWithPassword,
  signUpSupabaseWithPassword,
  subscribeToSupabaseSession,
  upgradeAnonymousSupabaseUserWithPassword,
  type SupabaseSessionSnapshot,
} from "@/features/server/supabaseBrowserSession";
import {
  getAuthFailureNoticeKey,
  getAuthGateModeForIntent,
  getPasswordRecoveryRequestNoticeKey,
  shouldBlockGuestUpgradeForSession,
} from "@/features/server/sessionSecurity";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";

type AuthMode = "signIn" | "signUp";

export type GameAuthGateProps = {
  open: boolean;
  allowGuest?: boolean;
  intent?: "entry" | "guestUpgrade";
  initialNoticeKey?: string;
  onGuest?: () => void | Promise<void>;
  onLinked: () => void | Promise<void>;
  onClose?: () => void;
};

const MIN_PASSWORD_LENGTH = 8;

export function GameAuthGate({
  open,
  allowGuest = true,
  intent = "entry",
  initialNoticeKey,
  onGuest,
  onLinked,
  onClose,
}: GameAuthGateProps) {
  const { t } = useI18n();
  const initialNotice = initialNoticeKey ? t(initialNoticeKey) : null;
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [session, setSession] = useState<SupabaseSessionSnapshot>({ status: "anonymous" });

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    void getSupabaseSessionSnapshot().then((snapshot) => {
      if (mounted) setSession(snapshot);
    });

    const subscription = subscribeToSupabaseSession((snapshot) => {
      setSession(snapshot);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [open]);

  useEffect(() => {
    if (open && initialNotice) {
      setNotice(initialNotice);
    }
  }, [initialNotice, open]);

  if (!open) return null;

  const guestUpgrade = intent === "guestUpgrade";
  const activeMode = getAuthGateModeForIntent({ intent, requestedMode: mode });
  const authenticatedSessionBlocked = shouldBlockGuestUpgradeForSession({
    intent,
    sessionStatus: session.status,
    sessionIsAnonymous: session.status === "authenticated" ? session.isAnonymous : false,
  });
  const configured = session.status !== "unconfigured";
  const emailReady = email.trim().length > 3 && email.includes("@");
  const passwordReady = password.length >= MIN_PASSWORD_LENGTH;
  const canSubmit = configured && emailReady && passwordReady && !busy;
  const authCta = activeMode === "signIn" ? t("auth.signInCta") : t("auth.createAccountCta");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setNotice(t("auth.validationHint"));
      return;
    }

    setBusy(true);
    setNotice(null);
    const credentials = { email, password };
    const currentSession = guestUpgrade ? await getSupabaseSessionSnapshot() : session;
    if (guestUpgrade) {
      setSession(currentSession);
    }
    if (
      shouldBlockGuestUpgradeForSession({
        intent,
        sessionStatus: currentSession.status,
        sessionIsAnonymous: currentSession.status === "authenticated" ? currentSession.isAnonymous : false,
      })
    ) {
      setBusy(false);
      setNotice(t("auth.guestUpgradeExistingSession"));
      return;
    }
    const result =
      activeMode === "signIn"
        ? await signInSupabaseWithPassword(credentials)
        : guestUpgrade
          ? await upgradeAnonymousSupabaseUserWithPassword(credentials)
          : await signUpSupabaseWithPassword(credentials);

    if (!result.ok) {
      setBusy(false);
      setNotice(t(getAuthFailureNoticeKey({ intent, mode: activeMode, reason: result.reason })));
      return;
    }

    setSession(result.session);
    if (result.session.status === "authenticated" && !result.session.isAnonymous) {
      sfx.unlock();
      await onLinked();
      setBusy(false);
      return;
    }

    setBusy(false);
    setNotice(t(guestUpgrade ? "auth.guestUpgradeCheckEmail" : "auth.checkEmail"));
  }

  async function handleGoogle() {
    if (!configured || busy) return;

    setBusy(true);
    setNotice(null);
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const result = await signInSupabaseWithGoogle(redirectTo);
    setBusy(false);

    if (!result.ok) {
      setNotice(t(result.reason === "unconfigured" ? "auth.unconfigured" : "auth.providerError"));
    }
  }

  async function handlePasswordRecovery() {
    if (!configured || busy) return;
    if (!emailReady) {
      setNotice(t("auth.recoveryEmailHint"));
      return;
    }

    setBusy(true);
    setNotice(null);
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const result = await requestSupabasePasswordRecovery(email, redirectTo);
    setBusy(false);

    if (!result.ok) {
      setNotice(t(getPasswordRecoveryRequestNoticeKey(result.reason)));
      return;
    }

    setNotice(t("auth.recoveryGeneric"));
  }

  async function continueAsGuest() {
    if (busy) return;
    sfx.tap();
    setBusy(true);
    await onGuest?.();
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#030407]/84 px-3 py-8 backdrop-blur-md">
      {onClose ? (
        <button type="button" aria-label={t("auth.close")} className="absolute inset-0 cursor-default" onClick={onClose} />
      ) : null}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-auth-title"
        className="frontline-motion-reveal relative w-full max-w-[58rem] overflow-hidden rounded-[36px] border border-[#f5c451]/20 bg-[linear-gradient(135deg,rgba(34,26,18,0.97),rgba(7,10,17,0.99)_54%,rgba(16,23,36,0.98))] shadow-[0_36px_120px_rgba(0,0,0,0.62)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(245,196,81,0.2),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(100,151,255,0.13),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_34%)]" />
        <div className="relative grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/10 p-6 md:border-b-0 md:border-r md:p-8">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#f5d498]">{t("auth.eyebrow")}</div>
            <h2 id="game-auth-title" className="mt-3 text-3xl font-black leading-none text-white sm:text-4xl">
              {t(guestUpgrade ? "auth.guestUpgradeTitle" : "auth.title")}
            </h2>
            <p className="mt-4 max-w-[26rem] text-sm leading-6 text-white/64">
              {t(guestUpgrade ? "auth.guestUpgradeSubtitle" : "auth.subtitle")}
            </p>

            <div className="mt-6 grid gap-3">
              <AuthPathCard
                title={t(guestUpgrade ? "auth.guestUpgradeOnlineTitle" : "auth.onlineTitle")}
                body={t(guestUpgrade ? "auth.guestUpgradeOnlineBody" : "auth.onlineBody")}
                tone="gold"
              />
              {allowGuest && !guestUpgrade ? <AuthPathCard title={t("auth.guestTitle")} body={t("auth.guestBody")} tone="blue" /> : null}
            </div>

            <p className="mt-5 rounded-[20px] border border-white/10 bg-black/22 p-4 text-[12px] leading-5 text-white/52">
              {t(guestUpgrade ? "auth.guestUpgradeSyncNote" : "auth.syncNote")}
            </p>
          </div>

          <div className="p-6 md:p-8">
            {authenticatedSessionBlocked ? (
              <div className="rounded-[26px] border border-amber-200/18 bg-amber-300/10 p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-100">{t("auth.createAccount")}</div>
                <div className="mt-2 text-sm leading-6 text-white/64">{t("auth.guestUpgradeExistingSession")}</div>
              </div>
            ) : session.status === "authenticated" && !session.isAnonymous ? (
              <div className="rounded-[26px] border border-emerald-300/20 bg-emerald-400/10 p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100">{t("auth.connected")}</div>
                <div className="mt-2 text-lg font-black text-white">{session.email ?? t("auth.connectedAccount")}</div>
                <button
                  type="button"
                  onClick={() => {
                    sfx.unlock();
                    onLinked();
                  }}
                  className="frontline-motion-action mt-5 w-full rounded-[20px] border border-emerald-200/28 bg-emerald-300/16 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-50 transition hover:border-emerald-100/50"
                >
                  {t("auth.continueLinked")}
                </button>
              </div>
            ) : (
              <>
                {guestUpgrade ? (
                  <div className="rounded-full border border-[#f5c451]/18 bg-[#f5c451]/10 px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
                    {t("auth.createAccount")}
                  </div>
                ) : (
                  <div className="flex rounded-full border border-white/10 bg-black/22 p-1">
                    {(["signIn", "signUp"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          setMode(tab);
                          setNotice(null);
                        }}
                        className={cn(
                          "frontline-motion-action flex-1 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition",
                          mode === tab ? "bg-[#f5c451]/18 text-[#f5d498]" : "text-white/48 hover:text-white/70",
                        )}
                      >
                        {tab === "signIn" ? t("auth.signIn") : t("auth.register")}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/48">{t("auth.email")}</span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={busy}
                      className="mt-2 w-full rounded-[18px] border border-white/10 bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-white/24 focus:border-[#f5c451]/42"
                      placeholder="commander@example.com"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/48">{t("auth.password")}</span>
                    <input
                      type="password"
                      autoComplete={activeMode === "signIn" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={busy}
                      className="mt-2 w-full rounded-[18px] border border-white/10 bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-white/24 focus:border-[#f5c451]/42"
                      placeholder={t("auth.passwordHint")}
                    />
                  </label>

                  {!configured ? (
                    <div className="rounded-[18px] border border-amber-200/16 bg-amber-300/10 px-4 py-3 text-[12px] leading-5 text-amber-100/80">
                      {t("auth.unconfigured")}
                    </div>
                  ) : null}
                  {notice ? (
                    <div className="rounded-[18px] border border-white/10 bg-white/[0.055] px-4 py-3 text-[12px] leading-5 text-white/64">
                      {notice}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={cn(
                      "frontline-motion-action mt-1 rounded-[20px] border px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition",
                      canSubmit
                        ? "border-[#f5c451]/42 bg-[#f5c451]/18 text-[#f5d498] shadow-[0_18px_34px_rgba(245,196,81,0.13)] hover:border-[#f5c451]/62"
                        : "cursor-not-allowed border-white/8 bg-white/[0.04] text-white/30",
                    )}
                  >
                    {busy ? t("auth.working") : authCta}
                  </button>
                  {!guestUpgrade && activeMode === "signIn" ? (
                    <button
                      type="button"
                      disabled={!configured || busy}
                      onClick={handlePasswordRecovery}
                      className="frontline-motion-action justify-self-center text-[11px] font-black uppercase tracking-[0.16em] text-white/46 transition hover:text-[#f5d498] disabled:cursor-not-allowed disabled:text-white/22"
                    >
                      {t("auth.forgotPassword")}
                    </button>
                  ) : null}
                </form>

                {!guestUpgrade ? (
                  <>
                    <div className="my-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/32">
                      <span className="h-px flex-1 bg-white/10" />
                      {t("auth.or")}
                      <span className="h-px flex-1 bg-white/10" />
                    </div>

                    <button
                      type="button"
                      disabled={!configured || busy}
                      onClick={handleGoogle}
                      className={cn(
                        "frontline-motion-action w-full rounded-[20px] border px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition",
                        configured && !busy
                          ? "border-sky-200/24 bg-sky-300/10 text-sky-50 hover:border-sky-100/42"
                          : "cursor-not-allowed border-white/8 bg-white/[0.04] text-white/30",
                      )}
                    >
                      {t("auth.google")}
                    </button>
                  </>
                ) : null}

                {allowGuest && !guestUpgrade ? (
                  <button
                    type="button"
                    onClick={continueAsGuest}
                    className="frontline-motion-action mt-3 w-full rounded-[20px] border border-white/10 bg-black/24 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/62 transition hover:border-white/20 hover:text-white"
                  >
                    {t("auth.playGuest")}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function AuthPathCard({ title, body, tone }: { title: string; body: string; tone: "gold" | "blue" }) {
  return (
    <div
      className={cn(
        "rounded-[22px] border p-4",
        tone === "gold" ? "border-[#f5c451]/18 bg-[#f5c451]/8" : "border-sky-200/14 bg-sky-300/8",
      )}
    >
      <div className="text-sm font-black text-white">{title}</div>
      <div className="mt-1 text-[12px] leading-5 text-white/54">{body}</div>
    </div>
  );
}

export default GameAuthGate;
