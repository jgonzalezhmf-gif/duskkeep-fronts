"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { FrontlineCardView, FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import GameBackNav from "@/components/game/shared/GameBackNav";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import {
  ScreenBadge,
  ScreenPanel,
  ScreenScaffold,
  SectionTitle,
} from "@/components/game/screens/ScreenChrome";
import {
  FRONTLINE_CARD_BY_ID,
  FRONTLINE_LEADER_BY_ID,
  FRONTLINE_LEADERS,
} from "@/features/frontline/data";
import { getFrontlineHeroProfileById } from "@/features/frontline/heroProfile";
import type { FrontlineHeroDef } from "@/features/frontline/types";
import { createFrontlineCardProfileMap } from "@/features/frontline/cardProgression";
import { cn } from "@/lib/cn";
import { frontlineLeaderName, frontlineLeaderPowerDescription, frontlineLeaderPowerName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";

type TempoKey = "strike" | "control" | "support" | "balanced";

function squadScore(squad: Array<FrontlineHeroDef | null>) {
  return squad.reduce((total, hero) => {
    return total + (hero ? hero.maxHp + hero.atk * 3 + hero.def * 4 + hero.speed : 0);
  }, 0);
}

function packageProfile(deckIds: string[], cardProfiles: ReturnType<typeof createFrontlineCardProfileMap>) {
  const cards = deckIds.map((id) => cardProfiles[id] ?? FRONTLINE_CARD_BY_ID[id]).filter(Boolean);
  const orders = cards.filter((card) => card.kind === "order").length;
  const tactics = cards.filter((card) => card.kind === "tactic").length;
  const summons = cards.filter((card) => card.kind === "summon").length;
  const curve = cards.reduce((sum, card) => sum + card.cost, 0);
  const tempoKey: TempoKey =
    orders >= 4
      ? "strike"
      : tactics >= 3
        ? "control"
        : summons >= 3
          ? "support"
          : "balanced";
  return { cards, orders, tactics, summons, curve, tempoKey };
}

export default function TeamPage() {
  const { t } = useI18n();
  const resources = useGameStore((state) => state.resources);
  const loadout = useGameStore((state) => state.frontlineLoadout);
  const playerHeroes = useGameStore((state) => state.heroes);
  const frontlineCardLevels = useGameStore((state) => state.frontlineCardLevels);
  const playerHeroById = useMemo(() => new Map(playerHeroes.map((hero) => [hero.heroId, hero] as const)), [playerHeroes]);
  const cardProfiles = useMemo(() => createFrontlineCardProfileMap(frontlineCardLevels), [frontlineCardLevels]);
  const squad = loadout.squad.map((id) => (id ? getFrontlineHeroProfileById(id, playerHeroById.get(id)) : null));
  const leader = FRONTLINE_LEADER_BY_ID[loadout.leaderId] ?? FRONTLINE_LEADERS[0];
  const deckIds = loadout.deck.filter(Boolean) as string[];
  const profile = packageProfile(deckIds, cardProfiles);
  const tempo = t(`teamScreen.tempo.${profile.tempoKey}`);
  const ready = squad.filter(Boolean).length === 3 && deckIds.length === 8;
  const power = squadScore(squad);
  const leaderName = frontlineLeaderName(t, leader);
  const leaderPowerName = frontlineLeaderPowerName(t, leader);
  const leaderPowerDescription = frontlineLeaderPowerDescription(t, leader);

  return (
    <ScreenScaffold scene="deck" dock={false} homeNav={false} hud={false}>
      <TeamTopChrome resources={resources} t={t} />
      <div className="absolute inset-x-3 bottom-4 top-20 z-20 overflow-y-auto md:inset-x-8 md:top-24">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-4 pb-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <ScreenPanel className="overflow-hidden p-4 md:p-5">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(101,210,200,0.16),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(245,196,81,0.14),transparent_24%)]" />
              <div className="relative z-[1]">
                <div className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
                  {t("teamScreen.hero.badge")}
                </div>
                <h1 className="mt-4 max-w-[56rem] text-[1.95rem] font-black leading-[0.92] tracking-[-0.045em] text-white md:text-[2.85rem]">
                  {t("teamScreen.hero.title")}
                </h1>
                <p className="mt-3 max-w-[45rem] text-[13px] leading-6 text-white/64 md:text-[14px]">
                  {t("teamScreen.hero.copy")}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                  <TeamMetric icon="team" label={t("teamScreen.metrics.squad")} value={`${squad.filter(Boolean).length}/3`} tone={ready ? "emerald" : "ember"} active={ready} />
                  <TeamMetric icon="power" label={t("teamScreen.metrics.power")} value={power} tone="gold" />
                  <TeamMetric icon="deck" label={t("teamScreen.metrics.cards")} value={`${deckIds.length}/8`} tone={deckIds.length === 8 ? "sky" : "ember"} />
                  <TeamMetric icon="battle" label={t("teamScreen.metrics.plan")} value={tempo} tone="violet" />
                </div>
              </div>
            </ScreenPanel>

            <ScreenPanel className="p-4">
              <SectionTitle
                eyebrow={t("teamScreen.doctrine.eyebrow")}
                title={leaderName}
                aside={<ScreenBadge tone={ready ? "gold" : "ember"}>{ready ? t("teamScreen.doctrine.ready") : t("teamScreen.doctrine.incomplete")}</ScreenBadge>}
              />
              <div className="mt-4 rounded-[24px] border border-[#f5c451]/18 bg-[#f5c451]/10 p-4">
                <div className="flex items-center gap-3">
                  <GameIcon kind="battle" tone="gold" size="lg" />
                  <div>
                    <div className="text-lg font-black text-white">{leaderPowerName}</div>
                    <div className="mt-1 text-[12px] leading-5 text-white/58">{leaderPowerDescription}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                <LinkButton href="/deck" icon="deck" label={t("teamScreen.doctrine.editDeck")} />
                <LinkButton href="/roster" icon="heroes" label={t("teamScreen.doctrine.viewHeroes")} variant="secondary" />
              </div>
            </ScreenPanel>
          </div>

          <ScreenPanel className="p-4 md:p-5">
            <SectionTitle
              eyebrow={t("teamScreen.assignment.eyebrow")}
              title={t("teamScreen.assignment.title")}
              aside={<ScreenBadge tone="sky">{t("teamScreen.assignment.summary")}</ScreenBadge>}
            />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {squad.map((hero, index) => (
                <FrontlineHeroStandee
                  key={`${hero?.heroId ?? "empty"}-${index}`}
                  hero={hero}
                  selected={Boolean(hero)}
                  side="ally"
                  label={index === 0 ? t("teamScreen.assignment.left") : index === 1 ? t("teamScreen.assignment.center") : t("teamScreen.assignment.right")}
                  emptyLabel={index === 0 ? t("teamScreen.assignment.emptyLeft") : index === 1 ? t("teamScreen.assignment.emptyCenter") : t("teamScreen.assignment.emptyRight")}
                />
              ))}
            </div>
          </ScreenPanel>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <ScreenPanel className="p-4 md:p-5">
              <SectionTitle eyebrow={t("teamScreen.package.eyebrow")} title={tempo} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <BuildStat label={t("teamScreen.package.orders")} value={profile.orders} tone="sky" icon="deck" />
                <BuildStat label={t("teamScreen.package.tactics")} value={profile.tactics} tone="gold" icon="deck" />
                <BuildStat label={t("teamScreen.package.summons")} value={profile.summons} tone="emerald" icon="heroes" />
                <BuildStat label={t("teamScreen.package.commandCurve")} value={profile.curve} tone="violet" icon="power" />
              </div>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-[13px] leading-6 text-white/62">
                {t("teamScreen.package.healthCheck")}
              </div>
            </ScreenPanel>

            <ScreenPanel className="p-4 md:p-5">
              <SectionTitle
                eyebrow={t("teamScreen.cards.eyebrow")}
                title={t("teamScreen.cards.title")}
                aside={<ScreenBadge tone={deckIds.length === 8 ? "gold" : "ember"}>{deckIds.length}/8</ScreenBadge>}
              />
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {profile.cards.length ? (
                  profile.cards.map((card) => (
                    <FrontlineCardView key={card.id} card={card} compact selected status={t("teamScreen.cards.inPackage")} />
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-white/12 bg-white/[0.03] p-5 text-[13px] leading-6 text-white/54 md:col-span-2 xl:col-span-4">
                    {t("teamScreen.cards.empty")}
                  </div>
                )}
              </div>
            </ScreenPanel>
          </div>
        </div>
      </div>
    </ScreenScaffold>
  );
}

function TeamTopChrome({ resources, t }: { resources: { gold: number; dust: number; gems: number }; t: (key: string) => string }) {
  return (
    <>
      <GameBackNav label={t("common.home")} eyebrow={t("nav.team")} icon="fortress" tone="gold" placement="top-left" />
      <div className="pointer-events-auto fixed right-3 top-3 z-40 flex items-center gap-1.5 md:right-5 md:top-4 md:gap-2">
        <GameResourceBar resources={resources} size="sm" className="max-w-[calc(100vw-9rem)] md:max-w-none" />
      </div>
    </>
  );
}

function LinkButton({
  href,
  icon,
  label,
  variant = "primary",
}: {
  href: string;
  icon: "deck" | "heroes";
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link href={href} className="block">
      <span
        className={cn(
          "group relative isolate flex items-center justify-center gap-2 overflow-hidden rounded-[22px] border px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition hover:-translate-y-0.5",
          variant === "primary"
            ? "border-[#f8d57b]/30 bg-[linear-gradient(180deg,#fff0bc_0%,#f5c451_44%,#d18c25_100%)] text-[#241102] shadow-[0_18px_38px_rgba(245,196,81,0.26)]"
            : "border-white/12 bg-[linear-gradient(180deg,rgba(24,29,40,0.84),rgba(9,11,18,0.96))] text-white/86 shadow-[0_16px_30px_rgba(0,0,0,0.28)]",
        )}
      >
        <GameIcon kind={icon} tone={variant === "primary" ? "gold" : "sky"} size="sm" className="h-8 w-8 rounded-[13px] p-1" />
        {label}
      </span>
    </Link>
  );
}

function TeamMetric({
  icon,
  label,
  value,
  tone,
  active,
}: {
  icon: "team" | "power" | "deck" | "battle";
  label: string;
  value: string | number;
  tone: GameIconTone;
  active?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-[20px] border px-3 py-2.5", active ? "border-cyan-200/22 bg-cyan-300/10" : "border-white/10 bg-white/[0.045]")}>
      <GameIcon kind={icon} tone={tone} size="sm" />
      <div className="min-w-0">
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
        <div className="mt-0.5 truncate text-base font-black text-white">{value}</div>
      </div>
    </div>
  );
}

function BuildStat({ label, value, tone, icon }: { label: string; value: number; tone: GameIconTone; icon: "deck" | "heroes" | "power" }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
          <div className="mt-1 text-2xl font-black text-white">{value}</div>
        </div>
        <GameIcon kind={icon} tone={tone} size="sm" />
      </div>
    </div>
  );
}
