import ArtPortrait from "@/components/ui/ArtPortrait";
import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import type { TacticalUnit } from "@/features/tactical/types";
import { getUnitPortrait } from "@/lib/art";
import { cn } from "@/lib/cn";

export type TacticalFloaterKind = "hit" | "heal" | "shield" | "buff" | "summon" | "ability" | "death";
export type TacticalHighlightKind = "move" | "attack" | "ability" | "summon" | "spell" | "power" | null;

const roleGlyph: Record<string, GlyphKind> = {
  leader: "battle",
  tank: "shield",
  fighter: "attack",
  archer: "attack",
  mage: "skill",
  support: "heal",
  summoner: "power",
};

const rarityAccent: Record<string, string> = {
  common: "from-white/70 to-white/0",
  rare: "from-sky-300/88 to-sky-300/0",
  epic: "from-fuchsia-300/88 to-fuchsia-300/0",
  legendary: "from-amber-300/88 to-amber-300/0",
};

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

export function BoardSideFlag({ tone, label, compact }: { tone: "ally" | "enemy"; label: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-black uppercase tracking-[0.2em] shadow-[0_10px_18px_rgba(0,0,0,0.16)]",
        compact ? "gap-1.5 px-2.5 py-1 text-[8px]" : "gap-2 px-3 py-1.5 text-[9px]",
        tone === "ally"
          ? "bg-[linear-gradient(180deg,rgba(64,129,196,0.18),rgba(12,18,28,0.62))] text-sky-50"
          : "bg-[linear-gradient(180deg,rgba(156,74,88,0.18),rgba(18,12,20,0.62))] text-rose-50",
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", tone === "ally" ? "bg-sky-300" : "bg-rose-300")} />
      {label}
    </div>
  );
}

export function StatusPill({
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
        "rounded-full font-black uppercase tracking-[0.18em] shadow-[0_10px_18px_rgba(0,0,0,0.18)]",
        compact ? "px-2 py-1 text-[8px]" : "px-3 py-1.5 text-[9px]",
        tone === "ally"
          ? "bg-[linear-gradient(180deg,rgba(63,124,194,0.16),rgba(12,17,26,0.68))] text-sky-50"
          : tone === "enemy"
            ? "bg-[linear-gradient(180deg,rgba(152,72,86,0.16),rgba(18,12,20,0.68))] text-rose-50"
            : "bg-[linear-gradient(180deg,rgba(255,244,216,0.08),rgba(11,13,19,0.68))] text-white/72",
      )}
    >
      <span className="mr-1.5 text-white/44">{label}</span>
      {value}
    </div>
  );
}

export function TileHighlight({ kind }: { kind: NonNullable<TacticalHighlightKind> }) {
  const palette =
    kind === "move"
      ? "ring-1 ring-emerald-300/42 bg-[radial-gradient(circle_at_50%_50%,rgba(52,211,153,0.22),rgba(52,211,153,0.08)_42%,transparent_84%)]"
      : kind === "attack"
        ? "ring-1 ring-rose-300/42 bg-[radial-gradient(circle_at_50%_50%,rgba(251,113,133,0.22),rgba(251,113,133,0.08)_42%,transparent_84%)]"
        : kind === "ability"
          ? "ring-1 ring-fuchsia-300/42 bg-[radial-gradient(circle_at_50%_50%,rgba(217,70,239,0.22),rgba(217,70,239,0.08)_42%,transparent_84%)]"
          : kind === "spell"
            ? "ring-1 ring-sky-300/42 bg-[radial-gradient(circle_at_50%_50%,rgba(125,211,252,0.2),rgba(125,211,252,0.08)_42%,transparent_84%)]"
            : "ring-1 ring-amber-300/42 bg-[radial-gradient(circle_at_50%_50%,rgba(252,211,77,0.22),rgba(252,211,77,0.08)_42%,transparent_84%)]";
  const icon =
    kind === "move"
      ? "move"
      : kind === "attack"
        ? "attack"
        : kind === "ability"
          ? "skill"
          : kind === "spell"
            ? "skill"
            : "power";
  return (
    <>
      <div className={cn("pointer-events-none absolute inset-[6%] rounded-[20px] shadow-[0_0_24px_rgba(0,0,0,0.14)]", palette)} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1] grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(255,247,225,0.14),rgba(0,0,0,0.46)_72%)] text-white shadow-[0_12px_20px_rgba(0,0,0,0.28)]">
        <span className="h-4 w-4">
          <GameGlyph kind={icon} shell="none" />
        </span>
      </div>
    </>
  );
}

export function LegendPill({ kind, label }: { kind: "move" | "attack" | "ability"; label: string }) {
  const tone =
    kind === "move"
      ? "border-emerald-200/18 bg-emerald-400/10 text-emerald-50"
      : kind === "attack"
        ? "border-rose-200/18 bg-rose-400/10 text-rose-50"
        : "border-fuchsia-200/18 bg-fuchsia-400/10 text-fuchsia-50";
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.25 py-0.9 text-[8px] font-black uppercase tracking-[0.16em]", tone)}>
      <span className="h-3.5 w-3.5">
        <GameGlyph kind={kind === "move" ? "move" : kind === "attack" ? "attack" : "skill"} shell="none" />
      </span>
      {label}
    </div>
  );
}

