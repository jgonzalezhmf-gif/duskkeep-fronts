"use client";

import { cn } from "@/lib/cn";
import { getHomeEffectAsset } from "@/lib/homeEffectAssets";

import type { HomeEffectsQaEditorState } from "./HomeEffectsQaTypes";
import type { HomeEffectAnchorId, HomeLandmarkEffectConfig } from "./homeEffectLayout";

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function HomeEffectQaHandles({
  landmark,
  effects,
  editor,
}: {
  landmark: HomeEffectAnchorId;
  effects: HomeLandmarkEffectConfig[];
  editor: HomeEffectsQaEditorState;
}) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[8] border border-cyan-300/55 bg-cyan-300/[0.025]"
      data-home-qa-landmark={landmark}
    >
      <span className="absolute left-1 top-1 rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100">
        {landmark}
      </span>
      {effects.map((effect) => {
        const asset = getHomeEffectAsset(effect.effect);
        const renderMode = asset?.renderMode ?? "missing";
        const hasLocalAnimation = renderMode === "staticWithLocalAnimation";
        const recommendedAnchor = asset?.anchor ?? { xPercent: 50, yPercent: 50, name: "center" };

        return (
          <button
            key={effect.id}
            type="button"
            data-home-qa-effect={effect.id}
            data-home-qa-effect-render-mode={renderMode}
            data-home-qa-local-animation={hasLocalAnimation ? "1" : "0"}
            className={cn(
              "pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 border text-left shadow-[0_0_0_1px_rgba(0,0,0,0.65)]",
              renderMode === "disabled"
                ? "border-rose-300/85 bg-rose-300/10"
                : effect.id === editor.selectedId
                  ? "border-yellow-300 bg-yellow-300/12"
                  : "border-sky-300/80 bg-sky-300/8",
            )}
            style={{
              left: `${effect.xPercent}%`,
              top: `${effect.yPercent}%`,
              width: `${effect.widthPercent}%`,
              height: `${effect.heightPercent}%`,
              transform: `translate(-50%, -50%) perspective(520px) rotate(${effect.rotationDeg ?? 0}deg) rotateY(${effect.yawDeg ?? 0}deg) scale(${effect.flipX ? -1 : 1}, ${effect.flipY ? -1 : 1})`,
              transformOrigin: `${effect.originXPercent ?? 50}% ${effect.originYPercent ?? 50}%`,
            }}
            title={`${effect.id} | ${effect.effect} | ${renderMode} | anchor ${recommendedAnchor.name}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              editor.onSelect(effect.id);
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.preventDefault();
              event.stopPropagation();
              editor.onSelect(effect.id);
              const anchorNode = event.currentTarget.closest("[data-home-effect-anchor]");
              if (!(anchorNode instanceof HTMLElement)) return;
              const rect = anchorNode.getBoundingClientRect();

              const move = (moveEvent: PointerEvent) => {
                editor.onChange(effect.id, {
                  xPercent: roundPercent(clamp(((moveEvent.clientX - rect.left) / rect.width) * 100, 0, 100)),
                  yPercent: roundPercent(clamp(((moveEvent.clientY - rect.top) / rect.height) * 100, 0, 100)),
                });
              };

              const up = () => {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
              };

              window.addEventListener("pointermove", move);
              window.addEventListener("pointerup", up, { once: true });
            }}
          >
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-black/80" />
            <span
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100 bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.85)]"
              style={{ left: `${recommendedAnchor.xPercent}%`, top: `${recommendedAnchor.yPercent}%` }}
            />
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/55" />
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/55" />
            <span className="absolute bottom-0 left-0 rounded-tr bg-black/75 px-1 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-white/85">
              {renderMode}
            </span>
          </button>
        );
      })}
    </span>
  );
}
