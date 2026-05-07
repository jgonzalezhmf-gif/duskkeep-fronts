"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/cn";
import { HOME_EFFECT_IDS, type HomeEffectId } from "@/lib/homeEffectAssets";
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
import type { AdventureMapEditorSelection, AdventureVisualNode, AdventureVisualRoute } from "./AdventureCampaignTypes";
import {
  clamp,
  getDefaultPropEffect,
  getEditableRoutes,
  getEffectDuration,
  getPropHeight,
  getPropWidth,
  nodeStyle,
} from "./AdventureMapGeometry";

const DESIGN_WIDTH = ADVENTURE_MAP_DESIGN.width;
const DESIGN_HEIGHT = ADVENTURE_MAP_DESIGN.height;
type EditorSelection = AdventureMapEditorSelection;

function editorButtonClass(active: boolean) {
  return cn(
    "rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] transition",
    active ? "border-sky-200/36 bg-sky-300/18 text-sky-100" : "border-white/10 bg-white/[0.06] text-white/64 hover:bg-white/10",
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

export function AdventureMapEditorOverlay({
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
