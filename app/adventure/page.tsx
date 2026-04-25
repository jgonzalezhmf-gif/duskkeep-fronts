"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ADVENTURE } from "@/data/adventure";
import { isAdventureFirstClearRewardAvailable } from "@/lib/rewardVisibility";
import { nextUnlockedLevel, useGameStore } from "@/lib/store";
import {
  AdventureCampaignMap,
  AdventureMissionPanel,
  type AdventureCampaignMeta,
  type AdventureNodeLayout,
  type AdventureNodeState,
} from "@/components/game/adventure/AdventureCampaignScene";
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

const CHAPTER_LAYOUTS: Record<number, AdventureNodeLayout[]> = {
  1: [
    { x: "12%", y: "82%", mobileX: "13%", mobileY: "78%" },
    { x: "22%", y: "75%", mobileX: "22%", mobileY: "69%" },
    { x: "33%", y: "77%", mobileX: "33%", mobileY: "72%" },
    { x: "43%", y: "67%", mobileX: "45%", mobileY: "62%" },
    { x: "55%", y: "70%", mobileX: "60%", mobileY: "65%" },
    { x: "67%", y: "61%", mobileX: "74%", mobileY: "56%" },
    { x: "75%", y: "50%", mobileX: "79%", mobileY: "47%" },
    { x: "63%", y: "44%", mobileX: "64%", mobileY: "40%" },
    { x: "51%", y: "50%", mobileX: "50%", mobileY: "45%" },
    { x: "39%", y: "40%", mobileX: "36%", mobileY: "35%" },
    { x: "49%", y: "28%", mobileX: "50%", mobileY: "24%" },
    { x: "67%", y: "21%", mobileX: "73%", mobileY: "20%" },
  ],
  2: [
    { x: "14%", y: "81%", mobileX: "15%", mobileY: "75%" },
    { x: "27%", y: "71%", mobileX: "27%", mobileY: "66%" },
    { x: "40%", y: "75%", mobileX: "39%", mobileY: "69%" },
    { x: "53%", y: "63%", mobileX: "55%", mobileY: "57%" },
    { x: "67%", y: "54%", mobileX: "70%", mobileY: "48%" },
    { x: "59%", y: "42%", mobileX: "59%", mobileY: "39%" },
    { x: "46%", y: "31%", mobileX: "45%", mobileY: "28%" },
    { x: "76%", y: "20%", mobileX: "79%", mobileY: "20%" },
  ],
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
  const accountLevel = useGameStore((state) => state.account.level);
  const router = useRouter();

  const chapters = useMemo(() => {
    const byChapter = new Map<number, (typeof ADVENTURE)[number][]>();
    for (const level of ADVENTURE) {
      if (!byChapter.has(level.chapter)) byChapter.set(level.chapter, []);
      byChapter.get(level.chapter)!.push(level);
    }

    const out: { chapter: number; nodes: AdventureNodeState[] }[] = [];
    let previousLevelCleared = true;
    for (const chapter of Array.from(byChapter.keys()).sort((a, b) => a - b)) {
      const nodes = byChapter.get(chapter)!.map((lvl) => {
        const levelProgress = progress[lvl.id];
        const cleared = levelProgress?.cleared ?? false;
        const accountLocked = (lvl.unlockAccountLevel ?? 0) > accountLevel;
        const progressLocked = !previousLevelCleared && !cleared;
        const locked = accountLocked || progressLocked;
        const current = !cleared && !locked;
        previousLevelCleared = cleared;
        return {
          lvl,
          cleared,
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
  const defaultChapter = nextLevel?.chapter ?? chapters[0]?.chapter ?? 1;
  const [activeChapter, setActiveChapter] = useState(defaultChapter);
  const active = chapters.find((chapter) => chapter.chapter === activeChapter) ?? chapters[0];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    if (selectedId && active.nodes.some((node) => node.lvl.id === selectedId)) return;
    const fallback = active.nodes.find((node) => node.pausedHere || node.current)?.lvl.id ?? active.nodes[0]?.lvl.id ?? null;
    setSelectedId(fallback);
  }, [active, selectedId]);

  if (!active) return null;

  const meta = getLocalizedChapterMeta(active.chapter, t);
  const layouts = CHAPTER_LAYOUTS[active.chapter] ?? CHAPTER_LAYOUTS[1];
  const selected =
    active.nodes.find((node) => node.lvl.id === selectedId) ??
    active.nodes.find((node) => node.pausedHere || node.current) ??
    active.nodes[0];

  if (!selected) return null;

  return (
    <ScreenScaffold scene={meta.scene} dock={false}>
      <div className="relative z-20 mx-auto flex w-full max-w-[1580px] flex-col gap-4 px-3 pb-16 pt-52 sm:pt-[9.5rem] md:px-6 md:pb-20 md:pt-[6.5rem] xl:px-8">
        <section className="relative overflow-hidden rounded-[38px] border border-[#f5d498]/14 bg-[linear-gradient(180deg,rgba(54,38,23,0.16),rgba(9,13,20,0.58)_38%,rgba(7,9,14,0.86))] shadow-[0_36px_96px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(245,196,81,0.16),transparent_20%),radial-gradient(circle_at_82%_16%,rgba(147,214,255,0.14),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0)_18%,rgba(0,0,0,0.12)_100%)]" />
          <div className="relative z-30 border-b border-[#f5d498]/10 px-3 py-3 md:px-5 md:py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#f5d498]">{t("adventure.campaignFronts")}</div>
                <div className="mt-1 text-lg font-black text-white md:text-[1.32rem]">{t("adventure.warpathAtlas")}</div>
                <div className="mt-1 max-w-[42rem] text-[11px] leading-5 text-white/58 md:text-[12px]">
                  {t("adventure.atlasHint")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ScreenBadge tone="sky">{chapters.length} {t("adventure.chapters")}</ScreenBadge>
                <ScreenBadge tone="neutral">{selected.lvl.index}/{active.nodes.length} {t("adventure.nodes")}</ScreenBadge>
              </div>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {chapters.map((chapter) => {
                const chapterMeta = getLocalizedChapterMeta(chapter.chapter, t);
                const selectedTab = chapter.chapter === active.chapter;
                const fullyLocked = chapter.nodes.every((node) => node.locked && !node.cleared);
                const cleared = chapter.nodes.filter((node) => node.cleared).length;
                return (
                  <button
                    key={chapter.chapter}
                    onClick={() => setActiveChapter(chapter.chapter)}
                    className={cn(
                      "frontline-motion-tab relative overflow-hidden rounded-[22px] border px-3 py-3 text-left transition",
                      selectedTab
                        ? "border-white/14 bg-[linear-gradient(180deg,rgba(44,28,15,0.68),rgba(9,11,17,0.96))] shadow-[0_18px_38px_rgba(245,196,81,0.12)]"
                        : "border-white/8 bg-[linear-gradient(180deg,rgba(14,18,28,0.34),rgba(8,10,16,0.9))]",
                      fullyLocked && !selectedTab && "opacity-60",
                    )}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg,transparent,${chapterMeta.accent},transparent)` }} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: chapterMeta.accent }}>
                          {chapterMeta.subtitle}
                        </div>
                        <div className="mt-1 truncate text-sm font-black text-white">{chapterMeta.name}</div>
                        <div className="mt-1 text-[11px] leading-5 text-white/56">{chapterMeta.terrainLabel}</div>
                      </div>
                      <ScreenBadge tone={fullyLocked ? "neutral" : selectedTab ? "gold" : "sky"}>
                        {fullyLocked ? t("adventure.locked") : `${cleared}/${chapter.nodes.length}`}
                      </ScreenBadge>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative grid items-start gap-4 px-3 pb-3 pt-3 md:px-5 md:pb-5 md:pt-4 xl:grid-cols-[minmax(0,1fr)_23rem]">
            <div className="relative">
              <div className="h-[33rem] sm:h-[37rem] lg:h-[42rem] xl:h-[46rem]">
                <AdventureCampaignMap
                  meta={meta}
                  nodes={active.nodes}
                  layouts={layouts}
                  selectedId={selected.lvl.id}
                  onSelect={setSelectedId}
                  embedded
                  showOverlayHeader={false}
                />
              </div>
            </div>
            <div className="relative xl:sticky xl:top-24 xl:pt-1">
              <AdventureMissionPanel
                meta={meta}
                node={selected}
                totalNodes={active.nodes.length}
                onOpenBattle={() => !selected.locked && router.push(`/adventure/${selected.lvl.id}`)}
              />
            </div>
          </div>
        </section>
      </div>
    </ScreenScaffold>
  );
}
