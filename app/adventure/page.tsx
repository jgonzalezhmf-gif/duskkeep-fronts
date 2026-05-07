"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ADVENTURE } from "@/data/adventure";
import { isAdventureFirstClearRewardAvailable } from "@/lib/rewardVisibility";
import { nextUnlockedLevel, useGameStore } from "@/lib/store";
import {
  getAdventureMapInteraction,
  getAdventureMapInteractionStatus,
  isAdventureMapInteractionClaimActive,
  type AdventureMapInteractionStatus,
} from "@/features/adventure/mapInteractions";
import {
  getAdventureNodeDefinition,
  getAdventureNodeType,
  isAdventureClaimed,
  isAdventureCombatNode,
  type AdventureProgressEntry,
} from "@/features/adventure/nodeResolution";
import { getAdventureUnlockedLevelIds, isAdventureChapterDemoLocked } from "@/features/adventure/progression";
import {
  AdventureCampaignMap,
  AdventureCacheRevealOverlay,
  AdventureMissionPanel,
  AdventureMapInteractionPanel,
  type AdventureCampaignMeta,
  type AdventureNodeState,
} from "@/components/game/adventure/AdventureCampaignScene";
import { ADVENTURE_MAP_CHAPTER_LAYOUTS } from "@/components/game/adventure/adventureMapLayout";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { ScreenBadge, ScreenScaffold } from "@/components/game/screens/ScreenChrome";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";

const CHAPTER_META: Record<number, AdventureCampaignMeta> = {
  1: {
    name: "The Eclipse Rising",
    subtitle: "Chapter I",
    accent: "#f5c451",
    scene: "adventureMoon",
    hint: "Climb through ruined ridge roads, moonlit shrines and fractured gates until the eclipse citadel opens.",
    atmosphere: "Moonlit campaign route with broken sanctuaries, ritual bridges and cold blue haze hanging over the ascent.",
    terrainLabel: "Moon ridges and shrine roads",
    threatLabel: "Cult patrols, ambush lanes and citadel defenders",
    landmarks: [
      { label: "Crossroads Camp", kind: "camp", x: "13%", y: "82%", mobileX: "13%", mobileY: "77%" },
      { label: "Lumen Altar", kind: "altar", x: "36%", y: "58%", mobileX: "31%", mobileY: "53%" },
      { label: "Broken Span", kind: "bridge", x: "53%", y: "47%", mobileX: "53%", mobileY: "44%" },
      { label: "Citadel Gate", kind: "gate", x: "70%", y: "22%", mobileX: "73%", mobileY: "22%" },
    ],
  },
  2: {
    name: "Ashes of the Pact",
    subtitle: "Chapter II",
    accent: "#ff9c5f",
    scene: "adventureAsh",
    hint: "Advance through scorched passes, kiln basins and siege furnaces toward the crown of ash.",
    atmosphere: "A volcanic route with obsidian spires, cinder winds, forge-light and collapsing bridges across a burning basin.",
    terrainLabel: "Scorched ravines and kiln basins",
    threatLabel: "Ash warbands, brute elites and spire wardens",
    landmarks: [
      { label: "Scorched Pass", kind: "spire", x: "13%", y: "80%", mobileX: "15%", mobileY: "74%" },
      { label: "Ember Kiln", kind: "ruin", x: "40%", y: "58%", mobileX: "37%", mobileY: "54%" },
      { label: "Forge Span", kind: "bridge", x: "59%", y: "43%", mobileX: "58%", mobileY: "39%" },
      { label: "Ash Crown", kind: "gate", x: "78%", y: "20%", mobileX: "79%", mobileY: "19%" },
    ],
  },
  3: {
    name: "Starlit Tower",
    subtitle: "Chapter III",
    accent: "#8ec5ff",
    scene: "adventureMoon",
    hint: "Reserved for the next campaign drop.",
    atmosphere: "Placeholder chapter slot kept visible to preserve progression rhythm and future content pacing.",
    terrainLabel: "Future chapter",
    threatLabel: "Content drop pending",
    landmarks: [],
  },
};

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;
const CHAPTER_TRANSLATION_KEYS: Record<number, "one" | "two" | "three"> = {
  1: "one",
  2: "two",
  3: "three",
};

const CHAPTER_LANDMARK_KEYS: Record<number, string[]> = {
  1: ["camp", "altar", "bridge", "gate"],
  2: ["pass", "kiln", "bridge", "crown"],
  3: [],
};

