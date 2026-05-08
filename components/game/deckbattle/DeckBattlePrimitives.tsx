import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import { cn } from "@/lib/cn";

export function MetricPill({
  tone,
  icon,
  value,
}: {
  tone: "rose" | "gold" | "sky";
  icon: GlyphKind;
  value: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black shadow-[0_10px_18px_rgba(0,0,0,0.2)]",
        tone === "rose"
          ? "border-rose-200/20 bg-rose-400/10 text-white"
          : tone === "sky"
            ? "border-sky-200/20 bg-sky-400/10 text-sky-50"
            : "border-[#f5c451]/24 bg-[#f5c451]/12 text-[#ffe5a0]",
      )}
    >
      <span className="h-4 w-4">
        <GameGlyph kind={icon} shell="none" />
      </span>
      {value}
    </span>
  );
}

export function HeaderChip({
  label,
  value,
  tone,
  compact,
}: {
  label: string;
  value: string;
  tone: "ally" | "enemy" | "neutral";
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-full font-black uppercase tracking-[0.16em] shadow-[0_8px_14px_rgba(0,0,0,0.16)]",
        compact ? "px-2.5 py-1 text-[8px]" : "px-3 py-1.5 text-[9px]",
        tone === "ally"
          ? "bg-[linear-gradient(180deg,rgba(71,146,222,0.18),rgba(9,16,26,0.54))] text-sky-50"
          : tone === "enemy"
            ? "bg-[linear-gradient(180deg,rgba(176,86,101,0.18),rgba(18,11,18,0.54))] text-rose-50"
            : "bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(10,12,18,0.54))] text-white/70",
      )}
    >
      <span className="mr-1.5 text-white/42">{label}</span>
      {value}
    </div>
  );
}

export function UtilityBubble({ kind, label, compact }: { kind?: "cfg"; label?: string; compact?: boolean }) {
  return (
    <button className={cn("grid place-items-center rounded-full bg-[linear-gradient(180deg,rgba(16,20,30,0.72),rgba(10,12,18,0.86))] font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_16px_rgba(0,0,0,0.18)]", compact ? "h-[2.125rem] w-[2.125rem] p-1.5 text-[9px]" : "h-11 w-11 p-2 text-[10px]")}>
      {kind ? <GameGlyph kind={kind} shell="none" /> : label}
    </button>
  );
}

export function ManaWellPanel({ mana, maxMana }: { mana: number; maxMana: number }) {
  return (
    <div className="rounded-[16px] bg-[linear-gradient(180deg,rgba(32,24,16,0.72),rgba(10,12,18,0.9))] p-2 shadow-[0_10px_18px_rgba(0,0,0,0.18)]">
      <div className="flex items-center gap-2.5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border border-[#f5c451]/24 bg-[radial-gradient(circle_at_50%_28%,rgba(255,223,151,0.46),rgba(245,196,81,0.12)_54%,rgba(9,12,18,0.98)_100%)] text-[15px] font-black text-white shadow-[0_8px_14px_rgba(0,0,0,0.22)]">
          {mana}
        </div>
        <div className="min-w-0">
          <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#f5d498]/72">Mana well</div>
          <div className="mt-0.5 text-[11px] font-black text-white">
            {mana}
            <span className="text-white/38">/{maxMana}</span> crystals
          </div>
          <div className="mt-1.5 flex gap-1">
            {Array.from({ length: Math.max(maxMana, 1) }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  index < mana ? "bg-[#f5c451] shadow-[0_0_10px_rgba(245,196,81,0.48)]" : "bg-white/12",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
