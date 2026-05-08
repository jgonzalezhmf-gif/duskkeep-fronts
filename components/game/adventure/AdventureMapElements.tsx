"use client";

import { cn } from "@/lib/cn";
import { getAdventureNodeAsset } from "@/lib/adventureMapAssets";
import type { AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";
import GameIcon from "@/components/game/shared/GameIcon";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import type { AdventureMapPartyMarkerLayout, AdventureMapPropLayout } from "./adventureMapLayout";
import type { AdventureVisualNode, AdventureVisualRoute, TranslateFn } from "./AdventureCampaignTypes";
import { curvedRoute, getPropHeight, getPropVisualOpacity, getPropWidth, nodeStyle } from "./AdventureMapGeometry";
import { getNodeAssetId, getNodeAssetScale, getNodeIcon, getNodeTheme, getNodeVisualScale } from "./AdventureMapNodeVisuals";
import { InteractionPropContent, InteractionPropState, getPropContent } from "./AdventureMapPropVisuals";
export { AdventureMapInteractionStyles } from "./AdventureMapPropVisuals";
export function AdventureMapRoute({ route, accent }: { route: AdventureVisualRoute; accent: string }) {
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

export function AdventureMapNode({
  visualNode,
  active,
  accent,
  totalNodes,
  onSelect,
  t,
  qaEnabled,
  editorSelected,
  onEditorSelect,
  onEditorDragStart,
}: {
  visualNode: AdventureVisualNode;
  active: boolean;
  accent: string;
  totalNodes: number;
  onSelect: (id: string) => void;
  t: TranslateFn;
  qaEnabled: boolean;
  editorSelected: boolean;
  onEditorSelect: () => void;
  onEditorDragStart: () => void;
}) {
  const node = visualNode.node;
  const tone =
    visualNode.status === "locked"
      ? "steel"
      : visualNode.status === "cleared"
        ? "emerald"
        : visualNode.type === "boss"
          ? "ember"
          : visualNode.type === "chest"
            ? "gold"
            : "sky";
  const label = node.locked
    ? t("adventure.node.sealed")
    : node.cleared
      ? t("adventure.node.cleared")
      : visualNode.type === "boss"
        ? t("adventure.node.boss")
        : visualNode.type === "elite"
          ? t("adventure.node.elite")
          : visualNode.type === "chest"
            ? t("adventure.reward.firstClear")
            : t("adventure.node.battle");
  const size = visualNode.size ?? (visualNode.type === "boss" ? 68 : visualNode.type === "chest" ? 54 : 48);
  const visualSize = Math.round(size * getNodeVisualScale(visualNode, active));
  const nodeTheme = getNodeTheme(visualNode, active, accent);
  const nodeAssetId = getNodeAssetId(visualNode);
  const nodeAsset = getAdventureNodeAsset(nodeAssetId);
  const clearedAsset = visualNode.status === "cleared" || visualNode.status === "claimed" || visualNode.status === "completed" ? getAdventureNodeAsset("cleared") : null;

  return (
    <button
      type="button"
      data-adventure-node={visualNode.id}
      data-node-status={visualNode.status}
      data-node-type={visualNode.type}
      aria-label={`${node.lvl.name} ${label}`}
      onClick={() => (qaEnabled ? onEditorSelect() : onSelect(visualNode.id))}
      onPointerDown={(event) => {
        if (!qaEnabled) return;
        event.preventDefault();
        event.stopPropagation();
        onEditorSelect();
        const startX = event.clientX;
        const startY = event.clientY;

        const move = (moveEvent: globalThis.PointerEvent) => {
          if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 4) return;
          onEditorDragStart();
          window.removeEventListener("pointermove", move);
        };

        const up = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
        };

        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up, { once: true });
      }}
      className={cn(
        "group absolute z-[6] -translate-x-1/2 -translate-y-1/2 transition duration-200 hover:brightness-110",
        active && "z-[8]",
        visualNode.status === "locked" && "opacity-58",
        editorSelected && "ring-2 ring-sky-200 ring-offset-2 ring-offset-black",
      )}
      style={{ ...nodeStyle(visualNode.x, visualNode.y), width: visualSize, height: visualSize, zIndex: visualNode.zIndex ?? undefined }}
    >
      <span className={cn("pointer-events-none absolute left-1/2 top-[88%] h-[22%] w-[78%] -translate-x-1/2 rounded-full bg-black/56 blur-[4px]", visualNode.status === "locked" && "opacity-50")} />
      {visualNode.status === "available" || active ? (
        <span
          className={cn(
            "pointer-events-none absolute left-1/2 top-[82%] h-[12%] w-[62%] -translate-x-1/2 rounded-full blur-[3px]",
            active ? "bg-[#f5c451]/42" : "bg-[#8fd5ff]/24",
          )}
        />
      ) : null}
      {visualNode.type === "boss" ? <span className="pointer-events-none absolute left-1/2 top-[82%] h-[14%] w-[72%] -translate-x-1/2 rounded-full bg-[#ff5b2f]/24 blur-[3px]" /> : null}
      {nodeAsset ? (
        <span className="relative block h-full w-full">
          <img
            src={nodeAsset.src}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="lazy"
            decoding="async"
            style={{ transform: `scale(${getNodeAssetScale(visualNode, active)})` }}
            className={cn(
              "h-full w-full object-contain drop-shadow-[0_15px_18px_rgba(0,0,0,0.82)] transition duration-200",
              active && "brightness-125 saturate-[1.18] drop-shadow-[0_18px_24px_rgba(0,0,0,0.9)]",
              visualNode.type === "boss" && "brightness-112 saturate-[1.18] drop-shadow-[0_18px_24px_rgba(0,0,0,0.88)]",
              visualNode.type === "chest" && "brightness-125 saturate-[1.2] drop-shadow-[0_14px_18px_rgba(98,55,11,0.72)]",
              visualNode.status === "locked" && "opacity-72 saturate-[0.46] brightness-70",
              (visualNode.status === "cleared" || visualNode.status === "claimed" || visualNode.status === "completed") && "opacity-88 saturate-[0.78] brightness-95",
            )}
          />
          {clearedAsset ? (
            <img
              src={clearedAsset.src}
              alt=""
              aria-hidden="true"
              draggable={false}
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute -bottom-[7%] -right-[10%] h-[48%] w-[48%] object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.52)]"
            />
          ) : null}
        </span>
      ) : (
        <span
          className="relative grid h-full w-full place-items-center overflow-hidden rounded-full border shadow-[0_16px_30px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-12px_18px_rgba(0,0,0,0.28)]"
          style={{ borderColor: nodeTheme.border, background: nodeTheme.background }}
        >
          <span className="absolute inset-[6px] rounded-full border border-black/40 bg-[radial-gradient(circle_at_42%_34%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(180deg,rgba(12,15,20,0.28),rgba(0,0,0,0.52))]" />
          <span className="absolute inset-[13px] rounded-full border" style={{ borderColor: nodeTheme.innerBorder, boxShadow: nodeTheme.glow }} />
          <GameIcon kind={getNodeIcon(visualNode)} tone={tone} size="sm" className="relative z-[1] h-[62%] w-[62%] rounded-full border border-white/10 bg-black/20" />
          {visualNode.status === "cleared" || visualNode.status === "claimed" || visualNode.status === "completed" ? (
            <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full border border-emerald-200/28 bg-emerald-950/86 text-[10px] font-black text-emerald-200">
              OK
            </span>
          ) : null}
        </span>
      )}
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.34rem)] hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-[#f5d498]/16 bg-[#080b10]/68 px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-white/72 opacity-0 backdrop-blur-md transition group-hover:opacity-100 md:block">
        {visualNode.type === "boss" ? node.lvl.name : `${node.lvl.index}/${totalNodes}`}
      </span>
    </button>
  );
}

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
