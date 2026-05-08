import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import { cn } from "@/lib/cn";

export type TacticalFloaterKind = "hit" | "heal" | "shield" | "buff" | "summon" | "ability" | "death";

export function StatGem({
  kind,
  value,
  tone,
}: {
  kind: GlyphKind;
  value: string;
  tone: "ally" | "enemy" | "gold" | "shield";
}) {
  const palette =
    tone === "ally"
      ? "from-[#8ddcff] to-[#2a8be0] border-[#dff6ff]/52 text-white"
      : tone === "enemy"
        ? "from-[#ff9689] to-[#d34848] border-[#ffd7d2]/52 text-white"
        : tone === "shield"
          ? "from-[#a8f0ff] to-[#46a4de] border-[#d8f7ff]/52 text-white"
          : "from-[#f7d46f] to-[#da931f] border-[#fff0b7]/52 text-[#2b1603]";
  return (
    <div className={cn("inline-flex min-w-[2.6rem] items-center justify-center gap-1 rounded-[14px] border bg-gradient-to-b px-2 py-1 text-[9px] font-black shadow-[0_10px_18px_rgba(0,0,0,0.26)]", palette)}>
      <span className="h-3.5 w-3.5">
        <GameGlyph kind={kind} shell="none" />
      </span>
      {value}
    </div>
  );
}

export function ActionButton({
  kind,
  label,
  active,
  disabled,
  onClick,
}: {
  kind: GlyphKind;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] shadow-[0_12px_20px_rgba(0,0,0,0.18)] transition",
        active ? "border-[#f5c451]/30 bg-[#f5c451]/14 text-[#ffe5a0]" : "border-white/10 bg-white/6 text-white/82",
        disabled && "opacity-35",
      )}
    >
      <span className="h-4 w-4">
        <GameGlyph kind={kind} shell="none" />
      </span>
      {label}
    </button>
  );
}

export function FloatingText({
  text,
  label,
  kind,
}: {
  text: string;
  label?: string;
  kind: TacticalFloaterKind;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-[-10%] text-center font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.84)] animate-[floatUp_.9s_ease-out_forwards]",
        kind === "hit" && "text-rose-300",
        kind === "heal" && "text-emerald-300",
        kind === "shield" && "text-sky-300",
        kind === "buff" && "text-amber-200",
        kind === "summon" && "text-[#f5d498]",
        kind === "ability" && "text-fuchsia-200",
        kind === "death" && "text-white",
      )}
    >
      {label ? <div className="text-[9px] uppercase tracking-[0.16em] text-white/78">{label}</div> : null}
      <div className={cn("text-sm", (kind === "summon" || kind === "death") && "text-base")}>{text}</div>
    </div>
  );
}
