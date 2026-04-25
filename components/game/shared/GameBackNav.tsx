"use client";

import Link from "next/link";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import type { GlyphKind } from "@/components/ui/GameGlyph";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";

export default function GameBackNav({
  href = "/",
  label = "Home",
  eyebrow = "Return",
  icon = "fortress",
  tone = "gold",
  className,
  fixed = true,
  placement = "top-left",
}: {
  href?: string;
  label?: string;
  eyebrow?: string;
  icon?: GlyphKind;
  tone?: GameIconTone;
  className?: string;
  fixed?: boolean;
  placement?: "top-left" | "under-hud";
}) {
  const { t } = useI18n();
  const fixedClass =
    !fixed
      ? ""
      : placement === "under-hud"
        ? "fixed left-3 top-[5.85rem] md:left-5 md:top-[6.4rem]"
        : "fixed left-3 top-3 md:left-5 md:top-5";

  return (
    <Link
      href={href}
      className={cn(
        "frontline-motion-action group z-40 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(11,15,23,0.78),rgba(6,8,13,0.94))] py-1.5 pl-1.5 pr-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:border-[#f5c451]/24 hover:shadow-[0_20px_44px_rgba(245,196,81,0.12)]",
        fixedClass,
        className,
      )}
    >
      <GameIcon kind={icon} tone={tone} size="md" className="transition group-hover:scale-105" />
      <span className="leading-none">
        <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-white/42">{eyebrow === "Return" ? t("common.return") : eyebrow}</span>
        <span className="mt-1 block text-[12px] font-black uppercase tracking-[0.16em] text-white/84">{label === "Home" ? t("common.home") : label}</span>
      </span>
    </Link>
  );
}
