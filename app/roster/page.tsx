"use client";

import { useEffect, useMemo, useState } from "react";
import SceneBackdrop from "@/components/game/screens/SceneBackdrop";
import GameBackNav from "@/components/game/shared/GameBackNav";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import HeroDetailModal from "@/components/game/HeroDetailModal";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { HEROES } from "@/data/heroes";
import { heroUnlockLevel } from "@/data/unlocks";
import { getFrontlineHeroProfile, isFrontlineReadyHero } from "@/features/frontline/heroProfile";
import { cn } from "@/lib/cn";
import { sfx } from "@/lib/audio";
import { useI18n } from "@/lib/i18n/useI18n";
import { isPlayerHeroUnlocked } from "@/lib/playerHeroOwnership";
import { useGameStore } from "@/lib/store";
import ScreenBackground from "@/components/ui/ScreenBackground";
import type { Rarity, Role } from "@/lib/types";
import {
  buildRosterCombatSquadSlots,
  buildRosterOverview,
  DEFAULT_ROSTER_OWNED_FILTER,
  FRONTLINE_COMBAT_SLOT_COUNT,
} from "./rosterPageHelpers";
import { Chip, CompanySeal, FilterRow, HeroMetric, RoleSigil, RosterTag } from "./RosterPrimitives";

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

