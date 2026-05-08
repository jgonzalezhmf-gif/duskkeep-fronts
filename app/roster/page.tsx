"use client";

import { useMemo, useState } from "react";
import SceneBackdrop from "@/components/game/screens/SceneBackdrop";
import GameBackNav from "@/components/game/shared/GameBackNav";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import HeroDetailModal from "@/components/game/HeroDetailModal";
import { HEROES } from "@/data/heroes";
import { heroUnlockLevel } from "@/data/unlocks";
import { getFrontlineHeroProfile, isFrontlineReadyHero } from "@/features/frontline/heroProfile";
import { cn } from "@/lib/cn";
import { sfx } from "@/lib/audio";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import ScreenBackground from "@/components/ui/ScreenBackground";
import type { Rarity, Role } from "@/lib/types";
import { Chip, FilterRow, HeroMetric, RosterTag } from "./RosterPrimitives";

type RarityFilter = "all" | Rarity;
type RoleFilter = "all" | Role;
type OwnedFilter = "all" | "owned" | "locked";

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

const ROLE_FILTERS: Role[] = ["tank", "fighter", "archer", "mage", "support", "summoner"];
const RARITY_FILTERS: Rarity[] = ["common", "rare", "epic", "legendary"];

function heroProgressLabel({
  owned,
  level,
  stars,
  gated,
  gate,
  shards,
  t,
}: {
  owned: boolean;
  level?: number;
  stars?: number;
  gated?: boolean;
  gate?: number | null;
  shards?: number;
  t: TranslateFn;
}) {
  if (owned) return t("rosterScreen.labels.levelStar", { level: level ?? 1, stars: stars ?? 1 });
  if (gated && gate) return t("rosterScreen.labels.unlockLevel", { level: gate });
  return t("rosterScreen.labels.shards", { current: shards ?? 0, target: 10 });
}

