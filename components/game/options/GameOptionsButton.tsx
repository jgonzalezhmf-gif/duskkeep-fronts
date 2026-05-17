"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { UiIcon } from "@/components/game/shared/UiIcon";
import { signOutSupabase } from "@/features/server/supabaseBrowserSession";
import { SUPPORTED_LOCALES, type LocaleCode } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/useI18n";
import { audio, sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/lib/store";
import type { ThemeName } from "@/lib/audio-runtime";

const GameIntroPreview = dynamic(() => import("@/components/game/intro/GameIntro").then((mod) => mod.GameIntro), {
  ssr: false,
});

const GameAuthGate = dynamic(() => import("@/components/game/auth/GameAuthGate").then((mod) => mod.GameAuthGate), {
  ssr: false,
});

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function GameOptionsButton({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [introPreviewOpen, setIntroPreviewOpen] = useState(false);
  const [accountGateOpen, setAccountGateOpen] = useState(false);
  const [accountSyncBusy, setAccountSyncBusy] = useState(false);
  const [accountSignOutBusy, setAccountSignOutBusy] = useState(false);
  const [accountSyncNotice, setAccountSyncNotice] = useState<string | null>(null);
  const language = useGameStore((state) => state.language);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const muted = useGameStore((state) => state.audioMuted);
  const musicVolume = useGameStore((state) => state.musicVolume);
  const sfxVolume = useGameStore((state) => state.sfxVolume);
  const setMuted = useGameStore((state) => state.setAudioMuted);
  const setMusicVolume = useGameStore((state) => state.setMusicVolume);
  const setSfxVolume = useGameStore((state) => state.setSfxVolume);
  const reducedMotion = useGameStore((state) => state.reducedMotion);
  const setReducedMotion = useGameStore((state) => state.setReducedMotion);
  const visualEffects = useGameStore((state) => state.visualEffects);
  const setVisualEffects = useGameStore((state) => state.setVisualEffects);
  const textScale = useGameStore((state) => state.textScale);
  const setTextScale = useGameStore((state) => state.setTextScale);
  const accountLinkMode = useGameStore((state) => state.accountLinkMode);
  const setAccountLinkMode = useGameStore((state) => state.setAccountLinkMode);
  const loadServerSnapshotOnlineFirst = useGameStore((state) => state.loadServerSnapshotOnlineFirst);
  const syncLocalSnapshotOnlineFirst = useGameStore((state) => state.syncLocalSnapshotOnlineFirst);

  return (
    <>
      <button
        type="button"
        aria-label={t("options.button")}
        title={t("options.button")}
        onClick={() => {
          sfx.tap();
          setOpen(true);
        }}
        onMouseEnter={() => sfx.hover()}
        className={cn(
          "frontline-motion-action grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.78),rgba(9,12,18,0.98))] p-1 shadow-[0_14px_28px_rgba(0,0,0,0.24)] transition hover:border-[#f5c451]/28",
          className,
        )}
      >
        <UiIcon name="settings" size="lg" className="h-9 w-9" imgClassName="scale-110" />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto px-3 py-6">
          <button
            type="button"
            aria-label={t("options.close")}
            className="absolute inset-0 bg-black/64 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-options-title"
            className="frontline-motion-reveal relative z-[1] my-auto max-h-[calc(100dvh-3rem)] w-full max-w-[36rem] overflow-y-auto overflow-x-hidden rounded-[34px] border border-[#f5c451]/18 bg-[linear-gradient(180deg,rgba(37,28,20,0.96),rgba(8,10,16,0.98))] p-5 shadow-[0_34px_90px_rgba(0,0,0,0.5)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(245,196,81,0.2),transparent_28%),radial-gradient(circle_at_88%_22%,rgba(122,162,255,0.12),transparent_24%)]" />
            <div className="relative z-[1]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f5d498]">{t("options.button")}</div>
                  <h2 id="game-options-title" className="mt-1 text-3xl font-black text-white">
                    {t("options.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/62">{t("options.subtitle")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  {t("options.close")}
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                <OptionPanel title={t("options.language")} hint={t("options.languageHint")}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SUPPORTED_LOCALES.map((item) => {
                      const active = item.code === language;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setLanguage(item.code as LocaleCode);
                            sfx.tap();
                          }}
                          className={cn(
                            "frontline-motion-action rounded-[18px] border px-3 py-3 text-left transition",
                            active
                              ? "border-[#f5c451]/34 bg-[#f5c451]/14 shadow-[0_14px_28px_rgba(245,196,81,0.12)]"
                              : "border-white/10 bg-white/[0.045] hover:border-white/18",
                          )}
                        >
                          <div className="text-sm font-black text-white">{item.nativeName}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/44">{item.code === locale ? t("options.current") : item.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </OptionPanel>

                <OptionPanel title={t("options.audio")}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setMuted(!muted)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition",
                        muted ? "border-rose-300/24 bg-rose-400/12 text-rose-100" : "border-emerald-300/22 bg-emerald-400/12 text-emerald-100",
                      )}
                    >
                      {muted ? t("options.muted") : t("options.live")}
                    </button>
                  </div>
                  <OptionSlider label={t("options.music")} value={musicVolume} muted={muted} onChange={setMusicVolume} />
                  <OptionSlider
                    label={t("options.effects")}
                    value={sfxVolume}
                    muted={muted}
                    onChange={(value) => {
                      setSfxVolume(value);
                      audio.setSfxVolume(value);
                      if (!muted) sfx.hover();
                    }}
                  />
                </OptionPanel>

                <OptionPanel title={t("options.comfort")}>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <TogglePill active={reducedMotion} label={t("options.reducedMotion")} onClick={() => setReducedMotion(!reducedMotion)} />
                    <TogglePill active={visualEffects} label={t("options.visualEffects")} onClick={() => setVisualEffects(!visualEffects)} />
                    <TogglePill active={textScale === "large"} label={`${t("options.textScale")}: ${textScale === "large" ? t("options.large") : t("options.normal")}`} onClick={() => setTextScale(textScale === "large" ? "normal" : "large")} />
                  </div>
                </OptionPanel>

                <OptionPanel title={t("options.account")} hint={t("options.accountHint")}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-white">{t(accountModeTitleKey(accountLinkMode))}</div>
                      <div className="mt-1 text-[12px] leading-5 text-white/48">{t(accountModeBodyKey(accountLinkMode))}</div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em]",
                        accountLinkMode === "linked"
                          ? "border-emerald-300/24 bg-emerald-400/12 text-emerald-100"
                          : "border-amber-200/18 bg-amber-300/10 text-amber-100/78",
                      )}
                    >
                      {t(accountModeBadgeKey(accountLinkMode))}
                    </span>
                  </div>
                  {accountLinkMode !== "linked" ? (
                    <button
                      type="button"
                      onClick={() => {
                        sfx.tap();
                        setAccountGateOpen(true);
                      }}
                      className="frontline-motion-action mt-3 w-full rounded-[20px] border border-sky-200/24 bg-sky-300/10 px-4 py-3 text-left text-[11px] font-black uppercase tracking-[0.16em] text-sky-50 shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:border-sky-100/44"
                    >
                      {t("options.createAccountAndSave")}
                    </button>
                  ) : null}
                  {accountLinkMode === "linked" ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={accountSyncBusy || accountSignOutBusy}
                        onClick={async () => {
                          sfx.tap();
                          setAccountSyncBusy(true);
                          setAccountSyncNotice(null);
                          const result = await loadServerSnapshotOnlineFirst();
                          setAccountSyncBusy(false);
                          if (result.ok) {
                            sfx.unlock();
                            setAccountSyncNotice(t("options.accountRefreshDone"));
                          } else {
                            setAccountSyncNotice(
                              t(result.authoritative ? "options.accountRefreshFailed" : "options.accountSyncUnavailable"),
                            );
                          }
                        }}
                        className={cn(
                          "frontline-motion-action rounded-[20px] border px-4 py-3 text-left text-[11px] font-black uppercase tracking-[0.16em] transition",
                          accountSyncBusy
                            ? "cursor-wait border-white/8 bg-white/[0.04] text-white/30"
                            : "border-emerald-200/24 bg-emerald-300/10 text-emerald-50 hover:border-emerald-100/44",
                        )}
                      >
                        {accountSyncBusy ? t("options.accountSyncing") : t("options.refreshOnlineProgress")}
                      </button>
                      <button
                        type="button"
                        disabled={accountSyncBusy || accountSignOutBusy}
                        onClick={async () => {
                          sfx.tap();
                          setAccountSignOutBusy(true);
                          setAccountSyncNotice(null);
                          const result = await signOutSupabase();
                          setAccountSignOutBusy(false);
                          if (result.ok || result.reason === "unconfigured") {
                            setAccountLinkMode("guest");
                            setAccountSyncNotice(t("options.accountSignedOut"));
                          } else {
                            setAccountSyncNotice(t("options.accountSignOutFailed"));
                          }
                        }}
                        className={cn(
                          "frontline-motion-action rounded-[20px] border px-4 py-3 text-left text-[11px] font-black uppercase tracking-[0.16em] transition",
                          accountSignOutBusy
                            ? "cursor-wait border-white/8 bg-white/[0.04] text-white/30"
                            : "border-rose-200/20 bg-rose-300/9 text-rose-50 hover:border-rose-100/40",
                        )}
                      >
                        {accountSignOutBusy ? t("options.accountSigningOut") : t("options.signOutAccount")}
                      </button>
                    </div>
                  ) : null}
                  {accountSyncNotice ? <div className="mt-2 text-[12px] leading-5 text-white/54">{accountSyncNotice}</div> : null}
                </OptionPanel>

                <OptionPanel title={t("options.intro")} hint={t("options.introHint")}>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.tap();
                      setOpen(false);
                      setIntroPreviewOpen(true);
                    }}
                    className="frontline-motion-action w-full rounded-[20px] border border-[#f5c451]/28 bg-[#f5c451]/12 px-4 py-3 text-left text-[11px] font-black uppercase tracking-[0.16em] text-[#f5d498] shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition hover:border-[#f5c451]/48 hover:bg-[#f5c451]/18"
                  >
                    {t("options.replayIntro")}
                  </button>
                </OptionPanel>
              </div>
            </div>
          </section>
        </div>,
          document.body,
        )
        : null}
      {introPreviewOpen ? <GameIntroPreview onDone={() => setIntroPreviewOpen(false)} returnTheme={getRouteReturnTheme(pathname)} /> : null}
      {accountGateOpen ? (
        <GameAuthGate
          open={accountGateOpen}
          allowGuest={false}
          intent="guestUpgrade"
          onClose={() => setAccountGateOpen(false)}
          onLinked={async () => {
            setAccountSyncBusy(true);
            setAccountSyncNotice(t("options.accountSyncing"));
            const result = await syncLocalSnapshotOnlineFirst();
            setAccountSyncBusy(false);
            if (result.ok) {
              setAccountGateOpen(false);
              setAccountSyncNotice(t("options.accountSaveDone"));
            } else {
              setAccountSyncNotice(t(result.authoritative ? "options.accountSaveFailed" : "options.accountSyncUnavailable"));
            }
          }}
        />
      ) : null}
    </>
  );
}

