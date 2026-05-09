"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import {
  ADVENTURE_MAP_DESIGN,
  type AdventureMapChapterLayout,
  type AdventureMapPartyMarkerLayout,
  type AdventureMapPropLayout,
  type AdventureMapPropType,
  type AdventureMapRouteLayout,
  type AdventureNodeLayout,
} from "./adventureMapLayout";
import type { AdventureMapEditorSelection, AdventureNodeState } from "./AdventureCampaignTypes";
import { buildAdventureVisualNodes } from "./AdventureCampaignVisualNodes";
import {
  buildRoutes,
  clamp,
  getEditableRoutes,
  getPropHeight,
  getPropWidth,
} from "./AdventureMapGeometry";
import { createEditorNode, createEditorProp, createEditorRouteFromSelection, duplicateEditorNode, duplicateEditorProp, removeEditorSelectionFromLayout } from "./AdventureMapEditorFactories";
import { isCompletedPartyNode } from "./AdventureMapStateHelpers";

const DESIGN_WIDTH = ADVENTURE_MAP_DESIGN.width;
const DESIGN_HEIGHT = ADVENTURE_MAP_DESIGN.height;

type EditorSelection = AdventureMapEditorSelection;

export function useAdventureCampaignMapState({
  nodes,
  mapLayout,
  chapter,
  selectedId,
}: {
  nodes: AdventureNodeState[];
  mapLayout: AdventureMapChapterLayout;
  chapter: number;
  selectedId: string;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [qaEnabled, setQaEnabled] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [editorLayout, setEditorLayout] = useState(mapLayout);
  const [selectedEditor, setSelectedEditor] = useState<EditorSelection | null>(null);
  const [dragging, setDragging] = useState<EditorSelection | null>(null);
  const [showRouteHandles, setShowRouteHandles] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
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

  const visualNodes = useMemo(() => buildAdventureVisualNodes({ nodes, activeLayout, qaEnabled }), [activeLayout, nodes, qaEnabled]);

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
    const next = createEditorProp(type, cursor);
    setEditorLayout((current) => ({ ...current, props: [...(current.props ?? []), next] }));
    setSelectedEditor({ kind: "prop", id: next.id });
    setCopyStatus(`${next.id} created`);
  }

  function addNode() {
    const next = createEditorNode(cursor);
    setEditorLayout((current) => ({ ...current, nodes: [...current.nodes, next] }));
    setSelectedEditor({ kind: "node", id: next.id ?? "" });
  }

  function duplicateSelection(selection: EditorSelection | null) {
    if (!selection) return;
    if (selection.kind === "node") {
      const source = editorLayout.nodes.find((entry, index) => (entry.id ?? nodes[index]?.lvl.id) === selection.id);
      if (!source) return;
      const next = duplicateEditorNode(source, selection.id);
      setEditorLayout((current) => ({
        ...current,
        nodes: [...current.nodes, next],
      }));
      setSelectedEditor({ kind: "node", id: next.id ?? "" });
      return;
    }
    if (selection.kind === "prop") {
      const source = editorLayout.props?.find((entry) => entry.id === selection.id);
      if (!source) return;
      const next = duplicateEditorProp(source, selection.id);
      setEditorLayout((current) => ({
        ...current,
        props: [...(current.props ?? []), next],
      }));
      setSelectedEditor({ kind: "prop", id: next.id });
    }
  }

  function removeSelection(selection: EditorSelection | null) {
    if (!selection) return;
    setEditorLayout((current) => removeEditorSelectionFromLayout(current, selection, nodes.map((node) => node.lvl.id), visualNodes));
    setSelectedEditor(null);
  }

  function addRouteFromSelection(selection: EditorSelection | null) {
    const route = createEditorRouteFromSelection(selection, visualNodes);
    if (!route) return;
    setEditorLayout((current) => ({ ...current, routes: [...getEditableRoutes(current, visualNodes), route] }));
    setSelectedEditor({ kind: "routeControl", id: route.id, handle: "control1" });
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

  return {
    activeLayout,
    addNode,
    addProp,
    addRouteFromSelection,
    copyStatus,
    cursor,
    editorLayout,
    handleKeyDown,
    handlePointerMove,
    partyNode,
    qaEnabled,
    removeSelection,
    resetEditorLayout,
    routes,
    saveEditorDraft,
    saveEditorToCode,
    selectedEditor,
    setCopyStatus,
    setDragging,
    setSelectedEditor,
    setShowRouteHandles,
    showRouteHandles,
    stageRef,
    updateNode,
    updateParty,
    updateProp,
    updateRoute,
    visualNodes,
    duplicateSelection,
  };
}
