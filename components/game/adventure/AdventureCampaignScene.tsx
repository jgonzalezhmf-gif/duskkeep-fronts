"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { getScreenBackgroundAsset } from "@/lib/screenBackgroundAssets";
import {
  ADVENTURE_MAP_DESIGN,
  type AdventureMapChapterLayout,
  type AdventureMapNodeStatus,
  type AdventureMapNodeType,
  type AdventureMapPartyMarkerLayout,
  type AdventureMapPropLayout,
  type AdventureMapPropType,
  type AdventureMapRouteLayout,
  type AdventureNodeLayout,
} from "./adventureMapLayout";
import { type AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";
import { getFrontlineAdventureSquad } from "@/features/frontline/adventure";
import { AdventureSkyAtmosphere } from "@/components/game/adventure/AdventureSkyAtmosphere";
import { HomeEffectSpriteStyles } from "@/components/game/home/HomeEffectSprite";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  AdventureMapInteractionStyles,
  AdventureMapNode,
  AdventureMapProp,
  AdventureMapRoute,
  AdventurePartyMarker,
  RouteControlHandle,
  RouteRune,
  isCompletedPartyNode,
} from "./AdventureMapElements";
import { AdventureMapEditorOverlay } from "./AdventureMapEditorOverlay";
import {
  buildRoutes,
  clamp,
  getDefaultPropDimensions,
  getDefaultPropEffect,
  getEditableRoutes,
  getPropHeight,
  getPropWidth,
  getRouteControls,
  nodeStyle,
} from "./AdventureMapGeometry";
import type {
  AdventureCampaignMeta,
  AdventureMapEditorSelection,
  AdventureNodeState,
  AdventureVisualNode,
  TranslateFn,
} from "./AdventureCampaignTypes";

const DESIGN_WIDTH = ADVENTURE_MAP_DESIGN.width;
const DESIGN_HEIGHT = ADVENTURE_MAP_DESIGN.height;

export type {
  AdventureMapChapterLayout,
  AdventureMapNodeStatus,
  AdventureMapNodeType,
  AdventureNodeLayout,
};

export type { AdventureCampaignMeta, AdventureNodeState };
type EditorSelection = AdventureMapEditorSelection;

