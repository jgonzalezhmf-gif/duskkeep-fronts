"use client";

import { cn } from "@/lib/cn";
import type { AdventureVisualNode, AdventureVisualRoute } from "./AdventureCampaignTypes";
import { curvedRoute, nodeStyle } from "./AdventureMapGeometry";

export function AdventureMapRoute({ route }: { route: AdventureVisualRoute; accent: string }) {
  const { from, to } = route;
  const fromDone = from.status === "cleared" || from.status === "claimed" || from.status === "completed";
  const toDone = to.status === "cleared" || to.status === "claimed" || to.status === "completed";
  const routeState = route.state ?? (to.status === "locked" ? "locked" : fromDone && toDone ? "cleared" : "available");
  const boss = to.type === "boss";
  const stroke =
    routeState === "locked"
      ? "rgba(47,52,60,0.12)"
      : routeState === "cleared"
        ? "rgba(190,137,63,0.62)"
        : boss
          ? "rgba(255,135,78,0.74)"
          : "rgba(238,180,86,0.78)";
  const d = curvedRoute(route);
  const available = routeState === "available";

  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={routeState === "locked" ? "rgba(2,3,6,0.12)" : "rgba(3,2,1,0.48)"}
        strokeWidth={routeState === "locked" ? 6 : 14}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={routeState === "locked" ? 0.18 : 0.92}
      />
      <path
        d={d}
        fill="none"
        stroke={routeState === "locked" ? "rgba(78,84,94,0.07)" : "rgba(117,79,40,0.38)"}
        strokeWidth={routeState === "locked" ? 3 : 9}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={routeState === "locked" ? "3 28" : "18 13"}
        opacity={routeState === "locked" ? 0.08 : 0.72}
      />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={routeState === "locked" ? 1.2 : available ? 4.25 : boss ? 4 : 3}
        strokeLinecap={routeState === "locked" ? "butt" : "round"}
        strokeLinejoin="round"
        strokeDasharray={routeState === "locked" ? "4 28" : available ? "14 12" : "12 16"}
        filter={available || boss ? "url(#adventureRouteGlow)" : undefined}
        opacity={routeState === "locked" ? 0.07 : available ? 0.95 : 0.78}
      />
    </>
  );
}

export function RouteRune({ from, to, index }: { from: AdventureVisualNode; to: AdventureVisualNode; index: number }) {
  const locked = to.status === "locked";
  if (locked) return null;
  return (
    <>
      {[0.36, 0.64].map((t, markerIndex) => {
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        const offset = (index + markerIndex) % 2 === 0 ? 10 : -10;
        return (
          <span
            key={`${from.id}-${to.id}-${markerIndex}`}
            className="pointer-events-none absolute z-[3] h-3.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] border border-[#f5c451]/46 bg-[#f5c451]/26 shadow-[0_0_10px_rgba(245,196,81,0.24)]"
            style={nodeStyle(x + offset, y + (markerIndex === 0 ? -8 : 8))}
          />
        );
      })}
    </>
  );
}

export function RouteControlHandle({
  route,
  handle,
  point,
  selected,
  onSelect,
  onDragStart,
}: {
  route: AdventureVisualRoute;
  handle: "control1" | "control2";
  point: { x: number; y: number };
  selected: boolean;
  onSelect: () => void;
  onDragStart: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "absolute z-[26] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/70 bg-cyan-400/60 shadow-[0_0_18px_rgba(125,211,252,0.35)]",
        selected && "ring-2 ring-white",
      )}
      style={nodeStyle(point.x, point.y)}
      aria-label={`${route.id} ${handle}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect();
        onDragStart();
      }}
    />
  );
}
