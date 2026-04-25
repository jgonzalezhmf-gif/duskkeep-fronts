"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import GameGlyph from "@/components/ui/GameGlyph";
import { SUPPORTED_LOCALES, type LocaleCode } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/useI18n";
import { audio, sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/lib/store";

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function GameOptionsButton({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
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
          "frontline-motion-action grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.78),rgba(9,12,18,0.98))] p-2 shadow-[0_14px_28px_rgba(0,0,0,0.24)] transition hover:border-[#f5c451]/28",
          className,
        )}
      >
        <GameGlyph kind="cfg" shell="none" />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-[80] grid place-items-center px-3 py-6">
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
            className="frontline-motion-reveal relative z-[1] w-full max-w-[36rem] overflow-hidden rounded-[34px] border border-[#f5c451]/18 bg-[linear-gradient(180deg,rgba(37,28,20,0.96),rgba(8,10,16,0.98))] p-5 shadow-[0_34px_90px_rgba(0,0,0,0.5)]"
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
              </div>
            </div>
          </section>
        </div>,
          document.body,
        )
        : null}
    </>
  );
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
