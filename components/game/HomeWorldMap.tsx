"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { HomeEffectsQaPanel, type HomeEffectsQaEditorState } from "@/components/game/home/HomeEffectsQaEditor";
import HomeIcon, { type HomeIconKind } from "@/components/game/home/HomeIcon";
import HomeScene from "@/components/game/home/HomeScene";
import {
  HOME_EFFECTS_QA_STORAGE_KEY,
  createDuplicateEffectId,
  mergeHomeEffectQaEdits,
} from "@/components/game/home/homeEffectsQaState";
import { HOME_CTA_LAYOUT, HOME_DESIGN_HEIGHT, HOME_DESIGN_WIDTH } from "@/components/game/home/homeComposition";
import { HOME_LANDMARK_EFFECT_DEFS, getHomeWorldEffects, groupHomeLandmarkEffects, type HomeLandmarkEffectConfig } from "@/components/game/home/homeEffectLayout";
import { type HomeTone, type HomeZoneId } from "@/components/game/home/types";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { ModeIcon, type ModeIconName } from "@/components/game/shared/ModeIcon";
import GameOptionsButton from "@/components/game/options/GameOptionsButton";
import MuteButton from "@/components/ui/MuteButton";
import { getLeader } from "@/data/leaders";
import { teamPower } from "@/features/tactical/engine";
import { sfx } from "@/lib/audio";
import { getLeaderPortrait } from "@/lib/art";
import { cn } from "@/lib/cn";
import { getHomeEffectAsset, type HomeEffectId } from "@/lib/homeEffectAssets";
import { type HomeLandmarkId } from "@/lib/homeLandmarkAssets";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";

type HomeWorldFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
  cropX: number;
  cropY: number;
};

export type HomeHotspot = {
  zoneId: HomeZoneId;
  href: string;
  label: string;
  sublabel: string;
  icon: HomeIconKind;
  modeIcon?: ModeIconName;
  landmarkId?: HomeLandmarkId;
  tone: HomeTone;
  anchorX: string;
  anchorY: string;
  mobileAnchorX?: string;
  mobileAnchorY?: string;
  width?: string;
  height?: string;
  mobileWidth?: string;
  mobileHeight?: string;
  badge?: string | number;
  labelDx?: string;
  labelDy?: string;
  mobileLabelDx?: string;
  mobileLabelDy?: string;
  plaqueWidth?: string;
  mobilePlaqueWidth?: string;
};

const SIDE_ACTIONS = [
  { href: "/shop", labelKey: "nav.offers", sublabelKey: "home.hotDrops", icon: "offers" as const, tone: "rose" as const },
  { href: "/missions", labelKey: "nav.rewards", sublabelKey: "home.claim", icon: "rewards" as const, tone: "gold" as const },
  { href: "/events", labelKey: "nav.events", sublabelKey: "home.liveNow", icon: "events" as const, modeIcon: "daily_event" as const, tone: "violet" as const },
];

const DOCK_ACTIONS = [
  { href: "/team", labelKey: "nav.team", icon: "team" as const, tone: "sky" as const },
  { href: "/missions", labelKey: "nav.quests", icon: "missions" as const, tone: "gold" as const },
  { href: "/roster", labelKey: "nav.heroes", icon: "heroes" as const, tone: "violet" as const },
  { href: "/deck", labelKey: "nav.deck", icon: "deck" as const, tone: "emerald" as const },
];

const TONE_STYLES: Record<
  HomeTone,
  {
    ring: string;
    wash: string;
    text: string;
    panel: string;
    solid: string;
    soft: string;
  }
