"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { FrontlineCardDef } from "@/features/frontline/types";
import {
  createFrontlineCardProfileMap,
} from "@/features/frontline/cardProgression";
import { getFrontlineHeroProfileById } from "@/features/frontline/heroProfile";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import { DeckCardPoolSection } from "./DeckCardPoolSection";
import { HeroRosterButton } from "./DeckHeroRosterButton";
import { DeckLoadoutSyncButton } from "./DeckLoadoutSyncButton";
import { LeaderDoctrinePanel } from "./DeckLeaderDoctrinePanel";
import { BuildPill, PackageSlotGrid, Panel, ReadinessRune, WarTableSeal } from "./DeckPrimitives";
import { buildDeckReadiness, buildPackageProfile, FRONTLINE_DECK_TARGET_SIZE } from "./deckPageHelpers";

export default function DeckPage() {
  const { t } = useI18n();
  const [clientReady, setClientReady] = useState(false);
  const loadout = useGameStore((state) => state.frontlineLoadout);
  const resources = useGameStore((state) => state.resources);
  const playerHeroes = useGameStore((state) => state.heroes);
  const frontlineCardUnlocks = useGameStore((state) => state.frontlineCardUnlocks);
  const frontlineCardLevels = useGameStore((state) => state.frontlineCardLevels);
  const setLeader = useGameStore((state) => state.setFrontlineLeader);
  const setSquadSlot = useGameStore((state) => state.setFrontlineSquadSlot);
  const toggleDeckCard = useGameStore((state) => state.toggleFrontlineDeckCard);
  const upgradeFrontlineCard = useGameStore((state) => state.upgradeFrontlineCardOnlineFirst);

  const selectedDeck = loadout.deck.filter(Boolean) as string[];
  const cardProfiles = useMemo(() => createFrontlineCardProfileMap(frontlineCardLevels), [frontlineCardLevels]);
  const playerHeroById = useMemo(() => new Map(playerHeroes.map((hero) => [hero.heroId, hero] as const)), [playerHeroes]);
  const squadHeroes = loadout.squad.map((id) => (id ? getFrontlineHeroProfileById(id, playerHeroById.get(id)) : null));
  const leader = FRONTLINE_LEADERS.find((entry) => entry.id === loadout.leaderId) ?? FRONTLINE_LEADERS[0];
  const selectedCards = selectedDeck
    .map((cardId) => cardProfiles[cardId] ?? FRONTLINE_CARD_BY_ID[cardId])
    .filter((card): card is FrontlineCardDef => Boolean(card));
  const readiness = buildDeckReadiness({
    leaderId: loadout.leaderId,
    squadIds: loadout.squad,
    deckIds: selectedDeck,
    t,
  });
  const packageProfile = buildPackageProfile(selectedDeck);
  const focusLabel = t(`deckScreen.packageFocus.${packageProfile.focus}`);

  useEffect(() => {
    setClientReady(true);
  }, []);

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-[#071019]">
      <ScreenBackground screen="deck" overlayIntensity="medium" fallback={<SceneBackdrop scene="deck" />} />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_14%,rgba(245,196,81,0.09),transparent_24%),linear-gradient(180deg,rgba(5,7,12,0.08),rgba(5,7,12,0.34)_62%,rgba(5,7,12,0.7))]" />
      <GameBackNav />
      <GameResourceBar resources={resources} size="sm" className="pointer-events-auto fixed right-3 top-3 z-40 max-w-[calc(100vw-9rem)] md:right-5 md:top-4 md:max-w-none" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-3 px-3 pb-16 pt-28 sm:pt-28 md:px-6 md:pb-20 md:pt-[5.5rem] xl:px-8">
        {!clientReady ? (
          <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(45,34,29,0.64),rgba(15,18,28,0.82)_42%,rgba(8,10,16,0.9)_78%)] p-4 shadow-[0_22px_56px_rgba(0,0,0,0.3)]" aria-busy="true">
            <div className="inline-flex rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
              {t("deckScreen.frontlineLoadout")}
            </div>
            <div className="mt-3 h-8 max-w-[26rem] rounded-full bg-white/[0.07]" />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="h-44 rounded-[22px] border border-white/10 bg-white/[0.04]" />
              <div className="h-44 rounded-[22px] border border-white/10 bg-white/[0.04]" />
              <div className="h-44 rounded-[22px] border border-white/10 bg-white/[0.04]" />
            </div>
          </section>
        ) : (
          <>
          <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(45,34,29,0.68),rgba(15,18,28,0.82)_36%,rgba(8,10,16,0.9)_76%)] shadow-[0_22px_56px_rgba(0,0,0,0.3)]">
        <div className="relative z-[1] px-3 py-3 md:px-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)]">
            <div className="min-w-0">
              <div className="inline-flex rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
                {t("deckScreen.warTable.eyebrow")}
              </div>
              <div className="mt-2 text-[1.9rem] font-black leading-[0.88] tracking-[-0.04em] text-white md:text-[3rem]">
                {t("deckScreen.warTable.title")}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 md:max-w-[38rem]">
                <ReadinessRune kind="battle" label={readiness.checks[0].label} value={readiness.checks[0].value} ready={readiness.checks[0].ready} />
                <ReadinessRune kind="heroes" label={readiness.checks[1].label} value={readiness.checks[1].value} ready={readiness.checks[1].ready} />
                <ReadinessRune kind="deck" label={readiness.checks[2].label} value={readiness.checks[2].value} ready={readiness.checks[2].ready} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <WarTableSeal ready={readiness.ready} label={readiness.label} nextAction={readiness.ready ? t("deckScreen.readiness.readyCue") : readiness.nextAction} />
              <DeckLoadoutSyncButton loadout={loadout} />
            </div>
          </div>

          <div className="mt-3 grid items-start gap-3 xl:grid-cols-[12rem_minmax(0,1fr)_24rem]">
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
                  <div className="mr-auto text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{focusLabel}</div>
                  <BuildPill icon="order" label={t("deckScreen.cardTypes.orders")} value={packageProfile.counts.orders} />
                  <BuildPill icon="tactic" label={t("deckScreen.cardTypes.tactics")} value={packageProfile.counts.tactics} />
                  <BuildPill icon="summon" label={t("deckScreen.cardTypes.summons")} value={packageProfile.counts.summons} />
                  <BuildPill icon="gear" label={t("deckScreen.package.command")} value={packageProfile.commandCost} />
                </div>
              </div>

            </Panel>

            <Panel title={t("deckScreen.panels.selectedPackage")}>
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/46">{focusLabel}</div>
                  <div className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[10px] font-black text-white">
                    {selectedDeck.length}/{FRONTLINE_DECK_TARGET_SIZE}
                  </div>
                </div>
                <PackageSlotGrid
                  cards={selectedCards}
                  targetSize={FRONTLINE_DECK_TARGET_SIZE}
                  emptyLabel={t("deckScreen.package.emptySlot")}
                  t={t}
                />
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
          </>
        )}
      </div>
    </div>
  );
}
