"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  doRegistrationPasswordsMatch,
  getRegistrationPasswordStrength,
  isRegistrationPasswordFormatValid,
  REGISTRATION_PASSWORD_MIN_LENGTH,
  type RegistrationPasswordStrength,
} from "@/features/server/authPasswordPolicy";
import {
  getSupabaseSessionSnapshot,
  requestAnonymousSupabaseEmailLink,
  requestSupabasePasswordRecovery,
  signInSupabaseWithGoogle,
  signInSupabaseWithPassword,
  signUpSupabaseWithPassword,
  subscribeToSupabaseSession,
  type SupabaseSessionSnapshot,
} from "@/features/server/supabaseBrowserSession";
import { PendingActionLabel } from "@/components/game/shared/PendingActionFeedback";
import {
  getAuthFailureNoticeKey,
  getAuthGateModeForIntent,
  getPasswordRecoveryRequestNoticeKey,
  shouldAutoContinueLinkedAuthGate,
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

const PASSWORD_STRENGTH_META: Record<
  RegistrationPasswordStrength,
  {
    labelKey: string;
    meterClassName: string;
    textClassName: string;
    borderClassName: string;
  }
> = {
  weak: {
    labelKey: "auth.passwordStrengthWeak",
    meterClassName: "bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.35)]",
    textClassName: "text-red-200",
    borderClassName: "border-red-300/42 focus:border-red-200/70",
  },
  medium: {
    labelKey: "auth.passwordStrengthMedium",
    meterClassName: "bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.35)]",
    textClassName: "text-amber-100",
    borderClassName: "border-amber-200/42 focus:border-amber-100/70",
  },
  strong: {
    labelKey: "auth.passwordStrengthStrong",
    meterClassName: "bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.35)]",
    textClassName: "text-emerald-100",
    borderClassName: "border-emerald-200/42 focus:border-emerald-100/70",
  },
};

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
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [session, setSession] = useState<SupabaseSessionSnapshot>({ status: "anonymous" });
  const autoContinueLinkedRef = useRef(false);

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

  useEffect(() => {
    if (!open) {
      autoContinueLinkedRef.current = false;
      return;
    }
    if (
      !shouldAutoContinueLinkedAuthGate({
        open,
        intent,
        sessionStatus: session.status,
        sessionIsAnonymous: session.status === "authenticated" ? session.isAnonymous : false,
      })
    ) {
      return;
    }
    if (autoContinueLinkedRef.current) return;

    autoContinueLinkedRef.current = true;
    void Promise.resolve(onLinked()).catch(() => {
      autoContinueLinkedRef.current = false;
    });
  }, [intent, onLinked, open, session]);

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
  const signUpMode = !guestUpgrade && activeMode === "signUp";
  const passwordStrength = getRegistrationPasswordStrength(password);
  const strengthMeta = PASSWORD_STRENGTH_META[passwordStrength.level];
  const passwordStrengthSegments = passwordStrength.level === "strong" ? 3 : passwordStrength.level === "medium" ? 2 : password.length > 0 ? 1 : 0;
  const registrationPasswordValid = isRegistrationPasswordFormatValid(password);
  const registrationPasswordMatch = doRegistrationPasswordsMatch(password, passwordConfirmation);
  const signInPasswordReady = password.length >= MIN_PASSWORD_LENGTH;
  const passwordReady = signUpMode ? registrationPasswordValid && registrationPasswordMatch : signInPasswordReady;
  const canSubmit = configured && emailReady && (guestUpgrade || passwordReady) && !busy;
  const authCta = activeMode === "signIn" ? t("auth.signInCta") : t("auth.createAccountCta");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      if (signUpMode && !registrationPasswordValid) {
        setNotice(t("auth.registrationPasswordLengthHint", { count: REGISTRATION_PASSWORD_MIN_LENGTH }));
      } else if (signUpMode && !registrationPasswordMatch) {
        setNotice(t("auth.passwordMismatchHint"));
      } else {
        setNotice(t(guestUpgrade ? "auth.recoveryEmailHint" : activeMode === "signUp" ? "auth.registrationValidationHint" : "auth.validationHint"));
      }
      return;
    }

    setBusy(true);
    setNotice(null);
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
    const result = guestUpgrade
      ? await requestAnonymousSupabaseEmailLink(email, typeof window !== "undefined" ? window.location.origin : undefined)
      : activeMode === "signIn"
        ? await signInSupabaseWithPassword({ email, password })
        : await signUpSupabaseWithPassword({ email, password });

    if (!result.ok) {
      setBusy(false);
      setNotice(t(getAuthFailureNoticeKey({ intent, mode: activeMode, reason: result.reason })));
      return;
    }

    setSession(result.session);
    if (!guestUpgrade && result.session.status === "authenticated" && !result.session.isAnonymous) {
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
    try {
      await onGuest?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid items-start justify-items-center overflow-hidden bg-[#030407]/84 px-3 py-3 backdrop-blur-md sm:place-items-center sm:overflow-y-auto sm:py-8">
      {onClose ? (
        <button type="button" aria-label={t("auth.close")} className="absolute inset-0 cursor-default" onClick={onClose} />
      ) : null}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-auth-title"
        className="frontline-motion-reveal relative max-h-[calc(100dvh-1.5rem)] w-full max-w-[58rem] overflow-y-auto rounded-[30px] border border-[#f5c451]/20 bg-[linear-gradient(135deg,rgba(34,26,18,0.97),rgba(7,10,17,0.99)_54%,rgba(16,23,36,0.98))] shadow-[0_36px_120px_rgba(0,0,0,0.62)] sm:rounded-[36px] md:overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(245,196,81,0.2),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(100,151,255,0.13),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_34%)]" />
        <div className="relative grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/10 p-4 sm:p-6 md:border-b-0 md:border-r md:p-8">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#f5d498]">{t("auth.eyebrow")}</div>
            <h2 id="game-auth-title" className="mt-3 text-3xl font-black leading-none text-white sm:text-4xl">
              {t(guestUpgrade ? "auth.guestUpgradeTitle" : "auth.title")}
            </h2>
            <p className="mt-4 max-w-[26rem] text-sm leading-6 text-white/64">
              {t(guestUpgrade ? "auth.guestUpgradeSubtitle" : activeMode === "signUp" ? "auth.registerSubtitle" : "auth.subtitle")}
            </p>

            <div className="mt-6 grid gap-3">
              <AuthPathCard
                title={t(guestUpgrade ? "auth.guestUpgradeOnlineTitle" : activeMode === "signUp" ? "auth.secureAccountTitle" : "auth.onlineTitle")}
                body={t(guestUpgrade ? "auth.guestUpgradeOnlineBody" : activeMode === "signUp" ? "auth.secureAccountBody" : "auth.onlineBody")}
                tone="gold"
              />
              {allowGuest && !guestUpgrade ? <AuthPathCard title={t("auth.guestTitle")} body={t("auth.guestBody")} tone="blue" /> : null}
            </div>

            <p className="mt-5 rounded-[20px] border border-white/10 bg-black/22 p-4 text-[12px] leading-5 text-white/52">
              {t(guestUpgrade ? "auth.guestUpgradeSyncNote" : activeMode === "signUp" ? "auth.registerPrivacyNote" : "auth.syncNote")}
            </p>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
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
                          setPasswordConfirmation("");
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

                {allowGuest && !guestUpgrade ? (
                  <button
                    type="button"
                    onClick={continueAsGuest}
                    disabled={busy}
                    className="frontline-motion-action mt-3 w-full rounded-[20px] border border-white/12 bg-white/[0.055] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/72 transition hover:border-white/22 hover:text-white md:hidden"
                  >
                    <PendingActionLabel pending={busy} pendingLabel={t("auth.working")}>
                      {t("auth.playGuest")}
                    </PendingActionLabel>
                  </button>
                ) : null}

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
                  {!guestUpgrade ? (
                    <div className="grid gap-3">
                      <label className="block">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/48">{t("auth.password")}</span>
                        <input
                          type="password"
                          autoComplete={activeMode === "signIn" ? "current-password" : "new-password"}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          disabled={busy}
                          aria-invalid={signUpMode && password.length > 0 && !registrationPasswordValid}
                          className={cn(
                            "mt-2 w-full rounded-[18px] border bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-white/24",
                            signUpMode && password.length > 0
                              ? strengthMeta.borderClassName
                              : "border-white/10 focus:border-[#f5c451]/42",
                          )}
                          placeholder={signUpMode ? t("auth.registrationPasswordHint") : t("auth.passwordHint")}
                        />
                      </label>

                      {signUpMode ? (
                        <>
                          <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
                                {t("auth.passwordSecurity")}
                              </span>
                              <span className={cn("text-[10px] font-black uppercase tracking-[0.18em]", strengthMeta.textClassName)}>
                                {t(strengthMeta.labelKey)}
                              </span>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-1.5" aria-hidden="true">
                              {[0, 1, 2].map((index) => (
                                <span
                                  key={index}
                                  className={cn(
                                    "h-1.5 rounded-full transition",
                                    passwordStrengthSegments > index ? strengthMeta.meterClassName : "bg-white/10",
                                  )}
                                />
                              ))}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                              <span className={registrationPasswordValid ? "text-emerald-100/82" : password.length > 0 ? "text-red-200/82" : "text-white/36"}>
                                {t("auth.passwordRequirementLength", { count: REGISTRATION_PASSWORD_MIN_LENGTH })}
                              </span>
                              <span className={registrationPasswordMatch ? "text-emerald-100/82" : passwordConfirmation.length > 0 ? "text-red-200/82" : "text-white/36"}>
                                {t("auth.passwordRequirementMatch")}
                              </span>
                            </div>
                          </div>

                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/48">{t("auth.confirmPassword")}</span>
                            <input
                              type="password"
                              autoComplete="new-password"
                              value={passwordConfirmation}
                              onChange={(event) => setPasswordConfirmation(event.target.value)}
                              disabled={busy}
                              aria-invalid={passwordConfirmation.length > 0 && !registrationPasswordMatch}
                              className={cn(
                                "mt-2 w-full rounded-[18px] border bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-white/24",
                                passwordConfirmation.length > 0 && !registrationPasswordMatch
                                  ? "border-red-300/42 focus:border-red-200/70"
                                  : passwordConfirmation.length > 0 && registrationPasswordMatch
                                    ? "border-emerald-200/42 focus:border-emerald-100/70"
                                    : "border-white/10 focus:border-[#f5c451]/42",
                              )}
                              placeholder={t("auth.confirmPasswordHint")}
                            />
                          </label>
                        </>
                      ) : null}
                    </div>
                  ) : null}

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
                    <PendingActionLabel pending={busy} pendingLabel={t("auth.working")}>
                      {authCta}
                    </PendingActionLabel>
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
                        "frontline-motion-action flex w-full items-center justify-center gap-3 rounded-[20px] border px-4 py-3 text-sm font-black transition",
                        configured && !busy
                          ? "border-white/70 bg-white text-[#1f1f1f] shadow-[0_16px_34px_rgba(0,0,0,0.24)] hover:bg-[#f8fafd]"
                          : "cursor-not-allowed border-white/8 bg-white/[0.04] text-white/30",
                      )}
                    >
                      <GoogleMark />
                      <PendingActionLabel pending={busy} pendingLabel={t("auth.working")}>
                        {t("auth.google")}
                      </PendingActionLabel>
                    </button>
                  </>
                ) : null}

                {allowGuest && !guestUpgrade ? (
                  <button
                    type="button"
                    onClick={continueAsGuest}
                    disabled={busy}
                    className="frontline-motion-action mt-3 hidden w-full rounded-[20px] border border-white/10 bg-black/24 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/62 transition hover:border-white/20 hover:text-white md:block"
                  >
                    <PendingActionLabel pending={busy} pendingLabel={t("auth.working")}>
                      {t("auth.playGuest")}
                    </PendingActionLabel>
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

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export default GameAuthGate;
