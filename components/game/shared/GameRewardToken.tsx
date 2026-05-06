"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { isResourceIconKind, ResourceIcon, type ResourceIconKind } from "@/components/game/shared/ResourceIcon";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import type { GlyphKind } from "@/components/ui/GameGlyph";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";

type RewardTone = GameIconTone;
type RewardIconKind = GlyphKind | ResourceIconKind;
type ResourceBarIcon = Extract<ResourceIconKind, "gold" | "dust" | "gem" | "gems" | "tickets" | "adventure_key">;

const DEFAULT_TONE: Partial<Record<RewardIconKind, RewardTone>> = {
  gold: "gold",
  dust: "violet",
  gem: "sky",
  gems: "sky",
  shards: "violet",
  tickets: "ember",
  command: "emerald",
  rewards: "gold",
  power: "emerald",
  heroes: "violet",
};

const tokenSizeClasses = {
  sm: {
    shell: "gap-2 rounded-[18px] py-1.5 pl-1.5 pr-3",
    icon: "h-9 w-9 rounded-[15px]",
    value: "text-sm",
    label: "text-[8px]",
  },
  md: {
    shell: "gap-2.5 rounded-[22px] py-2 pl-2 pr-4",
    icon: "h-11 w-11 rounded-[18px]",
    value: "text-base",
    label: "text-[9px]",
  },
  lg: {
    shell: "gap-3 rounded-[26px] py-2.5 pl-2.5 pr-5",
    icon: "h-14 w-14 rounded-[22px]",
    value: "text-xl",
    label: "text-[10px]",
  },
};

const resourceSizeClasses = {
  sm: {
    shell: "min-h-[2.85rem] gap-1 rounded-[20px] py-1 pl-1 pr-2 sm:min-h-[3.8rem] sm:gap-2.5 sm:rounded-[24px] sm:py-2 sm:pl-2 sm:pr-4",
    iconWrap: "h-10 w-10 sm:h-14 sm:w-14",
    value: "text-sm sm:text-base",
    label: "hidden text-[8px] sm:block sm:text-[9px]",
  },
  md: {
    shell: "min-h-[2.85rem] gap-1 rounded-[20px] py-1 pl-1 pr-2 sm:min-h-[4.35rem] sm:gap-3 sm:rounded-[28px] sm:py-2.5 sm:pl-2.5 sm:pr-5",
    iconWrap: "h-10 w-10 sm:h-16 sm:w-16",
    value: "text-sm sm:text-lg",
    label: "hidden text-[8px] sm:block sm:text-[9px]",
  },
  lg: {
    shell: "min-h-[5rem] gap-3.5 rounded-[32px] py-3 pl-3 pr-6",
    iconWrap: "h-[4.6rem] w-[4.6rem]",
    value: "text-2xl",
    label: "text-[10px]",
  },
};

const resourceAura: Record<ResourceBarIcon, string> = {
  gold: "from-[#fff4bd]/48 via-[#f5c451]/20 to-transparent",
  dust: "from-[#efd4ff]/44 via-[#a66cff]/18 to-transparent",
  gem: "from-[#dcf8ff]/50 via-[#67caff]/18 to-transparent",
  gems: "from-[#dcf8ff]/50 via-[#67caff]/18 to-transparent",
  tickets: "from-[#ffe3c4]/44 via-[#ff9c5f]/18 to-transparent",
  adventure_key: "from-[#fff3b8]/48 via-[#f5c451]/20 to-transparent",
};

const resourceText: Record<ResourceBarIcon, string> = {
  gold: "text-[#ffe9a8]",
  dust: "text-[#ead3ff]",
  gem: "text-[#d9f7ff]",
  gems: "text-[#d9f7ff]",
  tickets: "text-[#ffd5a8]",
  adventure_key: "text-[#ffe9a8]",
};

function easeOutQuart(value: number) {
  return 1 - Math.pow(1 - value, 4);
}

function useAnimatedResourceValue(value: ReactNode) {
  const numericValue = typeof value === "number" && Number.isFinite(value) ? value : null;
  const [displayValue, setDisplayValue] = useState(numericValue);
  const [delta, setDelta] = useState(0);
  const previousRef = useRef<number | null>(numericValue);
  const frameRef = useRef<number | null>(null);
  const clearRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (numericValue === null) {
      previousRef.current = null;
      setDisplayValue(null);
      setDelta(0);
      return;
    }

    const previous = previousRef.current;
    if (previous === null) {
      previousRef.current = numericValue;
      setDisplayValue(numericValue);
      return;
    }
    if (previous === numericValue) return;

    const diff = numericValue - previous;
    const startedAt = performance.now();
    const duration = Math.min(1180, Math.max(520, Math.abs(diff) * 10));
    setDelta(diff);
    if (clearRef.current) window.clearTimeout(clearRef.current);
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easeOutQuart(progress);
      setDisplayValue(Math.round(previous + diff * eased));
      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        previousRef.current = numericValue;
        setDisplayValue(numericValue);
        clearRef.current = window.setTimeout(() => setDelta(0), 520);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      if (clearRef.current) window.clearTimeout(clearRef.current);
    };
  }, [numericValue]);

  return {
    displayValue: numericValue === null ? value : displayValue ?? numericValue,
    delta,
  };
}

