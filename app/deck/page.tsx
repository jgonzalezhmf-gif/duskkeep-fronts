"use client";

import { useMemo, type ReactNode } from "react";
import ArtPortrait from "@/components/ui/ArtPortrait";
import SceneBackdrop from "@/components/game/screens/SceneBackdrop";
import ScreenBackground from "@/components/ui/ScreenBackground";
import { CardTypeIcon, type CardTypeIconName } from "@/components/game/shared/CardTypeIcon";
import GameBackNav from "@/components/game/shared/GameBackNav";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import GameGlyph from "@/components/ui/GameGlyph";
import { FrontlineCardView, FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import {
  FRONTLINE_CARD_BY_ID,
  FRONTLINE_CARD_POOL,
  FRONTLINE_HERO_BY_ID,
  FRONTLINE_HEROES,
  FRONTLINE_LEADERS,
} from "@/features/frontline/data";
import type { FrontlineHeroDef } from "@/features/frontline/types";
import {
  FRONTLINE_CARD_MAX_LEVEL,
  createFrontlineCardProfileMap,
  frontlineCardUpgradeCost,
  getFrontlineCardLevel,
  isFrontlineCardUnlocked,
} from "@/features/frontline/cardProgression";
import { getFrontlineCardUnlockSource } from "@/features/frontline/cardUnlockSources";
import { getFrontlineHeroProfileById } from "@/features/frontline/heroProfile";
import type { FrontlineCardDef } from "@/features/frontline/types";
import { getLeaderPortrait } from "@/lib/art";
import { cn } from "@/lib/cn";
import { frontlineCardEffectSummary, frontlineCardKindLabel, frontlineCardName, frontlineLeaderName, frontlineLeaderPowerName, frontlineLeaderTitle } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function buildPlan(
  leaderId: string,
  squadIds: Array<string | null>,
  deckIds: string[],
  t: TranslateFn,
) {
  const heroes = squadIds
    .map((id) => (id ? FRONTLINE_HERO_BY_ID[id] : null))
    .filter((hero): hero is FrontlineHeroDef => Boolean(hero));
  const counts = {
    orders: deckIds.filter((id) => FRONTLINE_CARD_BY_ID[id]?.kind === "order").length,
    tactics: deckIds.filter((id) => FRONTLINE_CARD_BY_ID[id]?.kind === "tactic").length,
    summons: deckIds.filter((id) => FRONTLINE_CARD_BY_ID[id]?.kind === "summon").length,
  };
  const roles = heroes.map((hero) => hero.role.toLowerCase()).join(" ");
  const leader = FRONTLINE_LEADERS.find((entry) => entry.id === leaderId);
  const leaderName = frontlineLeaderName(t, leader);

  let doctrine = t("deckScreen.buildPlan.flexibleDoctrine");
  let plan = t("deckScreen.buildPlan.flexiblePlan");
  if (roles.includes("tank") && roles.includes("healer")) {
    doctrine = t("deckScreen.buildPlan.stableDoctrine", { leader: leaderName || t("deckScreen.metrics.leader") });
    plan = t("deckScreen.buildPlan.stablePlan");
  } else if (roles.includes("finisher") || roles.includes("archer")) {
    doctrine = t("deckScreen.buildPlan.burstDoctrine", { leader: leaderName || t("deckScreen.metrics.leader") });
    plan = t("deckScreen.buildPlan.burstPlan");
  }
  if (counts.summons >= 2) {
    plan += t("deckScreen.buildPlan.summonAddon");
  }
  return { doctrine, plan, counts };
}

export default function DeckPage() {
  const { t } = useI18n();
  const loadout = useGameStore((state) => state.frontlineLoadout);
  const resources = useGameStore((state) => state.resources);
  const playerHeroes = useGameStore((state) => state.heroes);
  const frontlineCardUnlocks = useGameStore((state) => state.frontlineCardUnlocks);
  const frontlineCardLevels = useGameStore((state) => state.frontlineCardLevels);
  const setLeader = useGameStore((state) => state.setFrontlineLeader);
  const setSquadSlot = useGameStore((state) => state.setFrontlineSquadSlot);
  const toggleDeckCard = useGameStore((state) => state.toggleFrontlineDeckCard);
  const upgradeFrontlineCard = useGameStore((state) => state.upgradeFrontlineCard);

  const selectedDeck = loadout.deck.filter(Boolean) as string[];
  const selectedDeckSet = new Set(selectedDeck);
  const cardProfiles = useMemo(() => createFrontlineCardProfileMap(frontlineCardLevels), [frontlineCardLevels]);
  const orderedCardPool = [
    ...FRONTLINE_CARD_POOL.filter((cardId) => selectedDeckSet.has(cardId)),
    ...FRONTLINE_CARD_POOL.filter((cardId) => !selectedDeckSet.has(cardId) && isFrontlineCardUnlocked(frontlineCardUnlocks, cardId)),
    ...FRONTLINE_CARD_POOL.filter((cardId) => !selectedDeckSet.has(cardId) && !isFrontlineCardUnlocked(frontlineCardUnlocks, cardId)),
  ];
  const playerHeroById = useMemo(() => new Map(playerHeroes.map((hero) => [hero.heroId, hero] as const)), [playerHeroes]);
  const squadHeroes = loadout.squad.map((id) => (id ? getFrontlineHeroProfileById(id, playerHeroById.get(id)) : null));
  const leader = FRONTLINE_LEADERS.find((entry) => entry.id === loadout.leaderId) ?? FRONTLINE_LEADERS[0];
  const leaderName = frontlineLeaderName(t, leader);
  const leaderTitle = frontlineLeaderTitle(t, leader);
  const leaderPowerName = frontlineLeaderPowerName(t, leader);
  const squadReady = squadHeroes.filter(Boolean).length === 3;
  const deckReady = selectedDeck.length === 8;
  const plan = buildPlan(loadout.leaderId, loadout.squad, selectedDeck, t);

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-[#071019]">
      <ScreenBackground screen="deck" overlayIntensity="medium" fallback={<SceneBackdrop scene="deck" />} />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_14%,rgba(245,196,81,0.09),transparent_24%),linear-gradient(180deg,rgba(5,7,12,0.08),rgba(5,7,12,0.34)_62%,rgba(5,7,12,0.7))]" />
      <GameBackNav />
      <GameResourceBar resources={resources} size="sm" className="pointer-events-auto fixed right-3 top-3 z-40 max-w-[calc(100vw-9rem)] md:right-5 md:top-4 md:max-w-none" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-3 px-3 pb-16 pt-28 sm:pt-28 md:px-6 md:pb-20 md:pt-[5.5rem] xl:px-8">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(45,34,29,0.68),rgba(15,18,28,0.82)_36%,rgba(8,10,16,0.9)_76%)] shadow-[0_22px_56px_rgba(0,0,0,0.3)]">
        <div className="relative z-[1] px-3 py-3 md:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-[46rem]">
              <div className="inline-flex rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
                {t("deckScreen.frontlineLoadout")}
              </div>
              <div className="mt-2 text-[1.7rem] font-black leading-[0.94] text-white md:text-[2.55rem]">
                {t("deckScreen.frontlineLoadout")}
              </div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-4">
              <Metric label={t("deckScreen.metrics.leader")} value={leaderName} ok t={t} />
              <Metric label={t("deckScreen.metrics.squad")} value={`${squadHeroes.filter(Boolean).length}/3`} ok={squadReady} t={t} />
              <Metric label={t("deckScreen.metrics.deck")} value={`${selectedDeck.length}/8`} ok={deckReady} t={t} />
              <Metric label={t("deckScreen.metrics.package")} value={`${plan.counts.orders} / ${plan.counts.tactics} / ${plan.counts.summons}`} ok t={t} />
            </div>
          </div>

          <div className="mt-3 grid items-start gap-3 xl:grid-cols-[12rem_minmax(0,1fr)_17rem]">
            <Panel title={t("deckScreen.panels.leaderDoctrine")}>
              <div className="rounded-[20px] border border-[#f5c451]/20 bg-[linear-gradient(180deg,rgba(245,196,81,0.1),rgba(20,16,18,0.82))] p-2.5">
                <ArtPortrait
                  src={getLeaderPortrait(leader.id)}
                  alt={leaderName}
                  className="aspect-[4/4.6] w-full rounded-[20px] border border-white/10 bg-black/20"
                  fallback={<GameGlyph kind="battle" shell="none" className="h-8 w-8" />}
                />
                <div className="mt-2 text-base font-black text-white">{leaderName}</div>
                <div className="mt-1 text-[12px] text-white/58">{leaderTitle}</div>
                <div className="mt-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-white/70">
                  {leaderPowerName}
                </div>
              </div>

              <div className="mt-2 grid gap-1.5">
                {FRONTLINE_LEADERS.map((option) => {
                  const active = option.id === leader.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setLeader(option.id)}
                      className={cn(
                        "frontline-motion-tab rounded-[14px] border px-3 py-1.5 text-left transition",
                        active
                          ? "border-[#f5c451]/24 bg-[#f5c451]/10"
                          : "border-white/10 bg-white/[0.03]",
                      )}
                    >
                      <div className="text-sm font-black text-white">{frontlineLeaderName(t, option)}</div>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel title={t("deckScreen.panels.frontSquad")}>
              <div className="grid gap-3 md:grid-cols-3">
                {squadHeroes.map((hero, index) => (
                  <FrontlineHeroStandee
                    key={`slot-${index}`}
                    hero={hero}
                    selected={Boolean(hero)}
                    compact
                    label={index === 0 ? t("deckScreen.lanes.leftPressure") : index === 1 ? t("deckScreen.lanes.centerAnchor") : t("deckScreen.lanes.rightPressure")}
                    emptyLabel={index === 0 ? t("deckScreen.lanes.pickLeft") : index === 1 ? t("deckScreen.lanes.pickCenter") : t("deckScreen.lanes.pickRight")}
                    className="min-h-[10.25rem] p-2"
                  />
                ))}
              </div>

              <div className="mt-3 rounded-[18px] border border-white/10 bg-white/[0.035] p-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="mr-auto text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{t("deckScreen.buildPlan.eyebrow")}</div>
                  <BuildPill icon="order" label={t("deckScreen.cardTypes.orders")} value={plan.counts.orders} />
                  <BuildPill icon="tactic" label={t("deckScreen.cardTypes.tactics")} value={plan.counts.tactics} />
                  <BuildPill icon="summon" label={t("deckScreen.cardTypes.summons")} value={plan.counts.summons} />
                </div>
              </div>

            </Panel>

            <Panel title={t("deckScreen.panels.selectedPackage")}>
              <div className="grid gap-1.5">
                {selectedDeck.length ? (
                  selectedDeck.map((cardId) => {
                    const card = cardProfiles[cardId] ?? FRONTLINE_CARD_BY_ID[cardId];
                    return <SelectedPackageRow key={`selected-${card.id}`} card={card} t={t} />;
                  })
                ) : (
                  <div className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-[13px] leading-6 text-white/54">
                    {t("deckScreen.package.empty")}
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(8,10,16,0.92))] p-3 shadow-[0_22px_48px_rgba(0,0,0,0.26)] md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f5d498]">{t("deckScreen.pool.eyebrow")}</div>
            <div className="mt-1 text-sm text-white/62">{t("deckScreen.pool.copy")}</div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/62">
            {t("deckScreen.pool.selected", { count: selectedDeck.length })}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {orderedCardPool.map((cardId) => {
            const card = cardProfiles[cardId] ?? FRONTLINE_CARD_BY_ID[cardId];
            const unlocked = isFrontlineCardUnlocked(frontlineCardUnlocks, card.id);
            const active = selectedDeckSet.has(card.id);
            const level = getFrontlineCardLevel(frontlineCardLevels, card.id);
            const cost = frontlineCardUpgradeCost(level);
            const canUpgrade = unlocked && level < FRONTLINE_CARD_MAX_LEVEL && resources.gold >= cost.gold && resources.dust >= cost.dust;
            const unlockSource = getFrontlineCardUnlockSource(card.id);
            const unlockHint = unlockSource
              ? t("deckScreen.cardUpgrade.unlockAt", { chapter: unlockSource.chapter, index: unlockSource.index })
              : t("deckScreen.cardUpgrade.unlockHint");
            return (
              <div
                key={card.id}
                className={cn(
                  "rounded-[26px] border border-white/10 bg-black/18 p-2",
                  !unlocked && "border-white/8 bg-black/22 opacity-82 grayscale-[0.08]",
                  unlocked && !active && selectedDeck.length >= 8 && "opacity-70",
                )}
              >
                <button
                  onClick={() => {
                    if (unlocked) toggleDeckCard(card.id);
                  }}
                  disabled={!unlocked}
                  className="frontline-motion-action w-full rounded-[24px] text-left transition"
                >
                  <FrontlineCardView
                    card={card}
                    selected={active}
                    disabled={!unlocked || (!active && selectedDeck.length >= 8)}
                    status={active ? t("deckScreen.package.inPackage") : unlocked ? t("deckScreen.package.tapToAdd") : t("deckScreen.package.locked")}
                  />
                </button>
                <CardUpgradeBar
                  level={level}
                  cost={cost}
                  unlocked={unlocked}
                  unlockHint={unlockHint}
                  canUpgrade={canUpgrade}
                  t={t}
                  onUpgrade={() => upgradeFrontlineCard(card.id)}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {FRONTLINE_HEROES.map((hero) => {
            const selectedIndex = loadout.squad.findIndex((entry) => entry === hero.heroId);
            const progressedHero = getFrontlineHeroProfileById(hero.heroId, playerHeroById.get(hero.heroId)) ?? hero;
            return (
              <HeroRosterButton
                key={hero.heroId}
                hero={progressedHero}
                selectedIndex={selectedIndex}
                tierLabel={t("deckScreen.tiers.tier", { tier: hero.tier })}
                laneLabel={selectedIndex === 0 ? t("deckScreen.lanes.leftFront") : selectedIndex === 1 ? t("deckScreen.lanes.centerFront") : selectedIndex === 2 ? t("deckScreen.lanes.rightFront") : null}
                onPick={(slotIdx) => setSquadSlot(slotIdx, hero.heroId)}
                t={t}
              />
            );
          })}
        </div>
      </section>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(8,10,16,0.9))] p-3 shadow-[0_18px_38px_rgba(0,0,0,0.22)]">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{title}</div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Metric({ label, value, ok, t }: { label: string; value: string | number; ok: boolean; t: TranslateFn }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(9,11,17,0.88))] px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.15em] text-white/44">{label}</div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
      <div className={cn("mt-0.5 text-[9px] uppercase tracking-[0.13em]", ok ? "text-emerald-300/70" : "text-rose-300/70")}>
        {ok ? t("deckScreen.metrics.ready") : t("deckScreen.metrics.missing")}
      </div>
    </div>
  );
}

function BuildPill({ icon, label, value }: { icon: CardTypeIconName; label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1.5">
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-white/56">
        <CardTypeIcon type={icon} size="xs" className="h-5 w-5" />
        <span>{label}</span>
      </div>
      <div className="text-sm font-black text-white">{value}</div>
    </div>
  );
}

function SelectedPackageRow({ card, t }: { card: FrontlineCardDef; t: TranslateFn }) {
  return (
    <div className="group flex items-center gap-2 rounded-[16px] border border-[#f5c451]/14 bg-[#f5c451]/8 px-2.5 py-2">
      <CardTypeIcon type={card.kind as CardTypeIconName} size="sm" className="h-6 w-6 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-black text-white">{frontlineCardName(t, card)}</div>
        <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-white/46">
          <span>{frontlineCardKindLabel(t, card)}</span>
          <span className="truncate text-[#f5d498]/76">{frontlineCardEffectSummary(t, card)}</span>
        </div>
      </div>
      <div className="rounded-full border border-white/10 bg-black/24 px-2 py-1 text-[10px] font-black text-white">{card.cost}</div>
    </div>
  );
}

function HeroRosterButton({
  hero,
  selectedIndex,
  tierLabel,
  laneLabel,
  onPick,
  t,
}: {
  hero: FrontlineHeroDef;
  selectedIndex: number;
  tierLabel: string;
  laneLabel: string | null;
  onPick: (slotIdx: number) => void;
  t: TranslateFn;
}) {
  const visual = getFrontlineHeroVisualAsset(hero.heroId);
  const active = selectedIndex !== -1;

  return (
    <div
      className={cn(
        "rounded-[18px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.84))] p-2",
        active ? "border-[#f5c451]/26 bg-[#f5c451]/10" : "border-white/10",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="grid h-16 w-14 shrink-0 place-items-end overflow-hidden rounded-[16px] border border-white/10 bg-black/22">
          {visual.standeeSrc ? (
            <img
              src={visual.standeeSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,0.44)]"
            />
          ) : (
            <GameGlyph kind="heroes" shell="none" className="h-8 w-8 text-white/60" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-black text-white">{hero.name}</div>
          <div className="mt-0.5 truncate text-[10px] font-black uppercase tracking-[0.12em] text-white/44">{hero.role}</div>
          <div className="mt-1 flex justify-between gap-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/58">
            <span>HP {hero.maxHp}</span>
            <span>ATK {hero.atk}</span>
            <span>DEF {hero.def}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#f5d498]">
        {laneLabel ?? tierLabel}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((slotIdx) => (
          <button
            key={`${hero.heroId}-${slotIdx}`}
            onClick={() => onPick(slotIdx)}
            className={cn(
              "frontline-motion-tab rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] transition",
              selectedIndex === slotIdx
                ? "border-[#f5c451]/28 bg-[#f5c451]/14 text-[#f5d498]"
                : "border-white/10 bg-white/[0.04] text-white/58",
            )}
          >
            {slotIdx === 0 ? t("deckScreen.lanes.left") : slotIdx === 1 ? t("deckScreen.lanes.center") : t("deckScreen.lanes.right")}
          </button>
        ))}
      </div>
    </div>
  );
}

function CardUpgradeBar({
  level,
  cost,
  unlocked,
  unlockHint,
  canUpgrade,
  onUpgrade,
  t,
}: {
  level: number;
  cost: { gold: number; dust: number };
  unlocked: boolean;
  unlockHint: string;
  canUpgrade: boolean;
  onUpgrade: () => void;
  t: TranslateFn;
}) {
  const maxed = level >= FRONTLINE_CARD_MAX_LEVEL;
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-2">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#f5d498]">
          <ProgressionIcon name={!unlocked ? "unlock" : maxed ? "star" : "upgrade"} size="xs" className="h-5 w-5" />
          {!unlocked ? t("deckScreen.cardUpgrade.locked") : maxed ? t("deckScreen.cardUpgrade.max") : t("deckScreen.cardUpgrade.level", { level })}
        </div>
        {!unlocked ? (
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-white/42">
            {unlockHint}
          </div>
        ) : !maxed ? (
          <div className="mt-1 flex items-center gap-2 text-[10px] font-black text-white/58">
            <span className="inline-flex items-center gap-1"><ResourceIcon kind="gold" size="small" className="h-5 w-5" />{cost.gold}</span>
            <span className="inline-flex items-center gap-1"><ResourceIcon kind="dust" size="small" className="h-5 w-5" />{cost.dust}</span>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        disabled={!unlocked || maxed || !canUpgrade}
        onClick={onUpgrade}
        className={cn(
          "frontline-motion-action rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition",
          !unlocked
            ? "border-white/10 bg-black/20 text-white/28"
            : maxed
            ? "border-[#f5c451]/18 bg-[#f5c451]/10 text-[#f5d498]"
            : canUpgrade
              ? "border-[#f5c451]/32 bg-[#f5c451]/16 text-[#ffe0a2] hover:-translate-y-0.5"
              : "border-white/10 bg-black/20 text-white/34",
        )}
      >
        {!unlocked ? t("deckScreen.cardUpgrade.locked") : maxed ? t("deckScreen.cardUpgrade.done") : t("deckScreen.cardUpgrade.action")}
      </button>
    </div>
  );
}
