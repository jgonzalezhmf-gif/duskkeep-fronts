"use client";

import { cn } from "@/lib/cn";

export function NumberField({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
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

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options?: readonly string[];
  onChange: (value: string) => void;
}) {
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

export function TextField({
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

export function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-black/28 px-2 py-1 text-white/66">
      <span className="block text-[9px] uppercase tracking-[0.14em] text-white/36">{label}</span>
      <span className="mt-1 block truncate text-[12px] font-black text-white">{value}</span>
    </div>
  );
}

export function parseNodeIdList(value: string) {
  return value
    .split(/[,\s]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}