export function GameRewardToken({
  icon,
  label,
  value,
  tone,
  size = "md",
  featured,
  className,
}: {
  icon: RewardIconKind;
  label: string;
  value: ReactNode;
  tone?: RewardTone;
  size?: keyof typeof tokenSizeClasses;
  featured?: boolean;
  className?: string;
}) {
  const classes = tokenSizeClasses[size];
  const resolvedTone = tone ?? DEFAULT_TONE[icon] ?? "gold";
  return (
    <div
      className={cn(
        "frontline-motion-reward group/reward relative isolate inline-flex items-center overflow-hidden border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(8,10,16,0.9))] shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.13)] backdrop-blur-xl",
        classes.shell,
        featured && "border-[#ffe6a8]/24 bg-[linear-gradient(180deg,rgba(255,226,158,0.14),rgba(10,11,17,0.92))] shadow-[0_18px_38px_rgba(245,196,81,0.16)]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.16),transparent_24%),linear-gradient(90deg,rgba(255,255,255,0.06),transparent_46%)] opacity-80" />
      <span className="pointer-events-none absolute inset-x-[18%] bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.24),transparent)]" />
      {isResourceIconKind(icon) ? (
        <span className={cn("relative z-[1] grid shrink-0 place-items-center transition duration-300 group-hover/reward:scale-110", classes.icon)}>
          <ResourceIcon kind={icon} size="large" className="h-[112%] w-[112%]" />
        </span>
      ) : icon === "power" ? (
        <ProgressionIcon
          name="level_up"
          size="lg"
          className={cn("relative z-[1] shrink-0 transition duration-300 group-hover/reward:scale-105", classes.icon)}
        />
      ) : icon === "rewards" ? (
        <ProgressionIcon
          name="reward_chest"
          size="lg"
          className={cn("relative z-[1] shrink-0 transition duration-300 group-hover/reward:scale-105", classes.icon)}
        />
      ) : icon === "deck" ? (
        <GameAssetIcon
          category="nav"
          name="deck"
          size="lg"
          className={cn("relative z-[1] shrink-0 transition duration-300 group-hover/reward:scale-105", classes.icon)}
          imgClassName="scale-[1.22] drop-shadow-[0_8px_14px_rgba(0,0,0,0.44)]"
        />
      ) : (
        <GameIcon
          kind={icon}
          tone={resolvedTone}
          size="lg"
          className={cn("relative z-[1] shrink-0 transition duration-300 group-hover/reward:scale-105", classes.icon)}
        />
      )}
      <div className="relative z-[1] min-w-0 leading-none">
        <div className={cn("font-black uppercase tracking-[0.16em] text-white/48", classes.label)}>{label}</div>
        <div className={cn("mt-1 truncate font-black text-white", classes.value)}>{value}</div>
      </div>
    </div>
  );
}

export function GameResourceChip({
  icon,
  label,
  value,
  size = "md",
  className,
  href,
}: {
  icon: ResourceBarIcon;
  label: string;
  value: ReactNode;
  tone?: RewardTone;
  size?: keyof typeof tokenSizeClasses;
  className?: string;
  href?: string;
}) {
  const classes = resourceSizeClasses[size];
  const { displayValue, delta } = useAnimatedResourceValue(value);
  const changeState = delta > 0 ? "gain" : delta < 0 ? "spend" : "idle";
  const content = (
    <>
      <span className={cn("pointer-events-none absolute -inset-5 rounded-[34px] bg-[radial-gradient(circle_at_28%_50%,var(--tw-gradient-stops))] opacity-80 blur-xl transition duration-300 group-hover/resource:opacity-100", resourceAura[icon])} />
      <span className="frontline-resource-impact pointer-events-none absolute -inset-3 rounded-[32px] opacity-0" />
      <span className="frontline-resource-shine pointer-events-none absolute inset-0 rounded-[inherit] opacity-0" />
      <span className="pointer-events-none absolute -left-3 top-1/2 h-[4.2rem] w-[4.2rem] -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,245,199,0.88)_18deg,transparent_34deg,transparent_82deg,rgba(255,255,255,0.72)_103deg,transparent_124deg,transparent_180deg,rgba(255,245,199,0.76)_204deg,transparent_226deg,transparent_286deg,rgba(255,255,255,0.68)_306deg,transparent_330deg)] opacity-0 blur-[0.5px] transition duration-200 group-hover/resource:opacity-100 group-hover/resource:animate-[resourceRaysSpin_1.25s_linear_infinite] sm:h-[4.8rem] sm:w-[4.8rem]" />
      <span className="pointer-events-none absolute -left-5 top-1/2 h-[5.4rem] w-[5.4rem] -translate-y-1/2 rounded-full border border-white/0 opacity-0 transition group-hover/resource:opacity-100 group-hover/resource:animate-[resourceSparkOrbit_1.8s_linear_infinite] sm:h-[6.2rem] sm:w-[6.2rem]">
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)]" />
        <span className="absolute bottom-2 right-2 h-1 w-1 rounded-full bg-[#ffe7a6] shadow-[0_0_10px_rgba(255,218,126,0.9)]" />
        <span className="absolute left-1 top-2/3 h-1 w-1 rounded-full bg-sky-100 shadow-[0_0_10px_rgba(210,244,255,0.9)]" />
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(90deg,rgba(255,255,255,0.09),transparent_42%,rgba(255,255,255,0.04))]" />
      <span className="pointer-events-none absolute inset-x-[18%] bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.34),transparent)]" />

      <span className={cn("relative z-[1] -ml-1 grid shrink-0 place-items-center transition duration-300 group-hover/resource:scale-110 group-hover/resource:drop-shadow-[0_0_18px_rgba(255,232,170,0.72)]", classes.iconWrap)}>
        <ResourceIcon kind={icon} size="large" className="h-full w-full animate-[iconBreath_4.8s_ease-in-out_infinite]" />
      </span>
      <span className="relative z-[1] min-w-0 leading-none">
        <span className={cn("block font-black uppercase tracking-[0.2em] text-white/56", classes.label)}>{label}</span>
        <span className={cn("mt-0 block font-black tracking-[0.02em] tabular-nums sm:mt-1", resourceText[icon], classes.value)}>{displayValue}</span>
      </span>
      {delta !== 0 ? (
        <span
          className={cn(
            "frontline-resource-delta-label pointer-events-none absolute right-2 top-0 z-[2] rounded-full border px-2 py-1 text-[10px] font-black tabular-nums shadow-[0_10px_26px_rgba(0,0,0,0.34)]",
            delta > 0
              ? "border-[#ffe9a8]/42 bg-[#f5c451] text-[#1f1205]"
              : "border-rose-200/30 bg-rose-500 text-white",
          )}
        >
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      ) : null}
    </>
  );
  const shellClassName = cn(
    "frontline-motion-action frontline-resource-delta group/resource relative isolate inline-flex items-center overflow-visible border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(10,11,18,0.7)_54%,rgba(6,7,12,0.92))] shadow-[0_18px_40px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition duration-300 hover:border-white/24",
    changeState === "gain" && "frontline-resource-gain",
    changeState === "spend" && "frontline-resource-spend",
    classes.shell,
    className,
  );
  const resourceTarget = icon === "gem" ? "gems" : icon;
  return href ? (
    <Link href={href} className={shellClassName} data-resource-kind={resourceTarget} data-resource-change={changeState}>
      {content}
    </Link>
  ) : (
    <div className={shellClassName} data-resource-kind={resourceTarget} data-resource-change={changeState}>
      {content}
    </div>
  );
}

