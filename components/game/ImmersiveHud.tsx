"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import GameOptionsButton from "@/components/game/options/GameOptionsButton";
import MuteButton from "@/components/ui/MuteButton";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import FantasyCommanderBadge from "@/components/ui/fantasy/FantasyCommanderBadge";
import FantasyNavButton from "@/components/ui/fantasy/FantasyNavButton";
import { getLeader } from "@/data/leaders";
import { teamPower } from "@/features/tactical/engine";
import { getLeaderPortrait } from "@/lib/art";
import { cn } from "@/lib/cn";
import { resolveGlyphAssetIcon } from "@/lib/iconAssets";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", label: "nav.home", short: "nav.base", icon: "fortress" as const, tone: "gold" as const },
  { href: "/adventure", label: "nav.adventure", short: "nav.pve", icon: "adventure" as const, tone: "arcane" as const },
  { href: "/deck", label: "nav.deck", short: "nav.cards", icon: "deck" as const, tone: "crystal" as const },
  { href: "/fortress", label: "nav.fortress", short: "nav.core", icon: "fortress" as const, tone: "gold" as const },
  { href: "/arena", label: "nav.arena", short: "nav.pvp", icon: "arena" as const, tone: "ember" as const },
  { href: "/shop", label: "nav.market", short: "nav.shop", icon: "market" as const, tone: "jade" as const },
];

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${value}`;
}

export default function ImmersiveHud({
  dock = true,
  className,
}: {
  dock?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const resources = useGameStore((s) => s.resources);
  const account = useGameStore((s) => s.account);
  const heroes = useGameStore((s) => s.heroes);
  const team = useGameStore((s) => s.team);
  const activeLeaderId = useGameStore((s) => s.activeLeaderId);
  const leader = getLeader(activeLeaderId);
  const leaderPortrait = getLeaderPortrait(activeLeaderId);
  const progress = Math.min(100, Math.max(12, account.xp % 100 || 12));
  const rosterPower = useMemo(() => {
    const squad = team.flatMap((heroId) => {
      const hero = heroes.find((item) => item.heroId === heroId);
      return hero ? [{ heroId: hero.heroId, level: hero.level, stars: hero.stars }] : [];
    });
    return teamPower(squad);
  }, [heroes, team]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-30", className)}>
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(4,7,12,0.92),rgba(4,7,12,0.54),transparent)] md:h-36" />

      <div className="pointer-events-auto absolute left-3 top-3 md:left-5 md:top-4">
        <FantasyCommanderBadge
          name={account.name}
          level={account.level}
          xpWidth={progress}
          portrait={leaderPortrait}
          power={formatCompact(rosterPower)}
          leaderTitle={leader.title}
          groupLabel={t("home.commanderGroup")}
          levelLabel={t("common.level")}
          powerLabel={t("common.power")}
        />
      </div>

      <div className="pointer-events-auto absolute right-3 top-3 flex max-w-[calc(100vw-9rem)] items-start gap-2 md:right-5 md:top-4 md:max-w-none md:gap-2.5">
        <GameResourceBar resources={resources} size="sm" />
        <div className="pt-0.5">
          <div className="flex gap-1.5">
            <GameOptionsButton />
            <MuteButton />
          </div>
        </div>
      </div>

      {dock ? (
        <div className="pointer-events-auto absolute inset-x-3 bottom-3 md:inset-x-8 md:bottom-4">
          <div className="mx-auto max-w-[1020px]">
            <div className="relative px-2 py-2.5 md:px-4 md:py-3">
              <div
                aria-hidden
                className="absolute inset-0 border border-[#f5c451]/14 bg-[radial-gradient(circle_at_50%_0%,rgba(245,196,81,0.14),transparent_30%),linear-gradient(180deg,rgba(7,9,14,0.52),rgba(7,9,14,0.9))] shadow-[0_24px_44px_rgba(0,0,0,0.34)]"
                style={{ clipPath: "polygon(4% 0%, 96% 0%, 100% 28%, 100% 78%, 96% 100%, 4% 100%, 0% 78%, 0% 28%)" }}
              />
              <div
                aria-hidden
                className="absolute inset-x-[8%] top-0 h-10 rounded-b-[80%] bg-[linear-gradient(180deg,rgba(255,241,197,0.18),transparent)] blur-[12px]"
              />
              <div className="relative z-[1] grid grid-cols-6 gap-0.5 md:gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <FantasyNavButton
                      key={item.href}
                      href={item.href}
                      label={t(item.label)}
                      short={t(item.short)}
                      icon={item.icon}
                      tone={item.tone}
                      active={active}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pointer-events-auto absolute bottom-4 right-3 md:right-5">
          <QuickAccessRune icon="deck" href="/deck" label={t("nav.cards")} />
        </div>
      )}
    </div>
  );
}

function QuickAccessRune({ href, icon, label }: {
  href: string;
  icon: GlyphKind;
  label: string;
}) {
  const assetIcon = resolveGlyphAssetIcon(icon);

  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-[20px] border border-white/12 bg-[linear-gradient(180deg,rgba(11,15,22,0.58),rgba(5,8,13,0.9))] px-2.5 py-2 shadow-[0_16px_34px_rgba(0,0,0,0.34)] backdrop-blur-xl transition hover:border-[#f5d498]/24"
    >
      <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-visible rounded-[16px] border border-white/10 bg-[radial-gradient(circle_at_50%_28%,rgba(136,196,255,0.12),transparent_58%),linear-gradient(180deg,rgba(10,14,22,0.42),rgba(4,6,10,0.78))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {assetIcon ? (
          <GameAssetIcon
            category={assetIcon.category}
            name={assetIcon.name}
            size="xl"
            className="h-[118%] w-[118%] animate-[iconBreath_5s_ease-in-out_infinite]"
            imgClassName="scale-[1.2]"
            fallback={<GameGlyph kind={icon} shell="none" className="h-full w-full animate-[iconBreath_5s_ease-in-out_infinite]" />}
          />
        ) : (
          <GameGlyph kind={icon} shell="none" className="h-full w-full animate-[iconBreath_5s_ease-in-out_infinite]" />
        )}
      </span>
      <span
        className="hidden pr-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/76 md:block"
        style={{ clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)" }}
      >
        {label}
      </span>
    </Link>
  );
}
