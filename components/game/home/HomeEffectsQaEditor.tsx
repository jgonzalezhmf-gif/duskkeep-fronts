"use client";

import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/cn";

import { getHomeEffectAsset, HOME_EFFECT_IDS, type HomeEffectId } from "@/lib/homeEffectAssets";

import { Field, OpacityField, SelectField, ToggleField } from "./HomeEffectsQaFields";
import type { HomeEffectPatch } from "./HomeEffectsQaTypes";
import type { HomeEffectAnchorId, HomeLandmarkEffectConfig } from "./homeEffectLayout";

const HOME_EFFECT_ANCHORS: HomeEffectAnchorId[] = ["world", "fortress", "adventure", "arena", "market", "events", "deck"];
const HOME_EFFECT_TYPES: HomeEffectId[] = [...HOME_EFFECT_IDS];

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function HomeEffectsQaPanel({
  effects,
  selectedId,
  onSelect,
  onChange,
  onSave,
  onSaveToCode,
  onCreate,
  onDuplicate,
  onDuplicateToWorld,
  onRemove,
  onImport,
  onReset,
}: {
  effects: HomeLandmarkEffectConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: HomeEffectPatch) => void;
  onSave: () => void;
  onSaveToCode: () => Promise<string>;
  onCreate: (effect: HomeEffectId) => void;
  onDuplicate: (id: string) => void;
  onDuplicateToWorld: (id: string) => void;
  onRemove: (id: string) => void;
  onImport: (value: string) => void;
  onReset: () => void;
}) {
  const selected = useMemo(() => effects.find((effect) => effect.id === selectedId) ?? effects[0] ?? null, [effects, selectedId]);
  const selectedAsset = selected ? getHomeEffectAsset(selected.effect) : null;
  const exportValue = useMemo(() => JSON.stringify(effects, null, 2), [effects]);
  const selectedValue = useMemo(() => (selected ? JSON.stringify(selected, null, 2) : ""), [selected]);
  const [jsonDraft, setJsonDraft] = useState(exportValue);
  const [panelPosition, setPanelPosition] = useState<{ left: number; top: number } | null>(null);
  const [status, setStatus] = useState("Autosaved locally");
  const [newEffect, setNewEffect] = useState<HomeEffectId>("flame_loop");

  useEffect(() => {
    setJsonDraft(exportValue);
  }, [exportValue]);

  const copyText = (value: string, message: string) => {
    void navigator.clipboard?.writeText(value);
    setStatus(message);
  };

  const saveDraft = () => {
    onSave();
    setStatus(`Saved locally ${new Date().toLocaleTimeString()}`);
  };

  const saveToCode = async () => {
    try {
      const message = await onSaveToCode();
      setStatus(message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save to code");
    }
  };

  const importDraft = () => {
    try {
      onImport(jsonDraft);
      setStatus("Imported JSON");
    } catch {
      setStatus("Invalid JSON");
    }
  };

  const startPanelDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const panel = event.currentTarget.closest("[data-home-effects-qa-panel]");
    if (!(panel instanceof HTMLElement)) return;

    event.preventDefault();
    const rect = panel.getBoundingClientRect();
    const grabX = event.clientX - rect.left;
    const grabY = event.clientY - rect.top;

    const move = (moveEvent: PointerEvent) => {
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
  };

  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;

      const moveStep = event.shiftKey ? 2 : 0.5;
      const sizeStep = event.shiftKey ? 2 : 0.5;
      const rotationStep = event.shiftKey ? 5 : 1;
      const yawStep = event.shiftKey ? 15 : 5;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onChange(selected.id, { xPercent: roundPercent(clamp(selected.xPercent - moveStep, 0, 100)) });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onChange(selected.id, { xPercent: roundPercent(clamp(selected.xPercent + moveStep, 0, 100)) });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        onChange(selected.id, { yPercent: roundPercent(clamp(selected.yPercent - moveStep, 0, 100)) });
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        onChange(selected.id, { yPercent: roundPercent(clamp(selected.yPercent + moveStep, 0, 100)) });
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        onChange(selected.id, {
          widthPercent: roundPercent(clamp(selected.widthPercent + sizeStep, 0.5, 100)),
          heightPercent: roundPercent(clamp(selected.heightPercent + sizeStep, 0.5, 100)),
        });
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        onChange(selected.id, {
          widthPercent: roundPercent(clamp(selected.widthPercent - sizeStep, 0.5, 100)),
          heightPercent: roundPercent(clamp(selected.heightPercent - sizeStep, 0.5, 100)),
        });
      } else if (event.key === "[" || event.key === "{") {
        event.preventDefault();
        onChange(selected.id, { rotationDeg: roundPercent((selected.rotationDeg ?? 0) - rotationStep) });
      } else if (event.key === "]" || event.key === "}") {
        event.preventDefault();
        onChange(selected.id, { rotationDeg: roundPercent((selected.rotationDeg ?? 0) + rotationStep) });
      } else if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        onChange(selected.id, { yawDeg: roundPercent((selected.yawDeg ?? 0) + yawStep) });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onChange, selected]);

  return (
    <aside
      data-home-effects-qa-panel="1"
      className="pointer-events-auto fixed bottom-4 right-4 z-[80] flex max-h-[calc(100vh-2rem)] w-[25rem] max-w-[calc(100vw-2rem)] flex-col gap-2 overflow-hidden rounded-2xl border border-cyan-300/35 bg-slate-950/92 p-3 text-cyan-50 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      style={
        panelPosition
          ? {
              left: panelPosition.left,
              top: panelPosition.top,
              right: "auto",
              bottom: "auto",
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 cursor-move select-none" onPointerDown={startPanelDrag} title="Drag panel">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200/70">Home Effects QA</div>
          <div className="text-sm font-black text-white">?qa=effects</div>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-200/50">Drag this header to move panel</div>
        </div>
        <div className="grid shrink-0 gap-1">
          <button
            type="button"
            data-home-qa-action="save"
            className="rounded-lg border border-emerald-300/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100 hover:bg-emerald-300/10"
            onClick={saveDraft}
          >
            Save draft
          </button>
          <button
            type="button"
            data-home-qa-action="save-code"
            className="rounded-lg border border-yellow-300/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-yellow-100 hover:bg-yellow-300/10"
            onClick={saveToCode}
          >
            Save to code
          </button>
          <button
            type="button"
            data-home-qa-action="copy-all"
            className="rounded-lg border border-cyan-300/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-300/10"
            onClick={() => copyText(exportValue, "Copied full JSON")}
          >
            Copy all
          </button>
        </div>
      </div>

      <select
        className="rounded-lg border border-cyan-300/25 bg-black/45 px-2 py-1.5 text-xs font-bold text-white"
        value={selected?.id ?? ""}
        onChange={(event) => onSelect(event.target.value)}
      >
        {effects.map((effect) => (
          <option key={effect.id} value={effect.id}>
            {effect.id}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <SelectField label="new prop effect" value={newEffect} options={HOME_EFFECT_TYPES} onChange={(value) => setNewEffect(value as HomeEffectId)} />
        <button
          type="button"
          data-home-qa-action="new-prop"
          className="rounded-lg border border-emerald-300/30 px-2 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100 hover:bg-emerald-300/10"
          onClick={() => {
            onCreate(newEffect);
            setStatus(`Created ${newEffect}`);
          }}
        >
          New prop
        </button>
      </div>

      {selected ? (
        <div className="rounded-lg border border-cyan-300/20 bg-black/35 p-2 text-[10px] leading-relaxed text-cyan-50/78">
          <span className="font-black uppercase tracking-[0.14em] text-cyan-100">Asset:</span>{" "}
          {selected.effect} | {selectedAsset?.renderMode ?? "missing"} | frames {selectedAsset?.frameCount ?? selected.frameCount} | anchor {selectedAsset?.anchor.name ?? "unknown"}
          {" "} | localAnimation {selectedAsset?.renderMode === "staticWithLocalAnimation" ? "true" : "false"}
          {selectedAsset?.pipelineNote ? <span className="mt-1 block text-cyan-100/80">{selectedAsset.pipelineNote}</span> : null}
          {selectedAsset?.disabledReason ? <span className="mt-1 block text-rose-100/85">{selectedAsset.disabledReason}</span> : null}
        </div>
      ) : null}

      {selected ? (
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <Field label="id" value={selected.id} readOnly />
          <SelectField label="anchor" value={selected.landmark} options={HOME_EFFECT_ANCHORS} onChange={(value) => onChange(selected.id, { landmark: value as HomeEffectAnchorId })} />
          <SelectField label="effect" value={selected.effect} options={HOME_EFFECT_TYPES} onChange={(value) => onChange(selected.id, { effect: value as HomeEffectId })} />
          <OpacityField value={selected.opacity} onChange={(value) => onChange(selected.id, { opacity: value })} />
          <Field label="xPercent" value={selected.xPercent} onChange={(value) => onChange(selected.id, { xPercent: roundPercent(clamp(Number(value) || 0, 0, 100)) })} />
          <Field label="yPercent" value={selected.yPercent} onChange={(value) => onChange(selected.id, { yPercent: roundPercent(clamp(Number(value) || 0, 0, 100)) })} />
          <Field label="widthPercent" value={selected.widthPercent} onChange={(value) => onChange(selected.id, { widthPercent: roundPercent(clamp(Number(value) || 0.5, 0.5, 100)) })} />
          <Field label="heightPercent" value={selected.heightPercent} onChange={(value) => onChange(selected.id, { heightPercent: roundPercent(clamp(Number(value) || 0.5, 0.5, 100)) })} />
          <Field label="rotationDeg" value={selected.rotationDeg ?? 0} onChange={(value) => onChange(selected.id, { rotationDeg: roundPercent(Number(value) || 0) })} />
          <Field label="yawDeg" value={selected.yawDeg ?? 0} onChange={(value) => onChange(selected.id, { yawDeg: roundPercent(Number(value) || 0) })} />
          <Field label="originXPercent" value={selected.originXPercent ?? 50} onChange={(value) => onChange(selected.id, { originXPercent: roundPercent(clamp(Number(value) || 0, 0, 100)) })} />
          <Field label="originYPercent" value={selected.originYPercent ?? 50} onChange={(value) => onChange(selected.id, { originYPercent: roundPercent(clamp(Number(value) || 0, 0, 100)) })} />
          <Field label="anchorXPercent" value={selected.anchorXPercent ?? 50} onChange={(value) => onChange(selected.id, { anchorXPercent: roundPercent(clamp(Number(value) || 0, 0, 100)) })} />
          <Field label="anchorYPercent" value={selected.anchorYPercent ?? 50} onChange={(value) => onChange(selected.id, { anchorYPercent: roundPercent(clamp(Number(value) || 0, 0, 100)) })} />
          <ToggleField label="flipX" checked={selected.flipX ?? false} onChange={(checked) => onChange(selected.id, { flipX: checked })} />
          <ToggleField label="flipY" checked={selected.flipY ?? false} onChange={(checked) => onChange(selected.id, { flipY: checked })} />
        </div>
      ) : null}

      {selected ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            data-home-qa-action="duplicate"
            className="rounded-lg border border-yellow-300/30 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-yellow-100 hover:bg-yellow-300/10"
            onClick={() => {
              onDuplicate(selected.id);
              setStatus("Duplicated selected prop");
            }}
          >
            Duplicate prop
          </button>
          <button
            type="button"
            data-home-qa-action="copy-selected"
            className="rounded-lg border border-cyan-300/30 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-300/10"
            onClick={() => copyText(selectedValue, "Copied selected prop")}
          >
            Copy prop
          </button>
          <button
            type="button"
            data-home-qa-action="duplicate-world"
            className="rounded-lg border border-violet-300/30 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-violet-100 hover:bg-violet-300/10"
            onClick={() => {
              onDuplicateToWorld(selected.id);
              setStatus("Duplicated selected prop to world");
            }}
          >
            Duplicate world
          </button>
          <button
            type="button"
            data-home-qa-action="delete"
            className="rounded-lg border border-rose-300/30 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-rose-100 hover:bg-rose-300/10"
            onClick={() => {
              onRemove(selected.id);
              setStatus("Removed selected prop");
            }}
          >
            Delete prop
          </button>
          <button
            type="button"
            data-home-qa-action="reset-panel"
            className="rounded-lg border border-slate-300/30 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-100 hover:bg-slate-300/10"
            onClick={() => setPanelPosition(null)}
          >
            Reset panel
          </button>
        </div>
      ) : null}

      <div className="rounded-lg border border-cyan-300/20 bg-black/35 p-2 text-[10px] leading-relaxed text-cyan-50/78">
        Drag handles. Arrows move 0.5%. Shift+arrows move 2%. +/- resize 0.5%. Shift +/- resize 2%. [ ] rotate flat. Y changes yaw: 0/180 swaps flag side, 90/270 edge-on. {status}.
      </div>

      <textarea
        className="min-h-[12rem] flex-1 resize-none rounded-lg border border-cyan-300/20 bg-black/50 p-2 font-mono text-[10px] leading-relaxed text-cyan-50 outline-none"
        value={jsonDraft}
        onChange={(event) => setJsonDraft(event.target.value)}
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          data-home-qa-action="apply-json"
          className="rounded-lg border border-cyan-300/30 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-300/10"
          onClick={importDraft}
        >
          Apply pasted JSON
        </button>
        <button
          type="button"
          data-home-qa-action="download-json"
          className="rounded-lg border border-emerald-300/30 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100 hover:bg-emerald-300/10"
          onClick={() => {
            const blob = new Blob([exportValue], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "home-landmark-effects.json";
            anchor.click();
            URL.revokeObjectURL(url);
            setStatus("Downloaded JSON");
          }}
        >
          Download JSON
        </button>
      </div>

      <button
        type="button"
        data-home-qa-action="reset-local"
        className="rounded-lg border border-rose-300/30 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-rose-100 hover:bg-rose-300/10"
        onClick={onReset}
      >
        Reset local edits
      </button>
    </aside>
  );
}