function LockedHeroCard({
  progress,
  rarity,
  role,
  frontline,
  t,
}: {
  progress: string;
  rarity: string;
  role: string;
  frontline: boolean;
  t: TranslateFn;
}) {
  return (
    <div
      className="group/locked relative isolate min-h-[14rem] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_50%_14%,rgba(148,163,184,0.16),transparent_34%),linear-gradient(180deg,rgba(27,31,42,0.84),rgba(7,9,14,0.98))] p-3 text-left shadow-[0_20px_44px_rgba(0,0,0,0.26)]"
      aria-label={`${t("rosterScreen.labels.lockedHero")} - ${progress}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%,rgba(0,0,0,0.42))]" />
      <span className="pointer-events-none absolute inset-x-6 top-1/2 h-px bg-white/10" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/12 bg-black/24" />
      <div className="relative z-[1] flex items-start justify-between gap-2">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">{progress}</div>
          <div className="mt-1 text-lg font-black leading-tight text-white/78">{t("rosterScreen.labels.lockedHero")}</div>
          <div className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/38">{t("rosterScreen.labels.hiddenUntilUnlock")}</div>
        </div>
        <ProgressionIcon name="unlock" size="sm" className="opacity-70 grayscale" />
      </div>
      <div className="relative z-[1] mt-5 grid place-items-center py-5">
        <div className="grid h-20 w-20 place-items-center rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_42%_28%,rgba(255,255,255,0.16),rgba(0,0,0,0.34))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <ProgressionIcon name="unlock" size="lg" className="opacity-80 grayscale" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        <RosterTag>{rarity}</RosterTag>
        <RosterTag>{role}</RosterTag>
        <RosterTag tone={frontline ? "gold" : "neutral"}>
          {frontline ? t("rosterScreen.labels.frontline") : t("rosterScreen.labels.reserve")}
        </RosterTag>
      </div>
    </div>
  );
}

export default function RosterPage() {
  const { t } = useI18n();
  const [clientReady, setClientReady] = useState(false);
  const heroes = useGameStore((state) => state.heroes);
  const resources = useGameStore((state) => state.resources);
  const accountLevel = useGameStore((state) => state.account.level);
  const frontlineLoadout = useGameStore((state) => state.frontlineLoadout);
  const [selected, setSelected] = useState<string | null>(null);
  const [rarity, setRarity] = useState<RarityFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [owned, setOwned] = useState<OwnedFilter>(DEFAULT_ROSTER_OWNED_FILTER);

  const playerByHero = useMemo(() => new Map(heroes.map((hero) => [hero.heroId, hero] as const)), [heroes]);
  const rosterOverview = useMemo(
    () =>
      buildRosterOverview({
        heroes: HEROES,
        playerByHero,
        isFrontlineReady: isFrontlineReadyHero,
      }),
    [playerByHero],
  );

  const filtered = useMemo(() => {
    return HEROES.filter((hero) => {
      if (rarity !== "all" && hero.rarity !== rarity) return false;
      if (role !== "all" && hero.role !== role) return false;
      const playerHero = playerByHero.get(hero.id);
      const isOwned = isPlayerHeroUnlocked(playerHero);
      if (owned === "owned" && !isOwned) return false;
      if (owned === "locked" && isOwned) return false;
      return true;
    });
  }, [owned, playerByHero, rarity, role]);

  const activeSquadSlots = useMemo(
    () =>
      buildRosterCombatSquadSlots({
        heroes: HEROES,
        playerByHero,
        squad: frontlineLoadout.squad,
      }),
    [frontlineLoadout.squad, playerByHero],
  );
  const activeSquadCount = activeSquadSlots.filter((slot) => slot.owned).length;

  useEffect(() => {
    setClientReady(true);
  }, []);

  return (
    <div className="relative isolate min-h-dvh overflow-hidden px-3 pb-24 pt-56 sm:pt-40 md:px-6 md:pb-28 md:pt-28">
      <ScreenBackground screen="heroes" overlayIntensity="soft" fallback={<SceneBackdrop scene="roster" />} />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_22%_13%,rgba(245,196,81,0.08),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(198,154,255,0.08),transparent_26%),linear-gradient(180deg,rgba(6,8,13,0.04),rgba(6,8,13,0.3)_58%,rgba(6,8,13,0.72))]" />
      <GameBackNav />
      <GameResourceBar resources={resources} size="sm" className="pointer-events-auto fixed right-3 top-3 z-40 max-w-[calc(100vw-9rem)] md:right-5 md:top-4 md:max-w-none" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-5">
        {!clientReady ? (
          <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(35,24,47,0.78),rgba(13,16,25,0.94)_48%,rgba(7,9,14,0.96)_100%)] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.38)] md:p-6" aria-busy="true">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,196,81,0.1),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(137,196,255,0.1),transparent_22%)]" />
            <div className="relative z-[1]">
              <div className="h-7 w-32 rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10" />
              <div className="mt-5 h-12 max-w-[34rem] rounded-full bg-white/[0.07]" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="h-44 rounded-[26px] border border-white/10 bg-white/[0.045]" />
                <div className="h-44 rounded-[26px] border border-white/10 bg-white/[0.045]" />
                <div className="h-44 rounded-[26px] border border-white/10 bg-white/[0.045]" />
                <div className="h-44 rounded-[26px] border border-white/10 bg-white/[0.045]" />
              </div>
            </div>
          </section>
        ) : (
          <>
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
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <HeroMetric icon="heroes" label={t("rosterScreen.metrics.owned")} value={`${rosterOverview.ownedCount}/${rosterOverview.total}`} />
                <HeroMetric icon="battle" label={t("rosterScreen.metrics.frontlineReady")} value={`${rosterOverview.frontlineOwnedCount}/${rosterOverview.frontlineReadyCount}`} tone="sky" />
                <HeroMetric progressionIcon="tier_up" label={t("rosterScreen.metrics.locked")} value={`${rosterOverview.lockedCount}`} tone="violet" />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {rosterOverview.roles.map((entry) => (
                  <RoleSigil
                    key={entry.role}
                    role={entry.role}
                    label={t(`rosterScreen.roles.${entry.role}`)}
                    owned={entry.owned}
                    total={entry.total}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <CompanySeal
                eyebrow={t("rosterScreen.company.eyebrow")}
                title={t("rosterScreen.company.title")}
                value={t("rosterScreen.company.value", {
                  owned: activeSquadCount,
                  total: FRONTLINE_COMBAT_SLOT_COUNT,
                })}
                ready={activeSquadCount >= FRONTLINE_COMBAT_SLOT_COUNT}
              />
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
                    {t("rosterScreen.company.bench")}
                  </div>
                  <RosterTag tone="gold">{`${activeSquadCount}/${FRONTLINE_COMBAT_SLOT_COUNT}`}</RosterTag>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {activeSquadSlots.map((slot) => (
                    slot.hero && slot.playerHero ? (
                      <button
                        key={`squad-${slot.slot}-${slot.hero.id}`}
                        type="button"
                        onClick={() => {
                          sfx.tap();
                          setSelected(slot.hero?.id ?? null);
                        }}
                        className="frontline-motion-action text-left transition"
                      >
                        <FrontlineHeroStandee
                          hero={getFrontlineHeroProfile(slot.hero, slot.playerHero)}
                          compact
                          selected
                          label={heroProgressLabel({ owned: true, level: slot.playerHero.level, stars: slot.playerHero.stars, t })}
                        />
                      </button>
                    ) : (
                      <FrontlineHeroStandee
                        key={`squad-${slot.slot}-empty`}
                        hero={null}
                        compact
                        emptyLabel={t("rosterScreen.labels.emptySquadSlot")}
                      />
                    )
                  ))}
                </div>
              </div>
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
            const ownedHero = isPlayerHeroUnlocked(playerHero);
            const gate = heroUnlockLevel(hero.id);
            const gated = Boolean(gate && accountLevel < gate);
            const profile = getFrontlineHeroProfile(hero, playerHero);
            const progressLabel = heroProgressLabel({
              owned: ownedHero,
              level: playerHero?.level,
              stars: playerHero?.stars,
              gated,
              gate,
              shards: playerHero?.shards,
              t,
            });
            if (!ownedHero) {
              return (
                <LockedHeroCard
                  key={hero.id}
                  progress={progressLabel}
                  rarity={t(`rosterScreen.rarity.${hero.rarity}`)}
                  role={t(`rosterScreen.roles.${hero.role}`)}
                  frontline={isFrontlineReadyHero(hero.id)}
                  t={t}
                />
              );
            }

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
                    selected
                    label={progressLabel}
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
          </>
        )}
      </div>

      {selected ? <HeroDetailModal heroId={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}