function getLocalizedChapterMeta(chapter: number, t: TranslateFn): AdventureCampaignMeta {
  const base = CHAPTER_META[chapter] ?? CHAPTER_META[1];
  const key = CHAPTER_TRANSLATION_KEYS[chapter] ?? "one";
  const landmarkKeys = CHAPTER_LANDMARK_KEYS[chapter] ?? [];

  return {
    ...base,
    name: t(`adventure.chaptersMeta.${key}.name`),
    subtitle: t(`adventure.chaptersMeta.${key}.subtitle`),
    hint: t(`adventure.chaptersMeta.${key}.hint`),
    atmosphere: t(`adventure.chaptersMeta.${key}.atmosphere`),
    terrainLabel: t(`adventure.chaptersMeta.${key}.terrain`),
    threatLabel: t(`adventure.chaptersMeta.${key}.threat`),
    landmarks: base.landmarks.map((landmark, index) => ({
      ...landmark,
      label: t(`adventure.chaptersMeta.${key}.landmarks.${landmarkKeys[index]}`),
    })),
  };
}

export default function AdventureMapPage() {
  const { t } = useI18n();
  const progress = useGameStore((state) => state.adventureProgress);
  const resources = useGameStore((state) => state.resources);
  const adventureMapClaims = useGameStore((state) => state.adventureMapClaims);
  const accountLevel = useGameStore((state) => state.account.level);
  const claimAdventureNode = useGameStore((state) => state.claimAdventureNode);
  const claimAdventureMapInteraction = useGameStore((state) => state.claimAdventureMapInteraction);
  const router = useRouter();

  const chapters = useMemo(() => {
    const byChapter = new Map<number, (typeof ADVENTURE)[number][]>();
    for (const level of ADVENTURE) {
      if (!byChapter.has(level.chapter)) byChapter.set(level.chapter, []);
      byChapter.get(level.chapter)!.push(level);
    }

    const out: { chapter: number; nodes: AdventureNodeState[] }[] = [];
    const unlockedLevelIds = getAdventureUnlockedLevelIds(progress, accountLevel);
    for (const chapter of Array.from(byChapter.keys()).sort((a, b) => a - b)) {
      const demoLocked = isAdventureChapterDemoLocked(chapter);
      const nodes = byChapter.get(chapter)!.map((lvl) => {
        const levelProgress = progress[lvl.id];
        const nodeType = getAdventureNodeType(lvl);
        const claimed = isAdventureClaimed(nodeType, levelProgress as AdventureProgressEntry | undefined);
        const cleared = levelProgress?.cleared ?? false;
        const accountLocked = (lvl.unlockAccountLevel ?? 0) > accountLevel;
        const progressLocked = !unlockedLevelIds.has(lvl.id) && !cleared && !claimed;
        const locked = demoLocked || accountLocked || progressLocked;
        const current = !cleared && !claimed && !locked;
        return {
          lvl,
          cleared,
          claimed,
          locked,
          current,
          pausedHere: false,
          firstClearAvailable: isAdventureFirstClearRewardAvailable(levelProgress),
        };
      });
      out.push({ chapter, nodes });
    }
    return out;
  }, [accountLevel, progress]);

  const nextLevel = nextUnlockedLevel(useGameStore.getState());
  const defaultChapter =
    nextLevel && !isAdventureChapterDemoLocked(nextLevel.chapter)
      ? nextLevel.chapter
      : chapters.find((chapter) => !isAdventureChapterDemoLocked(chapter.chapter))?.chapter ?? chapters[0]?.chapter ?? 1;
  const [activeChapter, setActiveChapter] = useState(defaultChapter);
  const active =
    !isAdventureChapterDemoLocked(activeChapter)
      ? chapters.find((chapter) => chapter.chapter === activeChapter) ?? chapters[0]
      : chapters.find((chapter) => chapter.chapter === defaultChapter) ?? chapters[0];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [qaMapEditor, setQaMapEditor] = useState(false);
  const [claimedRewardsByNode, setClaimedRewardsByNode] = useState<Record<string, ReturnType<typeof claimAdventureNode>>>({});
  const [claimedRewardsByInteraction, setClaimedRewardsByInteraction] = useState<Record<string, ReturnType<typeof claimAdventureMapInteraction>>>({});
  const [cacheReveal, setCacheReveal] = useState<NonNullable<ReturnType<typeof claimAdventureMapInteraction>> | null>(null);
  const [interactionClock, setInteractionClock] = useState(() => Date.now());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQaMapEditor(params.get("qa") === "adventure-map" || params.get("qa") === "map-editor");
  }, []);

  useEffect(() => {
    if (activeChapter !== defaultChapter && isAdventureChapterDemoLocked(activeChapter)) {
      setActiveChapter(defaultChapter);
    }
  }, [activeChapter, defaultChapter]);

  useEffect(() => {
    const id = window.setInterval(() => setInteractionClock(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!active) return;
    if (selectedId && active.nodes.some((node) => node.lvl.id === selectedId)) return;
    const fallback = active.nodes.find((node) => node.pausedHere || node.current)?.lvl.id ?? active.nodes[0]?.lvl.id ?? null;
    setSelectedId(fallback);
  }, [active, selectedId]);

  if (!active) return null;

  const meta = getLocalizedChapterMeta(active.chapter, t);
  const mapLayout = ADVENTURE_MAP_CHAPTER_LAYOUTS[active.chapter] ?? ADVENTURE_MAP_CHAPTER_LAYOUTS[1];
  const interactionNow = new Date(interactionClock);
  const selected =
    active.nodes.find((node) => node.lvl.id === selectedId) ??
    active.nodes.find((node) => node.pausedHere || node.current) ??
    active.nodes[0];

  if (!selected) return null;

  const selectedDefinition = getAdventureNodeDefinition(selected.lvl);
  const selectedProgress = progress[selected.lvl.id] as AdventureProgressEntry | undefined;
  const claimedRewards = claimedRewardsByNode[selected.lvl.id] ?? null;
  const interactionStates = (() => {
    const states: Record<string, AdventureMapInteractionStatus> = {};
    for (const prop of mapLayout.props ?? []) {
      const interaction = getAdventureMapInteraction(prop.interaction?.id);
      if (!interaction || prop.interaction?.enabled === false) continue;
      states[interaction.id] = getAdventureMapInteractionStatus({
        interaction,
        progress,
        resources,
        claim: adventureMapClaims[interaction.id],
        now: interactionNow,
      });
    }
    return states;
  })();
  const selectedInteraction = getAdventureMapInteraction(selectedInteractionId);
  const selectedInteractionStatus =
    selectedInteraction && selectedInteractionId
      ? interactionStates[selectedInteractionId] ??
        getAdventureMapInteractionStatus({
          interaction: selectedInteraction,
          progress,
          resources,
          claim: adventureMapClaims[selectedInteractionId],
          now: interactionNow,
        })
      : null;
  const selectedInteractionRewards =
    selectedInteractionId && selectedInteractionStatus === "claimed" ? claimedRewardsByInteraction[selectedInteractionId] ?? null : null;
  const selectedInteractionClaim =
    selectedInteractionId && selectedInteraction && isAdventureMapInteractionClaimActive(selectedInteraction, adventureMapClaims[selectedInteractionId], interactionNow)
      ? adventureMapClaims[selectedInteractionId]
      : undefined;

  function resolveSelectedNode() {
    setSelectedInteractionId(null);
    if (selected.locked || selectedDefinition.type === "locked") return;
    if (isAdventureClaimed(selectedDefinition.type, selectedProgress)) return;
    if (!isAdventureCombatNode(selectedDefinition.type)) {
      const rewards = claimAdventureNode(selected.lvl.id);
      if (rewards) {
        setClaimedRewardsByNode((current) => ({ ...current, [selected.lvl.id]: rewards }));
      }
      return;
    }
    router.push(`/adventure/${selected.lvl.id}`);
  }

  function resolveSelectedInteraction() {
    if (!selectedInteractionId) return;
    const result = claimAdventureMapInteraction(selectedInteractionId);
    if (result) {
      setClaimedRewardsByInteraction((current) => ({ ...current, [selectedInteractionId]: result }));
      setCacheReveal(result);
    }
  }

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
          onSelect={(id) => {
            setSelectedInteractionId(null);
            setSelectedId(id);
          }}
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
                      onClick={() => {
                        if (demoLocked) return;
                        setActiveChapter(chapter.chapter);
                        setChaptersOpen(false);
                      }}
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
