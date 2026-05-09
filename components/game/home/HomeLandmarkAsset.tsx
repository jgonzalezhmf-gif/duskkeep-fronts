"use client";

import type { CSSProperties, ReactNode } from "react";

import { HomeEffectSprite } from "@/components/game/home/HomeEffectSprite";
import { HomeEffectQaHandles } from "@/components/game/home/HomeEffectQaHandles";
import { HOME_LANDMARK_EFFECTS, type HomeEffectAnchorId, type HomeLandmarkEffectConfig } from "@/components/game/home/homeEffectLayout";
import type { HomeEffectsQaEditorState } from "@/components/game/home/HomeEffectsQaTypes";
import { getHomeLandmarkAsset, type HomeLandmarkId } from "@/lib/homeLandmarkAssets";

type HomeLandmarkAssetProps = {
  id: HomeLandmarkId;
  active?: boolean;
  label: string;
  className: string;
  style?: CSSProperties;
  imgClassName?: string;
  fallback?: ReactNode;
  effects?: HomeLandmarkEffectConfig[];
  qaEditor?: HomeEffectsQaEditorState;
};

export function HomeLandmarkAsset({
  id,
  active = false,
  label,
  className,
  style,
  imgClassName = "",
  fallback,
  effects,
  qaEditor,
}: HomeLandmarkAssetProps) {
  const asset = getHomeLandmarkAsset(id);
  const resolvedEffects = effects ?? HOME_LANDMARK_EFFECTS[id] ?? [];

  if (!asset) {
    return <>{fallback ?? null}</>;
  }

  return (
    <span
      aria-hidden="true"
      data-home-landmark={id}
      data-home-effect-anchor={id}
      data-active={active ? "1" : "0"}
      className={`home-landmark-piece absolute block ${className}`}
      style={style}
      title={label}
    >
      <span className="home-landmark-ground absolute left-1/2 top-[93%] -z-[1] h-[8%] w-[46%] -translate-x-1/2 rounded-full bg-black/20 blur-[5px]" />
      <img
        src={asset.src}
        alt=""
        loading="eager"
        decoding="async"
        draggable={false}
        className={`home-landmark-image h-full w-full object-contain object-bottom ${imgClassName}`}
      />
      <HomeLandmarkEffects id={id} effects={resolvedEffects} />
      {qaEditor ? <HomeEffectQaHandles landmark={id} effects={resolvedEffects} editor={qaEditor} /> : null}
    </span>
  );
}

function HomeLandmarkEffects({ id, effects }: { id: HomeEffectAnchorId; effects: HomeLandmarkEffectConfig[] }) {
  if (!effects.length) {
    return null;
  }

  return (
    <span className="home-landmark-life absolute inset-0 z-[2]" data-home-life={id} aria-hidden="true">
      {effects.map((placement, index) => (
        <HomeEffectSprite
          key={`${id}-${placement.effect}-${index}`}
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
    </span>
  );
}
