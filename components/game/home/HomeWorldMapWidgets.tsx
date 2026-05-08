"use client";

import Link from "next/link";
import HomeIcon, { type HomeIconKind } from "@/components/game/home/HomeIcon";
import { TONE_STYLES } from "@/components/game/home/homeWorldMapConfig";
import { type HomeTone } from "@/components/game/home/types";
import { ModeIcon, type ModeIconName } from "@/components/game/shared/ModeIcon";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";

export function CommanderBanner({
  level,
  name,
  power,
  progress,
  portrait,
  leaderTitle,
  groupLabel,
  levelLabel,
  powerLabel,
}: {
  level: number;
  name: string;
  power: string;
  progress: number;
  portrait: string | null;
  leaderTitle: string;
  groupLabel: string;
  levelLabel: string;
  powerLabel: string;
}) {
  return (
    <Link
      href="/roster"
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="group relative flex w-[17.4rem] items-center gap-3 rounded-[28px] border border-[#f1c96c]/20 bg-[linear-gradient(180deg,rgba(19,16,15,0.66),rgba(8,10,16,0.94))] px-3 py-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl"
    >
      <span className="absolute inset-x-[12%] top-0 h-[38%] rounded-full bg-white/10 blur-md opacity-70" />
      <span className="absolute bottom-[-10px] left-10 h-5 w-16 rounded-full bg-black/34 blur-xl" />
      <span className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-[26px] border border-[#f0c75a]/34 bg-[linear-gradient(180deg,rgba(58,34,17,0.92),rgba(18,13,12,0.98))] shadow-[0_14px_28px_rgba(0,0,0,0.34)]" />
        <span className="absolute inset-[8%] rounded-[22px] bg-[radial-gradient(circle_at_50%_28%,rgba(255,213,122,0.46),transparent_62%)] blur-md" />
        {portrait ? (
          <img
            src={portrait}
            alt=""
            className="relative z-[1] h-[3.7rem] w-[3.7rem] rounded-[18px] object-cover object-top brightness-[1.04] contrast-[1.06]"
          />
        ) : (
          <span className="relative z-[1] h-[3.3rem] w-[3.3rem]">
            <HomeIcon kind="heroes" />
          </span>
        )}
        <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#f0c75a]/26 bg-[linear-gradient(180deg,rgba(32,22,12,0.94),rgba(14,10,8,0.98))] px-2 py-[0.18rem] text-[9px] font-black uppercase tracking-[0.18em] text-[#f8de9e]">
          {levelLabel} {level}
        </span>
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="block text-[8px] font-black uppercase tracking-[0.28em] text-white/54">{groupLabel}</span>
        <span className="mt-0.5 block truncate text-[1.2rem] font-black leading-none text-[#fff0cf]">{name}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-[#f0c75a]/22 bg-[linear-gradient(180deg,rgba(49,33,18,0.88),rgba(16,11,8,0.98))] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
            {leaderTitle}
          </span>
          <span className="rounded-full border border-sky-200/16 bg-[linear-gradient(180deg,rgba(10,20,31,0.82),rgba(7,10,17,0.98))] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/74">
            {powerLabel} {power}
          </span>
        </span>
        <span className="mt-2 block h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/34">
          <span
            className="block h-full rounded-full bg-[linear-gradient(90deg,#f6cf67,#f0a85a,#7ad8ff)] shadow-[0_0_18px_rgba(255,205,111,0.42)]"
            style={{ width: `${progress}%` }}
          />
        </span>
      </span>
    </Link>
  );
}

export function TimedCharm({
  label,
  value,
  tone,
  icon,
  className,
}: {
  label: string;
  value: string;
  tone: HomeTone;
  icon: HomeIconKind;
  className?: string;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[24px] border bg-[linear-gradient(180deg,rgba(14,17,26,0.76),rgba(8,10,17,0.98))] px-2.5 py-2 shadow-[0_16px_30px_rgba(0,0,0,0.26)] backdrop-blur-xl",
        palette.ring,
        className,
      )}
    >
      <span className="relative grid h-12 w-12 place-items-center">
        <span className={cn("absolute inset-0 rounded-full bg-gradient-to-br opacity-76 blur-xl", palette.wash)} />
        <span className="absolute bottom-1 h-3 w-9 rounded-full bg-black/32 blur-md" />
        <span className="relative block h-[2.95rem] w-[2.95rem]">
          <HomeIcon kind={icon} />
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-[8px] font-black uppercase tracking-[0.18em] text-white/44">{label}</span>
        <span className={cn("mt-0.5 block text-[11px] font-black", palette.text)}>{value}</span>
      </span>
    </div>
  );
}

export function HomeVisualIcon({
  icon,
  modeIcon,
  className,
}: {
  icon: HomeIconKind;
  modeIcon?: ModeIconName;
  className?: string;
}) {
  if (modeIcon) {
    return <ModeIcon name={modeIcon} size="xl" className={className} imgClassName="h-full w-full object-contain" />;
  }

  return <HomeIcon kind={icon} className={className} />;
}
