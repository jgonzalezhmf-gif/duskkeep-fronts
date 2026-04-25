"use client";

import { useEffect, useRef, useState } from "react";
import GameGlyph from "@/components/ui/GameGlyph";
import { audio, sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function MuteButton() {
  const { t } = useI18n();
  const muted = useGameStore((state) => state.audioMuted);
  const musicVolume = useGameStore((state) => state.musicVolume);
  const sfxVolume = useGameStore((state) => state.sfxVolume);
  const setMuted = useGameStore((state) => state.setAudioMuted);
  const setMusicVolume = useGameStore((state) => state.setMusicVolume);
  const setSfxVolume = useGameStore((state) => state.setSfxVolume);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    audio.syncFromStore({ muted, musicVolume, sfxVolume });
  }, [muted, musicVolume, sfxVolume]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current) return;
      if (ref.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={muted ? t("audio.unmute") : t("audio.audioMixer")}
        onClick={() => {
          sfx.tap();
          setOpen((value) => !value);
        }}
        onMouseEnter={() => sfx.hover()}
        className="ml-1 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.78),rgba(9,12,18,0.98))] p-2 shadow-[0_14px_28px_rgba(0,0,0,0.24)] transition hover:border-white/20 hover:scale-[1.03]"
        title={muted ? t("audio.soundOff") : t("audio.openMixer")}
      >
        <GameGlyph kind={muted ? "sound-off" : "sound-on"} shell="none" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-[16rem] rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.88),rgba(9,12,18,0.98))] p-3.5 shadow-[0_22px_40px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/42">{t("audio.mixer")}</div>
              <div className="mt-1 text-sm font-black text-white">{t("audio.mixerSubtitle")}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !muted;
                setMuted(next);
                if (!next) sfx.tap();
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] transition",
                muted
                  ? "border-rose-300/24 bg-rose-400/12 text-rose-100"
                  : "border-emerald-300/22 bg-emerald-400/12 text-emerald-100",
              )}
            >
              {muted ? t("options.muted") : t("options.live")}
            </button>
          </div>

          <MixerRow
            label={t("options.music")}
            value={musicVolume}
            muted={muted}
            onChange={(value) => setMusicVolume(value)}
          />
          <MixerRow
            label={t("options.effects")}
            value={sfxVolume}
            muted={muted}
            onChange={(value) => {
              setSfxVolume(value);
              if (!muted) {
                audio.setSfxVolume(value);
                sfx.hover();
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function MixerRow({
  label,
  value,
  muted,
  onChange,
}: {
  label: string;
  value: number;
  muted: boolean;
  onChange: (value: number) => void;
}) {
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