export function GameResourceBar({
  resources,
  arenaTickets,
  adventureKeys,
  size = "sm",
  className,
}: {
  resources: { gold: ReactNode; dust: ReactNode; gems: ReactNode; adventureKeys?: ReactNode };
  arenaTickets?: number;
  adventureKeys?: ReactNode;
  size?: keyof typeof resourceSizeClasses;
  className?: string;
}) {
  const { t } = useI18n();
  const visibleAdventureKeys = adventureKeys;

  return (
    <div className={cn("flex min-w-0 flex-wrap items-start justify-end gap-2 md:gap-2.5", className)}>
      <GameResourceChip icon="gold" tone="gold" label={t("resources.gold")} value={resources.gold} size={size} href="/shop" />
      <GameResourceChip icon="dust" tone="violet" label={t("resources.dust")} value={resources.dust} size={size} href="/shop" />
      <GameResourceChip icon="gems" tone="sky" label={t("resources.gems")} value={resources.gems} size={size} href="/shop" />
      {typeof visibleAdventureKeys !== "undefined" && visibleAdventureKeys !== null ? (
        <GameResourceChip icon="adventure_key" tone="gold" label={t("resources.adventureKeys")} value={visibleAdventureKeys} size={size} href="/shop" />
      ) : null}
      {typeof arenaTickets === "number" ? (
        <GameResourceChip icon="tickets" tone="gold" label={t("resources.tickets")} value={arenaTickets} size={size} className="hidden sm:inline-flex" href="/shop" />
      ) : null}
    </div>
  );
}
