"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import HomeScene from "@/components/game/home/HomeScene";
import HomeWorldMapStyles from "@/components/game/home/HomeWorldMapStyles";
import { DailyLoginCharm } from "@/components/game/home/DailyLoginCharm";
import {
  CommanderBanner,
  CornerAction,
  DockShrine,
  FightCrystal,
  WorldHotspot,
} from "@/components/game/home/HomeWorldMapWidgets";
import {
  HOME_EFFECTS_QA_STORAGE_KEY,
  createDuplicateEffectId,
  mergeHomeEffectQaEdits,
} from "@/components/game/home/homeEffectsQaState";
import type { HomeEffectsQaEditorState } from "@/components/game/home/HomeEffectsQaTypes";
import { HOME_CTA_LAYOUT, HOME_DESIGN_HEIGHT, HOME_DESIGN_WIDTH } from "@/components/game/home/homeComposition";
import { HOME_LANDMARK_EFFECT_DEFS, getHomeWorldEffects, groupHomeLandmarkEffects, type HomeLandmarkEffectConfig } from "@/components/game/home/homeEffectLayout";
import { type HomeHotspot, type HomeZoneId } from "@/components/game/home/types";
import {
  DOCK_ACTIONS,
  formatCompact,
  formatCountdown,
  msUntilDailyHour,
  msUntilMidnight,
} from "@/components/game/home/homeWorldMapConfig";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import GameOptionsButton from "@/components/game/options/GameOptionsButton";
import MuteButton from "@/components/ui/MuteButton";
import { getLeader } from "@/data/leaders";
import { getLeaderPortraitAsset } from "@/lib/art";
import { cn } from "@/lib/cn";
import { getHomeEffectAsset, type HomeEffectId } from "@/lib/homeEffectAssets";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import { teamPower } from "@/lib/teamPower";

const HomeEffectsQaPanel = dynamic(
  () => import("@/components/game/home/HomeEffectsQaEditor").then((module) => module.HomeEffectsQaPanel),
  { ssr: false },
);

type HomeWorldFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
  cropX: number;
  cropY: number;
};

export type { HomeHotspot } from "@/components/game/home/types";

