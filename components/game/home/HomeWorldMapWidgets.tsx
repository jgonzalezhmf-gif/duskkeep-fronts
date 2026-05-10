"use client";

import Link from "next/link";
import { type CSSProperties } from "react";
import HomeIcon, { type HomeIconKind } from "@/components/game/home/HomeIcon";
import { TONE_STYLES } from "@/components/game/home/homeWorldMapConfig";
import { type HomeHotspot, type HomeTone, type HomeZoneId } from "@/components/game/home/types";
import { ModeIcon, type ModeIconName } from "@/components/game/shared/ModeIcon";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";

type PortraitAsset = {
  src: string;
  webpSrc?: string;
};

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
  portrait: PortraitAsset | null;
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
          <picture className="relative z-[1] block h-[3.7rem] w-[3.7rem] overflow-hidden rounded-[18px]">
            {portrait.webpSrc ? <source srcSet={portrait.webpSrc} type="image/webp" /> : null}
            <img
              src={portrait.src}
              alt=""
              className="h-full w-full object-cover object-top brightness-[1.04] contrast-[1.06]"
            />
          </picture>
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

export function SideCharm({
  href,
  label,
  sublabel,
  icon,
  modeIcon,
  tone,
  delay,
}: {
  href: string;
  label: string;
  sublabel: string;
  icon: HomeIconKind;
  modeIcon?: ModeIconName;
  tone: HomeTone;
  delay: string;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="group flex items-center gap-1.5 opacity-86 transition hover:opacity-100"
      style={{ animation: `homeDockBreathe 5.4s ease-in-out ${delay} infinite` }}
    >
      <span className="relative flex h-[3.45rem] w-[3.25rem] items-end justify-center">
        <span className="absolute bottom-0.5 h-3 w-8 rounded-full bg-black/30 blur-md" />
        <span className={cn("absolute bottom-[0.25rem] h-[2.8rem] w-[2.8rem] rounded-full bg-gradient-to-br opacity-70 blur-xl", palette.wash)} />
        <span className="relative z-[1] h-[2.75rem] w-[2.75rem] transition group-hover:-translate-y-0.5 group-hover:scale-[1.08]">
          <HomeVisualIcon icon={icon} modeIcon={modeIcon} />
        </span>
      </span>
      <span
        className={cn(
          "relative min-w-[5.8rem] rounded-[15px] border px-2.25 py-1.25 text-left shadow-[0_12px_22px_rgba(0,0,0,0.2)] backdrop-blur-xl transition group-hover:-translate-y-0.5",
          "bg-[linear-gradient(180deg,rgba(11,15,23,0.74),rgba(7,10,16,0.96))]",
          palette.ring,
        )}
      >
        <span className={cn("absolute inset-y-[18%] left-0 top-auto w-[12%] rounded-full bg-gradient-to-b opacity-60 blur-sm", palette.wash)} />
        <span className="relative block text-[6px] font-black uppercase tracking-[0.22em] text-white/40">{sublabel}</span>
        <span className={cn("relative mt-0.5 block text-[9px] font-black uppercase tracking-[0.16em]", palette.text)}>{label}</span>
      </span>
    </Link>
  );
}

export function MiniActionCharm({
  href,
  label,
  icon,
  modeIcon,
  tone,
  delay,
}: {
  href: string;
  label: string;
  icon: HomeIconKind;
  modeIcon?: ModeIconName;
  tone: HomeTone;
  delay: string;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      title={label}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="relative flex h-[3rem] w-[2.8rem] items-end justify-center"
      style={{ animation: `homeDockBreathe 5.2s ease-in-out ${delay} infinite` }}
    >
      <span className="absolute bottom-0.5 h-2.5 w-8 rounded-full bg-black/28 blur-md" />
      <span className={cn("absolute bottom-[0.3rem] h-[2.7rem] w-[2.7rem] rounded-full bg-gradient-to-br opacity-72 blur-xl", palette.wash)} />
      <span className="relative h-[2.65rem] w-[2.65rem]">
        <HomeVisualIcon icon={icon} modeIcon={modeIcon} />
      </span>
    </Link>
  );
}