function getRouteReturnTheme(pathname: string): ThemeName {
  if (pathname === "/adventure") return "adventure";
  if (/^\/events(?:\/|$)/.test(pathname)) return "event";
  if (/^\/shop(?:\/|$)/.test(pathname)) return "shop";
  if (/^\/battle(?:\/|$)/.test(pathname) || /^\/adventure\/[^/]+$/.test(pathname)) return null;
  return "home";
}

function accountModeTitleKey(mode: string) {
  if (mode === "linked") return "options.accountLinked";
  if (mode === "guest") return "options.accountGuest";
  return "options.accountUndecided";
}

function accountModeBodyKey(mode: string) {
  if (mode === "linked") return "options.accountLinkedHint";
  if (mode === "guest") return "options.accountGuestHint";
  return "options.accountUndecidedHint";
}

function accountModeBadgeKey(mode: string) {
  if (mode === "linked") return "options.accountOnline";
  if (mode === "guest") return "options.accountLocal";
  return "options.accountPending";
}

function OptionPanel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-3">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">{title}</div>
        {hint ? <div className="mt-1 text-[12px] leading-5 text-white/54">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

function OptionSlider({ label, value, muted, onChange }: { label: string; value: number; muted: boolean; onChange: (value: number) => void }) {
  return (
    <label className="mt-3 block">
      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/56">
        <span>{label}</span>
        <span className="text-white/78">{muted ? "0%" : pct(value)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(value * 100)}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        className="audio-slider w-full"
      />
    </label>
  );
}

function TogglePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "frontline-motion-action rounded-[18px] border px-3 py-3 text-left text-[11px] font-black uppercase tracking-[0.14em] transition",
        active ? "border-[#f5c451]/34 bg-[#f5c451]/14 text-[#f5d498]" : "border-white/10 bg-white/[0.045] text-white/62",
      )}
    >
      {label}
    </button>
  );
}