export default function HomeWorldMap({
  hotspots,
  tutorialOpen,
  qaClean = false,
  qaEffects = false,
}: {
  hotspots: HomeHotspot[];
  tutorialOpen: boolean;
  qaClean?: boolean;
  qaEffects?: boolean;
}) {
  const { t } = useI18n();
  const sceneRef = useRef<HTMLElement | null>(null);
  const account = useGameStore((state) => state.account);
  const resources = useGameStore((state) => state.resources);
  const heroes = useGameStore((state) => state.heroes);
  const team = useGameStore((state) => state.team);
  const activeLeaderId = useGameStore((state) => state.activeLeaderId);
  const leader = getLeader(activeLeaderId);
  const portrait = getLeaderPortraitAsset(activeLeaderId);
  const [now, setNow] = useState<number | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [activeZone, setActiveZone] = useState<HomeZoneId | null>(null);
  const [hideOverlays, setHideOverlays] = useState(false);
  const [worldFrame, setWorldFrame] = useState<HomeWorldFrame | null>(null);
  const [qaEffectDefs, setQaEffectDefs] = useState<HomeLandmarkEffectConfig[]>(HOME_LANDMARK_EFFECT_DEFS);
  const [qaEffectsStorageReady, setQaEffectsStorageReady] = useState(false);
  const [selectedQaEffectId, setSelectedQaEffectId] = useState<string | null>(HOME_LANDMARK_EFFECT_DEFS[0]?.id ?? null);

  const progress = useMemo(() => Math.min(100, Math.max(12, account.xp % 100 || 12)), [account.xp]);
  const rosterPower = useMemo(() => {
    const squad = team.flatMap((heroId) => {
      const hero = heroes.find((item) => item.heroId === heroId);
      return hero ? [{ heroId: hero.heroId, level: hero.level, stars: hero.stars }] : [];
    });
    return teamPower(squad);
  }, [heroes, team]);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHideOverlays(window.localStorage.getItem("codex:hideOverlays") === "1");
  }, []);

  useEffect(() => {
    if (!qaEffects || typeof window === "undefined") {
      setQaEffectsStorageReady(false);
      return;
    }

    const raw = window.localStorage.getItem(HOME_EFFECTS_QA_STORAGE_KEY);
    if (raw) {
      try {
        setQaEffectDefs(mergeHomeEffectQaEdits(JSON.parse(raw)));
      } catch {
        setQaEffectDefs(HOME_LANDMARK_EFFECT_DEFS);
      }
    } else {
      setQaEffectDefs(HOME_LANDMARK_EFFECT_DEFS);
    }
    setSelectedQaEffectId((current) => current ?? HOME_LANDMARK_EFFECT_DEFS[0]?.id ?? null);
    setQaEffectsStorageReady(true);
  }, [qaEffects]);

  useEffect(() => {
    if (!qaEffects || !qaEffectsStorageReady || typeof window === "undefined") return;
    window.localStorage.setItem(HOME_EFFECTS_QA_STORAGE_KEY, JSON.stringify(qaEffectDefs));
  }, [qaEffectDefs, qaEffects, qaEffectsStorageReady]);

  useEffect(() => {
    if (!sceneRef.current || typeof window === "undefined") return;

    const node = sceneRef.current;
    let frameId = 0;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const compact = rect.width < 768;
      const scale = compact
        ? Math.max(rect.width / HOME_DESIGN_WIDTH, rect.height / HOME_DESIGN_HEIGHT)
        : Math.min(rect.width / HOME_DESIGN_WIDTH, rect.height / HOME_DESIGN_HEIGHT);
      const scaledWidth = HOME_DESIGN_WIDTH * scale;
      const scaledHeight = HOME_DESIGN_HEIGHT * scale;
      const left = (rect.width - scaledWidth) / 2;
      const top = (rect.height - scaledHeight) / 2;
      const cropX = Math.max(0, (scaledWidth - rect.width) / 2);
      const cropY = Math.max(0, (scaledHeight - rect.height) / 2);

      setWorldFrame((current) => {
        if (
          current &&
          Math.abs(current.left - left) < 0.5 &&
          Math.abs(current.top - top) < 0.5 &&
          Math.abs(current.width - scaledWidth) < 0.5 &&
          Math.abs(current.height - scaledHeight) < 0.5 &&
          Math.abs(current.scale - scale) < 0.001
        ) {
          return current;
        }

        const next = { left, top, width: scaledWidth, height: scaledHeight, scale, cropX, cropY };
        (window as typeof window & { __HOME_STAGE_DEBUG__?: typeof next }).__HOME_STAGE_DEBUG__ = next;
        return next;
      });
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(measure);
    };

    scheduleMeasure();
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(node);
    window.addEventListener("resize", scheduleMeasure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const cleanMode = qaClean || hideOverlays;
  const desktopDockActions = useMemo(() => DOCK_ACTIONS.filter((action) => !action.mobileOnly), []);
  const groupedQaEffects = useMemo(() => groupHomeLandmarkEffects(qaEffectDefs), [qaEffectDefs]);
  const worldQaEffects = useMemo(() => getHomeWorldEffects(qaEffectDefs), [qaEffectDefs]);
  const updateQaEffect = useCallback<HomeEffectsQaEditorState["onChange"]>((id, patch) => {
    setQaEffectDefs((current) =>
      current.map((effect) => {
        if (effect.id !== id) return effect;
        const asset = patch.effect ? getHomeEffectAsset(patch.effect) : null;
        return {
          ...effect,
          ...patch,
          ...(asset ? { frameCount: asset.frameCount } : {}),
        };
      }),
    );
  }, []);
  const saveQaEffects = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(HOME_EFFECTS_QA_STORAGE_KEY, JSON.stringify(qaEffectDefs));
  }, [qaEffectDefs]);
  const saveQaEffectsToCode = useCallback(async () => {
    const response = await fetch("/api/dev/home-effects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ effects: qaEffectDefs }),
    });
    const result = (await response.json()) as { ok?: boolean; message?: string };
    if (!response.ok || !result.ok) {
      throw new Error(result.message ?? "Could not save effects to code");
    }
    return result.message ?? "Saved to code";
  }, [qaEffectDefs]);
  const createQaEffect = useCallback((effect: HomeEffectId) => {
    setQaEffectDefs((current) => {
      const asset = getHomeEffectAsset(effect);
      const id = createDuplicateEffectId(`qa-${effect}`, current);
      const nextEffect: HomeLandmarkEffectConfig = {
        id,
        landmark: "world",
        effect,
        xPercent: 50,
        yPercent: 50,
        widthPercent: effect.includes("banner") ? 2.6 : 2,
        heightPercent: effect.includes("banner") ? 5.2 : 4,
        opacity: 1,
        frameCount: asset?.frameCount ?? 1,
        durationMs: effect.includes("flag") || effect.includes("banner") ? 1100 : 760,
        enabled: true,
        backgroundY: "52%",
      };

      setSelectedQaEffectId(id);
      return [...current, nextEffect];
    });
  }, []);
  const duplicateQaEffect = useCallback((id: string) => {
    setQaEffectDefs((current) => {
      const sourceIndex = current.findIndex((effect) => effect.id === id);
      const source = current[sourceIndex];
      if (!source) return current;

      const duplicate = {
        ...source,
        id: createDuplicateEffectId(source.id, current),
        xPercent: Math.min(100, Math.round((source.xPercent + 2) * 10) / 10),
        yPercent: Math.min(100, Math.round((source.yPercent + 2) * 10) / 10),
      };
      const next = [...current];
      next.splice(sourceIndex + 1, 0, duplicate);
      setSelectedQaEffectId(duplicate.id);
      return next;
    });
  }, []);
  const duplicateQaEffectToWorld = useCallback((id: string) => {
    setQaEffectDefs((current) => {
      const sourceIndex = current.findIndex((effect) => effect.id === id);
      const source = current[sourceIndex];
      if (!source) return current;

      const duplicate = {
        ...source,
        id: createDuplicateEffectId(`${source.id}-world`, current),
        landmark: "world" as const,
        xPercent: 50,
        yPercent: 50,
        widthPercent: Math.max(1, Math.min(18, source.widthPercent)),
        heightPercent: Math.max(1, Math.min(18, source.heightPercent)),
      };
      const next = [...current];
      next.splice(sourceIndex + 1, 0, duplicate);
      setSelectedQaEffectId(duplicate.id);
      return next;
    });
  }, []);
  const removeQaEffect = useCallback((id: string) => {
    setQaEffectDefs((current) => {
      if (current.length <= 1) return current;
      const next = current.filter((effect) => effect.id !== id);
      if (selectedQaEffectId === id) {
        setSelectedQaEffectId(next[0]?.id ?? null);
      }
      return next;
    });
  }, [selectedQaEffectId]);
  const replaceQaEffects = useCallback((value: string) => {
    const parsed = JSON.parse(value) as unknown;
    const merged = mergeHomeEffectQaEdits(parsed);
    setQaEffectDefs(merged);
    setSelectedQaEffectId(merged[0]?.id ?? null);
  }, []);
  const resetQaEffects = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(HOME_EFFECTS_QA_STORAGE_KEY);
    }
    setQaEffectDefs(HOME_LANDMARK_EFFECT_DEFS);
    setSelectedQaEffectId(HOME_LANDMARK_EFFECT_DEFS[0]?.id ?? null);
  }, []);
  const qaEditor = useMemo<HomeEffectsQaEditorState | undefined>(() => {
    if (!qaEffects) return undefined;
    return {
      selectedId: selectedQaEffectId,
      onSelect: setSelectedQaEffectId,
      onChange: updateQaEffect,
    };
  }, [qaEffects, selectedQaEffectId, updateQaEffect]);

  const timers = {
    reward: now === null ? "--:--:--" : formatCountdown(msUntilMidnight(now)),
    event: now === null ? "--:--:--" : formatCountdown(msUntilDailyHour(now, 20)),
  };

  return (
    <section
      ref={sceneRef}
      data-home-clean={cleanMode ? "1" : "0"}
      className="relative min-h-dvh overflow-hidden bg-[#09111d] text-white"
      onPointerMove={(event) => {
        if (!sceneRef.current) return;
        const rect = sceneRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        setParallax({ x, y });
      }}
      onPointerLeave={() => setParallax({ x: 0, y: 0 })}
    >
      <HomeWorldMapStyles />

      <div
        data-home-world-stage
        data-home-stage-ready={worldFrame ? "1" : "0"}
        className={cn(
          "absolute z-10",
          worldFrame ? "pointer-events-none" : "pointer-events-none inset-0",
        )}
        style={
          worldFrame
            ? ({
                left: `${worldFrame.left}px`,
                top: `${worldFrame.top}px`,
                width: `${HOME_DESIGN_WIDTH}px`,
                height: `${HOME_DESIGN_HEIGHT}px`,
                transform: `scale(${worldFrame.scale})`,
                transformOrigin: "top left",
                ["--home-stage-scale" as string]: `${worldFrame.scale}`,
                ["--home-stage-crop-x" as string]: `${worldFrame.cropX}px`,
                ["--home-stage-crop-y" as string]: `${worldFrame.cropY}px`,
              } as CSSProperties)
            : undefined
        }
      >
        <div className="relative h-full w-full overflow-visible">
          <HomeScene
            activeZone={activeZone}
            parallax={parallax}
            effectsByLandmark={qaEffects ? groupedQaEffects : undefined}
            worldEffects={qaEffects ? worldQaEffects : undefined}
            qaEditor={qaEditor}
          />
          {hotspots.map((spot) => (
            <WorldHotspot
              key={`${spot.zoneId}-${spot.href}`}
              spot={spot}
              qaDisabled={qaEffects}
              onActivate={(zone) => setActiveZone(zone)}
              onDeactivate={() => setActiveZone((current) => (current === spot.zoneId ? null : current))}
            />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,17,0.14),rgba(5,8,17,0.04)_22%,rgba(5,8,17,0)_52%,rgba(6,10,16,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(7,10,18,0.92))]" />

      <div className="pointer-events-auto absolute left-3 top-3 z-30 flex origin-top-left scale-[0.84] flex-col gap-2 md:left-5 md:top-4 md:scale-100">
        <CommanderBanner
          level={account.level}
          name={account.name}
          power={formatCompact(rosterPower)}
          progress={progress}
          portrait={portrait}
          leaderTitle={leader.title}
          groupLabel={t("home.commanderGroup")}
          levelLabel={t("common.level")}
          powerLabel={t("common.power")}
        />
        {!cleanMode ? (
          <div className={cn(tutorialOpen && "hidden md:block")}>
            <DailyLoginCharm />
          </div>
        ) : null}
      </div>

      <div className="pointer-events-auto absolute right-3 top-3 z-30 flex max-w-[calc(100vw-18rem)] flex-col items-end gap-1.5 md:right-5 md:top-4 md:max-w-none md:flex-row md:items-start md:gap-2">
        <GameResourceBar resources={resources} size="sm" className="flex-col flex-nowrap items-end gap-1.5 md:flex-row md:flex-wrap md:items-start md:gap-2.5" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <GameOptionsButton />
          <MuteButton />
        </div>
      </div>

      {tutorialOpen && !cleanMode ? (
        <div className="pointer-events-none absolute right-5 top-[6.8rem] z-30 hidden md:block">
          <div className="rounded-full border border-[#f0c75a]/20 bg-[linear-gradient(180deg,rgba(18,13,7,0.68),rgba(9,10,16,0.94))] px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#fff1bf] shadow-[0_14px_28px_rgba(0,0,0,0.28)]">
            {t("home.tutorialHint")}
          </div>
        </div>
      ) : null}

      <div
        className="pointer-events-auto absolute inset-x-3 bottom-[var(--home-cta-bottom-mobile)] z-30 grid grid-cols-[1fr_auto_1fr] items-end md:bottom-[var(--home-cta-bottom-desktop)] md:inset-x-5"
        style={{
          ["--home-cta-bottom-mobile" as string]: HOME_CTA_LAYOUT.mobileBottom,
          ["--home-cta-bottom-desktop" as string]: HOME_CTA_LAYOUT.desktopBottom,
        }}
      >
        <div className="justify-self-start">
          <CornerAction href="/missions" label={t("nav.quests")} sublabel={timers.reward} tone="gold" icon="quests" compact={cleanMode} />
        </div>
        <div
          className="origin-bottom translate-y-1 justify-self-center scale-[var(--home-cta-mobile-scale)] md:translate-y-4 md:scale-100"
          style={{ ["--home-cta-mobile-scale" as string]: HOME_CTA_LAYOUT.mobileScale }}
        >
          <FightCrystal href="/adventure" />
        </div>
        <div className="justify-self-end">
          <CornerAction href="/events" label={t("nav.pass")} sublabel={timers.event} tone="violet" icon="pass" modeIcon="daily_event" compact={cleanMode} />
        </div>
      </div>

      <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-30 md:inset-x-0 md:bottom-4">
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-14 rounded-[999px] bg-[radial-gradient(circle_at_50%_50%,rgba(9,16,26,0.72),transparent_74%)] blur-2xl md:inset-x-[calc(50%-16rem)]" />
        <div className="mx-auto flex max-w-[22rem] items-center justify-center gap-3 px-2 py-1 sm:hidden">
          {DOCK_ACTIONS.map((action, index) => (
            <DockShrine key={action.href} {...action} label={t(action.labelKey)} delay={`${index * 0.08}s`} />
          ))}
        </div>
        <div className="mx-auto hidden max-w-[58rem] grid-cols-[1fr_minmax(20rem,25rem)_1fr] items-end gap-3 px-5 py-1 sm:grid md:max-w-[68rem] md:grid-cols-[1fr_minmax(27rem,32rem)_1fr] md:gap-5">
          <div className="flex justify-end gap-3 md:gap-5">
            {DOCK_ACTIONS.slice(0, 2).map((action, index) => (
              <DockShrine key={action.href} {...action} label={t(action.labelKey)} delay={`${index * 0.08}s`} />
            ))}
          </div>
          <div aria-hidden className="h-1" />
          <div className="flex justify-start gap-3 md:gap-5">
            {desktopDockActions.slice(2).map((action, index) => (
              <DockShrine key={action.href} {...action} label={t(action.labelKey)} delay={`${(index + 2) * 0.08}s`} />
            ))}
          </div>
        </div>
      </div>

      {qaEffects ? (
        <HomeEffectsQaPanel
          effects={qaEffectDefs}
          selectedId={selectedQaEffectId}
          onSelect={setSelectedQaEffectId}
          onChange={updateQaEffect}
          onSave={saveQaEffects}
          onSaveToCode={saveQaEffectsToCode}
          onCreate={createQaEffect}
          onDuplicate={duplicateQaEffect}
          onDuplicateToWorld={duplicateQaEffectToWorld}
          onRemove={removeQaEffect}
          onImport={replaceQaEffects}
          onReset={resetQaEffects}
        />
      ) : null}
    </section>
  );
}
