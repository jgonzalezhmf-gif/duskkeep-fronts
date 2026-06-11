"use client";

import { cn } from "@/lib/cn";
import { getAdventureNodeAsset } from "@/lib/adventureMapAssets";
import GameIcon from "@/components/game/shared/GameIcon";
import type { AdventureVisualNode, TranslateFn } from "@/features/adventure/campaignTypes";
import { nodeStyle } from "./AdventureMapGeometry";
import { getNodeAssetId, getNodeAssetScale, getNodeIcon, getNodeTheme, getNodeVisualScale } from "./AdventureMapNodeVisuals";

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
