"use client";

import { FormEvent, useEffect, useState } from "react";
import { subscribeToSupabaseAuthEvents, updateSupabasePassword } from "@/features/server/supabaseBrowserSession";
import { getPasswordUpdateFailureNoticeKey } from "@/features/server/sessionSecurity";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";

const MIN_PASSWORD_LENGTH = 8;

export function PasswordRecoveryGate({ onRecovered }: { onRecovered?: () => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const subscription = subscribeToSupabaseAuthEvents((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setOpen(true);
        stripRecoveryTokensFromUrl();
      }
    });

    if (hasRecoveryParams()) {
      setOpen(true);
      stripRecoveryTokensFromUrl();
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (!open) return null;

  const passwordReady = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch = password === confirmPassword;
  const canSubmit = passwordReady && passwordsMatch && !busy && !completed;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordReady) {
      setNotice(t("auth.passwordRecoveryLengthHint"));
      return;
    }
    if (!passwordsMatch) {
      setNotice(t("auth.passwordRecoveryMismatch"));
      return;
    }

    setBusy(true);
    setNotice(null);
    const result = await updateSupabasePassword(password);
    setBusy(false);

    if (!result.ok) {
      setNotice(t(getPasswordUpdateFailureNoticeKey(result.reason)));
      return;
    }

    sfx.unlock();
    setCompleted(true);
    setPassword("");
    setConfirmPassword("");
    setNotice(t("auth.passwordRecoveryDone"));
    onRecovered?.();
  }

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center overflow-y-auto bg-[#030407]/86 px-3 py-8 backdrop-blur-md">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-recovery-title"
        className="frontline-motion-reveal relative w-full max-w-[32rem] overflow-hidden rounded-[32px] border border-[#f5c451]/20 bg-[linear-gradient(135deg,rgba(34,26,18,0.97),rgba(7,10,17,0.99)_58%,rgba(16,23,36,0.98))] p-6 shadow-[0_36px_100px_rgba(0,0,0,0.62)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(245,196,81,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_36%)]" />
        <div className="relative">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f5d498]">
            {t("auth.passwordRecoveryEyebrow")}
          </div>
          <h2 id="password-recovery-title" className="mt-2 text-3xl font-black leading-none text-white">
            {t("auth.passwordRecoveryTitle")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/62">{t("auth.passwordRecoverySubtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/48">
                {t("auth.newPassword")}
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy || completed}
                className="mt-2 w-full rounded-[18px] border border-white/10 bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-white/24 focus:border-[#f5c451]/42 disabled:text-white/38"
                placeholder={t("auth.passwordHint")}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/48">
                {t("auth.confirmPassword")}
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={busy || completed}
                className="mt-2 w-full rounded-[18px] border border-white/10 bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-white/24 focus:border-[#f5c451]/42 disabled:text-white/38"
                placeholder={t("auth.passwordHint")}
              />
            </label>

            {notice ? (
              <div className="rounded-[18px] border border-white/10 bg-white/[0.055] px-4 py-3 text-[12px] leading-5 text-white/64">
                {notice}
              </div>
            ) : null}

            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "frontline-motion-action rounded-[20px] border px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition",
                  canSubmit
                    ? "border-[#f5c451]/42 bg-[#f5c451]/18 text-[#f5d498] shadow-[0_18px_34px_rgba(245,196,81,0.13)] hover:border-[#f5c451]/62"
                    : "cursor-not-allowed border-white/8 bg-white/[0.04] text-white/30",
                )}
              >
                {busy ? t("auth.working") : t("auth.passwordRecoverySave")}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="frontline-motion-action rounded-[20px] border border-white/10 bg-black/24 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/62 transition hover:border-white/20 hover:text-white"
              >
                {completed ? t("common.continue") : t("auth.close")}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function hasRecoveryParams() {
  if (typeof window === "undefined") return false;
  const marker = `${window.location.hash} ${window.location.search}`.toLowerCase();
  return marker.includes("type=recovery");
}

function stripRecoveryTokensFromUrl() {
  if (typeof window === "undefined") return;
  const marker = `${window.location.hash} ${window.location.search}`.toLowerCase();
  if (!marker.includes("access_token") && !marker.includes("refresh_token") && !marker.includes("type=recovery")) return;
  const params = new URLSearchParams(window.location.search);
  params.delete("type");
  const cleanSearch = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ""}`);
}

export default PasswordRecoveryGate;
