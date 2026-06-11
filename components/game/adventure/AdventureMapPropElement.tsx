"use client";

import { cn } from "@/lib/cn";
import type { AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";
import type { AdventureMapPropLayout } from "@/features/adventure/mapLayout";
import { getPropHeight, getPropVisualOpacity, getPropWidth } from "@/features/adventure/mapGeometry";
import { nodeStyle } from "./AdventureMapGeometry";
import { InteractionPropContent, InteractionPropState, getPropContent } from "./AdventureMapPropVisuals";

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
