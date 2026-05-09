"use client";

import { cn } from "@/lib/cn";

function clampFieldValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function Field({
  label,
  value,
  readOnly = false,
  step = "0.1",
  onChange,
}: {
  label: string;
  value: string | number;
  readOnly?: boolean;
  step?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="font-black uppercase tracking-[0.12em] text-cyan-200/60">{label}</span>
      <input
        className="rounded border border-cyan-300/20 bg-black/45 px-2 py-1 text-white outline-none"
        type={typeof value === "number" && !readOnly ? "number" : "text"}
        step={step}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

export function OpacityField({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const normalized = clampFieldValue(Number(value) || 0, 0, 1);

  return (
    <label className="grid gap-1">
      <span className="font-black uppercase tracking-[0.12em] text-cyan-200/60">opacity</span>
      <div className="grid gap-1 rounded border border-cyan-300/20 bg-black/45 px-2 py-1">
        <div className="flex items-center justify-between gap-2">
          <input
            className="w-full accent-cyan-300"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={normalized}
            onChange={(event) => onChange(clampFieldValue(Number(event.target.value) || 0, 0, 1))}
          />
          <input
            className="w-16 rounded border border-cyan-300/20 bg-black/45 px-1 py-0.5 text-right text-white outline-none"
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={normalized}
            onChange={(event) => onChange(clampFieldValue(Number(event.target.value) || 0, 0, 1))}
          />
        </div>
      </div>
    </label>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="font-black uppercase tracking-[0.12em] text-cyan-200/60">{label}</span>
      <select
        className="rounded border border-cyan-300/20 bg-black/45 px-2 py-1 text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="font-black uppercase tracking-[0.12em] text-cyan-200/60">{label}</span>
      <button
        type="button"
        className={cn(
          "rounded border px-2 py-1 text-left text-white outline-none",
          checked ? "border-emerald-300/50 bg-emerald-300/18" : "border-cyan-300/20 bg-black/45",
        )}
        onClick={() => onChange(!checked)}
      >
        {checked ? "on" : "off"}
      </button>
    </label>
  );
}