export function UnitStandee({
  unit,
  selected,
  active,
}: {
  unit: TacticalUnit;
  selected?: boolean;
  active?: boolean;
}) {
  const hpPct = Math.max(0, Math.min(1, unit.hp / unit.maxHp));
  const portrait = getUnitPortrait(unit.heroId);
  const fallbackGlyph = roleGlyph[unit.role] ?? "skill";
  const ribbonTone =
    unit.side === "ally"
      ? "border-sky-200/22 bg-sky-400/16 text-sky-50"
      : "border-rose-200/22 bg-rose-400/16 text-rose-50";
  const frameTone =
    unit.side === "ally"
      ? "border-sky-100/30 shadow-[0_10px_22px_rgba(42,139,224,0.18)]"
      : "border-rose-100/30 shadow-[0_10px_22px_rgba(211,63,56,0.18)]";
  const plateTone =
    unit.side === "ally"
      ? "border-sky-200/26 bg-[linear-gradient(180deg,rgba(94,176,255,0.28),rgba(18,31,51,0.54)_40%,rgba(8,10,16,0.98))]"
      : "border-rose-200/26 bg-[linear-gradient(180deg,rgba(255,132,132,0.28),rgba(58,22,31,0.54)_40%,rgba(8,10,16,0.98))]";
  const glowTone = unit.side === "ally" ? "bg-sky-300/22" : "bg-rose-300/22";
  const statusTone =
    unit.buffs.stun > 0
      ? "border-amber-300/26 bg-amber-400/14 text-amber-50"
      : active
        ? "border-emerald-300/24 bg-emerald-400/12 text-emerald-50"
        : "border-white/10 bg-white/6 text-white/62";
  const statusLabel = unit.buffs.stun > 0 ? "Stun" : active ? "Ready" : unit.hasActed ? "Spent" : unit.role;

  return (
    <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center">
      <div className={cn("pointer-events-none absolute bottom-[8%] h-[24%] w-[88%] rounded-full blur-[28px]", glowTone)} />
      <div className="pointer-events-none absolute inset-x-[4%] bottom-[1.5%] h-[18%] rounded-full bg-black/30 blur-md" />
      <div className="relative h-full w-full">
        <div
          className={cn(
            "absolute inset-x-[-5%] bottom-[5.5%] top-[-8%] overflow-hidden rounded-[30px] border bg-[linear-gradient(180deg,rgba(255,247,221,0.14),rgba(255,255,255,0.03)_24%,rgba(0,0,0,0.34)_100%)] transition",
            frameTone,
            selected && "ring-2 ring-[#f5c451]/28",
          )}
        >
          <div className={cn("absolute inset-x-0 top-0 h-[13%] bg-gradient-to-b", rarityAccent[unit.rarity] ?? rarityAccent.common)} />
          <div className="absolute inset-[4%] overflow-hidden rounded-[24px] bg-black/14">
            <ArtPortrait
              src={portrait}
              alt={unit.name}
              className="absolute inset-0"
              imgClassName={cn(
                "scale-[1.28] object-[center_10%] saturate-[1.1] contrast-[1.04]",
                unit.side === "enemy" && "[transform:scaleX(-1)_scale(1.28)]",
              )}
              fallback={
                <div className="grid h-full w-full place-items-center">
                  <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border border-white/10 bg-black/24 p-3">
                    <GameGlyph kind={fallbackGlyph} shell="none" />
                  </div>
                </div>
              }
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(180deg,transparent,rgba(8,10,16,0.12)_38%,rgba(8,10,16,0.88)_100%)]" />
          </div>

          <div className="absolute left-[4%] top-[5%]">
            <StatGem kind="heart" value={`${unit.hp}`} tone={unit.side === "ally" ? "ally" : "enemy"} />
          </div>
          <div className="absolute right-[4%] top-[5%]">
            {unit.buffs.shield > 0 ? (
              <StatGem kind="shield" value={`${unit.buffs.shield}`} tone="shield" />
            ) : (
              <StatGem kind="attack" value={`${unit.atk}`} tone="gold" />
            )}
          </div>

          <div className={cn("absolute top-[12%]", unit.side === "ally" ? "left-[-1%]" : "right-[-1%]")}>
            <div className={cn("rounded-full border px-2.5 py-0.5 text-[7px] font-black uppercase tracking-[0.2em] shadow-[0_8px_14px_rgba(0,0,0,0.22)]", ribbonTone)}>
              {unit.side === "ally" ? "Ally" : "Enemy"}
            </div>
          </div>

          <div className="absolute inset-x-[2%] bottom-[4%]">
            <div className="rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.56),rgba(8,10,16,0.9))] px-2.5 py-1.5 shadow-[0_14px_24px_rgba(0,0,0,0.24)]">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[8px] font-black uppercase tracking-[0.18em] text-white/42">{unit.role === "leader" ? "Core" : unit.role}</div>
                  <div className="truncate text-[12px] font-black text-white">{unit.name}</div>
                </div>
                <div className={cn("rounded-full border px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.18em]", statusTone)}>
                  {statusLabel}
                </div>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/40">
                <div
                  className={cn(
                    "h-full rounded-full",
                    hpPct > 0.5 ? "bg-emerald-400" : hpPct > 0.25 ? "bg-amber-300" : "bg-rose-400",
                  )}
                  style={{ width: `${hpPct * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={cn("absolute inset-x-[2%] bottom-[0.5%] h-[17%] rounded-full border shadow-[0_14px_24px_rgba(0,0,0,0.32)]", plateTone)}>
          <div className="absolute inset-x-[10%] top-[18%] h-[30%] rounded-full bg-white/12" />
        </div>
      </div>
    </div>
  );
}
