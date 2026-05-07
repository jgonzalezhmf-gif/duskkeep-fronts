"use client";

import { HOME_EFFECT_IDS, type HomeEffectId } from "@/lib/homeEffectAssets";
import {
  ADVENTURE_MAP_INTERACTION_KINDS,
  ADVENTURE_MAP_NODE_STATUSES,
  ADVENTURE_MAP_NODE_TYPES,
  ADVENTURE_MAP_PROP_TYPES,
  type AdventureMapNodeStatus,
  type AdventureMapNodeType,
  type AdventureMapPartyMarkerLayout,
  type AdventureMapPropLayout,
  type AdventureMapPropType,
  type AdventureMapRouteLayout,
  type AdventureMapRouteState,
  type AdventureNodeLayout,
} from "./adventureMapLayout";
import type { AdventureVisualNode } from "./AdventureCampaignTypes";
import { getDefaultPropEffect, getEffectDuration, getPropHeight, getPropWidth } from "./AdventureMapGeometry";
import { NumberField, Readout, SelectField, TextField, parseNodeIdList } from "./AdventureMapEditorFields";

export function NodeEditorFields({
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

export function PropEditorFields({ prop, onUpdate }: { prop: AdventureMapPropLayout; onUpdate: (patch: Partial<AdventureMapPropLayout>) => void }) {
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

export function PartyEditorFields({ party, onUpdate }: { party?: AdventureMapPartyMarkerLayout; onUpdate: (patch: Partial<AdventureMapPartyMarkerLayout>) => void }) {
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

export function RouteEditorFields({
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
