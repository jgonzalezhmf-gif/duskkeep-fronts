"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";
import { getScreenBackgroundAsset } from "@/lib/screenBackgroundAssets";
import {
  ADVENTURE_MAP_DESIGN,
  type AdventureMapChapterLayout,
  type AdventureMapNodeStatus,
  type AdventureMapNodeType,
  type AdventureNodeLayout,
} from "@/features/adventure/mapLayout";
import { type AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";
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
} from "./AdventureMapElements";
import { getRouteControls } from "@/features/adventure/mapGeometry";
import { buildAdventureCanvasSceneModel } from "@/features/canvas-runtime/adventureAdapter";
import { AdventureCanvasMap } from "@/components/game/adventure/canvas/AdventureCanvasMap";
import { useAdventureCampaignMapState } from "./useAdventureCampaignMapState";
import type {
  AdventureCampaignMeta,
  AdventureNodeState,
} from "@/features/adventure/campaignTypes";

const DESIGN_WIDTH = ADVENTURE_MAP_DESIGN.width;
const DESIGN_HEIGHT = ADVENTURE_MAP_DESIGN.height;

const AdventureMapEditorOverlay = dynamic(
  () => import("./AdventureMapEditorOverlay").then((module) => module.AdventureMapEditorOverlay),
  { ssr: false },
);

export type {
  AdventureMapChapterLayout,
  AdventureMapNodeStatus,
  AdventureMapNodeType,
  AdventureNodeLayout,
};

export type { AdventureCampaignMeta, AdventureNodeState };

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
  canvasRuntimeEnabled = false,
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
  canvasRuntimeEnabled?: boolean;
  showOverlayHeader?: boolean;
}) {
  const { t } = useI18n();
  const background = getScreenBackgroundAsset("adventure");
  const {
    activeLayout,
    addNode,
    addProp,
    addRouteFromSelection,
    copyStatus,
    cursor,
    duplicateSelection,
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
  } = useAdventureCampaignMapState({ nodes, mapLayout, chapter, selectedId });
  const shouldMountCanvasRuntime = canvasRuntimeEnabled && !qaEnabled;
  const canvasSceneModel = shouldMountCanvasRuntime
    ? buildAdventureCanvasSceneModel({
        meta,
        nodes,
        mapLayout,
        chapter,
        selectedId,
        selectedInteractionId,
        interactionStates,
        qaEnabled,
      })
    : null;
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
      data-adventure-map-renderer={shouldMountCanvasRuntime ? "canvas" : "dom"}
      data-design-width={DESIGN_WIDTH}
      data-design-height={DESIGN_HEIGHT}
    >
      <HomeEffectSpriteStyles />
      <AdventureMapInteractionStyles />
      <div
        ref={stageRef}
        className={cn(
          "absolute",
          fullScreen
            ? "left-1/2 top-[45%] h-[min(100dvh,84.375vw)] w-[min(150vw,177.7778dvh)] -translate-x-1/2 -translate-y-1/2 md:top-1/2 md:h-[min(100dvh,56.25vw)] md:w-[min(100vw,177.7778dvh)]"
            : "inset-0",
        )}
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

        {!canvasSceneModel ? (
          <>
            <svg
              className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
              viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
              preserveAspectRatio="none"
              data-adventure-dom-route-layer
            >
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
          </>
        ) : null}

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
            visualMode={canvasSceneModel ? "canvasOverlay" : "dom"}
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
            visualMode={canvasSceneModel ? "canvasOverlay" : "dom"}
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
        {canvasSceneModel ? (
          <AdventureCanvasMap
            sceneModel={canvasSceneModel}
            className="pointer-events-none absolute inset-0 z-[4]"
          />
        ) : null}
      </div>
    </div>
  );
}