> = {
  gold: {
    ring: "border-[#f0c75a]/45",
    wash: "from-[#f8d47a]/54 via-[#f0c75a]/18 to-transparent",
    text: "text-[#fff1bf]",
    panel: "from-[#2b1c10]/95 via-[#17120c]/96 to-[#100d0a]/98",
    solid: "#f0c75a",
    soft: "rgba(240,199,90,0.22)",
  },
  violet: {
    ring: "border-fuchsia-300/38",
    wash: "from-fuchsia-300/56 via-fuchsia-300/16 to-transparent",
    text: "text-fuchsia-100",
    panel: "from-[#28142f]/95 via-[#18101f]/96 to-[#110b16]/98",
    solid: "#d8a5ff",
    soft: "rgba(216,165,255,0.2)",
  },
  sky: {
    ring: "border-sky-300/38",
    wash: "from-sky-300/52 via-sky-300/16 to-transparent",
    text: "text-sky-100",
    panel: "from-[#0f263b]/95 via-[#0b1824]/96 to-[#081118]/98",
    solid: "#87dcff",
    soft: "rgba(135,220,255,0.22)",
  },
  emerald: {
    ring: "border-emerald-300/38",
    wash: "from-emerald-300/52 via-emerald-300/16 to-transparent",
    text: "text-emerald-100",
    panel: "from-[#14291e]/95 via-[#0d1611]/96 to-[#0a110d]/98",
    solid: "#7de3ac",
    soft: "rgba(125,227,172,0.22)",
  },
  rose: {
    ring: "border-rose-300/38",
    wash: "from-rose-300/52 via-rose-300/16 to-transparent",
    text: "text-rose-100",
    panel: "from-[#30161b]/95 via-[#1a1013]/96 to-[#120c10]/98",
    solid: "#ff9a84",
    soft: "rgba(255,154,132,0.22)",
  },
};

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${value}`;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function msUntilMidnight(now: number) {
  const date = new Date(now);
  const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return midnight.getTime() - now;
}

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
  const portrait = getLeaderPortrait(activeLeaderId);
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
    ranking: formatCountdown(1000 * 60 * 60 * 6 + 1000 * 60 * 32),
    event: formatCountdown(1000 * 60 * 60 * 20 + 1000 * 60 * 11),
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
      <style jsx global>{`
        @keyframes homeHudPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.98); }
          50% { opacity: 0.95; transform: scale(1.06); }
        }
        @keyframes homeMarkerFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes homeDockBreathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes homeIconAura {
          0%, 100% { opacity: 0.56; transform: scale(0.94); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes homeIconSweep {
          0%, 100% { opacity: 0.16; transform: translateY(-6%) scaleX(0.84); }
          50% { opacity: 0.42; transform: translateY(6%) scaleX(1); }
        }
        @keyframes homeResourceGlint {
          0%, 100% { opacity: 0.3; transform: translateX(-10%) skewX(-18deg); }
          50% { opacity: 0.8; transform: translateX(10%) skewX(-18deg); }
        }
        @keyframes homeBeaconPulse {
          0%, 100% { opacity: 0.36; transform: scale(0.92); }
          50% { opacity: 0.92; transform: scale(1.1); }
        }
        @keyframes homeBeaconOrbit {
          0% { transform: rotate(0deg) translateX(13px) rotate(0deg); opacity: 0.42; }
          50% { opacity: 0.9; }
          100% { transform: rotate(360deg) translateX(13px) rotate(-360deg); opacity: 0.42; }
        }
        @keyframes homeBeaconRay {
          0%, 100% { opacity: 0.12; transform: translate(-50%, -50%) scaleY(0.92); }
          50% { opacity: 0.44; transform: translate(-50%, -50%) scaleY(1.08); }
        }
        @keyframes homePlaqueGlow {
          0%, 100% { box-shadow: 0 16px 28px rgba(0,0,0,0.32); }
          50% { box-shadow: 0 18px 34px rgba(0,0,0,0.34), 0 0 22px rgba(255,255,255,0.08); }
        }
        @keyframes homeZoneBreath {
          0%, 100% { opacity: 0.22; transform: scale(0.96); }
          50% { opacity: 0.7; transform: scale(1.04); }
        }
        @keyframes homeRibbonSweep {
          0% { opacity: 0; transform: translateX(-42%) skewX(-18deg); }
          18% { opacity: 0.34; }
          46% { opacity: 0.12; }
          100% { opacity: 0; transform: translateX(40%) skewX(-18deg); }
        }
      `}</style>

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
          <div className="hidden gap-2 md:flex">
            <TimedCharm label={t("nav.rewards")} value={timers.reward} tone="gold" icon="quests" />
            <TimedCharm label={t("nav.pass")} value={timers.event} tone="violet" icon="pass" />
          </div>
        ) : null}
      </div>

      <div className="pointer-events-auto absolute right-3 top-3 z-30 flex max-w-[calc(100vw-9rem)] items-start gap-1.5 md:right-5 md:top-4 md:max-w-none md:gap-2">
        <GameResourceBar resources={resources} size="sm" />
        <GameOptionsButton />
        <MuteButton />
      </div>

      <div className="pointer-events-auto absolute right-3 top-[8.9rem] z-30 hidden flex-col gap-2.5 md:right-5 md:flex">
        {SIDE_ACTIONS.map((action, index) => (
          <SideCharm key={action.href} {...action} label={t(action.labelKey)} sublabel={t(action.sublabelKey)} delay={`${index * 0.16}s`} />
        ))}
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
          className="origin-bottom justify-self-center scale-[var(--home-cta-mobile-scale)] md:scale-100"
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
        <div className="mx-auto flex max-w-[22rem] items-center justify-center gap-3 px-2 py-1 md:max-w-[30rem] md:gap-5 md:px-5">
          {DOCK_ACTIONS.map((action, index) => (
            <DockShrine key={action.href} {...action} label={t(action.labelKey)} delay={`${index * 0.08}s`} />
          ))}
        </div>
      </div>

      <div className="pointer-events-auto absolute right-3 top-[5rem] z-30 flex gap-2 md:hidden">
        {SIDE_ACTIONS.map((action, index) => (
          <MiniActionCharm key={action.href} {...action} label={t(action.labelKey)} delay={`${index * 0.12}s`} />
        ))}
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

function CommanderBanner({
  level,
  name,
  power,
  progress,
  portrait,
  leaderTitle,
  groupLabel,
  levelLabel,
  powerLabel,
}: {
  level: number;
  name: string;
  power: string;
  progress: number;
  portrait: string | null;
  leaderTitle: string;
  groupLabel: string;
  levelLabel: string;
  powerLabel: string;
}) {
  return (
    <Link
      href="/roster"
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="group relative flex w-[17.4rem] items-center gap-3 rounded-[28px] border border-[#f1c96c]/20 bg-[linear-gradient(180deg,rgba(19,16,15,0.66),rgba(8,10,16,0.94))] px-3 py-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl"
    >
      <span className="absolute inset-x-[12%] top-0 h-[38%] rounded-full bg-white/10 blur-md opacity-70" />
      <span className="absolute bottom-[-10px] left-10 h-5 w-16 rounded-full bg-black/34 blur-xl" />
      <span className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-[26px] border border-[#f0c75a]/34 bg-[linear-gradient(180deg,rgba(58,34,17,0.92),rgba(18,13,12,0.98))] shadow-[0_14px_28px_rgba(0,0,0,0.34)]" />
        <span className="absolute inset-[8%] rounded-[22px] bg-[radial-gradient(circle_at_50%_28%,rgba(255,213,122,0.46),transparent_62%)] blur-md" />
        {portrait ? (
          <img
            src={portrait}
            alt=""
            className="relative z-[1] h-[3.7rem] w-[3.7rem] rounded-[18px] object-cover object-top brightness-[1.04] contrast-[1.06]"
          />
        ) : (
          <span className="relative z-[1] h-[3.3rem] w-[3.3rem]">
            <HomeIcon kind="heroes" />
          </span>
        )}
        <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#f0c75a]/26 bg-[linear-gradient(180deg,rgba(32,22,12,0.94),rgba(14,10,8,0.98))] px-2 py-[0.18rem] text-[9px] font-black uppercase tracking-[0.18em] text-[#f8de9e]">
          {levelLabel} {level}
        </span>
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="block text-[8px] font-black uppercase tracking-[0.28em] text-white/54">{groupLabel}</span>
        <span className="mt-0.5 block truncate text-[1.2rem] font-black leading-none text-[#fff0cf]">{name}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-[#f0c75a]/22 bg-[linear-gradient(180deg,rgba(49,33,18,0.88),rgba(16,11,8,0.98))] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
            {leaderTitle}
          </span>
          <span className="rounded-full border border-sky-200/16 bg-[linear-gradient(180deg,rgba(10,20,31,0.82),rgba(7,10,17,0.98))] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/74">
            {powerLabel} {power}
          </span>
        </span>
        <span className="mt-2 block h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/34">
          <span
            className="block h-full rounded-full bg-[linear-gradient(90deg,#f6cf67,#f0a85a,#7ad8ff)] shadow-[0_0_18px_rgba(255,205,111,0.42)]"
            style={{ width: `${progress}%` }}
          />
        </span>
      </span>
    </Link>
  );
}

function ResourceTotem({
  href,
  label,
  value,
  icon,
  tone,
}: {
  href: string;
  label: string;
  value: string;
  icon: HomeIconKind;
  tone: HomeTone;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className={cn(
        "group relative flex min-w-[5.8rem] items-center gap-1.5 rounded-[20px] border bg-[linear-gradient(180deg,rgba(11,15,22,0.68),rgba(7,10,16,0.96))] px-2 py-1.5 shadow-[0_14px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        palette.ring,
      )}
    >
      <span className="absolute inset-x-[12%] top-0 h-[36%] rounded-full bg-white/10 blur-sm opacity-70" />
      <span className={cn("absolute inset-[10%] rounded-[20px] bg-gradient-to-br opacity-0 blur-xl transition group-hover:opacity-100", palette.wash)} />
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
        <span className="absolute bottom-[0.2rem] h-3 w-9 rounded-full bg-black/30 blur-md" />
        <span className={cn("absolute inset-0 rounded-full bg-gradient-to-br opacity-68 blur-xl transition group-hover:opacity-100", palette.wash)} />
        <span className="relative z-[1] h-[2.85rem] w-[2.85rem] transition group-hover:-translate-y-0.5 group-hover:scale-[1.08]">
          <HomeIcon kind={icon} />
        </span>
      </span>
      <span className="relative min-w-0">
        <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-white/44">{label}</span>
        <span className={cn("block text-[0.94rem] font-black leading-none", palette.text)}>{value}</span>
      </span>
    </Link>
  );
}

function TimedCharm({
  label,
  value,
  tone,
  icon,
  className,
}: {
  label: string;
  value: string;
  tone: HomeTone;
  icon: HomeIconKind;
  className?: string;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[24px] border bg-[linear-gradient(180deg,rgba(14,17,26,0.76),rgba(8,10,17,0.98))] px-2.5 py-2 shadow-[0_16px_30px_rgba(0,0,0,0.26)] backdrop-blur-xl",
        palette.ring,
        className,
      )}
    >
      <span className="relative grid h-12 w-12 place-items-center">
        <span className={cn("absolute inset-0 rounded-full bg-gradient-to-br opacity-76 blur-xl", palette.wash)} />
        <span className="absolute bottom-1 h-3 w-9 rounded-full bg-black/32 blur-md" />
        <span className="relative block h-[2.95rem] w-[2.95rem]">
          <HomeIcon kind={icon} />
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-[8px] font-black uppercase tracking-[0.18em] text-white/44">{label}</span>
        <span className={cn("mt-0.5 block text-[11px] font-black", palette.text)}>{value}</span>
      </span>
    </div>
  );
}

function HomeVisualIcon({
  icon,
  modeIcon,
  className,
}: {
  icon: HomeIconKind;
  modeIcon?: ModeIconName;
  className?: string;
}) {
  if (modeIcon) {
    return <ModeIcon name={modeIcon} size="xl" className={className} imgClassName="h-full w-full object-contain" />;
  }

  return <HomeIcon kind={icon} className={className} />;
}

function SideCharm({
  href,
  label,
  sublabel,
  icon,
  modeIcon,
  tone,
  delay,
}: {
  href: string;
  label: string;
  sublabel: string;
  icon: HomeIconKind;
  modeIcon?: ModeIconName;
  tone: HomeTone;
  delay: string;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="group flex items-center gap-1.5 opacity-86 transition hover:opacity-100"
      style={{ animation: `homeDockBreathe 5.4s ease-in-out ${delay} infinite` }}
    >
      <span className="relative flex h-[3.45rem] w-[3.25rem] items-end justify-center">
        <span className="absolute bottom-0.5 h-3 w-8 rounded-full bg-black/30 blur-md" />
        <span className={cn("absolute bottom-[0.25rem] h-[2.8rem] w-[2.8rem] rounded-full bg-gradient-to-br opacity-70 blur-xl", palette.wash)} />
        <span className="relative z-[1] h-[2.75rem] w-[2.75rem] transition group-hover:-translate-y-0.5 group-hover:scale-[1.08]">
          <HomeVisualIcon icon={icon} modeIcon={modeIcon} />
        </span>
      </span>
      <span
        className={cn(
          "relative min-w-[5.8rem] rounded-[15px] border px-2.25 py-1.25 text-left shadow-[0_12px_22px_rgba(0,0,0,0.2)] backdrop-blur-xl transition group-hover:-translate-y-0.5",
          "bg-[linear-gradient(180deg,rgba(11,15,23,0.74),rgba(7,10,16,0.96))]",
          palette.ring,
        )}
      >
        <span className={cn("absolute inset-y-[18%] left-0 top-auto w-[12%] rounded-full bg-gradient-to-b opacity-60 blur-sm", palette.wash)} />
        <span className="relative block text-[6px] font-black uppercase tracking-[0.22em] text-white/40">{sublabel}</span>
        <span className={cn("relative mt-0.5 block text-[9px] font-black uppercase tracking-[0.16em]", palette.text)}>{label}</span>
      </span>
    </Link>
  );
}

function MiniActionCharm({
  href,
  label,
  icon,
  modeIcon,
  tone,
  delay,
}: {
  href: string;
  label: string;
  icon: HomeIconKind;
  modeIcon?: ModeIconName;
  tone: HomeTone;
  delay: string;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      title={label}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="relative flex h-[3rem] w-[2.8rem] items-end justify-center"
      style={{ animation: `homeDockBreathe 5.2s ease-in-out ${delay} infinite` }}
    >
      <span className="absolute bottom-0.5 h-2.5 w-8 rounded-full bg-black/28 blur-md" />
      <span className={cn("absolute bottom-[0.3rem] h-[2.7rem] w-[2.7rem] rounded-full bg-gradient-to-br opacity-72 blur-xl", palette.wash)} />
      <span className="relative h-[2.65rem] w-[2.65rem]">
        <HomeVisualIcon icon={icon} modeIcon={modeIcon} />
      </span>
    </Link>
  );
}

function DockShrine({
  href,
  label,
  icon,
  tone,
  delay,
}: {
  href: string;
  label: string;
  icon: HomeIconKind;
  tone: HomeTone;
  delay: string;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="group flex flex-col items-center gap-1"
      style={{ animation: `homeDockBreathe 5.8s ease-in-out ${delay} infinite` }}
    >
      <span className="relative flex h-[4.35rem] w-[4.05rem] items-end justify-center md:h-[4.75rem] md:w-[4.35rem]">
        <span className="absolute bottom-1 h-3.5 w-10 rounded-full bg-black/32 blur-md" />
        <span className={cn("absolute bottom-[0.55rem] h-[3.35rem] w-[3.35rem] rounded-full bg-gradient-to-br opacity-76 blur-2xl md:h-[3.7rem] md:w-[3.7rem]", palette.wash)} />
        <span className="relative h-[3.15rem] w-[3.15rem] transition group-hover:-translate-y-0.5 group-hover:scale-[1.08] md:h-[3.45rem] md:w-[3.45rem]">
          <HomeIcon kind={icon} />
        </span>
      </span>
      <span
        className={cn(
          "rounded-full border px-2 py-[0.25rem] text-[7px] font-black uppercase tracking-[0.16em] shadow-[0_10px_18px_rgba(0,0,0,0.24)] backdrop-blur-xl md:px-2.5 md:text-[8px]",
          palette.ring,
          palette.text,
          "bg-[linear-gradient(180deg,rgba(12,16,24,0.76),rgba(7,10,16,0.96))]",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function CornerAction({
  href,
  label,
  sublabel,
  tone,
  icon,
  modeIcon,
  compact = false,
}: {
  href: string;
  label: string;
  sublabel: string;
  tone: HomeTone;
  icon: HomeIconKind;
  modeIcon?: ModeIconName;
  compact?: boolean;
}) {
  const palette = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className={cn(
        "flex items-center gap-2 rounded-[22px] border bg-[linear-gradient(180deg,rgba(12,17,26,0.68),rgba(7,10,18,0.96))] px-2 py-1.5 shadow-[0_16px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        compact && "scale-[0.92] opacity-92",
        palette.ring,
      )}
    >
      <span className="relative flex h-12 w-12 items-end justify-center">
        <span className="absolute bottom-1 h-3 w-9 rounded-full bg-black/28 blur-md" />
        <span className={cn("absolute bottom-[0.25rem] h-[2.95rem] w-[2.95rem] rounded-full bg-gradient-to-br opacity-74 blur-xl", palette.wash)} />
        <span className="relative h-[2.85rem] w-[2.85rem]">
          <HomeVisualIcon icon={icon} modeIcon={modeIcon} />
        </span>
      </span>
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/48">{label}</div>
        <div className={cn("mt-0.5 text-[11px] font-black", palette.text)}>{sublabel}</div>
      </div>
    </Link>
  );
}

function FightCrystal({ href }: { href: string }) {
  const { t } = useI18n();

  return (
    <Link
      href={href}
      onMouseEnter={() => sfx.hover()}
      onPointerDown={() => sfx.tap()}
      className="group relative flex items-center gap-3 rounded-[28px] border border-[#f0c75a]/34 bg-[linear-gradient(180deg,rgba(45,23,16,0.84),rgba(10,11,18,0.98))] px-4 py-3.5 shadow-[0_26px_52px_rgba(0,0,0,0.34),0_0_34px_rgba(255,151,103,0.16)] backdrop-blur-xl transition hover:-translate-y-0.5 md:gap-4 md:rounded-[34px] md:px-6 md:py-4.5"
    >
      <span className="absolute -bottom-5 left-1/2 h-8 w-[76%] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(circle_at_50%_50%,rgba(14,19,30,0.62),transparent_70%)] blur-2xl" />
      <span className="absolute inset-x-[18%] -bottom-2 h-5 rounded-[0_0_20px_20px] border border-[#f0c75a]/16 border-t-0 bg-[linear-gradient(180deg,rgba(36,22,16,0.92),rgba(11,12,18,0.98))]" />
      <span className="absolute left-[18%] bottom-1 h-6 w-10 rounded-[14px_14px_8px_8px] border border-[#f0c75a]/16 bg-[linear-gradient(180deg,rgba(18,21,31,0.92),rgba(8,10,16,0.98))] opacity-70" />
      <span className="absolute right-[18%] bottom-1 h-6 w-10 rounded-[14px_14px_8px_8px] border border-[#f0c75a]/16 bg-[linear-gradient(180deg,rgba(18,21,31,0.92),rgba(8,10,16,0.98))] opacity-70" />
      <span className="absolute inset-x-[14%] top-0 h-[48%] rounded-full bg-white/10 blur-lg opacity-80" />
      <span className="absolute inset-x-[24%] top-[0.55rem] h-px bg-[linear-gradient(90deg,transparent,rgba(255,233,187,0.68),transparent)] opacity-76" />
      <span className="relative flex h-16 w-16 items-end justify-center md:h-[4.9rem] md:w-[4.9rem]">
        <span className="absolute inset-[-12%] rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,216,122,0.64),rgba(255,126,103,0.2)_58%,transparent_78%)] blur-2xl" />
        <span className="absolute bottom-1 h-4 w-11 rounded-full bg-black/34 blur-md" />
        <span className="relative z-10 h-[3.55rem] w-[3.55rem] transition group-hover:scale-[1.08] md:h-[4.2rem] md:w-[4.2rem]">
          <ModeIcon name="campaign" size="xl" className="h-full w-full" />
        </span>
      </span>
      <div className="relative z-[1]">
        <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#ffdca1] md:text-[10px] md:tracking-[0.22em]">{t("home.mainQuest")}</div>
        <div className="text-[1.15rem] font-black text-white md:text-[1.5rem]">{t("home.adventureFight")}</div>
        <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/54">{t("home.pushFrontier")}</div>
      </div>
    </Link>
  );
}

function WorldHotspot({
  spot,
  qaDisabled = false,
  onActivate,
  onDeactivate,
}: {
  spot: HomeHotspot;
  qaDisabled?: boolean;
  onActivate: (zone: HomeZoneId) => void;
  onDeactivate: () => void;
}) {
  const style = {
    ["--spot-left" as string]: spot.anchorX,
    ["--spot-top" as string]: spot.anchorY,
    ["--spot-width" as string]: spot.width ?? spot.mobileWidth ?? "7rem",
    ["--spot-height" as string]: spot.height ?? spot.mobileHeight ?? "5rem",
    ["--spot-left-mobile" as string]: spot.mobileAnchorX ?? spot.anchorX,
    ["--spot-top-mobile" as string]: spot.mobileAnchorY ?? spot.anchorY,
    ["--spot-width-mobile" as string]: spot.mobileWidth ?? spot.width ?? "7rem",
    ["--spot-height-mobile" as string]: spot.mobileHeight ?? spot.height ?? "5rem",
    ["--spot-label-dx" as string]: spot.labelDx ?? "0rem",
    ["--spot-label-dy" as string]: spot.labelDy ?? "2.4rem",
    ["--spot-label-dx-mobile" as string]: spot.mobileLabelDx ?? spot.labelDx ?? "0rem",
    ["--spot-label-dy-mobile" as string]: spot.mobileLabelDy ?? spot.labelDy ?? "1.7rem",
    ["--spot-plaque-width" as string]: spot.plaqueWidth ?? spot.mobilePlaqueWidth ?? "8rem",
    ["--spot-plaque-width-mobile" as string]: spot.mobilePlaqueWidth ?? spot.plaqueWidth ?? "6rem",
  } as CSSProperties;

  return (
    <WorldHotspotAnchor spot={spot} qaDisabled={qaDisabled} onActivate={onActivate} onDeactivate={onDeactivate} style={style} />
  );
}

function WorldHotspotAnchor({
  spot,
  qaDisabled,
  style,
  onActivate,
  onDeactivate,
}: {
  spot: HomeHotspot;
  qaDisabled: boolean;
  style: CSSProperties;
  onActivate: (zone: HomeZoneId) => void;
  onDeactivate: () => void;
}) {
  const palette = TONE_STYLES[spot.tone];
  const landmarkDriven = Boolean(spot.landmarkId);

  return (
    <Link
      href={spot.href}
      aria-label={spot.label}
      data-home-zone={spot.zoneId}
      data-home-hotspot={spot.zoneId}
      className={cn(
        "group absolute z-20 isolate will-change-transform",
        qaDisabled ? "pointer-events-none" : "pointer-events-auto",
        "left-[var(--spot-left-mobile)] top-[var(--spot-top-mobile)] h-[var(--spot-height-mobile)] w-[var(--spot-width-mobile)]",
        "md:left-[var(--spot-left)] md:top-[var(--spot-top)] md:h-[var(--spot-height)] md:w-[var(--spot-width)]",
      )}
      style={{
        ...style,
        transform: "translate(-50%, -50%)",
        transformOrigin: "center center",
      }}
      onMouseEnter={() => {
        sfx.hover();
        onActivate(spot.zoneId);
      }}
      onFocus={() => onActivate(spot.zoneId)}
      onPointerDown={() => sfx.tap()}
      onMouseLeave={onDeactivate}
      onBlur={onDeactivate}
    >
      <span
        className="absolute inset-[6%] rounded-[52px] blur-2xl opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 68%, ${palette.soft}, transparent 62%)`,
          animation: "homeZoneBreath 3.8s ease-in-out infinite",
        }}
      />
      <span className="absolute inset-[10%] rounded-[42px] bg-[radial-gradient(circle_at_50%_62%,rgba(255,255,255,0.14),transparent_58%)] opacity-0 blur-xl transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />

      {!landmarkDriven ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[52%]">
          <span className={cn("absolute left-1/2 top-[calc(100%+0.1rem)] h-8 w-14 -translate-x-1/2 rounded-full opacity-[0.76] blur-xl", palette.wash)} />
          <span className="absolute left-1/2 top-[calc(100%+0.55rem)] h-3.5 w-10 -translate-x-1/2 rounded-full bg-black/36 blur-md" />
          <span className="absolute left-1/2 top-[calc(100%-3.15rem)] h-[3.45rem] w-[3.45rem] -translate-x-1/2 md:top-[calc(100%-3.62rem)] md:h-[4rem] md:w-[4rem]">
            <HomeVisualIcon icon={spot.icon} modeIcon={spot.modeIcon} />
          </span>
        </span>
      ) : null}

      <span
        data-home-hotspot-label={spot.zoneId}
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2",
          "left-[calc(50%+var(--spot-label-dx-mobile))] top-[calc(50%+var(--spot-label-dy-mobile))] w-[var(--spot-plaque-width-mobile)]",
          "md:left-[calc(50%+var(--spot-label-dx))] md:top-[calc(50%+var(--spot-label-dy))] md:w-[var(--spot-plaque-width)]",
        )}
      >
        <span
          className={cn(
            "relative flex items-center justify-center gap-1.5 rounded-[14px] border text-center shadow-[0_14px_22px_rgba(0,0,0,0.24)] backdrop-blur-xl transition duration-200 group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 md:rounded-[16px]",
            landmarkDriven ? "px-2 py-1.5 md:px-2.5 md:py-1.5 bg-[linear-gradient(180deg,rgba(10,14,21,0.66),rgba(7,10,16,0.9))]" : "px-2.5 py-1.5 md:px-3 md:py-1.5 bg-[linear-gradient(180deg,rgba(10,14,21,0.74),rgba(7,10,16,0.96))]",
            palette.ring,
          )}
        >
          <span className="absolute inset-x-[18%] top-0 h-[38%] rounded-full bg-white/10 opacity-60 blur-sm" />
          <span className={cn("absolute left-1.5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b md:h-7", palette.wash)} />
          <span className="relative min-w-0 pl-2">
            <span className="hidden truncate text-[7px] font-black uppercase tracking-[0.22em] text-white/30 md:block">{spot.sublabel}</span>
            <span className={cn("block truncate text-[9px] font-black uppercase tracking-[0.16em] drop-shadow-[0_2px_8px_rgba(255,255,255,0.16)] md:text-[11px]", palette.text)}>
              {spot.label}
            </span>
          </span>

          {spot.badge !== undefined ? (
            <span className="relative z-[1] grid min-h-[1.2rem] min-w-[1.2rem] shrink-0 place-items-center rounded-full border border-[#240d10] bg-[linear-gradient(180deg,#ff8b7d,#f14a55)] px-1 text-[8px] font-black text-white shadow-[0_0_18px_rgba(255,104,112,0.56)] md:min-h-[1.35rem] md:min-w-[1.35rem] md:text-[9px]">
              {spot.badge}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}
