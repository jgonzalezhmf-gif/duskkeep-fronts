"use client";

import Link from "next/link";
import ArtPortrait from "@/components/ui/ArtPortrait";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import { sfx } from "@/lib/audio";

export default function FantasyCommanderBadge({
  name,
  level,
  xpWidth,
  portrait,
  power,
  leaderTitle = "Warden of Dawnkeep",
  groupLabel = "War Council",
  levelLabel = "Lv",
  powerLabel = "Power",
}: {
  name: string;
  level: number;
  xpWidth: number;
  portrait: string;
  power?: string;
  leaderTitle?: string;
  groupLabel?: string;
  levelLabel?: string;
  powerLabel?: string;
}) {
  return (
    <Link
      href="/roster"
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="group relative flex w-[17.4rem] items-center gap-3 rounded-[28px] border border-[#f1c96c]/20 bg-[linear-gradient(180deg,rgba(19,16,15,0.66),rgba(8,10,16,0.94))] px-3 py-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl"
    >
      <span className="absolute inset-x-[12%] top-0 h-[38%] rounded-full bg-white/10 opacity-70 blur-md" />
      <span className="absolute bottom-[-10px] left-10 h-5 w-16 rounded-full bg-black/34 blur-xl" />
      <span className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-[26px] border border-[#f0c75a]/34 bg-[linear-gradient(180deg,rgba(58,34,17,0.92),rgba(18,13,12,0.98))] shadow-[0_14px_28px_rgba(0,0,0,0.34)]" />
        <span className="absolute inset-[8%] rounded-[22px] bg-[radial-gradient(circle_at_50%_28%,rgba(255,213,122,0.46),transparent_62%)] blur-md" />
        <ArtPortrait
          src={portrait}
          alt={name}
          className="relative z-[1] h-[3.7rem] w-[3.7rem] rounded-[18px] object-cover object-top brightness-[1.04] contrast-[1.06]"
          fallback={
            <span className="relative z-[1] h-[3.3rem] w-[3.3rem]">
              <GameAssetIcon category="nav" name="heroes" size="xl" className="h-full w-full opacity-80" imgClassName="scale-[1.12]" />
            </span>
          }
        />
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
          {power ? (
            <span className="rounded-full border border-sky-200/16 bg-[linear-gradient(180deg,rgba(10,20,31,0.82),rgba(7,10,17,0.98))] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/74">
              {powerLabel} {power}
            </span>
          ) : null}
        </span>
        <span className="mt-2 block h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/34">
          <span
            className="block h-full rounded-full bg-[linear-gradient(90deg,#f6cf67,#f0a85a,#7ad8ff)] shadow-[0_0_18px_rgba(255,205,111,0.42)]"
            style={{ width: `${xpWidth}%` }}
          />
        </span>
      </span>
    </Link>
  );
}
