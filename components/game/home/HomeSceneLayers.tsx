"use client";

import type { CSSProperties } from "react";

import { HomeEffectSprite } from "@/components/game/home/HomeEffectSprite";
import { HomeEffectQaHandles, type HomeEffectsQaEditorState } from "@/components/game/home/HomeEffectsQaEditor";
import { HomeLandmarkAsset } from "@/components/game/home/HomeLandmarkAsset";
import { HOME_LANDMARK_LAYOUT, type HomeLandmarkLayout } from "@/components/game/home/homeComposition";
import type { HomeLandmarkEffectConfig } from "@/components/game/home/homeEffectLayout";
import type { HomeZoneId } from "@/components/game/home/types";
import type { HomeLandmarkId } from "@/lib/homeLandmarkAssets";

const HOME_LANDMARK_LABELS: Record<HomeLandmarkId, string> = {
  fortress: "Fortress",
  adventure: "Adventure",
  arena: "Arena",
  events: "Events",
  deck: "Deck",
  market: "Market",
};

export function HomeLandmarkLayer({
  activeZone,
  nearX,
  nearY,
  effectsByLandmark,
  qaEditor,
}: {
  activeZone: HomeZoneId | null;
  nearX: number;
  nearY: number;
  effectsByLandmark?: Partial<Record<HomeLandmarkId, HomeLandmarkEffectConfig[]>>;
  qaEditor?: HomeEffectsQaEditorState;
}) {
  return (
    <div
      className="absolute inset-0 z-[2]"
      style={{ transform: `translate3d(${nearX}px, ${nearY}px, 0)` }}
    >
      {(["arena", "events", "deck", "market", "adventure", "fortress"] as const).map((id) => (
        <HomeLandmarkAsset
          key={id}
          id={id}
          label={HOME_LANDMARK_LABELS[id]}
          active={activeZone === id}
          className=""
          style={getHomeLandmarkStyle(id, HOME_LANDMARK_LAYOUT[id], activeZone === id)}
          effects={effectsByLandmark?.[id]}
          qaEditor={qaEditor}
        />
      ))}
    </div>
  );
}

export function HomeWorldEffectLayer({
  effects,
  qaEditor,
}: {
  effects: HomeLandmarkEffectConfig[];
  qaEditor?: HomeEffectsQaEditorState;
}) {
  if (!effects.length && !qaEditor) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[3] block"
      data-home-effect-anchor="world"
      data-home-qa-landmark="world"
    >
      {effects.map((placement) => (
        <HomeEffectSprite
          key={placement.id}
          dataId={placement.id}
          effect={placement.effect}
          durationMs={placement.durationMs}
          width={`${placement.widthPercent}%`}
          height={`${placement.heightPercent}%`}
          opacity={placement.opacity ?? 1}
          backgroundY={placement.backgroundY}
          rotationDeg={placement.rotationDeg}
          yawDeg={placement.yawDeg}
          originXPercent={placement.originXPercent}
          originYPercent={placement.originYPercent}
          anchorXPercent={placement.anchorXPercent}
          anchorYPercent={placement.anchorYPercent}
          flipX={placement.flipX}
          flipY={placement.flipY}
          mobileDisabled={placement.mobileDisabled ?? true}
          style={{
            left: `${placement.xPercent}%`,
            top: `${placement.yPercent}%`,
          }}
        />
      ))}
      {qaEditor ? <HomeEffectQaHandles landmark="world" effects={effects} editor={qaEditor} /> : null}
    </span>
  );
}

function getHomeLandmarkStyle(id: HomeLandmarkId, layout: HomeLandmarkLayout, active: boolean): CSSProperties {
  return {
    left: `${layout.x}px`,
    top: `${layout.y}px`,
    width: `${layout.width}px`,
    height: `${layout.height}px`,
    zIndex: layout.zIndex,
    transform: active ? "translate(-50%, -101%) scale(1.018)" : "translate(-50%, -100%)",
    transformOrigin: "50% 100%",
    filter: getHomeLandmarkFilter(id, active),
    opacity: 1,
    transition: "filter 220ms ease, transform 220ms ease, opacity 220ms ease",
    contain: "layout paint",
    ["--home-landmark-x" as string]: layout.x,
    ["--home-landmark-y" as string]: layout.y,
    ["--home-landmark-id" as string]: id,
  };
}

function getHomeLandmarkFilter(id: HomeLandmarkId, active: boolean) {
  if (active) return "saturate(0.98) contrast(1.04) brightness(0.98)";
  if (id === "fortress") return "saturate(0.88) contrast(1.04) brightness(0.9)";
  if (id === "adventure") return "saturate(0.94) contrast(1.04) brightness(0.92)";
  if (id === "events") return "saturate(0.96) contrast(1.04) brightness(0.92)";
  if (id === "deck") return "saturate(1.08) contrast(1.2) brightness(1.12) drop-shadow(0 8px 8px rgba(0,0,0,0.42))";
  if (id === "market") return "saturate(1.08) contrast(1.18) brightness(1.1) drop-shadow(0 8px 8px rgba(0,0,0,0.4))";
  return "saturate(0.9) contrast(1.03) brightness(0.9)";
}
