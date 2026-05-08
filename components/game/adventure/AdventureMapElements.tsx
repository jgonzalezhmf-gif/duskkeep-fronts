"use client";

import { cn } from "@/lib/cn";
import { getAdventureNodeAsset } from "@/lib/adventureMapAssets";
import type { AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import type { AdventureMapPartyMarkerLayout, AdventureMapPropLayout } from "./adventureMapLayout";
import type { AdventureVisualNode } from "./AdventureCampaignTypes";
import { getPropHeight, getPropVisualOpacity, getPropWidth, nodeStyle } from "./AdventureMapGeometry";
import { InteractionPropContent, InteractionPropState, getPropContent } from "./AdventureMapPropVisuals";
export { AdventureMapInteractionStyles } from "./AdventureMapPropVisuals";
export { AdventureMapRoute, RouteControlHandle, RouteRune } from "./AdventureMapRouteElements";
export { AdventureMapNode } from "./AdventureMapNodeElement";

export function AdventurePartyMarker({
  visualNode,
  layout,
  qaEnabled,
  selected,
  onSelect,
  onDragStart,
}: {
  visualNode: AdventureVisualNode;
  layout?: AdventureMapPartyMarkerLayout;
  qaEnabled: boolean;
  selected: boolean;
  onSelect: () => void;
  onDragStart: () => void;
}) {
  const x = qaEnabled ? layout?.x ?? visualNode.x : visualNode.x;
  const y = qaEnabled ? layout?.y ?? visualNode.y : visualNode.y;
  const size = Math.round((layout?.size ?? 56) * (qaEnabled ? 1 : 1.34));
  const markerAsset = getAdventureNodeAsset("current");
  return (
    <div
      className={cn(
        "absolute -translate-x-1/2 -translate-y-[112%]",
        qaEnabled ? "pointer-events-auto cursor-grab" : "pointer-events-none",
        selected && "rounded-full ring-2 ring-amber-200",
      )}
      style={{ ...nodeStyle(x, y), zIndex: qaEnabled ? layout?.zIndex ?? 28 : Math.max(layout?.zIndex ?? 28, 42) }}
      data-adventure-party-marker
      onClick={(event) => {
        if (!qaEnabled) return;
        event.stopPropagation();
        onSelect();
      }}
      onPointerDown={(event) => {
        if (!qaEnabled) return;
        event.preventDefault();
        event.stopPropagation();
        onSelect();
        onDragStart();
      }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <span className="pointer-events-none absolute bottom-[3%] left-1/2 h-[30%] w-[70%] -translate-x-1/2 rounded-full bg-black/62 blur-[5px]" />
        <span className="pointer-events-none absolute bottom-[6%] left-1/2 h-[24%] w-[56%] -translate-x-1/2 rounded-full bg-[#f5c451]/36 blur-[4px]" />
        {markerAsset ? (
          <img
            src={markerAsset.src}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="lazy"
            decoding="async"
            className="relative h-full w-full object-contain brightness-110 saturate-[1.12] drop-shadow-[0_16px_20px_rgba(0,0,0,0.82)]"
          />
        ) : (
          <>
            <span className="absolute bottom-1 left-1/2 h-4 w-10 -translate-x-1/2 rounded-full bg-[#f5c451]/18 blur-md" />
            <span className="absolute left-1/2 top-[1.2rem] h-11 w-[3px] -translate-x-1/2 rounded-full bg-[#f5d498]/78 shadow-[0_0_10px_rgba(245,196,81,0.24)]" />
            <span className="absolute left-[1.7rem] top-1 h-7 w-9 rounded-r-[10px] border border-[#f5d498]/34 bg-[linear-gradient(135deg,rgba(245,196,81,0.82),rgba(102,41,30,0.96))] shadow-[0_8px_18px_rgba(0,0,0,0.36)]" />
            <span className="absolute left-[1.72rem] top-2.5 h-3 w-5 rounded-r-md bg-black/18" />
            <span className="absolute bottom-0 left-1/2 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full border border-[#f5d498]/28 bg-black/76 shadow-[0_10px_22px_rgba(0,0,0,0.34)]">
              <ModeIcon name="campaign" size="xs" />
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function isCompletedPartyNode(node: AdventureVisualNode) {
  return node.status === "cleared" || node.status === "claimed" || node.status === "completed";
}

export function AdventureMapProp({
  prop,
  qaEnabled,
  selected,
  interactionStatus,
  interactionSelected,
  onInteractionSelect,
  onSelect,
  onDragStart,
}: {
  prop: AdventureMapPropLayout;
  qaEnabled: boolean;
  selected: boolean;
  interactionStatus?: AdventureMapInteractionStatus;
  interactionSelected: boolean;
  onInteractionSelect?: (id: string) => void;
  onSelect: () => void;
  onDragStart: () => void;
}) {
  if (!prop.enabled && !qaEnabled) return null;
  const content = getPropContent(prop);
  const interaction = prop.interaction?.enabled === false ? undefined : prop.interaction;
  const visualZIndex = qaEnabled ? prop.zIndex : interaction ? Math.max(prop.zIndex, 32) : Math.min(prop.zIndex, 14);
  const renderedContent = interaction ? (
    <InteractionPropContent prop={prop} status={interactionStatus ?? "locked"} fallback={content} />
  ) : (
    content
  );
  const style = {
    ...nodeStyle(prop.x, prop.y),
    transform: `translate(-50%, -50%) perspective(520px) rotateX(${prop.rotationX ?? 0}deg) rotateY(${prop.rotationY ?? 0}deg) rotateZ(${prop.rotation ?? 0}deg)`,
    transformStyle: "preserve-3d" as const,
    zIndex: visualZIndex,
    width: getPropWidth(prop),
    height: getPropHeight(prop),
    opacity: interaction ? prop.opacity ?? 1 : getPropVisualOpacity(prop),
  };

  if (!qaEnabled) {
    if (interaction?.id && onInteractionSelect) {
      return (
        <button
          type="button"
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 transition duration-200",
            interactionStatus === "ready" && "hover:brightness-125",
            interactionStatus === "locked" && "opacity-52",
            interactionStatus === "claimed" && "opacity-45 saturate-75",
          )}
          style={style}
          data-adventure-prop={prop.id}
          data-adventure-interaction={interaction.id}
          data-interaction-status={interactionStatus}
          aria-label={interaction.id}
          onClick={(event) => {
            event.stopPropagation();
            onInteractionSelect(interaction.id);
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
            onInteractionSelect(interaction.id);
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
            onInteractionSelect(interaction.id);
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
            onInteractionSelect(interaction.id);
          }}
          onFocus={() => onInteractionSelect(interaction.id)}
        >
          {renderedContent}
          <InteractionPropState status={interactionStatus ?? "locked"} selected={interactionSelected} />
        </button>
      );
    }
    return (
      <span
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={style}
        data-adventure-prop={prop.id}
        aria-hidden="true"
      >
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition",
        qaEnabled ? "pointer-events-auto cursor-grab" : "pointer-events-none",
        selected && "ring-2 ring-sky-200 ring-offset-2 ring-offset-black",
        !prop.enabled && "opacity-40",
      )}
      style={style}
      data-adventure-prop={prop.id}
      aria-label={prop.id}
      onClick={(event) => {
        if (!qaEnabled) return;
        event.stopPropagation();
        onSelect();
      }}
      onPointerDown={(event) => {
        if (!qaEnabled) return;
        event.preventDefault();
        event.stopPropagation();
        onSelect();
        onDragStart();
      }}
    >
      {renderedContent}
      <span className="pointer-events-none absolute inset-0 rounded-full border border-sky-200/70 bg-sky-200/[0.04] shadow-[0_0_0_1px_rgba(0,0,0,0.7)]" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-black/82" />
      <span className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/45" />
      <span className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/45" />
      <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/82 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-sky-100">
        {prop.id}
      </span>
    </button>
  );
}
