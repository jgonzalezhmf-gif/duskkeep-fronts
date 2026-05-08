"use client";

import { cn } from "@/lib/cn";
import { getAdventureNodeAsset } from "@/lib/adventureMapAssets";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import type { AdventureMapPartyMarkerLayout } from "./adventureMapLayout";
import type { AdventureVisualNode } from "./AdventureCampaignTypes";
import { nodeStyle } from "./AdventureMapGeometry";

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
