"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { AdventureLevel, Rewards } from "@/lib/types";
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
import {
  type AdventureMapInteractionClaim,
  type AdventureMapInteractionDefinition,
  type AdventureMapInteractionLootTier,
  type AdventureMapInteractionOpenResult,
  type AdventureMapInteractionStatus,
} from "@/features/adventure/mapInteractions";
import { FRONTLINE_CARD_BY_ID } from "@/features/frontline/data";
import { getFrontlineAdventureSquad, getFrontlinePresetForAdventure } from "@/features/frontline/adventure";
import {
  getAdventureNodeDefinition,
  getAdventureNodeRewardPreview,
  isAdventureClaimed,
  isAdventureCombatNode,
  type AdventureNodeDefinition,
  type AdventureNodeType,
  type AdventureProgressEntry,
} from "@/features/adventure/nodeResolution";
import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import { getFrontlineEnemyLeaderPortraitForPreset } from "@/lib/frontlineLeaderPortraitAssets";
import { AdventureSkyAtmosphere } from "@/components/game/adventure/AdventureSkyAtmosphere";
import { HomeEffectSprite, HomeEffectSpriteStyles } from "@/components/game/home/HomeEffectSprite";
import GameIcon from "@/components/game/shared/GameIcon";
import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { CombatIcon } from "@/components/game/shared/CombatIcon";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import { frontlineCardName, frontlinePresetName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  SceneButton,
  ScreenBadge,
  ScreenPanel,
} from "@/components/game/screens/ScreenChrome";
import { HOME_EFFECT_IDS, type HomeEffectId } from "@/lib/homeEffectAssets";
import type { ScreenScene } from "@/components/game/screens/SceneBackdrop";

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

export type AdventureNodeState = {
  lvl: AdventureLevel;
  cleared: boolean;
  locked: boolean;
  current: boolean;
  claimed?: boolean;
  pausedHere: boolean;
  firstClearAvailable: boolean;
};

export type AdventureLandmark = {
  label: string;
  kind: "camp" | "bridge" | "altar" | "gate" | "spire" | "ruin";
  x: string;
  y: string;
  mobileX: string;
  mobileY: string;
};

export type AdventureCampaignMeta = {
  name: string;
  subtitle: string;
  accent: string;
  scene: ScreenScene;
  hint: string;
  atmosphere: string;
  terrainLabel: string;
  threatLabel: string;
  landmarks: AdventureLandmark[];
};

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

type AdventureVisualNode = {
  id: string;
  node: AdventureNodeState;
  x: number;
  y: number;
  size?: number;
  zIndex?: number;
  type: AdventureMapNodeType;
  status: AdventureMapNodeStatus;
  connectsTo: string[];
};

type AdventureVisualRoute = {
  id: string;
  from: AdventureVisualNode;
  to: AdventureVisualNode;
  state?: AdventureMapRouteState;
  control1?: { x: number; y: number };
  control2?: { x: number; y: number };
};

type EditorSelection =
  | { kind: "node"; id: string }
  | { kind: "prop"; id: string }
  | { kind: "party"; id: "party" }
  | { kind: "routeControl"; id: string; handle: "control1" | "control2" };

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
            interactionSelected && "ring-2 ring-[#f5d498]/75 ring-offset-2 ring-offset-black",
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
          <InteractionPropState status={interactionStatus ?? "locked"} />
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

function InteractionPropState({ status }: { status: AdventureMapInteractionStatus }) {
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
      <span className="pointer-events-none absolute left-[18%] top-[14%] h-[36%] w-[52%] rounded-[45%] bg-[#ffd978]/18 blur-[5px] shadow-[0_0_18px_rgba(245,196,81,0.28)]" />
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
        status === "ready" && "animate-[adventureKeyChestGlow_1.85s_ease-in-out_infinite]",
      )}
    >
      {status === "ready" && shine ? (
        <span className="pointer-events-none absolute left-[50%] top-[43%] z-[0] block h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[42%] opacity-55">
          <span
            className="absolute left-0 top-0 h-full bg-[image:var(--adventure-gold-shine)] bg-[length:100%_100%] bg-no-repeat motion-safe:animate-[adventureGoldShineLoop_1.05s_steps(6)_infinite] motion-reduce:hidden"
            style={{
              width: `${shine.frameCount * 100}%`,
              ["--adventure-gold-shine" as string]: `url(${shine.src})`,
            }}
          />
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
          "h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.52)]",
          status === "ready" && "brightness-110 saturate-[1.12] drop-shadow-[0_12px_18px_rgba(0,0,0,0.56)]",
        )}
      />
      {status === "ready" ? <span className="pointer-events-none absolute left-[21%] top-[20%] h-[18%] w-[46%] rounded-[45%] bg-[#fff0a8]/22 blur-[4px]" /> : null}
    </span>
  );
}

