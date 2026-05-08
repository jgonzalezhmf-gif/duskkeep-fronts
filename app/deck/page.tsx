"use client";

import { useMemo } from "react";
import SceneBackdrop from "@/components/game/screens/SceneBackdrop";
import ScreenBackground from "@/components/ui/ScreenBackground";
import GameBackNav from "@/components/game/shared/GameBackNav";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import {
  FRONTLINE_CARD_BY_ID,
  FRONTLINE_HEROES,
  FRONTLINE_LEADERS,
} from "@/features/frontline/data";
import {
  createFrontlineCardProfileMap,
} from "@/features/frontline/cardProgression";
import { getFrontlineHeroProfileById } from "@/features/frontline/heroProfile";
import { frontlineLeaderName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import { DeckCardPoolSection } from "./DeckCardPoolSection";
import { HeroRosterButton } from "./DeckHeroRosterButton";
import { LeaderDoctrinePanel } from "./DeckLeaderDoctrinePanel";
import { BuildPill, Metric, Panel, SelectedPackageRow } from "./DeckPrimitives";
import { buildPlan } from "./deckPageHelpers";

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
  const cardProfiles = useMemo(() => createFrontlineCardProfileMap(frontlineCardLevels), [frontlineCardLevels]);
  const playerHeroById = useMemo(() => new Map(playerHeroes.map((hero) => [hero.heroId, hero] as const)), [playerHeroes]);
  const squadHeroes = loadout.squad.map((id) => (id ? getFrontlineHeroProfileById(id, playerHeroById.get(id)) : null));
  const leader = FRONTLINE_LEADERS.find((entry) => entry.id === loadout.leaderId) ?? FRONTLINE_LEADERS[0];
  const leaderName = frontlineLeaderName(t, leader);
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
            <LeaderDoctrinePanel leader={leader} onSelectLeader={setLeader} t={t} />

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
        <DeckCardPoolSection
          selectedDeck={selectedDeck}
          cardProfiles={cardProfiles}
          frontlineCardUnlocks={frontlineCardUnlocks}
          frontlineCardLevels={frontlineCardLevels}
          resources={resources}
          onToggleCard={toggleDeckCard}
          onUpgradeCard={upgradeFrontlineCard}
          t={t}
        />

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
