"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { getScreenBackgroundAsset } from "@/lib/screenBackgroundAssets";
import { getAdventureMapInteractionAsset, getAdventureMapInteractionEffectAsset } from "@/lib/adventureMapInteractionAssets";
import {
  ADVENTURE_PROP_ASSET_IDS,
  getAdventureNodeAsset,
  getAdventurePropAsset,
  type AdventureNodeAssetId,
  type AdventurePropAssetId,
} from "@/lib/adventureMapAssets";
import {
  ADVENTURE_MAP_DESIGN,
  ADVENTURE_MAP_INTERACTION_KINDS,
  ADVENTURE_MAP_NODE_STATUSES,
  ADVENTURE_MAP_NODE_TYPES,
  ADVENTURE_MAP_PROP_TYPES,
  type AdventureMapChapterLayout,
  type AdventureMapNodeStatus,
  type AdventureMapNodeType,
  type AdventureMapPartyMarkerLayout,
  type AdventureMapPropLayout,
  type AdventureMapPropType,
  type AdventureMapRouteLayout,
  type AdventureMapRouteState,
  type AdventureNodeLayout,
} from "./adventureMapLayout";
import { type AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";
import { getFrontlineAdventureSquad } from "@/features/frontline/adventure";
import { AdventureSkyAtmosphere } from "@/components/game/adventure/AdventureSkyAtmosphere";
import { HomeEffectSprite, HomeEffectSpriteStyles } from "@/components/game/home/HomeEffectSprite";
import GameIcon from "@/components/game/shared/GameIcon";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { useI18n } from "@/lib/i18n/useI18n";
import { ScreenBadge } from "@/components/game/screens/ScreenChrome";
import { HOME_EFFECT_IDS, type HomeEffectId } from "@/lib/homeEffectAssets";
import { AdventureMapEditorOverlay } from "./AdventureMapEditorOverlay";
import {
  buildRoutes,
  clamp,
  curvedRoute,
  getDefaultPropDimensions,
  getDefaultPropEffect,
  getEditableRoutes,
  getEffectDuration,
  getPropHeight,
  getPropVisualOpacity,
  getPropWidth,
  getRouteControls,
  nodeStyle,
} from "./AdventureMapGeometry";
import type {
  AdventureCampaignMeta,
  AdventureMapEditorSelection,
  AdventureNodeState,
  AdventureVisualNode,
  AdventureVisualRoute,
  TranslateFn,
} from "./AdventureCampaignTypes";

const DESIGN_WIDTH = ADVENTURE_MAP_DESIGN.width;
const DESIGN_HEIGHT = ADVENTURE_MAP_DESIGN.height;
const HOME_EFFECT_PROP_IDS = new Set<string>(HOME_EFFECT_IDS);
const ADVENTURE_PROP_ASSET_ID_SET = new Set<string>(ADVENTURE_PROP_ASSET_IDS);

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

function AdventureMapRoute({ route, accent }: { route: AdventureVisualRoute; accent: string }) {
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

function RouteRune({ from, to, index }: { from: AdventureVisualNode; to: AdventureVisualNode; index: number }) {
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

function AdventureMapNode({
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
          <GameIcon kind={nodeIcon(visualNode)} tone={tone} size="sm" className="relative z-[1] h-[62%] w-[62%] rounded-full border border-white/10 bg-black/20" />
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

function AdventurePartyMarker({
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

function isCompletedPartyNode(node: AdventureVisualNode) {
  return node.status === "cleared" || node.status === "claimed" || node.status === "completed";
}

function AdventureMapProp({
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

function RouteControlHandle({
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
function InteractionPropState({ status, selected }: { status: AdventureMapInteractionStatus; selected?: boolean }) {
  if (status === "claimed") {
    return <span className="pointer-events-none absolute -right-1 -top-1 rounded-full border border-emerald-200/36 bg-emerald-950/86 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-emerald-100">OK</span>;
  }
  if (status === "locked") {
    return null;
  }
  if (status === "needs_key") {
    return <span className="pointer-events-none absolute -right-1 -top-1 rounded-full border border-[#f5d498]/24 bg-black/78 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-[#f5d498]">KEY</span>;
  }
  return (
    <>
      <span className={cn(
        "pointer-events-none absolute left-1/2 top-[48%] h-[82%] w-[112%] -translate-x-1/2 -translate-y-1/2 rounded-[42%] bg-[#ffd978]/18 blur-[8px] shadow-[0_0_26px_rgba(245,196,81,0.26)]",
        selected && "opacity-90",
      )} />
      <span className="pointer-events-none absolute -right-1 -top-1 rounded-full border border-[#f5d498]/34 bg-[#2a1606]/92 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-[#ffe6a8]">OPEN</span>
    </>
  );
}

function InteractionPropContent({
  prop,
  status,
  fallback,
}: {
  prop: AdventureMapPropLayout;
  status: AdventureMapInteractionStatus;
  fallback: ReactNode;
}) {
  if (prop.interaction?.kind !== "keyChest") return <>{fallback}</>;
  const src = getAdventureMapInteractionAsset(status);
  const shine = getAdventureMapInteractionEffectAsset("gold_shine_loop");
  return (
    <span
      className={cn(
        "relative block h-full w-full",
        status === "ready" && "motion-safe:animate-[adventureKeyChestPulse_1.95s_ease-in-out_infinite]",
      )}
    >
      {status === "ready" && shine ? (
        <span className="pointer-events-none absolute left-1/2 top-[47%] z-[0] block h-[148%] w-[170%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[44%] opacity-[0.68]">
          {Array.from({ length: shine.frameCount }).map((_, index) => (
            <span
              key={`gold-shine-frame-${index}`}
              className="absolute inset-0 opacity-0 motion-safe:animate-[adventureGoldShineFrame_0.65s_steps(1,end)_infinite] motion-reduce:hidden"
              style={{ animationDelay: `${index * (650 / shine.frameCount)}ms` }}
            >
              <span
                className="absolute top-0 h-full bg-[image:var(--adventure-gold-shine)] bg-[length:100%_100%] bg-no-repeat"
                style={{
                  left: `${index * -100}%`,
                  width: `${shine.frameCount * 100}%`,
                  ["--adventure-gold-shine" as string]: `url(${shine.src})`,
                }}
              />
            </span>
          ))}
        </span>
      ) : null}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        className={cn(
          "h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.52)] [transform-origin:50%_58%]",
          status === "ready" && "brightness-110 saturate-[1.12] drop-shadow-[0_12px_18px_rgba(0,0,0,0.56)]",
          status === "ready" && "motion-safe:animate-[adventureKeyChestBreath_2.35s_ease-in-out_infinite]",
        )}
      />
      {status === "ready" ? <span className="pointer-events-none absolute left-[9%] top-[5%] h-[42%] w-[82%] rounded-[45%] bg-[#fff0a8]/18 blur-[6px]" /> : null}
    </span>
  );
}

function AdventureMapInteractionStyles() {
  return (
    <style jsx global>{`
      @keyframes adventureKeyChestPulse {
        0%,
        100% {
          filter: brightness(1) saturate(1);
        }
        48% {
          filter: brightness(1.13) saturate(1.14);
        }
      }

      @keyframes adventureKeyChestBreath {
        0%,
        100% {
          transform: translateZ(0) scale(1);
        }
        45% {
          transform: translateZ(0) scale(1.035);
        }
        62% {
          transform: translateZ(0) scale(1.015);
        }
      }

      @keyframes adventureGoldShineFrame {
        0%,
        19.999% {
          opacity: 0.86;
          transform: translateZ(0) scale(1);
        }
        20%,
        100% {
          opacity: 0;
          transform: translateZ(0) scale(1);
        }
      }
    `}</style>
  );
}

function getPropContent(prop: AdventureMapPropLayout) {
  const type = prop.type;
  if (type === "key_chest") {
    const src = getAdventureMapInteractionAsset("locked");
    return (
      <span className="relative block h-full w-full">
        <img
          src={src}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.52)]"
        />
      </span>
    );
  }
  if (isAdventurePropAsset(type)) {
    const asset = getAdventurePropAsset(type);
    if (asset) {
      return (
        <span className="relative block h-full w-full">
          <img
            src={asset.src}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.48)]"
          />
          {prop.effect?.enabled !== false ? <AdventurePropEffect prop={prop} /> : null}
        </span>
      );
    }
  }
  if (isHomeEffectProp(type)) {
    return (
      <HomeEffectSprite
        effect={type}
        durationMs={type === "clouds_dark_layer" ? 90000 : type === "crow_fly_loop" ? 720 : 720}
        width="100%"
        height="100%"
        dataId={prop.id}
        opacity={1}
        mobileDisabled={false}
        className="left-1/2 top-1/2"
      />
    );
  }
  if (type === "camp_prop") return <span className="block h-full w-full rounded-[40%] border border-[#f5d498]/24 bg-[linear-gradient(180deg,rgba(245,196,81,0.24),rgba(46,28,12,0.76))]" />;
  if (type === "chest_prop") return <span className="block h-[70%] w-full rounded-[18%] border border-[#f5d498]/28 bg-[linear-gradient(180deg,rgba(245,196,81,0.28),rgba(70,38,16,0.82))]" />;
  return <span className="block h-full w-full rounded-full bg-amber-300/36 blur-[1px] shadow-[0_0_14px_currentColor]" />;
}

function AdventurePropEffect({ prop }: { prop: AdventureMapPropLayout }) {
  if (!prop.effect || !HOME_EFFECT_PROP_IDS.has(prop.effect.type)) return null;
  return (
    <HomeEffectSprite
      effect={prop.effect.type}
      durationMs={prop.effect.durationMs ?? getEffectDuration(prop.effect.type)}
      width={`${prop.effect.widthPercent}%`}
      height={`${prop.effect.heightPercent}%`}
      dataId={`${prop.id}-effect`}
      opacity={prop.effect.opacity ?? 0.85}
      mobileDisabled={false}
      className="absolute"
      style={{
        left: `${prop.effect.xPercent}%`,
        top: `${prop.effect.yPercent}%`,
      }}
    />
  );
}

function isHomeEffectProp(type: AdventureMapPropType): type is HomeEffectId {
  return HOME_EFFECT_PROP_IDS.has(type);
}

function isAdventurePropAsset(type: AdventureMapPropType): type is AdventurePropAssetId {
  return ADVENTURE_PROP_ASSET_ID_SET.has(type);
}

function getNodeAssetId(node: AdventureVisualNode): AdventureNodeAssetId {
  if (node.status === "locked") return "locked";
  if (node.status === "claimed" || node.status === "completed") return "cleared";
  if (node.type === "hidden") return "secret";
  return node.type === "locked" ? "locked" : node.type;
}

function getNodeVisualScale(node: AdventureVisualNode, active: boolean) {
  if (active || node.status === "current") return node.type === "boss" ? 1.38 : 1.34;
  if (node.type === "boss") return 1.28;
  if (node.type === "chest") return 1.22;
  if (node.type === "elite") return 1.18;
  if (node.status === "locked") return 0.86;
  if (node.status === "cleared" || node.status === "claimed" || node.status === "completed") return 1.1;
  return 1.18;
}

function getNodeAssetScale(node: AdventureVisualNode, active: boolean) {
  if (active || node.status === "current") return 1.08;
  if (node.type === "boss") return 1.08;
  if (node.type === "chest") return 1.06;
  if (node.status === "locked") return 0.96;
  return 1.04;
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

function nodeIcon(node: AdventureVisualNode): "battle" | "rewards" | "shield" | "adventure" {
  if (node.status === "locked") return "shield";
  if (node.type === "chest" || node.status === "cleared") return "rewards";
  if (node.type === "boss" || node.type === "elite") return "battle";
  return "adventure";
}

function getNodeTheme(node: AdventureVisualNode, active: boolean, accent: string) {
  if (node.status === "locked") {
    return {
      border: "rgba(156,163,175,0.24)",
      innerBorder: "rgba(255,255,255,0.1)",
      background: "radial-gradient(circle at 42% 32%, rgba(93,103,118,0.34), rgba(13,16,22,0.94) 68%)",
      glow: "0 0 0 rgba(0,0,0,0)",
    };
  }
  if (node.status === "cleared" || node.status === "claimed" || node.status === "completed") {
    return {
      border: "rgba(152,209,174,0.28)",
      innerBorder: "rgba(152,209,174,0.18)",
      background: "radial-gradient(circle at 42% 32%, rgba(130,180,145,0.24), rgba(18,24,18,0.94) 70%)",
      glow: "0 0 14px rgba(99,180,121,0.12)",
    };
  }
  if (node.type === "boss") {
    return {
      border: "rgba(255,184,117,0.5)",
      innerBorder: "rgba(255,133,84,0.34)",
      background: "radial-gradient(circle at 42% 30%, rgba(255,147,84,0.36), rgba(47,17,14,0.96) 70%)",
      glow: active ? "0 0 24px rgba(255,147,84,0.34)" : "0 0 16px rgba(255,147,84,0.18)",
    };
  }
  if (node.type === "chest") {
    return {
      border: "rgba(245,212,152,0.48)",
      innerBorder: "rgba(245,196,81,0.3)",
      background: "radial-gradient(circle at 42% 30%, rgba(245,196,81,0.34), rgba(48,32,12,0.95) 70%)",
      glow: active ? "0 0 22px rgba(245,196,81,0.28)" : "0 0 13px rgba(245,196,81,0.14)",
    };
  }
  return {
    border: active ? "rgba(245,212,152,0.5)" : `${accent}80`,
    innerBorder: "rgba(145,205,255,0.24)",
    background: "radial-gradient(circle at 42% 30%, rgba(130,196,255,0.26), rgba(12,22,35,0.96) 70%)",
    glow: active ? "0 0 22px rgba(145,205,255,0.25)" : "0 0 12px rgba(145,205,255,0.12)",
  };
}