function AdventureMapEditorOverlay({
  cursor,
  visualNodes,
  routes,
  layout,
  selected,
  showRouteHandles,
  copyStatus,
  onSelect,
  onUpdateNode,
  onUpdateProp,
  onUpdateParty,
  onUpdateRoute,
  onAddNode,
  onAddProp,
  onAddRoute,
  onDuplicate,
  onRemove,
  onSave,
  onSaveToCode,
  onReset,
  onToggleRouteHandles,
  onCopy,
}: {
  cursor: { x: number; y: number } | null;
  visualNodes: AdventureVisualNode[];
  routes: AdventureVisualRoute[];
  layout: AdventureMapChapterLayout;
  selected: EditorSelection | null;
  showRouteHandles: boolean;
  copyStatus: string;
  onSelect: (selection: EditorSelection | null) => void;
  onUpdateNode: (id: string, patch: Partial<AdventureNodeLayout>) => void;
  onUpdateProp: (id: string, patch: Partial<AdventureMapPropLayout>) => void;
  onUpdateParty: (patch: Partial<AdventureMapPartyMarkerLayout>) => void;
  onUpdateRoute: (id: string, patch: Partial<AdventureMapRouteLayout>) => void;
  onAddNode: () => void;
  onAddProp: (type: AdventureMapPropType) => void;
  onAddRoute: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onSave: () => void;
  onSaveToCode: () => Promise<string>;
  onReset: () => void;
  onToggleRouteHandles: () => void;
  onCopy: (label: string, value: string) => void;
}) {
  const selectedNode = selected?.kind === "node" ? visualNodes.find((node) => node.id === selected.id) : null;
  const selectedNodeLayout = selectedNode ? layout.nodes.find((node) => node.id === selectedNode.id) : null;
  const selectedProp = selected?.kind === "prop" ? layout.props?.find((prop) => prop.id === selected.id) : null;
  const selectedRoute = selected?.kind === "routeControl" ? getEditableRoutes(layout, visualNodes).find((route) => route.id === selected.id) : null;
  const selectedJson = JSON.stringify(getSelectedExport(layout, selected), null, 2);
  const nodesJson = JSON.stringify(layout.nodes.map((node, index) => ({ ...node, id: node.id ?? visualNodes[index]?.id })), null, 2);
  const routesJson = JSON.stringify(getEditableRoutes(layout, visualNodes), null, 2);
  const propsJson = JSON.stringify(layout.props ?? [], null, 2);
  const allJson = JSON.stringify(layout, null, 2);
  const [newPropType, setNewPropType] = useState<AdventureMapPropType>("campfire");
  const [panelPosition, setPanelPosition] = useState<{ left: number; top: number } | null>(null);
  const [status, setStatus] = useState("Autosaved locally");
  const elementOptions = [
    ...visualNodes.map((node) => ({ value: `node:${node.id}`, label: `node | ${node.id}` })),
    ...(layout.props ?? []).map((prop) => ({ value: `prop:${prop.id}`, label: `prop | ${prop.type} | ${prop.id}` })),
    { value: "party:party", label: "party | marker" },
    ...getEditableRoutes(layout, visualNodes).flatMap((route) => [
      { value: `routeControl:${route.id}:control1`, label: `route | ${route.id} c1` },
      { value: `routeControl:${route.id}:control2`, label: `route | ${route.id} c2` },
    ]),
  ];
  const selectedValue =
    selected?.kind === "routeControl"
      ? `${selected.kind}:${selected.id}:${selected.handle}`
      : selected
        ? `${selected.kind}:${selected.id}`
        : "";

  function parseSelection(value: string): EditorSelection | null {
    const [kind, id, handle] = value.split(":");
    if (kind === "node" && id) return { kind, id };
    if (kind === "prop" && id) return { kind, id };
    if (kind === "party") return { kind: "party", id: "party" };
    if (kind === "routeControl" && id && (handle === "control1" || handle === "control2")) return { kind, id, handle };
    return null;
  }

  function startPanelDrag(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    const panel = event.currentTarget.closest("[data-adventure-map-editor-panel]");
    if (!(panel instanceof HTMLElement)) return;

    event.preventDefault();
    const rect = panel.getBoundingClientRect();
    const grabX = event.clientX - rect.left;
    const grabY = event.clientY - rect.top;

    const move = (moveEvent: globalThis.PointerEvent) => {
      const maxLeft = Math.max(0, window.innerWidth - rect.width);
      const maxTop = Math.max(0, window.innerHeight - rect.height);
      setPanelPosition({
        left: clamp(moveEvent.clientX - grabX, 0, maxLeft),
        top: clamp(moveEvent.clientY - grabY, 0, maxTop),
      });
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  }

  function copyText(label: string, value: string) {
    onCopy(label, value);
    setStatus(`${label} copied`);
  }

  async function saveToCode() {
    try {
      const message = await onSaveToCode();
      setStatus(message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save to code");
    }
  }

  function saveDraft() {
    onSave();
    setStatus(`Saved locally ${new Date().toLocaleTimeString()}`);
  }

  return (
    <div className="absolute inset-0 z-[40] pointer-events-none">
      <div className="absolute inset-0 border border-sky-300/45" />
      {visualNodes.map((node) => (
        <div
          key={`qa-${node.id}`}
          className="absolute z-[21] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/35"
          style={nodeStyle(node.x, node.y)}
        >
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200" />
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-black text-sky-100">
            {node.id} {Math.round(node.x)},{Math.round(node.y)}
          </span>
        </div>
      ))}
      <div
        data-adventure-map-editor-panel="1"
        className="pointer-events-auto fixed right-3 top-24 z-[80] flex w-[25rem] max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-[18px] border border-sky-200/24 bg-black/86 p-3 text-white shadow-[0_18px_42px_rgba(0,0,0,0.42)] backdrop-blur-xl"
        style={
          panelPosition
            ? {
                left: panelPosition.left,
                top: panelPosition.top,
                right: "auto",
                maxHeight: "min(42rem, calc(100dvh - 10rem))",
              }
            : { maxHeight: "min(42rem, calc(100dvh - 10rem))" }
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 cursor-move select-none" onPointerDown={startPanelDrag} title="Drag panel">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-200">Adventure map editor</div>
            <div className="mt-1 text-xs text-white/66">
              Canvas {DESIGN_WIDTH}x{DESIGN_HEIGHT} {cursor ? `| cursor ${cursor.x}, ${cursor.y}` : ""}
            </div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-200/46">Drag this header to move panel</div>
          </div>
          <div className="grid shrink-0 gap-1">
            <button type="button" onClick={saveDraft} className={cn(editorButtonClass(false), "border-emerald-300/28 text-emerald-100")}>
              Save draft
            </button>
            <button type="button" onClick={() => void saveToCode()} className={cn(editorButtonClass(false), "border-yellow-300/28 text-yellow-100")}>
              Save to code
            </button>
            <button type="button" onClick={() => copyText("selected", selectedJson)} className={editorButtonClass(false)}>
              Copy selected
            </button>
            <button type="button" onClick={() => copyText("layout", allJson)} className={editorButtonClass(true)}>
              Copy all
            </button>
          </div>
        </div>

        <select
          className="mt-3 rounded-lg border border-sky-300/25 bg-black/52 px-2 py-1.5 text-xs font-bold text-white outline-none"
          value={selectedValue}
          onChange={(event) => onSelect(parseSelection(event.target.value))}
        >
          <option value="">Select element...</option>
          {elementOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-2">
          <SelectField label="new prop" value={newPropType} options={ADVENTURE_MAP_PROP_TYPES} onChange={(type) => setNewPropType(type as AdventureMapPropType)} />
          <button type="button" onClick={() => onAddProp(newPropType)} className={editorButtonClass(true)}>
            New prop
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={onAddNode} className={editorButtonClass(false)}>
            New node
          </button>
          <button type="button" onClick={onAddRoute} className={editorButtonClass(false)}>
            New route
          </button>
          <button type="button" onClick={onDuplicate} disabled={!selected} className={editorButtonClass(false)}>
            Duplicate selected
          </button>
          <button type="button" onClick={onRemove} disabled={!selected || selected.kind === "party"} className={cn(editorButtonClass(false), "border-rose-300/28 text-rose-100 disabled:opacity-35")}>
            Delete selected
          </button>
          <button type="button" onClick={() => onSelect(null)} className={editorButtonClass(false)}>
            Clear selection
          </button>
          <button type="button" onClick={() => setPanelPosition(null)} className={editorButtonClass(false)}>
            Reset panel
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={onToggleRouteHandles} className={editorButtonClass(showRouteHandles)}>
            Route handles
          </button>
          <button type="button" onClick={onReset} className={cn(editorButtonClass(false), "border-amber-300/28 text-amber-100")}>
            Reset local edits
          </button>
        </div>

        <div className="mt-3 min-h-0 overflow-y-auto pr-1">
        <div className="rounded-[14px] border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/48">Selected</div>
          {!selected ? <div className="mt-2 text-xs text-white/58">Click a node, prop, party marker or route handle.</div> : null}
          {selectedNode && selectedNodeLayout ? (
            <NodeEditorFields node={selectedNode} layout={selectedNodeLayout} onUpdate={(patch) => onUpdateNode(selectedNode.id, patch)} />
          ) : null}
          {selectedProp ? <PropEditorFields prop={selectedProp} onUpdate={(patch) => onUpdateProp(selectedProp.id, patch)} /> : null}
          {selected?.kind === "party" ? <PartyEditorFields party={layout.partyMarker} onUpdate={onUpdateParty} /> : null}
          {selectedRoute && selected?.kind === "routeControl" ? (
            <RouteEditorFields route={selectedRoute} handle={selected.handle} onUpdate={(patch) => onUpdateRoute(selectedRoute.id, patch)} />
          ) : null}
        </div>

        <textarea
          readOnly
          value={selectedJson}
          className="mt-3 h-28 w-full resize-none rounded-[12px] border border-white/10 bg-black/54 p-2 font-mono text-[10px] text-white/78"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => copyText("nodes", nodesJson)} className={editorButtonClass(false)}>Copy nodes JSON</button>
          <button type="button" onClick={() => copyText("routes", routesJson)} className={editorButtonClass(false)}>Copy routes JSON</button>
          <button type="button" onClick={() => copyText("props", propsJson)} className={editorButtonClass(false)}>Copy props JSON</button>
          <button type="button" onClick={() => copyText("layout", allJson)} className={editorButtonClass(true)}>Copy all layout</button>
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/42">
          Drag selected. Arrows: 2px. Shift+arrows: 10px. +/- resizes. {status}.
        </div>
        {copyStatus ? <div className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">{copyStatus}</div> : null}
        </div>
      </div>
    </div>
  );
}

function NodeEditorFields({
  node,
  layout,
  onUpdate,
}: {
  node: AdventureVisualNode;
  layout: AdventureNodeLayout;
  onUpdate: (patch: Partial<AdventureNodeLayout>) => void;
}) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
      <Readout label="id" value={node.id} />
      <NumberField label="x" value={layout.x} onChange={(x) => onUpdate({ x })} />
      <NumberField label="y" value={layout.y} onChange={(y) => onUpdate({ y })} />
      <NumberField label="size" value={layout.size ?? node.size ?? 48} onChange={(size) => onUpdate({ size })} />
      <NumberField label="z" value={layout.zIndex ?? node.zIndex ?? 20} onChange={(zIndex) => onUpdate({ zIndex })} />
      <SelectField label="type" value={layout.type ?? node.type} options={ADVENTURE_MAP_NODE_TYPES} onChange={(type) => onUpdate({ type: type as AdventureMapNodeType })} />
      <SelectField label="status" value={layout.status ?? node.status} options={ADVENTURE_MAP_NODE_STATUSES} onChange={(status) => onUpdate({ status: status as AdventureMapNodeStatus })} />
      <TextField
        label="connects to"
        value={(layout.connectsTo ?? node.connectsTo ?? []).join(", ")}
        className="col-span-2"
        placeholder="c1l3, c1l7"
        onChange={(value) => onUpdate({ connectsTo: parseNodeIdList(value) })}
      />
    </div>
  );
}

function PropEditorFields({ prop, onUpdate }: { prop: AdventureMapPropLayout; onUpdate: (patch: Partial<AdventureMapPropLayout>) => void }) {
  const effect = prop.effect;
  const interaction = prop.interaction;
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
      <Readout label="id" value={prop.id} />
      <SelectField label="type" value={prop.type} options={ADVENTURE_MAP_PROP_TYPES} onChange={(type) => onUpdate({ type: type as AdventureMapPropType })} />
      <NumberField label="x" value={prop.x} onChange={(x) => onUpdate({ x })} />
      <NumberField label="y" value={prop.y} onChange={(y) => onUpdate({ y })} />
      <NumberField label="width" value={getPropWidth(prop)} onChange={(width) => onUpdate({ width, size: undefined })} />
      <NumberField label="height" value={getPropHeight(prop)} onChange={(height) => onUpdate({ height, size: undefined })} />
      <NumberField label="z" value={prop.zIndex} onChange={(zIndex) => onUpdate({ zIndex })} />
      <NumberField label="rotate z" value={prop.rotation ?? 0} step={1} onChange={(rotation) => onUpdate({ rotation })} />
      <NumberField label="rotate x" value={prop.rotationX ?? 0} step={1} onChange={(rotationX) => onUpdate({ rotationX })} />
      <NumberField label="rotate y" value={prop.rotationY ?? 0} step={1} onChange={(rotationY) => onUpdate({ rotationY })} />
      <NumberField label="opacity" value={prop.opacity ?? 1} step={0.05} onChange={(opacity) => onUpdate({ opacity })} />
      <label className="flex items-center gap-2 rounded-[10px] border border-white/10 bg-black/28 px-2 py-1 text-white/70">
        <input type="checkbox" checked={prop.enabled} onChange={(event) => onUpdate({ enabled: event.target.checked })} />
        enabled
      </label>
      <div className="col-span-2 mt-1 border-t border-white/10 pt-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/38">Prop effect</div>
      <SelectField
        label="effect"
        value={effect?.type ?? "none"}
        options={["none", ...HOME_EFFECT_IDS]}
        onChange={(type) =>
          onUpdate({
            effect:
              type === "none"
                ? undefined
                : {
                    ...(effect ?? {
                      xPercent: 50,
                      yPercent: 40,
                      widthPercent: 40,
                      heightPercent: 40,
                      opacity: 0.85,
                      durationMs: getEffectDuration(type as HomeEffectId),
                      enabled: true,
                    }),
                    type: type as HomeEffectId,
                  },
          })
        }
      />
      <label className="flex items-center gap-2 rounded-[10px] border border-white/10 bg-black/28 px-2 py-1 text-white/70">
        <input
          type="checkbox"
          checked={effect?.enabled ?? false}
          onChange={(event) => onUpdate({ effect: { ...(effect ?? getDefaultPropEffect(prop.type) ?? { type: "flame_loop", xPercent: 50, yPercent: 40, widthPercent: 40, heightPercent: 40 }), enabled: event.target.checked } })}
        />
        effect enabled
      </label>
      {effect ? (
        <>
          <NumberField label="effect x%" value={effect.xPercent} step={0.5} onChange={(xPercent) => onUpdate({ effect: { ...effect, xPercent } })} />
          <NumberField label="effect y%" value={effect.yPercent} step={0.5} onChange={(yPercent) => onUpdate({ effect: { ...effect, yPercent } })} />
          <NumberField label="effect w%" value={effect.widthPercent} step={0.5} onChange={(widthPercent) => onUpdate({ effect: { ...effect, widthPercent } })} />
          <NumberField label="effect h%" value={effect.heightPercent} step={0.5} onChange={(heightPercent) => onUpdate({ effect: { ...effect, heightPercent } })} />
          <NumberField label="effect opacity" value={effect.opacity ?? 0.85} step={0.05} onChange={(opacity) => onUpdate({ effect: { ...effect, opacity } })} />
          <NumberField label="effect ms" value={effect.durationMs ?? getEffectDuration(effect.type)} onChange={(durationMs) => onUpdate({ effect: { ...effect, durationMs } })} />
        </>
      ) : null}
      <div className="col-span-2 mt-1 border-t border-white/10 pt-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/38">Map interaction</div>
      <label className="flex items-center gap-2 rounded-[10px] border border-white/10 bg-black/28 px-2 py-1 text-white/70">
        <input
          type="checkbox"
          checked={interaction?.enabled ?? false}
          onChange={(event) =>
            onUpdate({
              interaction: event.target.checked
                ? {
                    id: interaction?.id ?? "c1-lower-cache",
                    kind: interaction?.kind ?? "keyChest",
                    keyCost: interaction?.keyCost ?? 1,
                    unlockAfter: interaction?.unlockAfter ?? ["c1l2"],
                    rewardId: interaction?.rewardId ?? interaction?.id ?? "c1-lower-cache",
                    enabled: true,
                  }
                : interaction
                  ? { ...interaction, enabled: false }
                  : undefined,
            })
          }
        />
        interaction enabled
      </label>
      <SelectField
        label="kind"
        value={interaction?.kind ?? "keyChest"}
        options={ADVENTURE_MAP_INTERACTION_KINDS}
        onChange={(kind) =>
          onUpdate({
            interaction: {
              ...(interaction ?? { id: "c1-lower-cache", keyCost: 1, unlockAfter: ["c1l2"], enabled: true }),
              kind: kind as "keyChest",
            },
          })
        }
      />
      <TextField
        label="interaction id"
        value={interaction?.id ?? ""}
        className="col-span-2"
        placeholder="c1-lower-cache"
        onChange={(id) =>
          onUpdate({
            interaction: {
              ...(interaction ?? { kind: "keyChest", keyCost: 1, unlockAfter: ["c1l2"], enabled: true }),
              id,
              rewardId: interaction?.rewardId ?? id,
            },
          })
        }
      />
      <NumberField
        label="key cost"
        value={interaction?.keyCost ?? 1}
        onChange={(keyCost) =>
          onUpdate({
            interaction: {
              ...(interaction ?? { id: "c1-lower-cache", kind: "keyChest", unlockAfter: ["c1l2"], enabled: true }),
              keyCost,
            },
          })
        }
      />
      <TextField
        label="unlock after"
        value={(interaction?.unlockAfter ?? []).join(", ")}
        placeholder="c1l2"
        onChange={(value) =>
          onUpdate({
            interaction: {
              ...(interaction ?? { id: "c1-lower-cache", kind: "keyChest", keyCost: 1, enabled: true }),
              unlockAfter: parseNodeIdList(value),
            },
          })
        }
      />
    </div>
  );
}

function PartyEditorFields({ party, onUpdate }: { party?: AdventureMapPartyMarkerLayout; onUpdate: (patch: Partial<AdventureMapPartyMarkerLayout>) => void }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
      <NumberField label="x" value={party?.x ?? 0} onChange={(x) => onUpdate({ x })} />
      <NumberField label="y" value={party?.y ?? 0} onChange={(y) => onUpdate({ y })} />
      <NumberField label="size" value={party?.size ?? 56} onChange={(size) => onUpdate({ size })} />
      <NumberField label="z" value={party?.zIndex ?? 28} onChange={(zIndex) => onUpdate({ zIndex })} />
      <SelectField label="style" value={party?.style ?? "banner"} options={["banner", "token", "camp"]} onChange={(style) => onUpdate({ style: style as AdventureMapPartyMarkerLayout["style"] })} />
    </div>
  );
}