export function AdventureCampaignMap({
  meta,
  nodes,
  mapLayout,
  chapter,
  selectedId,
  onSelect,
  selectedInteractionId,
  interactionStates,
  onSelectInteraction,
  embedded = false,
  fullScreen = false,
}: {
  meta: AdventureCampaignMeta;
  nodes: AdventureNodeState[];
  mapLayout: AdventureMapChapterLayout;
  chapter: number;
  selectedId: string;
  onSelect: (id: string) => void;
  selectedInteractionId?: string | null;
  interactionStates?: Record<string, AdventureMapInteractionStatus>;
  onSelectInteraction?: (id: string) => void;
  embedded?: boolean;
  fullScreen?: boolean;
  showOverlayHeader?: boolean;
}) {
  const { t } = useI18n();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [qaEnabled, setQaEnabled] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [editorLayout, setEditorLayout] = useState(mapLayout);
  const [selectedEditor, setSelectedEditor] = useState<EditorSelection | null>(null);
  const [dragging, setDragging] = useState<EditorSelection | null>(null);
  const [showRouteHandles, setShowRouteHandles] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const background = getScreenBackgroundAsset("adventure");
  const editorKey = useMemo(() => `adventure-map-editor:${nodes.map((node) => node.lvl.id).join("|")}`, [nodes]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQaEnabled(params.get("qa") === "adventure-map" || params.get("qa") === "map-editor");
  }, []);

  useEffect(() => {
    if (!qaEnabled) {
      setEditorLayout(mapLayout);
      return;
    }
    const saved = window.localStorage.getItem(editorKey);
    if (saved) {
      try {
        setEditorLayout(JSON.parse(saved) as AdventureMapChapterLayout);
        return;
      } catch {
        window.localStorage.removeItem(editorKey);
      }
    }
    setEditorLayout(mapLayout);
  }, [editorKey, mapLayout, qaEnabled]);

  useEffect(() => {
    if (!qaEnabled) return;
    window.localStorage.setItem(editorKey, JSON.stringify(editorLayout));
  }, [editorKey, editorLayout, qaEnabled]);

  const activeLayout = qaEnabled ? editorLayout : mapLayout;

  const visualNodes = useMemo(
    () => {
      const realIds = new Set(nodes.map((node) => node.lvl.id));
      const baseNodes = nodes.map((node, index): AdventureVisualNode => {
        const id = node.lvl.id;
        const layout =
          activeLayout.nodes.find((entry) => entry.id === id) ??
          activeLayout.nodes[index] ??
          activeLayout.nodes[activeLayout.nodes.length - 1] ??
          { x: 280 + index * 130, y: 820 - index * 42 };
        const type = layout.type ?? deriveNodeType(node, index, nodes.length);
        const status = qaEnabled && layout.status ? layout.status : deriveNodeStatus(node);
        return {
          id,
          node,
          x: layout.x,
          y: layout.y,
          size: layout.size,
          zIndex: layout.zIndex,
          type: qaEnabled ? type : status === "locked" ? "locked" : type,
          status,
          connectsTo: layout.connectsTo ?? (nodes[index + 1] ? [nodes[index + 1].lvl.id] : []),
        };
      });

      if (!qaEnabled) return baseNodes;

      const editorOnlyNodes = activeLayout.nodes
        .filter((entry) => entry.id && !realIds.has(entry.id))
        .map((layout, index): AdventureVisualNode => {
          const id = layout.id ?? `qa-node-${index + 1}`;
          return {
            id,
            node: {
              lvl: {
                id,
                chapter: 0,
                index: baseNodes.length + index + 1,
                name: id,
                enemyTeam: [],
                rewards: {},
                recommendedPower: 0,
              },
              cleared: false,
              locked: false,
              current: false,
              pausedHere: false,
              firstClearAvailable: false,
            },
            x: layout.x,
            y: layout.y,
            size: layout.size,
            zIndex: layout.zIndex,
            type: layout.type ?? "battle",
            status: layout.status ?? "available",
            connectsTo: layout.connectsTo ?? [],
          };
        });

      return [...baseNodes, ...editorOnlyNodes];
    },
    [activeLayout.nodes, nodes, qaEnabled],
  );

  const selectedNode = visualNodes.find((node) => node.id === selectedId) ?? visualNodes[0];
  const partyNode =
    [...visualNodes].reverse().find((node) => isCompletedPartyNode(node)) ??
    visualNodes.find((node) => node.node.pausedHere || node.status === "current") ??
    selectedNode;
  const routes = buildRoutes(visualNodes, activeLayout.routes);

  function pointFromEvent(event: PointerEvent<HTMLDivElement>) {
    if (!stageRef.current) return null;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * DESIGN_WIDTH);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * DESIGN_HEIGHT);
    return {
      x: Math.max(0, Math.min(DESIGN_WIDTH, x)),
      y: Math.max(0, Math.min(DESIGN_HEIGHT, y)),
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!qaEnabled) return;
    const point = pointFromEvent(event);
    if (!point) return;
    setCursor(point);
    if (dragging) updateEditorPosition(dragging, point);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!qaEnabled || !selectedEditor) return;
    const step = event.shiftKey ? 10 : 2;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
      const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
      nudgeEditorSelection(selectedEditor, dx, dy);
    }
    if (event.key === "+" || event.key === "=" || event.key === "-") {
      event.preventDefault();
      resizeEditorSelection(selectedEditor, event.key === "-" ? -step : step);
    }
  }

  function updateNode(id: string, patch: Partial<AdventureNodeLayout>) {
    setEditorLayout((current) => ({
      ...current,
      nodes: current.nodes.map((node, index) => ((node.id ?? nodes[index]?.lvl.id) === id ? { ...node, id, ...patch } : node)),
    }));
  }

  function updateProp(id: string, patch: Partial<AdventureMapPropLayout>) {
    setEditorLayout((current) => ({
      ...current,
      props: (current.props ?? []).map((prop) => (prop.id === id ? { ...prop, ...patch } : prop)),
    }));
  }

  function updateParty(patch: Partial<AdventureMapPartyMarkerLayout>) {
    setEditorLayout((current) => ({
      ...current,
      partyMarker: { ...(current.partyMarker ?? { size: 56, zIndex: 28, style: "banner" }), ...patch },
    }));
  }

  function updateRoute(id: string, patch: Partial<AdventureMapRouteLayout>) {
    setEditorLayout((current) => {
      const routesToEdit = getEditableRoutes(current, visualNodes);
      return {
        ...current,
        routes: routesToEdit.map((route) => (route.id === id ? { ...route, ...patch } : route)),
      };
    });
  }

  function updateEditorPosition(selection: EditorSelection, point: { x: number; y: number }) {
    if (selection.kind === "node") updateNode(selection.id, point);
    if (selection.kind === "prop") updateProp(selection.id, point);
    if (selection.kind === "party") updateParty(point);
    if (selection.kind === "routeControl") updateRoute(selection.id, { [selection.handle]: point });
  }

  function nudgeEditorSelection(selection: EditorSelection, dx: number, dy: number) {
    if (selection.kind === "node") {
      const node = editorLayout.nodes.find((entry, index) => (entry.id ?? nodes[index]?.lvl.id) === selection.id);
      if (node) updateNode(selection.id, { x: clamp(node.x + dx, 0, DESIGN_WIDTH), y: clamp(node.y + dy, 0, DESIGN_HEIGHT) });
    }
    if (selection.kind === "prop") {
      const prop = editorLayout.props?.find((entry) => entry.id === selection.id);
      if (prop) updateProp(selection.id, { x: clamp(prop.x + dx, 0, DESIGN_WIDTH), y: clamp(prop.y + dy, 0, DESIGN_HEIGHT) });
    }
    if (selection.kind === "party") {
      const party = editorLayout.partyMarker;
      updateParty({ x: clamp((party?.x ?? partyNode?.x ?? 0) + dx, 0, DESIGN_WIDTH), y: clamp((party?.y ?? partyNode?.y ?? 0) + dy, 0, DESIGN_HEIGHT) });
    }
    if (selection.kind === "routeControl") {
      const route = getEditableRoutes(editorLayout, visualNodes).find((entry) => entry.id === selection.id);
      const point = route?.[selection.handle];
      if (point) updateRoute(selection.id, { [selection.handle]: { x: clamp(point.x + dx, 0, DESIGN_WIDTH), y: clamp(point.y + dy, 0, DESIGN_HEIGHT) } });
    }
  }

  function resizeEditorSelection(selection: EditorSelection, delta: number) {
    if (selection.kind === "node") {
      const node = editorLayout.nodes.find((entry, index) => (entry.id ?? nodes[index]?.lvl.id) === selection.id);
      updateNode(selection.id, { size: clamp((node?.size ?? 48) + delta, 24, 120) });
    }
    if (selection.kind === "prop") {
      const prop = editorLayout.props?.find((entry) => entry.id === selection.id);
      if (prop) {
        const width = getPropWidth(prop);
        const height = getPropHeight(prop);
        updateProp(selection.id, {
          width: clamp(width + delta, 8, 320),
          height: clamp(height + delta, 8, 320),
          size: undefined,
        });
      }
    }
    if (selection.kind === "party") updateParty({ size: clamp((editorLayout.partyMarker?.size ?? 56) + delta, 24, 140) });
  }

  function addProp(type: AdventureMapPropType) {
    const id = `${type}-${Date.now().toString(36)}`;
    const dimensions = getDefaultPropDimensions(type);
    const next: AdventureMapPropLayout = {
      id,
      type,
      x: cursor?.x ?? Math.round(DESIGN_WIDTH * 0.42),
      y: cursor?.y ?? Math.round(DESIGN_HEIGHT * 0.5),
      width: dimensions.width,
      height: dimensions.height,
      zIndex: 35,
      opacity: 1,
      enabled: true,
      ...(getDefaultPropEffect(type) ? { effect: getDefaultPropEffect(type) } : {}),
      ...(type === "key_chest"
        ? {
            interaction: {
              id: "c1-lower-cache",
              kind: "keyChest" as const,
              keyCost: 1,
              unlockAfter: ["c1l2"],
              rewardId: "c1-lower-cache",
              enabled: true,
            },
          }
        : {}),
    };
    setEditorLayout((current) => ({ ...current, props: [...(current.props ?? []), next] }));
    setSelectedEditor({ kind: "prop", id });
    setCopyStatus(`${id} created`);
  }

  function addNode() {
    const id = `qa-node-${Date.now().toString(36)}`;
    const next: AdventureNodeLayout = {
      id,
      x: cursor?.x ?? DESIGN_WIDTH / 2,
      y: cursor?.y ?? DESIGN_HEIGHT / 2,
      type: "battle",
      status: "available",
      size: 48,
      zIndex: 20,
      connectsTo: [],
    };
    setEditorLayout((current) => ({ ...current, nodes: [...current.nodes, next] }));
    setSelectedEditor({ kind: "node", id });
  }

  function duplicateSelection(selection: EditorSelection | null) {
    if (!selection) return;
    const suffix = Date.now().toString(36);
    if (selection.kind === "node") {
      const source = editorLayout.nodes.find((entry, index) => (entry.id ?? nodes[index]?.lvl.id) === selection.id);
      if (!source) return;
      const id = `${selection.id}-copy-${suffix}`;
      setEditorLayout((current) => ({
        ...current,
        nodes: [
          ...current.nodes,
          {
            ...source,
            id,
            x: clamp(source.x + 42, 0, DESIGN_WIDTH),
            y: clamp(source.y + 42, 0, DESIGN_HEIGHT),
            connectsTo: [],
          },
        ],
      }));
      setSelectedEditor({ kind: "node", id });
      return;
    }
    if (selection.kind === "prop") {
      const source = editorLayout.props?.find((entry) => entry.id === selection.id);
      if (!source) return;
      const id = `${selection.id}-copy-${suffix}`;
      setEditorLayout((current) => ({
        ...current,
        props: [
          ...(current.props ?? []),
          {
            ...source,
            id,
            x: clamp(source.x + 36, 0, DESIGN_WIDTH),
            y: clamp(source.y + 36, 0, DESIGN_HEIGHT),
          },
        ],
      }));
      setSelectedEditor({ kind: "prop", id });
    }
  }

  function removeSelection(selection: EditorSelection | null) {
    if (!selection) return;
    if (selection.kind === "node") {
      setEditorLayout((current) => ({
        ...current,
        nodes: current.nodes.filter((entry, index) => (entry.id ?? nodes[index]?.lvl.id) !== selection.id),
        routes: getEditableRoutes(current, visualNodes).filter((route) => route.from !== selection.id && route.to !== selection.id),
        partyMarker:
          current.partyMarker?.anchorNodeId === selection.id
            ? { ...current.partyMarker, anchorNodeId: undefined }
            : current.partyMarker,
      }));
      setSelectedEditor(null);
      return;
    }
    if (selection.kind === "prop") {
      setEditorLayout((current) => ({ ...current, props: (current.props ?? []).filter((prop) => prop.id !== selection.id) }));
      setSelectedEditor(null);
      return;
    }
    if (selection.kind === "routeControl") {
      setEditorLayout((current) => ({
        ...current,
        routes: getEditableRoutes(current, visualNodes).filter((route) => route.id !== selection.id),
      }));
      setSelectedEditor(null);
    }
  }

  function addRouteFromSelection(selection: EditorSelection | null) {
    const from = selection?.kind === "node" ? selection.id : visualNodes[0]?.id;
    const to = visualNodes.find((node) => node.id !== from)?.id;
    if (!from || !to) return;
    const fromNode = visualNodes.find((node) => node.id === from);
    const toNode = visualNodes.find((node) => node.id === to);
    if (!fromNode || !toNode) return;
    const id = `${from}-${to}-${Date.now().toString(36)}`;
    const route: AdventureMapRouteLayout = {
      id,
      from,
      to,
      state: "available",
      control1: { x: Math.round(fromNode.x + (toNode.x - fromNode.x) * 0.34), y: Math.round(fromNode.y - 60) },
      control2: { x: Math.round(fromNode.x + (toNode.x - fromNode.x) * 0.66), y: Math.round(toNode.y + 60) },
    };
    setEditorLayout((current) => ({ ...current, routes: [...getEditableRoutes(current, visualNodes), route] }));
    setSelectedEditor({ kind: "routeControl", id, handle: "control1" });
    setShowRouteHandles(true);
  }

  function resetEditorLayout() {
    window.localStorage.removeItem(editorKey);
    setEditorLayout(mapLayout);
    setSelectedEditor(null);
    setCopyStatus("local edits reset");
  }

  function saveEditorDraft() {
    window.localStorage.setItem(editorKey, JSON.stringify(editorLayout));
    setCopyStatus("draft saved locally");
  }

  async function saveEditorToCode() {
    const response = await fetch("/api/dev/adventure-map-layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter, layout: editorLayout }),
    });
    const payload = (await response.json()) as { ok?: boolean; message?: string };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.message ?? "Could not save Adventure map layout");
    }
    setCopyStatus(payload.message ?? "layout saved to code");
    return payload.message ?? "layout saved to code";
  }

  return (
    <div
      className={cn(
        fullScreen
          ? "absolute inset-0 overflow-hidden bg-[#070b12]"
          : "relative aspect-video w-full overflow-hidden rounded-[30px] border border-[#f5d498]/12 bg-[#070b12] shadow-[0_28px_72px_rgba(0,0,0,0.36)]",
        embedded && "rounded-[28px]",
        qaEnabled && "z-[70]",
      )}
      data-adventure-world-map
      data-design-width={DESIGN_WIDTH}
      data-design-height={DESIGN_HEIGHT}
    >
      <HomeEffectSpriteStyles />
      <AdventureMapInteractionStyles />
      <div
        ref={stageRef}
        className={cn("absolute", fullScreen ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : "inset-0")}
        style={
          fullScreen
            ? {
                width: "min(100vw, 177.7778dvh)",
                height: "min(100dvh, 56.25vw)",
              }
            : undefined
        }
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragging(null)}
        onKeyDown={handleKeyDown}
        tabIndex={qaEnabled ? 0 : undefined}
      >
        {background ? (
          <img
            src={background.src}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: background.position ?? "50% 50%" }}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(78,103,141,0.36),transparent_38%),linear-gradient(180deg,#182033,#060910)]" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_42%,transparent_0%,rgba(5,8,14,0.04)_50%,rgba(5,8,14,0.5)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,13,0.08),rgba(4,7,13,0.02)_34%,rgba(4,7,13,0.34)_100%)]" />
        <AdventureSkyAtmosphere />

        <svg className="pointer-events-none absolute inset-0 z-[2] h-full w-full" viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`} preserveAspectRatio="none">
          <defs>
            <filter id="adventureRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {routes.map((route) => (
            <AdventureMapRoute key={route.id} route={route} accent={meta.accent} />
          ))}
        </svg>

        {routes.map((route, index) => (
          <RouteRune key={`${route.id}-rune`} from={route.from} to={route.to} index={index} />
        ))}

        {(activeLayout.props ?? []).map((prop) => (
          <AdventureMapProp
            key={prop.id}
            prop={prop}
            qaEnabled={qaEnabled}
            selected={selectedEditor?.kind === "prop" && selectedEditor.id === prop.id}
            interactionStatus={prop.interaction?.id ? interactionStates?.[prop.interaction.id] : undefined}
            interactionSelected={Boolean(prop.interaction?.id && prop.interaction.id === selectedInteractionId)}
            onInteractionSelect={onSelectInteraction}
            onSelect={() => setSelectedEditor({ kind: "prop", id: prop.id })}
            onDragStart={() => setDragging({ kind: "prop", id: prop.id })}
          />
        ))}

        {visualNodes.map((visualNode) => (
          <AdventureMapNode
            key={visualNode.id}
            visualNode={visualNode}
            active={visualNode.id === selectedId}
            accent={meta.accent}
            totalNodes={visualNodes.length}
            onSelect={onSelect}
            t={t}
            qaEnabled={qaEnabled}
            editorSelected={selectedEditor?.kind === "node" && selectedEditor.id === visualNode.id}
            onEditorSelect={() => {
              setSelectedEditor({ kind: "node", id: visualNode.id });
              if (nodes.some((node) => node.lvl.id === visualNode.id)) {
                onSelect(visualNode.id);
              }
            }}
            onEditorDragStart={() => setDragging({ kind: "node", id: visualNode.id })}
          />
        ))}

        {partyNode ? (
          <AdventurePartyMarker
            visualNode={partyNode}
            layout={activeLayout.partyMarker}
            qaEnabled={qaEnabled}
            selected={selectedEditor?.kind === "party"}
            onSelect={() => setSelectedEditor({ kind: "party", id: "party" })}
            onDragStart={() => setDragging({ kind: "party", id: "party" })}
          />
        ) : null}

        {qaEnabled && showRouteHandles
          ? routes.flatMap((route) => {
              const controls = getRouteControls(route);
              return (["control1", "control2"] as const).map((handle) => (
                <RouteControlHandle
                  key={`${route.id}-${handle}`}
                  route={route}
                  handle={handle}
                  point={controls[handle]}
                  selected={selectedEditor?.kind === "routeControl" && selectedEditor.id === route.id && selectedEditor.handle === handle}
                  onSelect={() => setSelectedEditor({ kind: "routeControl", id: route.id, handle })}
                  onDragStart={() => setDragging({ kind: "routeControl", id: route.id, handle })}
                />
              ));
            })
          : null}

        {!fullScreen ? (
        <div className="pointer-events-none absolute left-4 top-4 z-[5] max-w-[18rem] rounded-[22px] border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl">
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f5d498]">{meta.subtitle}</div>
          <div className="mt-1 truncate text-sm font-black text-white">{meta.name}</div>
          <div className="mt-1 text-[11px] leading-4 text-white/56">{meta.terrainLabel}</div>
        </div>
        ) : null}

        {qaEnabled ? (
          <AdventureMapEditorOverlay
            cursor={cursor}
            visualNodes={visualNodes}
            routes={routes}
            layout={editorLayout}
            selected={selectedEditor}
            showRouteHandles={showRouteHandles}
            copyStatus={copyStatus}
            onSelect={setSelectedEditor}
            onUpdateNode={updateNode}
            onUpdateProp={updateProp}
            onUpdateParty={updateParty}
            onUpdateRoute={updateRoute}
            onAddNode={addNode}
            onAddProp={addProp}
            onAddRoute={() => addRouteFromSelection(selectedEditor)}
            onDuplicate={() => duplicateSelection(selectedEditor)}
            onRemove={() => removeSelection(selectedEditor)}
            onSave={saveEditorDraft}
            onSaveToCode={saveEditorToCode}
            onReset={resetEditorLayout}
            onToggleRouteHandles={() => setShowRouteHandles((value) => !value)}
            onCopy={(label, value) => {
              void navigator.clipboard?.writeText(value);
              setCopyStatus(`${label} copied`);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function deriveNodeStatus(node: AdventureNodeState): AdventureMapNodeStatus {
  if (node.locked) return "locked";
  if (node.claimed) return "claimed";
  if (node.pausedHere || node.current) return "current";
  if (node.cleared) return "cleared";
  return "available";
}

function deriveNodeType(node: AdventureNodeState, index: number, total: number): AdventureMapNodeType {
  if (node.locked) return "locked";
  if (/boss/i.test(node.lvl.name) || index === total - 1) return "boss";
  if (node.firstClearAvailable && (node.lvl.firstClearRewards?.frontlineCards?.length || node.lvl.firstClearRewards?.gems)) return "chest";
  const squad = getFrontlineAdventureSquad(node.lvl);
  if ((node.lvl.obstacles?.length ?? 0) >= 2 || squad.some((enemy) => enemy.tier >= 3)) return "elite";
  return "battle";
}
