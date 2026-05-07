"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ADVENTURE } from "@/data/adventure";
import {
  getAdventureMapInteraction,
  getAdventureMapInteractionStatus,
  isAdventureMapInteractionClaimActive,
  type AdventureMapInteractionStatus,
  type AdventureMapInteractionOpenResult,
} from "@/features/adventure/mapInteractions";
import {
  getAdventureNodeDefinition,
  getAdventureNodeType,
  isAdventureClaimed,
  isAdventureCombatNode,
  type AdventureProgressEntry,
} from "@/features/adventure/nodeResolution";
import { getAdventureUnlockedLevelIds, isAdventureChapterDemoLocked } from "@/features/adventure/progression";
import { isAdventureFirstClearRewardAvailable } from "@/lib/rewardVisibility";
import { nextUnlockedLevel, useGameStore } from "@/lib/store";
import { ADVENTURE_MAP_CHAPTER_LAYOUTS } from "./adventureMapLayout";
import { getLocalizedChapterMeta } from "./AdventureChapterMeta";
import type { AdventureNodeState, TranslateFn } from "./AdventureCampaignTypes";

export function useAdventureMapPageState(t: TranslateFn) {
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
  const [cacheReveal, setCacheReveal] = useState<AdventureMapInteractionOpenResult | null>(null);
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

  if (!active) return { ready: false as const };

  const meta = getLocalizedChapterMeta(active.chapter, t);
  const mapLayout = ADVENTURE_MAP_CHAPTER_LAYOUTS[active.chapter] ?? ADVENTURE_MAP_CHAPTER_LAYOUTS[1];
  const interactionNow = new Date(interactionClock);
  const selected =
    active.nodes.find((node) => node.lvl.id === selectedId) ??
    active.nodes.find((node) => node.pausedHere || node.current) ??
    active.nodes[0];

  if (!selected) return { ready: false as const };

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

  function selectNode(id: string) {
    setSelectedInteractionId(null);
    setSelectedId(id);
  }

  function selectChapter(chapter: number) {
    if (isAdventureChapterDemoLocked(chapter)) return;
    setActiveChapter(chapter);
    setChaptersOpen(false);
  }

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

  return {
    ready: true as const,
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
  };
}