function RouteEditorFields({
  route,
  handle,
  onUpdate,
}: {
  route: AdventureMapRouteLayout;
  handle: "control1" | "control2";
  onUpdate: (patch: Partial<AdventureMapRouteLayout>) => void;
}) {
  const point = route[handle] ?? { x: 0, y: 0 };
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
      <Readout label="route" value={route.id} />
      <Readout label="handle" value={handle} />
      <NumberField label="x" value={point.x} onChange={(x) => onUpdate({ [handle]: { ...point, x } })} />
      <NumberField label="y" value={point.y} onChange={(y) => onUpdate({ [handle]: { ...point, y } })} />
      <SelectField label="state" value={route.state ?? "available"} options={["cleared", "available", "locked", "boss"]} onChange={(state) => onUpdate({ state: state as AdventureMapRouteState })} />
    </div>
  );
}

function NumberField({ label, value, step = 1, onChange }: { label: string; value: number; step?: number; onChange: (value: number) => void }) {
  return (
    <label className="rounded-[10px] border border-white/10 bg-black/28 px-2 py-1 text-white/66">
      <span className="block text-[9px] uppercase tracking-[0.14em] text-white/36">{label}</span>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full bg-transparent text-[12px] font-black text-white outline-none"
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options?: readonly string[]; onChange: (value: string) => void }) {
  const safeOptions = options ?? [];
  return (
    <label className="rounded-[10px] border border-white/10 bg-black/28 px-2 py-1 text-white/66">
      <span className="block text-[9px] uppercase tracking-[0.14em] text-white/36">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full bg-black text-[12px] font-black text-white outline-none">
        {safeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  placeholder,
  className,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={cn("rounded-[10px] border border-white/10 bg-black/28 px-2 py-1 text-white/66", className)}>
      <span className="block text-[9px] uppercase tracking-[0.14em] text-white/36">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full bg-transparent text-[12px] font-black text-white outline-none placeholder:text-white/24"
      />
    </label>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-black/28 px-2 py-1 text-white/66">
      <span className="block text-[9px] uppercase tracking-[0.14em] text-white/36">{label}</span>
      <span className="mt-1 block truncate text-[12px] font-black text-white">{value}</span>
    </div>
  );
}

function parseNodeIdList(value: string) {
  return value
    .split(/[,\s]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function AdventureMissionPanel({
  meta,
  node,
  totalNodes,
  nodeDefinition,
  progress,
  claimedRewards,
  expanded = false,
  onToggleExpanded,
  onOpenBattle,
}: {
  meta: AdventureCampaignMeta;
  node: AdventureNodeState;
  totalNodes: number;
  nodeDefinition?: AdventureNodeDefinition;
  progress?: AdventureProgressEntry;
  claimedRewards?: Rewards | null;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  onOpenBattle: () => void;
}) {
  const { t } = useI18n();
  const definition = nodeDefinition ?? getAdventureNodeDefinition(node.lvl);
  const nodeType = definition.type;
  const nodeClaimed = isAdventureClaimed(nodeType, progress) || node.claimed;
  const combatNode = isAdventureCombatNode(nodeType);
  const firstClearAvailable = node.firstClearAvailable && !nodeClaimed;
  const tone =
    node.locked || nodeType === "locked"
      ? "neutral"
      : nodeClaimed || node.cleared
        ? "emerald"
        : nodeType === "boss"
          ? "ember"
          : nodeType === "elite" || nodeType === "danger"
            ? "sky"
            : "gold";
  const statusLabel = getMissionStatusLabel(node, definition, progress, firstClearAvailable, t);
  const frontlineSquad = getFrontlineAdventureSquad(node.lvl);
  const frontlinePreset = combatNode ? getFrontlinePresetForAdventure(node.lvl) : null;
  const enemyLeaderPortrait = getFrontlineEnemyLeaderPortraitForPreset(frontlinePreset);
  const enemyTotal = frontlineSquad.reduce((sum, enemy) => sum + enemy.maxHp + enemy.atk * 2 + enemy.def * 2 + enemy.tier * 6, 0);
  const objective = getMissionObjective(node, definition, t);
  const rewardPreview = claimedRewards ?? getAdventureNodeRewardPreview(node.lvl, progress);
  const rewardChips = buildRewardChipsFromRewards(rewardPreview, firstClearAvailable, t);
  const primaryReward = rewardChips[0];
  const cta = getMissionCta(node, definition, progress, t);
  const showEnemyFormation = combatNode;

  return (
    <ScreenPanel className="pointer-events-none overflow-hidden border-[#f5d498]/14 bg-[linear-gradient(180deg,rgba(12,15,22,0.74),rgba(6,8,12,0.88))] p-0 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-xl">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(245,196,81,0.14),transparent_22%),radial-gradient(circle_at_88%_0%,rgba(143,213,255,0.1),transparent_20%)]" />
        <div className="relative p-2.5">
          <div className="grid items-center gap-2 md:grid-cols-[minmax(17rem,1fr)_auto_auto_auto]">
            <div className="flex min-w-0 items-center gap-2.5">
              <MissionNodeAssetBadge nodeType={nodeType} locked={node.locked || nodeType === "locked"} claimed={nodeClaimed || node.cleared} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <ScreenBadge tone={tone}>{statusLabel}</ScreenBadge>
                  <ScreenBadge tone="sky">{getNodeTypeLabel(nodeType)}</ScreenBadge>
                  {combatNode ? <ScreenBadge tone="sky">{t("adventure.power")} {node.lvl.recommendedPower}</ScreenBadge> : null}
                </div>
                <h2 className="mt-1 truncate text-[1.05rem] font-black leading-tight text-white md:text-[1.2rem]">{node.lvl.name}</h2>
              </div>
            </div>

            <div className="grid gap-1.5 md:min-w-[8rem]">
              <MissionFact
                label={combatNode ? t("adventure.enemySquadPower") : t("adventure.nodeAction")}
                value={combatNode ? `${enemyTotal}` : nodeClaimed ? t("adventure.claimedNode") : t("adventure.noCombat")}
                icon={combatNode ? "power" : "rewards"}
              />
            </div>

            <div className="min-w-0">
              {primaryReward ? (
                <RewardChip key={`${primaryReward.label}-${primaryReward.value}`} compact {...primaryReward} />
              ) : (
                <ScreenBadge tone="neutral">{t("adventure.rewardOutlook")}</ScreenBadge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SceneButton onClick={onOpenBattle} disabled={cta.disabled} className="pointer-events-auto min-w-[10.5rem] px-4 py-2.5">
                {cta.label}
              </SceneButton>
              <button
                type="button"
                onClick={onToggleExpanded}
                className="pointer-events-auto rounded-full border border-white/12 bg-white/[0.045] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/68 transition hover:border-[#f5d498]/28 hover:text-[#f5d498]"
              >
                {expanded ? t("options.close") : "Details"}
              </button>
            </div>
          </div>

          {expanded ? (
            <div className="mt-2 grid gap-2 border-t border-white/10 pt-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_17rem]">
              <div className="rounded-[16px] border border-white/10 bg-black/18 p-2.5">
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/44">{t("adventure.objective")}</div>
                <p className="mt-1 text-[11px] leading-4 text-white/62">{objective}</p>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <MissionFact label={t("adventure.terrain")} value={meta.terrainLabel} icon="fortress" />
                  <MissionFact label={t("adventure.routePace")} value={getRepeatPolicyLabel(definition, nodeClaimed || node.cleared, t)} icon="adventure" />
                </div>
                {definition.nodeRule ? (
                  <div className="mt-2 rounded-[12px] border border-[#f5d498]/12 bg-[#f5c451]/8 px-2.5 py-2 text-[10px] leading-4 text-[#f5d498]/72">
                    <span className="font-black uppercase tracking-[0.12em] text-[#f5d498]">{definition.nodeRule.label}</span> · {definition.nodeRule.description}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[16px] border border-white/10 bg-black/18 p-2.5">
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/44">{t("adventure.rewardOutlook")}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rewardChips.map((chip) => (
                    <RewardChip key={`${chip.label}-${chip.value}`} compact {...chip} />
                  ))}
                </div>
              </div>

              <div className="rounded-[16px] border border-white/10 bg-black/18 p-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/44">
                    {showEnemyFormation ? t("adventure.enemyFormation") : t("adventure.nodeAction")}
                  </div>
                  <ScreenBadge tone={tone}>{showEnemyFormation ? `${frontlineSquad.length} ${t("adventure.units")}` : getRepeatPolicyLabel(definition, nodeClaimed || node.cleared, t)}</ScreenBadge>
                </div>
                {showEnemyFormation ? <div className="mt-2 grid gap-1.5">
                  {frontlinePreset ? (
                    <EnemyCommanderRow
                      portrait={enemyLeaderPortrait}
                      label={t("frontline.enemy")}
                      name={frontlinePresetName(t, frontlinePreset)}
                    />
                  ) : null}
                  {frontlineSquad.map((enemy, index) => {
                    const visual = getFrontlineHeroVisualAsset(enemy.heroId);
                    return (
                      <EnemyRow
                        key={`${enemy.heroId}-${index}`}
                        name={enemy.name}
                        portrait={visual.standeeSrc ?? visual.portraitFallbackSrc ?? undefined}
                        role={enemy.role}
                        stats={`HP ${enemy.maxHp} / ATK ${enemy.atk} / DEF ${enemy.def}`}
                      />
                    );
                  })}
                </div> : (
                  <p className="mt-2 text-[11px] leading-4 text-white/58">
                    {nodeClaimed ? t("adventure.cacheAlreadyClaimed") : t("adventure.cacheOpenHint")}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ScreenPanel>
  );
}

export function AdventureMapInteractionPanel({
  interaction,
  status,
  resources,
  claimedResult,
  persistedClaim,
  expanded = false,
  onToggleExpanded,
  onClaim,
}: {
  interaction: AdventureMapInteractionDefinition;
  status: AdventureMapInteractionStatus;
  resources: { adventureKeys: number };
  claimedResult?: AdventureMapInteractionOpenResult | null;
  persistedClaim?: AdventureMapInteractionClaim;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  onClaim: () => void;
}) {
  const { t } = useI18n();
  const revealedRewards = claimedResult?.rewards ?? persistedClaim?.rewards ?? null;
  const rewardChips = revealedRewards ? buildRewardChipsFromRewards(revealedRewards, false, t) : [];
  const lootTier = claimedResult?.lootTier ?? persistedClaim?.lootTier ?? null;
  const lootTitle = claimedResult?.lootTitle ?? persistedClaim?.lootTitle ?? null;
  const statusLabel = getInteractionStatusLabel(status, t);
  const cta = getInteractionCta(interaction, status, t);

  return (
    <ScreenPanel className="pointer-events-none overflow-hidden border-[#f5d498]/14 bg-[linear-gradient(180deg,rgba(20,15,8,0.76),rgba(6,8,12,0.88))] p-0 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-xl">
      <div className="relative p-2.5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(245,196,81,0.2),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(143,213,255,0.08),transparent_26%)]" />
        <div className="relative grid items-center gap-2 md:grid-cols-[minmax(18rem,1fr)_auto_auto_auto]">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-[#f5d498]/18 bg-[linear-gradient(180deg,rgba(245,196,81,0.18),rgba(11,8,5,0.82))] shadow-[0_10px_24px_rgba(0,0,0,0.32)]">
              <ProgressionIcon name="reward_chest" size="lg" className="h-11 w-11" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <ScreenBadge tone={status === "ready" ? "gold" : status === "claimed" ? "emerald" : "neutral"}>{statusLabel}</ScreenBadge>
                <ScreenBadge tone="sky">{t("adventure.mapCache")}</ScreenBadge>
              </div>
              <h2 className="mt-1 truncate text-[1.05rem] font-black leading-tight text-white md:text-[1.2rem]">{lootTitle ?? interaction.title}</h2>
            </div>
          </div>

          <MissionFact
            label={t("adventure.keyCost")}
            value={`${interaction.keyCost} / ${resources.adventureKeys ?? 0}`}
            icon="adventure_key"
          />

          <div className="min-w-0">
            {revealedRewards && rewardChips[0] ? (
              <RewardChip key={`${rewardChips[0].label}-${rewardChips[0].value}`} compact {...rewardChips[0]} />
            ) : (
              <div className="rounded-[15px] border border-[#f5d498]/16 bg-[#100c06]/54 px-3 py-2">
                <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#f5d498]/58">{t("adventure.rewardOutlook")}</div>
                <div className="mt-1 text-[12px] font-black uppercase tracking-[0.08em] text-[#ffe6a8]">{t("adventure.mysteryCache")}</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SceneButton onClick={onClaim} disabled={cta.disabled} className="pointer-events-auto min-w-[10rem] px-4 py-2.5">
              {cta.label}
            </SceneButton>
            <button
              type="button"
              onClick={onToggleExpanded}
              className="pointer-events-auto rounded-full border border-white/12 bg-white/[0.045] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/68 transition hover:border-[#f5d498]/28 hover:text-[#f5d498]"
            >
              {expanded ? t("options.close") : "Details"}
            </button>
          </div>
        </div>

        {expanded ? (
          <div className="relative mt-2 grid gap-2 border-t border-white/10 pt-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-[16px] border border-white/10 bg-black/18 p-2.5">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/44">{t("adventure.objective")}</div>
              <p className="mt-1 text-[11px] leading-4 text-white/62">{interaction.description}</p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-black/18 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/44">{t("adventure.rewardOutlook")}</div>
                {lootTier ? <ScreenBadge tone={getLootTierTone(lootTier)}>{getLootTierLabel(lootTier, t)}</ScreenBadge> : null}
              </div>
              {revealedRewards ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rewardChips.map((chip) => (
                    <RewardChip key={`${chip.label}-${chip.value}`} compact {...chip} />
                  ))}
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    <ScreenBadge tone="neutral">{t("adventure.lootCommon")}</ScreenBadge>
                    <ScreenBadge tone="sky">{t("adventure.lootRare")}</ScreenBadge>
                    <ScreenBadge tone="ember">{t("adventure.lootEpic")}</ScreenBadge>
                    <ScreenBadge tone="gold">{t("adventure.lootLegendary")}</ScreenBadge>
                  </div>
                  <p className="text-[10px] leading-4 text-white/48">{t("adventure.cacheUnknownHint")}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ScreenPanel>
  );
}

export function AdventureCacheRevealOverlay({
  result,
  onClose,
}: {
  result: AdventureMapInteractionOpenResult;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const rewardChips = buildRewardChipsFromRewards(result.rewards, false, t);
  const tierTone = getLootTierTone(result.lootTier);

  return (
    <div className="pointer-events-auto fixed inset-0 z-[95] grid place-items-center bg-black/58 px-4 backdrop-blur-sm">
      <div className="frontline-motion-reward relative w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-[34px] border border-[#f5d498]/24 bg-[linear-gradient(180deg,rgba(53,35,13,0.94),rgba(7,8,13,0.96))] p-5 text-center shadow-[0_28px_90px_rgba(0,0,0,0.58)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,196,81,0.24),transparent_32%),radial-gradient(circle_at_50%_58%,rgba(255,231,164,0.1),transparent_46%)]" />
        <div className="pointer-events-none absolute inset-x-10 top-3 h-px bg-[linear-gradient(90deg,transparent,rgba(255,232,170,0.58),transparent)]" />
        <div className="relative">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[28px] border border-[#f5d498]/24 bg-[linear-gradient(180deg,rgba(245,196,81,0.18),rgba(9,8,12,0.84))] shadow-[0_16px_34px_rgba(0,0,0,0.42)]">
            <ProgressionIcon name="reward_chest" size="xl" className="h-24 w-24" />
          </div>
          <div className="mt-4 flex justify-center">
            <ScreenBadge tone={tierTone}>{getLootTierLabel(result.lootTier, t)}</ScreenBadge>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">{result.lootTitle}</h2>
          <p className="mx-auto mt-2 max-w-[34rem] text-sm leading-6 text-white/62">{t("adventure.cacheRevealBody")}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {rewardChips.map((chip) => (
              <RewardChip key={`${chip.label}-${chip.value}`} {...chip} compact={false} />
            ))}
          </div>
          <SceneButton onClick={onClose} className="mt-6 px-6 py-3">
            {t("common.continue")}
          </SceneButton>
        </div>
      </div>
    </div>
  );
}

function getMissionStatusLabel(
  node: AdventureNodeState,
  definition: AdventureNodeDefinition,
  progress: AdventureProgressEntry | undefined,
  firstClearAvailable: boolean,
  t: TranslateFn,
) {
  if (node.locked || definition.type === "locked") {
    return node.lvl.unlockAccountLevel ? t("adventure.unlocksAtLevel", { level: node.lvl.unlockAccountLevel }) : t("adventure.routeSealed");
  }
  if (isAdventureClaimed(definition.type, progress) || node.claimed) return t("adventure.claimedNode");
  if (node.pausedHere) return t("adventure.pausedEncounter");
  if (firstClearAvailable) return t("adventure.firstClear");
  if (node.cleared) {
    if (definition.repeatPolicy === "reduced") return t("adventure.replayReduced");
    if (definition.repeatPolicy === "free_no_reward") return t("adventure.practiceNoReward");
    return t("adventure.clearedEncounter");
  }
  if (definition.type === "chest") return t("adventure.rewardCache");
  if (definition.type === "boss") return t("adventure.bossEncounter");
  if (definition.type === "elite") return t("adventure.eliteEncounter");
  return t("adventure.battleEncounter");
}

function getMissionObjective(node: AdventureNodeState, definition: AdventureNodeDefinition, t: TranslateFn) {
  if (node.locked || definition.type === "locked") return t("adventure.objectives.locked");
  if (definition.type === "chest") return t("adventure.cacheOpenHint");
  if (definition.type === "boss") return t("adventure.objectives.boss");
  if (definition.type === "elite") return t("adventure.objectives.elite");
  if (definition.type === "merchant") return "Future merchant node prepared for campaign shops.";
  if (definition.type === "shrine") return "Future shrine node prepared for blessings.";
  if (definition.type === "event" || definition.type === "secret") return "Future event node prepared for non-combat route choices.";
  return t("adventure.objectives.battle");
}

function getMissionCta(
  node: AdventureNodeState,
  definition: AdventureNodeDefinition,
  progress: AdventureProgressEntry | undefined,
  t: TranslateFn,
) {
  if (node.locked || definition.type === "locked") return { label: t("adventure.lockedCta"), disabled: true };
  if (isAdventureClaimed(definition.type, progress) || node.claimed) return { label: t("adventure.claimedNode"), disabled: true };
  if (definition.type === "chest") return { label: t("adventure.openChest"), disabled: false };
  if (definition.type === "elite") return { label: t("adventure.challengeElite"), disabled: false };
  if (definition.type === "boss") return { label: t("adventure.faceBoss"), disabled: false };
  if (!isAdventureCombatNode(definition.type)) return { label: t("adventure.notReady"), disabled: true };
  return { label: node.pausedHere ? t("adventure.resumeMission") : t("adventure.startAdventure"), disabled: false };
}

function getInteractionStatusLabel(status: AdventureMapInteractionStatus, t: TranslateFn) {
  if (status === "claimed") return t("adventure.claimedNode");
  if (status === "locked") return t("adventure.routeSealed");
  if (status === "needs_key") return t("adventure.needsKey");
  return t("adventure.cacheReady");
}

function getInteractionCta(
  interaction: AdventureMapInteractionDefinition,
  status: AdventureMapInteractionStatus,
  t: TranslateFn,
) {
  if (status === "claimed") return { label: t("adventure.claimedNode"), disabled: true };
  if (status === "locked") return { label: t("adventure.lockedCta"), disabled: true };
  if (status === "needs_key") return { label: t("adventure.needsKey"), disabled: true };
  return { label: interaction.kind === "keyChest" ? t("adventure.openMapCache") : t("adventure.openChest"), disabled: false };
}

function getLootTierLabel(tier: AdventureMapInteractionLootTier, t: TranslateFn) {
  if (tier === "legendary") return t("adventure.lootLegendary").replace(" 5%", "");
  if (tier === "epic") return t("adventure.lootEpic").replace(" 15%", "");
  if (tier === "rare") return t("adventure.lootRare").replace(" 30%", "");
  return t("adventure.lootCommon").replace(" 50%", "");
}

function getLootTierTone(tier: AdventureMapInteractionLootTier): "neutral" | "gold" | "emerald" | "sky" | "ember" {
  if (tier === "legendary") return "gold";
  if (tier === "epic") return "ember";
  if (tier === "rare") return "sky";
  return "neutral";
}

function getNodeTypeLabel(type: AdventureNodeDefinition["type"]) {
  const labels: Record<AdventureNodeDefinition["type"], string> = {
    battle: "Battle",
    elite: "Elite",
    boss: "Boss",
    chest: "Chest",
    shrine: "Shrine",
    merchant: "Merchant",
    event: "Event",
    secret: "Secret",
    danger: "Danger",
    locked: "Locked",
  };
  return labels[type];
}

function getRepeatPolicyLabel(definition: AdventureNodeDefinition, clearedOrClaimed: boolean, t?: TranslateFn) {
  const tr = t ?? ((key: string) => key);
  if (definition.type === "chest") return clearedOrClaimed ? tr("adventure.claimedNode") : tr("adventure.claimOnce");
  if (definition.repeatPolicy === "reduced") return clearedOrClaimed ? tr("adventure.replayReduced") : tr("adventure.firstClear");
  if (definition.repeatPolicy === "free_no_reward") return clearedOrClaimed ? tr("adventure.practiceOnly") : tr("adventure.firstClear");
  if (definition.repeatPolicy === "ticket_cost") return "Ticket cost";
  return clearedOrClaimed ? tr("adventure.completed") : tr("adventure.firstClear");
}

function MissionFact({ label, value, icon }: { label: string; value: string; icon: "adventure" | "battle" | "fortress" | "power" | "rewards" | "adventure_key" }) {
  return (
    <div className="min-w-0 rounded-[15px] border border-white/10 bg-white/[0.035] px-2.5 py-1.5">
      <div className="flex items-center gap-1.5">
        {icon === "power" ? (
          <CombatIcon name="leader_power" size="sm" className="h-7 w-7 rounded-[10px]" />
        ) : icon === "adventure_key" ? (
          <ResourceIcon kind="adventure_key" size="small" className="h-7 w-7" />
        ) : (
          <GameIcon kind={icon} tone="steel" size="sm" className="h-7 w-7 rounded-[10px]" />
        )}
        <div className="min-w-0">
          <div className="text-[8px] font-black uppercase tracking-[0.12em] text-white/42">{label}</div>
          <div className="mt-0.5 truncate text-[11px] font-black text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function MissionNodeAssetBadge({
  nodeType,
  locked,
  claimed,
}: {
  nodeType: AdventureNodeType;
  locked: boolean;
  claimed: boolean;
}) {
  const assetId = getMissionNodeAssetId(nodeType, locked, claimed);
  const asset = getAdventureNodeAsset(assetId);

  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.36),rgba(5,7,12,0.72))] shadow-[0_10px_22px_rgba(0,0,0,0.28)]">
      <span className="pointer-events-none absolute inset-[12%] rounded-full bg-black/18 blur-sm" />
      {asset ? (
        <img
          src={asset.src}
          alt=""
          aria-hidden
          loading="lazy"
          className={cn(
            "relative z-[1] h-[118%] w-[118%] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.44)]",
            locked ? "opacity-70 grayscale-[0.25]" : "",
            claimed ? "opacity-86" : "",
            nodeType === "boss" ? "scale-[1.1]" : "",
          )}
        />
      ) : (
        <GameIcon kind={locked ? "shield" : nodeType === "boss" || nodeType === "elite" || nodeType === "danger" ? "battle" : claimed || nodeType === "chest" ? "rewards" : "adventure"} tone="steel" size="sm" className="relative z-[1] h-8 w-8 rounded-[10px] bg-transparent" />
      )}
    </span>
  );
}

function getMissionNodeAssetId(nodeType: AdventureNodeType, locked: boolean, claimed: boolean): AdventureNodeAssetId {
  if (locked) return "locked";
  if (claimed) return "cleared";
  if (nodeType === "locked") return "locked";
  return nodeType;
}

function EnemyCommanderRow({ name, portrait, label }: { name: string; portrait?: string | null; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] border border-[#f5d498]/14 bg-[#f5c451]/8 px-2 py-1.5">
      {portrait ? (
        <img
          src={portrait}
          alt=""
          className="h-10 w-9 shrink-0 rounded-[12px] border border-[#f5d498]/18 bg-black/24 object-cover shadow-[0_8px_18px_rgba(0,0,0,0.24)]"
          loading="lazy"
          aria-hidden
        />
      ) : null}
      <div className="min-w-0">
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#f5d498]/62">{label}</div>
        <div className="truncate text-[11px] font-black text-white">{name}</div>
      </div>
    </div>
  );
}

function EnemyRow({ name, portrait, role, stats }: { name: string; portrait?: string; role: string; stats: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-black/16 px-2 py-1.5">
      <div className="grid h-10 w-9 shrink-0 place-items-end overflow-hidden rounded-[11px] border border-rose-200/14 bg-black/24">
        {portrait ? (
          <img src={portrait} alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-full w-full object-contain object-bottom drop-shadow-[0_9px_12px_rgba(0,0,0,0.44)]" />
        ) : (
          <GameIcon kind="battle" tone="ember" size="sm" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] font-black text-white">{name}</div>
        <div className="mt-0.5 truncate text-[10px] uppercase tracking-[0.1em] text-white/42">{role}</div>
      </div>
      <div className="hidden text-[9px] font-black uppercase tracking-[0.08em] text-rose-100/58 sm:block">{stats}</div>
    </div>
  );
}

function RewardChip({
  icon,
  label,
  value,
  tone,
  compact,
}: {
  icon: "gold" | "gem" | "dust" | "rewards" | "deck" | "adventure_key";
  label: string;
  value: string;
  tone: "gold" | "sky" | "violet" | "emerald";
  compact?: boolean;
}) {
  return (
    <GameRewardToken
      icon={icon}
      label={label}
      value={value}
      tone={tone}
      size={compact ? "sm" : "md"}
      featured={icon === "gold" || icon === "gem" || icon === "dust"}
    />
  );
}

function buildRoutes(nodes: AdventureVisualNode[], routeLayouts: AdventureMapRouteLayout[] = []): AdventureVisualRoute[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  if (routeLayouts.length) {
    return routeLayouts
      .map((route) => {
        const from = byId.get(route.from);
        const to = byId.get(route.to);
        if (!from || !to) return null;
        return { ...route, from, to };
      })
      .filter((route): route is AdventureVisualRoute => Boolean(route));
  }
  return nodes.flatMap((from) =>
    from.connectsTo
      .map((id) => byId.get(id))
      .filter((to): to is AdventureVisualNode => Boolean(to))
      .map((to) => ({ id: `${from.id}-${to.id}`, from, to })),
  );
}

function curvedRoute(route: AdventureVisualRoute) {
  const { from, to } = route;
  const controls = getRouteControls(route);
  return `M ${from.x} ${from.y} C ${controls.control1.x} ${controls.control1.y}, ${controls.control2.x} ${controls.control2.y}, ${to.x} ${to.y}`;
}

function getRouteControls(route: AdventureVisualRoute) {
  const { from, to } = route;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return {
    control1: route.control1 ?? { x: Math.round(from.x + dx * 0.38), y: Math.round(from.y + dy * 0.12 - 28) },
    control2: route.control2 ?? { x: Math.round(from.x + dx * 0.62), y: Math.round(from.y + dy * 0.88 + 28) },
  };
}

function getEditableRoutes(layout: AdventureMapChapterLayout, nodes: AdventureVisualNode[]): AdventureMapRouteLayout[] {
  if (layout.routes?.length) return layout.routes;
  return buildRoutes(nodes).map((route) => {
    const controls = getRouteControls(route);
    return {
      id: route.id,
      from: route.from.id,
      to: route.to.id,
      state: route.state,
      control1: controls.control1,
      control2: controls.control2,
    };
  });
}

function nodeStyle(x: number, y: number): CSSProperties {
  return {
    left: `${(x / DESIGN_WIDTH) * 100}%`,
    top: `${(y / DESIGN_HEIGHT) * 100}%`,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function editorButtonClass(active: boolean) {
  return cn(
    "rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] transition",
    active ? "border-sky-200/36 bg-sky-300/18 text-sky-100" : "border-white/10 bg-white/[0.06] text-white/64 hover:bg-white/10",
  );
}

function AdventureMapInteractionStyles() {
  return (
    <style jsx global>{`
      @keyframes adventureKeyChestGlow {
        0%,
        100% {
          filter: brightness(1) saturate(1);
        }
        48% {
          filter: brightness(1.14) saturate(1.16);
        }
      }

      @keyframes adventureGoldShineLoop {
        from {
          transform: translate3d(0, 0, 0);
        }
        to {
          transform: translate3d(-83.333333%, 0, 0);
        }
      }
    `}</style>
  );
}

function getSelectedExport(layout: AdventureMapChapterLayout, selected: EditorSelection | null) {
  if (!selected) return { selected: null };
  if (selected.kind === "node") return layout.nodes.find((node) => node.id === selected.id) ?? { id: selected.id };
  if (selected.kind === "prop") return layout.props?.find((prop) => prop.id === selected.id) ?? { id: selected.id };
  if (selected.kind === "party") return layout.partyMarker ?? { id: "party" };
  if (selected.kind === "routeControl") return { route: layout.routes?.find((route) => route.id === selected.id), handle: selected.handle };
  return { selected };
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

function getPropWidth(prop: AdventureMapPropLayout) {
  return prop.width ?? prop.size ?? getDefaultPropDimensions(prop.type).width;
}

function getPropHeight(prop: AdventureMapPropLayout) {
  return prop.height ?? prop.size ?? getDefaultPropDimensions(prop.type).height;
}

function getPropVisualOpacity(prop: AdventureMapPropLayout) {
  const base = prop.opacity ?? 1;
  if (prop.type === "hidden_glow" || prop.type === "hidden_glow_alt") return Math.min(base, 0.42);
  if (prop.type === "campfire" || prop.type === "road_lantern") return Math.min(base, 0.82);
  if (prop.type === "merchant_cart") return Math.min(base, 0.78);
  return base;
}

function getDefaultPropDimensions(type: AdventureMapPropType) {
  if (type === "key_chest") return { width: 118, height: 84 };
  if (type === "clouds_dark_layer") return { width: 220, height: 92 };
  if (type === "campfire") return { width: 54, height: 54 };
  if (type === "small_camp") return { width: 82, height: 68 };
  if (type === "road_lantern") return { width: 38, height: 56 };
  if (type === "merchant_cart") return { width: 92, height: 74 };
  if (type === "ruin_marker") return { width: 70, height: 72 };
  if (type === "hidden_glow" || type === "hidden_glow_alt") return { width: 52, height: 52 };
  return { width: 72, height: 72 };
}

function getDefaultPropEffect(type: AdventureMapPropType): AdventureMapPropLayout["effect"] {
  if (type === "campfire") {
    return {
      type: "flame_loop",
      xPercent: 50,
      yPercent: 35,
      widthPercent: 46,
      heightPercent: 46,
      opacity: 0.95,
      durationMs: 720,
      enabled: true,
    };
  }
  if (type === "road_lantern" || type === "small_camp" || type === "merchant_cart") {
    return {
      type: "lantern_warm_loop",
      xPercent: 52,
      yPercent: 38,
      widthPercent: 34,
      heightPercent: 34,
      opacity: 0.74,
      durationMs: 980,
      enabled: true,
    };
  }
  if (type === "hidden_glow" || type === "hidden_glow_alt") {
    return {
      type: "purple_flame_loop",
      xPercent: 50,
      yPercent: 50,
      widthPercent: 42,
      heightPercent: 42,
      opacity: 0.5,
      durationMs: 820,
      enabled: false,
    };
  }
  return undefined;
}

function getEffectDuration(effect: HomeEffectId) {
  if (effect === "clouds_dark_layer") return 90000;
  if (effect === "crow_fly_loop") return 720;
  if (effect === "lantern_warm_loop") return 980;
  if (effect === "candle_loop") return 760;
  return 720;
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

function getNodeRole(node: AdventureNodeState, index: number, totalNodes: number) {
  if (node.pausedHere) return "resume";
  if (/boss/i.test(node.lvl.name) || index === totalNodes) return "boss";
  const squad = getFrontlineAdventureSquad(node.lvl);
  if ((node.lvl.obstacles?.length ?? 0) >= 2 || squad.some((enemy) => enemy.tier >= 3)) return "elite";
  return "battle";
}

function buildRewardChips(level: AdventureLevel, firstClearAvailable: boolean, t: TranslateFn) {
  const chips: { icon: "gold" | "gem" | "dust" | "rewards" | "deck" | "adventure_key"; label: string; value: string; tone: "gold" | "sky" | "violet" | "emerald" }[] = [];
  if (level.rewards.gold) chips.push({ icon: "gold", label: t("adventure.reward.gold"), value: `${level.rewards.gold}`, tone: "gold" });
  if (level.rewards.dust) chips.push({ icon: "dust", label: t("adventure.reward.dust"), value: `${level.rewards.dust}`, tone: "violet" });
  if (level.rewards.gems) chips.push({ icon: "gem", label: t("adventure.reward.gems"), value: `${level.rewards.gems}`, tone: "sky" });
  if (firstClearAvailable && level.firstClearRewards) chips.push({ icon: "rewards", label: t("adventure.reward.firstClear"), value: t("adventure.reward.bonusCache"), tone: "emerald" });
  for (const unlock of firstClearAvailable ? level.firstClearRewards?.frontlineCards ?? [] : []) {
    const card = FRONTLINE_CARD_BY_ID[unlock.cardId];
    if (!card) continue;
    chips.push({ icon: "deck", label: t("frontline.cardUnlocks"), value: frontlineCardName(t, card), tone: "sky" });
  }
  return chips;
}

function buildRewardChipsFromRewards(rewards: Rewards, firstClearAvailable: boolean, t: TranslateFn) {
  const chips: { icon: "gold" | "gem" | "dust" | "rewards" | "deck" | "adventure_key"; label: string; value: string; tone: "gold" | "sky" | "violet" | "emerald" }[] = [];
  if (rewards.gold) chips.push({ icon: "gold", label: t("adventure.reward.gold"), value: `${rewards.gold}`, tone: "gold" });
  if (rewards.dust) chips.push({ icon: "dust", label: t("adventure.reward.dust"), value: `${rewards.dust}`, tone: "violet" });
  if (rewards.gems) chips.push({ icon: "gem", label: t("adventure.reward.gems"), value: `${rewards.gems}`, tone: "sky" });
  if (rewards.accountXp) chips.push({ icon: "rewards", label: "Account XP", value: `${rewards.accountXp}`, tone: "emerald" });
  if (rewards.xp) chips.push({ icon: "rewards", label: "Hero XP", value: `${rewards.xp}`, tone: "emerald" });
  if (rewards.adventureKeys) chips.push({ icon: "adventure_key", label: t("resources.adventureKeys"), value: `${rewards.adventureKeys}`, tone: "gold" });
  if (firstClearAvailable && (rewards.frontlineCards?.length || rewards.shards?.length)) {
    chips.push({ icon: "rewards", label: t("adventure.reward.firstClear"), value: t("adventure.reward.bonusCache"), tone: "emerald" });
  }
  for (const unlock of rewards.frontlineCards ?? []) {
    const card = FRONTLINE_CARD_BY_ID[unlock.cardId];
    if (!card) continue;
    chips.push({ icon: "deck", label: t("frontline.cardUnlocks"), value: frontlineCardName(t, card), tone: "sky" });
  }
  return chips;
}