export default function RosterPage() {
  const { t } = useI18n();
  const heroes = useGameStore((state) => state.heroes);
  const resources = useGameStore((state) => state.resources);
  const accountLevel = useGameStore((state) => state.account.level);
  const [selected, setSelected] = useState<string | null>(null);
  const [rarity, setRarity] = useState<RarityFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [owned, setOwned] = useState<OwnedFilter>("all");

  const playerByHero = useMemo(() => new Map(heroes.map((hero) => [hero.heroId, hero] as const)), [heroes]);
  const ownedCount = heroes.filter((hero) => hero.stars > 0).length;
  const frontlineReadyCount = HEROES.filter((hero) => isFrontlineReadyHero(hero.id)).length;

  const filtered = useMemo(() => {
    return HEROES.filter((hero) => {
      if (rarity !== "all" && hero.rarity !== rarity) return false;
      if (role !== "all" && hero.role !== role) return false;
      const playerHero = playerByHero.get(hero.id);
      const isOwned = Boolean(playerHero && playerHero.stars > 0);
      if (owned === "owned" && !isOwned) return false;
      if (owned === "locked" && isOwned) return false;
      return true;
    });
  }, [owned, playerByHero, rarity, role]);

  const featured = useMemo(
    () =>
      HEROES.filter((hero) => isFrontlineReadyHero(hero.id))
        .map((hero) => ({ hero, playerHero: playerByHero.get(hero.id) }))
        .slice(0, 6),
    [playerByHero],
  );

  return (
    <div className="relative isolate min-h-dvh overflow-hidden px-3 pb-24 pt-56 sm:pt-40 md:px-6 md:pb-28 md:pt-28">
      <ScreenBackground screen="heroes" overlayIntensity="soft" fallback={<SceneBackdrop scene="roster" />} />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_22%_13%,rgba(245,196,81,0.08),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(198,154,255,0.08),transparent_26%),linear-gradient(180deg,rgba(6,8,13,0.04),rgba(6,8,13,0.3)_58%,rgba(6,8,13,0.72))]" />
      <GameBackNav />
      <GameResourceBar resources={resources} size="sm" className="pointer-events-auto fixed right-3 top-3 z-40 max-w-[calc(100vw-9rem)] md:right-5 md:top-4 md:max-w-none" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-5">
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(35,24,47,0.84),rgba(13,16,25,0.96)_46%,rgba(7,9,14,0.98)_100%)] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.38)] md:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,196,81,0.12),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(137,196,255,0.12),transparent_22%)]" />
          <div className="relative z-[1] grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(28rem,0.9fr)]">
            <div>
              <div className="inline-flex rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">
                {t("rosterScreen.heroHall")}
              </div>
              <h1 className="mt-4 max-w-[52rem] text-[2.25rem] font-black leading-[0.92] tracking-[-0.045em] text-white md:text-[4rem]">
                {t("rosterScreen.title")}
              </h1>
              <p className="mt-4 max-w-[44rem] text-[13px] leading-7 text-white/66 md:text-[15px]">
                {t("rosterScreen.copy")}
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <HeroMetric icon="heroes" label={t("rosterScreen.metrics.owned")} value={`${ownedCount}/${HEROES.length}`} />
                <HeroMetric icon="battle" label={t("rosterScreen.metrics.frontlineReady")} value={`${frontlineReadyCount}`} tone="sky" />
                <HeroMetric progressionIcon="tier_up" label={t("rosterScreen.metrics.futureTiers")} value={t("rosterScreen.metrics.staged")} tone="violet" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-2">
              {featured.slice(0, 4).map(({ hero, playerHero }) => (
                <button
                  key={`featured-${hero.id}`}
                  type="button"
                  onClick={() => {
                    sfx.tap();
                    setSelected(hero.id);
                  }}
                  className="frontline-motion-action text-left transition"
                >
                  <FrontlineHeroStandee
                    hero={getFrontlineHeroProfile(hero, playerHero)}
                    compact
                    selected={Boolean(playerHero?.stars)}
                    label={playerHero?.stars ? heroProgressLabel({ owned: true, level: playerHero.level, stars: playerHero.stars, t }) : t("rosterScreen.labels.lockedTier")}
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.94))] p-4 shadow-[0_22px_56px_rgba(0,0,0,0.28)]">
          <div className="grid gap-3 xl:grid-cols-[1fr_1fr_0.7fr]">
            <FilterRow label={t("rosterScreen.filters.rarity")}>
              <Chip active={rarity === "all"} onClick={() => setRarity("all")}>{t("rosterScreen.filters.all")}</Chip>
              {RARITY_FILTERS.map((rarityValue) => (
                <Chip key={rarityValue} active={rarity === rarityValue} onClick={() => setRarity(rarityValue)}>
                  {t(`rosterScreen.rarity.${rarityValue}`)}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label={t("rosterScreen.filters.role")}>
              <Chip active={role === "all"} onClick={() => setRole("all")}>{t("rosterScreen.filters.all")}</Chip>
              {ROLE_FILTERS.map((roleValue) => (
                <Chip key={roleValue} active={role === roleValue} onClick={() => setRole(roleValue)}>
                  {t(`rosterScreen.roles.${roleValue}`)}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label={t("rosterScreen.filters.state")}>
              <Chip active={owned === "all"} onClick={() => setOwned("all")}>{t("rosterScreen.filters.all")}</Chip>
              <Chip active={owned === "owned"} onClick={() => setOwned("owned")}>{t("rosterScreen.filters.owned")}</Chip>
              <Chip active={owned === "locked"} onClick={() => setOwned("locked")}>{t("rosterScreen.filters.locked")}</Chip>
            </FilterRow>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((hero) => {
            const playerHero = playerByHero.get(hero.id);
            const ownedHero = Boolean(playerHero && playerHero.stars > 0);
            const gate = heroUnlockLevel(hero.id);
            const gated = Boolean(gate && accountLevel < gate);
            const profile = getFrontlineHeroProfile(hero, playerHero);
            return (
              <button
                key={hero.id}
                type="button"
                onClick={() => {
                  sfx.tap();
                  setSelected(hero.id);
                }}
                className={cn("frontline-motion-action group text-left transition", !ownedHero && "opacity-82")}
              >
                <div className="relative">
                  <FrontlineHeroStandee
                    hero={profile}
                    compact
                    selected={ownedHero}
                    label={heroProgressLabel({
                      owned: ownedHero,
                      level: playerHero?.level,
                      stars: playerHero?.stars,
                      gated,
                      gate,
                      shards: playerHero?.shards,
                      t,
                    })}
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <RosterTag>{t(`rosterScreen.rarity.${hero.rarity}`)}</RosterTag>
                    <RosterTag tone={isFrontlineReadyHero(hero.id) ? "gold" : "neutral"}>
                      {isFrontlineReadyHero(hero.id) ? t("rosterScreen.labels.frontline") : t("rosterScreen.labels.reserve")}
                    </RosterTag>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {filtered.length === 0 ? (
          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#131927_0%,#0b1017_100%)] p-5 text-center text-sm text-white/60">
            {t("rosterScreen.labels.empty")}
          </section>
        ) : null}
      </div>

      {selected ? <HeroDetailModal heroId={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}