export function DockShrine({
  href,
  label,
  icon,
  tone,
  delay,
}: {
  href: string;
  label: string;
  icon: HomeIconKind;
  tone: HomeTone;
  delay: string;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="group flex flex-col items-center gap-1"
      style={{ animation: `homeDockBreathe 5.8s ease-in-out ${delay} infinite` }}
    >
      <span className="relative flex h-[4.35rem] w-[4.05rem] items-end justify-center md:h-[4.75rem] md:w-[4.35rem]">
        <span className="absolute bottom-1 h-3.5 w-10 rounded-full bg-black/32 blur-md" />
        <span className={cn("absolute bottom-[0.55rem] h-[3.35rem] w-[3.35rem] rounded-full bg-gradient-to-br opacity-76 blur-2xl md:h-[3.7rem] md:w-[3.7rem]", palette.wash)} />
        <span className="relative h-[3.15rem] w-[3.15rem] transition group-hover:-translate-y-0.5 group-hover:scale-[1.08] md:h-[3.45rem] md:w-[3.45rem]">
          <HomeIcon kind={icon} />
        </span>
      </span>
      <span
        className={cn(
          "rounded-full border px-2 py-[0.25rem] text-[7px] font-black uppercase tracking-[0.16em] shadow-[0_10px_18px_rgba(0,0,0,0.24)] backdrop-blur-xl md:px-2.5 md:text-[8px]",
          palette.ring,
          palette.text,
          "bg-[linear-gradient(180deg,rgba(12,16,24,0.76),rgba(7,10,16,0.96))]",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function CornerAction({
  href,
  label,
  sublabel,
  tone,
  icon,
  modeIcon,
  compact = false,
}: {
  href: string;
  label: string;
  sublabel: string;
  tone: HomeTone;
  icon: HomeIconKind;
  modeIcon?: ModeIconName;
  compact?: boolean;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className={cn(
        "flex items-center gap-2 rounded-[22px] border bg-[linear-gradient(180deg,rgba(12,17,26,0.68),rgba(7,10,18,0.96))] px-2 py-1.5 shadow-[0_16px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        compact && "scale-[0.92] opacity-92",
        palette.ring,
      )}
    >
      <span className="relative flex h-12 w-12 items-end justify-center">
        <span className="absolute bottom-1 h-3 w-9 rounded-full bg-black/28 blur-md" />
        <span className={cn("absolute bottom-[0.25rem] h-[2.95rem] w-[2.95rem] rounded-full bg-gradient-to-br opacity-74 blur-xl", palette.wash)} />
        <span className="relative h-[2.85rem] w-[2.85rem]">
          <HomeVisualIcon icon={icon} modeIcon={modeIcon} />
        </span>
      </span>
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/48">{label}</div>
        <div className={cn("mt-0.5 text-[11px] font-black", palette.text)}>{sublabel}</div>
      </div>
    </Link>
  );
}

export function FightCrystal({ href }: { href: string }) {
  const { t } = useI18n();

  return (
    <Link
      href={href}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="group relative flex items-center gap-3 rounded-[28px] border border-[#f0c75a]/34 bg-[linear-gradient(180deg,rgba(45,23,16,0.84),rgba(10,11,18,0.98))] px-4 py-3.5 shadow-[0_26px_52px_rgba(0,0,0,0.34),0_0_34px_rgba(255,151,103,0.16)] backdrop-blur-xl transition hover:-translate-y-0.5 md:gap-4 md:rounded-[34px] md:px-6 md:py-4.5"
    >
      <span className="absolute -bottom-5 left-1/2 h-8 w-[76%] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(circle_at_50%_50%,rgba(14,19,30,0.62),transparent_70%)] blur-2xl" />
      <span className="absolute inset-x-[18%] -bottom-2 h-5 rounded-[0_0_20px_20px] border border-[#f0c75a]/16 border-t-0 bg-[linear-gradient(180deg,rgba(36,22,16,0.92),rgba(11,12,18,0.98))]" />
      <span className="absolute left-[18%] bottom-1 h-6 w-10 rounded-[14px_14px_8px_8px] border border-[#f0c75a]/16 bg-[linear-gradient(180deg,rgba(18,21,31,0.92),rgba(8,10,16,0.98))] opacity-70" />
      <span className="absolute right-[18%] bottom-1 h-6 w-10 rounded-[14px_14px_8px_8px] border border-[#f0c75a]/16 bg-[linear-gradient(180deg,rgba(18,21,31,0.92),rgba(8,10,16,0.98))] opacity-70" />
      <span className="absolute inset-x-[14%] top-0 h-[48%] rounded-full bg-white/10 blur-lg opacity-80" />
      <span className="absolute inset-x-[24%] top-[0.55rem] h-px bg-[linear-gradient(90deg,transparent,rgba(255,233,187,0.68),transparent)] opacity-76" />
      <span className="relative flex h-16 w-16 items-end justify-center md:h-[4.9rem] md:w-[4.9rem]">
        <span className="absolute inset-[-12%] rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,216,122,0.64),rgba(255,126,103,0.2)_58%,transparent_78%)] blur-2xl" />
        <span className="absolute bottom-1 h-4 w-11 rounded-full bg-black/34 blur-md" />
        <span className="relative z-10 h-[3.55rem] w-[3.55rem] transition group-hover:scale-[1.08] md:h-[4.2rem] md:w-[4.2rem]">
          <ModeIcon name="campaign" size="xl" className="h-full w-full" />
        </span>
      </span>
      <div className="relative z-[1]">
        <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#ffdca1] md:text-[10px] md:tracking-[0.22em]">{t("home.mainQuest")}</div>
        <div className="text-[1.15rem] font-black text-white md:text-[1.5rem]">{t("home.adventureFight")}</div>
        <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/54">{t("home.pushFrontier")}</div>
      </div>
    </Link>
  );
}

export function WorldHotspot({
  spot,
  qaDisabled = false,
  onActivate,
  onDeactivate,
}: {
  spot: HomeHotspot;
  qaDisabled?: boolean;
  onActivate: (zone: HomeZoneId) => void;
  onDeactivate: () => void;
}) {
  const style = {
    ["--spot-left" as string]: spot.anchorX,
    ["--spot-top" as string]: spot.anchorY,
    ["--spot-width" as string]: spot.width ?? spot.mobileWidth ?? "7rem",
    ["--spot-height" as string]: spot.height ?? spot.mobileHeight ?? "5rem",
    ["--spot-left-mobile" as string]: spot.mobileAnchorX ?? spot.anchorX,
    ["--spot-top-mobile" as string]: spot.mobileAnchorY ?? spot.anchorY,
    ["--spot-width-mobile" as string]: spot.mobileWidth ?? spot.width ?? "7rem",
    ["--spot-height-mobile" as string]: spot.mobileHeight ?? spot.height ?? "5rem",
    ["--spot-label-dx" as string]: spot.labelDx ?? "0rem",
    ["--spot-label-dy" as string]: spot.labelDy ?? "2.4rem",
    ["--spot-label-dx-mobile" as string]: spot.mobileLabelDx ?? spot.labelDx ?? "0rem",
    ["--spot-label-dy-mobile" as string]: spot.mobileLabelDy ?? spot.labelDy ?? "1.7rem",
    ["--spot-plaque-width" as string]: spot.plaqueWidth ?? spot.mobilePlaqueWidth ?? "8rem",
    ["--spot-plaque-width-mobile" as string]: spot.mobilePlaqueWidth ?? spot.plaqueWidth ?? "6rem",
  } as CSSProperties;

  return (
    <WorldHotspotAnchor spot={spot} qaDisabled={qaDisabled} onActivate={onActivate} onDeactivate={onDeactivate} style={style} />
  );
}

function WorldHotspotAnchor({
  spot,
  qaDisabled,
  style,
  onActivate,
  onDeactivate,
}: {
  spot: HomeHotspot;
  qaDisabled: boolean;
  style: CSSProperties;
  onActivate: (zone: HomeZoneId) => void;
  onDeactivate: () => void;
}) {
  const palette = TONE_STYLES[spot.tone];
  const landmarkDriven = Boolean(spot.landmarkId);

  return (
    <Link
      href={spot.href}
      aria-label={spot.label}
      data-home-zone={spot.zoneId}
      data-home-hotspot={spot.zoneId}
      className={cn(
        "group absolute z-20 isolate will-change-transform",
        qaDisabled ? "pointer-events-none" : "pointer-events-auto",
        "left-[var(--spot-left-mobile)] top-[var(--spot-top-mobile)] h-[var(--spot-height-mobile)] w-[var(--spot-width-mobile)]",
        "md:left-[var(--spot-left)] md:top-[var(--spot-top)] md:h-[var(--spot-height)] md:w-[var(--spot-width)]",
      )}
      style={{
        ...style,
        transform: "translate(-50%, -50%)",
        transformOrigin: "center center",
      }}
      onMouseEnter={() => {
        sfx.hover();
        onActivate(spot.zoneId);
      }}
      onFocus={() => onActivate(spot.zoneId)}
      onPointerDown={() => sfx.tap()}
      onMouseLeave={onDeactivate}
      onBlur={onDeactivate}
    >
      <span
        className="absolute inset-[6%] rounded-[52px] blur-2xl opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 68%, ${palette.soft}, transparent 62%)`,
          animation: "homeZoneBreath 3.8s ease-in-out infinite",
        }}
      />
      <span className="absolute inset-[10%] rounded-[42px] bg-[radial-gradient(circle_at_50%_62%,rgba(255,255,255,0.14),transparent_58%)] opacity-0 blur-xl transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />

      {!landmarkDriven ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[52%]">
          <span className={cn("absolute left-1/2 top-[calc(100%+0.1rem)] h-8 w-14 -translate-x-1/2 rounded-full opacity-[0.76] blur-xl", palette.wash)} />
          <span className="absolute left-1/2 top-[calc(100%+0.55rem)] h-3.5 w-10 -translate-x-1/2 rounded-full bg-black/36 blur-md" />
          <span className="absolute left-1/2 top-[calc(100%-3.15rem)] h-[3.45rem] w-[3.45rem] -translate-x-1/2 md:top-[calc(100%-3.62rem)] md:h-[4rem] md:w-[4rem]">
            <HomeVisualIcon icon={spot.icon} modeIcon={spot.modeIcon} />
          </span>
        </span>
      ) : null}

      <span
        data-home-hotspot-label={spot.zoneId}
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2",
          "left-[calc(50%+var(--spot-label-dx-mobile))] top-[calc(50%+var(--spot-label-dy-mobile))] w-[var(--spot-plaque-width-mobile)]",
          "md:left-[calc(50%+var(--spot-label-dx))] md:top-[calc(50%+var(--spot-label-dy))] md:w-[var(--spot-plaque-width)]",
        )}
      >
        <span
          className={cn(
            "relative flex items-center justify-center gap-1.5 rounded-[14px] border text-center shadow-[0_14px_22px_rgba(0,0,0,0.24)] backdrop-blur-xl transition duration-200 group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 md:rounded-[16px]",
            landmarkDriven ? "px-2 py-1.5 md:px-2.5 md:py-1.5 bg-[linear-gradient(180deg,rgba(10,14,21,0.66),rgba(7,10,16,0.9))]" : "px-2.5 py-1.5 md:px-3 md:py-1.5 bg-[linear-gradient(180deg,rgba(10,14,21,0.74),rgba(7,10,16,0.96))]",
            palette.ring,
          )}
        >
          <span className="absolute inset-x-[18%] top-0 h-[38%] rounded-full bg-white/10 opacity-60 blur-sm" />
          <span className={cn("absolute left-1.5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b md:h-7", palette.wash)} />
          <span className="relative min-w-0 pl-2">
            <span className="hidden truncate text-[7px] font-black uppercase tracking-[0.22em] text-white/30 md:block">{spot.sublabel}</span>
            <span className={cn("block truncate text-[9px] font-black uppercase tracking-[0.16em] drop-shadow-[0_2px_8px_rgba(255,255,255,0.16)] md:text-[11px]", palette.text)}>
              {spot.label}
            </span>
          </span>

          {spot.badge !== undefined ? (
            <span className="relative z-[1] grid min-h-[1.2rem] min-w-[1.2rem] shrink-0 place-items-center rounded-full border border-[#240d10] bg-[linear-gradient(180deg,#ff8b7d,#f14a55)] px-1 text-[8px] font-black text-white shadow-[0_0_18px_rgba(255,104,112,0.56)] md:min-h-[1.35rem] md:min-w-[1.35rem] md:text-[9px]">
              {spot.badge}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}
