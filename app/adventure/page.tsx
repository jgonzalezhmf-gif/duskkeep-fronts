"use client";

import { isAdventureChapterDemoLocked } from "@/features/adventure/progression";
import { AdventureCampaignMap } from "@/components/game/adventure/AdventureCampaignScene";
import { getLocalizedChapterMeta } from "@/components/game/adventure/AdventureChapterMeta";
import {
  AdventureCacheRevealOverlay,
  AdventureMapInteractionPanel,
  AdventureMissionPanel,
} from "@/components/game/adventure/AdventureMissionPanels";
import { useAdventureMapPageState } from "@/components/game/adventure/useAdventureMapPageState";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { ScreenBadge, ScreenScaffold } from "@/components/game/screens/ScreenChrome";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";

export default function AdventureMapPage() {
  const { t } = useI18n();
  const state = useAdventureMapPageState(t);
  if (!state.ready) return null;

  const {
    active,
    cacheReveal,
    chapters,
    chaptersOpen,
    claimedRewards,
    detailsExpanded,
    interactionStates,
    mapLayout,
    meta,
    qaMapEditor,
    resources,
    resolveSelectedInteraction,
    resolveSelectedNode,
    selectChapter,
    selectNode,
    selected,
    selectedDefinition,
    selectedInteraction,
    selectedInteractionClaim,
    selectedInteractionId,
    selectedInteractionRewards,
    selectedInteractionStatus,
    selectedProgress,
    setCacheReveal,
    setChaptersOpen,
    setDetailsExpanded,
    setSelectedInteractionId,
  } = state;

  return (
    <ScreenScaffold scene={meta.scene} dock={false}>
      <div className="relative box-border h-dvh overflow-hidden px-3 pb-4 pt-36 sm:pt-32 md:px-6 md:pt-24 xl:px-8">
        <AdventureCampaignMap
          meta={meta}
          nodes={active.nodes}
          mapLayout={mapLayout}
          chapter={active.chapter}
          selectedId={selected.lvl.id}
          selectedInteractionId={selectedInteractionId}
          interactionStates={interactionStates}
          onSelect={selectNode}
          onSelectInteraction={setSelectedInteractionId}
          fullScreen
        />
        <div className="pointer-events-none absolute inset-0 z-[11] bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(4,7,13,0.06)_50%,rgba(4,7,13,0.62)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[11] h-44 bg-[linear-gradient(180deg,rgba(4,7,13,0.84),rgba(4,7,13,0.22),transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[11] h-44 bg-[linear-gradient(0deg,rgba(4,7,13,0.86),rgba(4,7,13,0.24),transparent)]" />

        <div className="pointer-events-none fixed inset-x-3 bottom-4 top-36 z-30 mx-auto max-w-[1680px] sm:top-32 md:inset-x-6 md:top-24 xl:inset-x-8">
          <div className="pointer-events-auto absolute left-0 top-0 w-[min(28rem,calc(100vw-1.5rem))]">
            <div className="rounded-[18px] border border-[#f5d498]/12 bg-[linear-gradient(180deg,rgba(10,13,20,0.34),rgba(7,9,14,0.58))] px-2.5 py-2 shadow-[0_12px_28px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <ModeIcon name="campaign" size="sm" withGlow={false} className="h-8 w-8 opacity-90" />
                <div className="min-w-0 flex-1">
                  <div className="text-[8px] uppercase tracking-[0.18em]" style={{ color: meta.accent }}>{meta.subtitle}</div>
                  <div className="truncate text-[12px] font-black leading-tight text-white">{meta.name}</div>
                </div>
                <ScreenBadge tone="neutral" className="px-2 py-0.5 text-[8px]">
                  {selected.lvl.index}/{active.nodes.length}
                </ScreenBadge>
                <button
                  type="button"
                  onClick={() => setChaptersOpen((value) => !value)}
                  className="rounded-full border border-[#f5d498]/18 bg-black/26 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#f5d498] transition hover:bg-[#f5c451]/12"
                >
                  {t("adventure.chapters")}
                </button>
              </div>
            </div>

            {chaptersOpen ? (
              <div className="mt-2 grid gap-1.5 rounded-[18px] border border-white/10 bg-black/72 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.34)] backdrop-blur-xl">
                {chapters.map((chapter) => {
                  const chapterMeta = getLocalizedChapterMeta(chapter.chapter, t);
                  const selectedTab = chapter.chapter === active.chapter;
                  const demoLocked = isAdventureChapterDemoLocked(chapter.chapter);
                  const fullyLocked = demoLocked || chapter.nodes.every((node) => node.locked && !node.cleared);
                  const cleared = chapter.nodes.filter((node) => node.cleared).length;
                  return (
                    <button
                      key={chapter.chapter}
                      type="button"
                      disabled={demoLocked}
                      aria-disabled={demoLocked}
                      title={demoLocked ? "Demo locked" : undefined}
                      onClick={() => selectChapter(chapter.chapter)}
                      className={cn(
                        "frontline-motion-tab relative overflow-hidden rounded-[13px] border px-2.5 py-1.5 text-left transition",
                        selectedTab
                          ? "border-[#f5d498]/28 bg-[linear-gradient(180deg,rgba(44,28,15,0.72),rgba(9,11,17,0.9))]"
                          : "border-white/8 bg-[linear-gradient(180deg,rgba(14,18,28,0.44),rgba(8,10,16,0.76))]",
                        fullyLocked && !selectedTab && "opacity-60",
                        demoLocked && "cursor-not-allowed",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <ModeIcon name={chapter.chapter === 3 ? "dungeon_run" : "campaign"} size="sm" withGlow={false} className="h-8 w-8 opacity-90" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[8px] uppercase tracking-[0.16em]" style={{ color: chapterMeta.accent }}>
                            {chapterMeta.subtitle}
                          </div>
                          <div className="truncate text-[11px] font-black text-white">{chapterMeta.name}</div>
                        </div>
                        <ScreenBadge tone={fullyLocked ? "neutral" : selectedTab ? "gold" : "sky"} className="px-2 py-0.5 text-[8px]">
                          {fullyLocked ? t("adventure.locked") : `${cleared}/${chapter.nodes.length}`}
                        </ScreenBadge>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {!qaMapEditor ? (
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 mx-auto w-[min(62rem,calc(100vw-1.5rem))]",
                detailsExpanded ? "top-[calc(100dvh-31rem)]" : "top-[calc(100dvh-19rem)]",
              )}
            >
              {selectedInteraction && selectedInteractionStatus ? (
                <AdventureMapInteractionPanel
                  interaction={selectedInteraction}
                  status={selectedInteractionStatus}
                  resources={resources}
                  claimedResult={selectedInteractionRewards}
                  persistedClaim={selectedInteractionClaim}
                  expanded={detailsExpanded}
                  onToggleExpanded={() => setDetailsExpanded((value) => !value)}
                  onClaim={resolveSelectedInteraction}
                />
              ) : (
                <AdventureMissionPanel
                  meta={meta}
                  node={selected}
                  totalNodes={active.nodes.length}
                  nodeDefinition={selectedDefinition}
                  progress={selectedProgress}
                  claimedRewards={claimedRewards}
                  expanded={detailsExpanded}
                  onToggleExpanded={() => setDetailsExpanded((value) => !value)}
                  onOpenBattle={resolveSelectedNode}
                />
              )}
            </div>
          ) : null}
        </div>
        {cacheReveal ? <AdventureCacheRevealOverlay result={cacheReveal} onClose={() => setCacheReveal(null)} /> : null}
      </div>
    </ScreenScaffold>
  );
}
