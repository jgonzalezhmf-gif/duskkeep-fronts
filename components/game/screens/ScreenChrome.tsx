"use client";

import type { ReactNode } from "react";
import ImmersiveHud from "@/components/game/ImmersiveHud";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import GameBackNav from "@/components/game/shared/GameBackNav";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import ScreenBackground from "@/components/ui/ScreenBackground";
import FantasyMedallion, { type FantasyTone } from "@/components/ui/fantasy/FantasyMedallion";
import { cn } from "@/lib/cn";
import { resolveGlyphAssetIcon } from "@/lib/iconAssets";
import SceneBackdrop, { type ScreenScene } from "./SceneBackdrop";
import type { ScreenBackgroundId } from "@/lib/screenBackgroundAssets";

export function ScreenScaffold({
  scene,
  children,
  className,
  dock = true,
  homeNav,
  hud = true,
}: {
  scene: ScreenScene;
  children: ReactNode;
  className?: string;
  dock?: boolean;
  homeNav?: boolean;
  hud?: boolean;
}) {
  const showHomeNav = homeNav ?? !dock;
  const backgroundScreen = screenBackgroundForScene(scene);
  return (
    <section className={cn("relative min-h-dvh overflow-hidden bg-[#071019]", className)}>
      {backgroundScreen ? (
        <ScreenBackground
          screen={backgroundScreen}
          overlayIntensity={screenBackgroundOverlay(scene)}
          fallback={<SceneBackdrop scene={scene} />}
        />
      ) : (
        <SceneBackdrop scene={scene} />
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-[linear-gradient(180deg,rgba(7,11,18,0.9),rgba(7,11,18,0.18),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-44 bg-[linear-gradient(0deg,rgba(5,8,14,0.96),rgba(5,8,14,0.42),transparent)]" />
      <div className="pointer-events-none absolute left-[-8%] top-[14%] z-[1] h-72 w-72 rounded-full bg-sky-300/10 blur-[90px]" />
      <div className="pointer-events-none absolute right-[-6%] top-[20%] z-[1] h-72 w-72 rounded-full bg-amber-200/10 blur-[96px]" />
      {hud ? <ImmersiveHud dock={dock} /> : null}
      {showHomeNav ? <GameBackNav placement="under-hud" /> : null}
      <div className="frontline-motion-reveal relative z-10 min-h-dvh">{children}</div>
    </section>
  );
}

function screenBackgroundForScene(scene: ScreenScene): ScreenBackgroundId | null {
  if (scene === "shop") return "market";
  if (scene === "deck") return "deck";
  if (scene === "fortress") return "fortress";
  if (scene === "events") return "events";
  if (scene === "arena") return "arena";
  if (scene === "adventureMoon" || scene === "adventureAsh") return "adventure";
  if (scene === "roster") return "heroes";
  return null;
}

function screenBackgroundOverlay(scene: ScreenScene): "soft" | "medium" | "strong" {
  if (scene === "adventureMoon" || scene === "adventureAsh") return "strong";
  if (scene === "roster") return "medium";
  if (scene === "deck" || scene === "fortress") return "medium";
  return "soft";
}

export function ScreenPanel({
  children,
  className,
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "frontline-motion-surface relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,24,0.66),rgba(8,10,16,0.9))] shadow-[0_22px_54px_rgba(0,0,0,0.28)] backdrop-blur-2xl",
        accent &&
          "border-[#f5c451]/18 bg-[linear-gradient(180deg,rgba(44,28,15,0.6),rgba(10,12,18,0.92))] shadow-[0_22px_54px_rgba(245,196,81,0.1)]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,240,186,0.12),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(129,198,255,0.1),transparent_22%)]" />
      <span className="pointer-events-none absolute inset-[1px] rounded-[26px] border border-white/[0.05]" />
      <span className="pointer-events-none absolute inset-x-[14%] top-0 h-12 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)] blur-[12px]" />
      <span className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
      {children}
    </div>
  );
}

export function ScreenHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <ScreenPanel accent className={cn("px-4 py-4 md:px-5 md:py-5", className)}>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 items-center rounded-full border border-[#f5c451]/18 bg-[#f5c451]/10 px-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#f5d498]">
          {eyebrow}
        </span>
        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(245,212,152,0.44),rgba(245,212,152,0.06),transparent)]" />
      </div>
      <div className="mt-3 text-xl font-black text-white md:text-[1.9rem] md:leading-[1.02]">{title}</div>
      {description ? <p className="mt-2 text-[12px] leading-5 text-white/64 md:text-[13px] md:leading-6">{description}</p> : null}
    </ScreenPanel>
  );
}

export function SceneButton({
  children,
  className,
  icon,
  tone = "gold",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  icon?: GlyphKind;
  tone?: GameIconTone;
}) {
  return (
    <button
      {...props}
      className={cn(
        "frontline-motion-action group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-[24px] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary"
          ? "frontline-motion-cta border border-[#ffe9ad]/38 bg-[linear-gradient(180deg,#fff6cf_0%,#ffd56a_36%,#d98a24_100%)] text-[#211004] shadow-[0_20px_42px_rgba(245,196,81,0.32),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-12px_18px_rgba(105,48,8,0.22)]"
          : "border border-white/16 bg-[linear-gradient(180deg,rgba(43,49,62,0.92),rgba(10,12,19,0.98))] text-white/90 shadow-[0_16px_34px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.14)]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent_42%,transparent)] opacity-70 transition group-hover:opacity-100" />
      <span className="pointer-events-none absolute inset-y-1 left-2 w-10 rounded-full bg-white/18 blur-md" />
      <span className="pointer-events-none absolute inset-x-[12%] bottom-1 h-px bg-white/28" />
      <span className="pointer-events-none absolute inset-y-0 left-[-30%] w-[42%] skew-x-[-24deg] bg-white/22 opacity-0 blur-md transition duration-500 group-hover:left-[112%] group-hover:opacity-100" />
      {icon ? (
        <GameIcon
          kind={icon}
          tone={variant === "primary" ? tone : "steel"}
          size="sm"
          className={cn("relative z-[1] h-9 w-9 rounded-[15px]", variant === "primary" && "shadow-[0_10px_18px_rgba(0,0,0,0.2)]")}
        />
      ) : null}
      <span className="relative z-[1]">{children}</span>
    </button>
  );
}

export function ScreenBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "gold" | "emerald" | "sky" | "ember";
  className?: string;
}) {
  const toneClasses =
    tone === "gold"
      ? "bg-[#f5c451]/14 text-[#f5d498] border-[#f5c451]/18"
      : tone === "emerald"
        ? "bg-emerald-400/14 text-emerald-300 border-emerald-300/20"
        : tone === "sky"
          ? "bg-sky-400/14 text-sky-300 border-sky-300/20"
          : tone === "ember"
            ? "bg-orange-400/12 text-orange-200 border-orange-300/18"
            : "bg-white/8 text-white/70 border-white/10";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] shadow-[0_8px_18px_rgba(0,0,0,0.18)]",
        toneClasses,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SceneMetric({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: GlyphKind;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,31,0.72),rgba(9,11,18,0.92))] px-3 py-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.08),transparent_24%)]" />
      <div className="flex items-center gap-2">
        {icon ? <SceneMedallion icon={icon} className="h-10 w-10 shrink-0" /> : null}
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/42">{label}</div>
          <div className="mt-1 truncate text-base font-black text-white md:text-lg">{value}</div>
        </div>
      </div>
    </div>
  );
}

export function SceneMedallion({
  icon,
  className,
  tone = "gold",
}: {
  icon: GlyphKind;
  className?: string;
  tone?: "gold" | "sky" | "violet" | "emerald" | "ember";
}) {
  const assetIcon = resolveGlyphAssetIcon(icon);
  const fantasyTone: FantasyTone =
    tone === "sky"
      ? "crystal"
      : tone === "violet"
        ? "arcane"
        : tone === "emerald"
          ? "jade"
          : tone === "ember"
            ? "ember"
            : "gold";
  return (
    <FantasyMedallion tone={fantasyTone} size="md" className={className}>
      {assetIcon ? (
        <GameAssetIcon
          category={assetIcon.category}
          name={assetIcon.name}
          size="xl"
          className="h-full w-full"
          fallback={<GameGlyph kind={icon} shell="none" className="h-full w-full" />}
        />
      ) : (
        <GameGlyph kind={icon} shell="none" className="h-full w-full" />
      )}
    </FantasyMedallion>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  aside,
  className,
}: {
  eyebrow: string;
  title: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-[#f5d498]">{eyebrow}</div>
        <div className="mt-1 text-lg font-black text-white md:text-2xl">{title}</div>
      </div>
      {aside}
    </div>
  );
}
