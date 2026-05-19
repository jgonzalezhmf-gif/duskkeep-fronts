import ArtPortrait from "@/components/ui/ArtPortrait";
import { type GlyphKind } from "@/components/ui/GameGlyph";
import { InlineGlyphIcon } from "@/components/game/shared/InlineGlyphIcon";
import { cn } from "@/lib/cn";
import type { LeaderDef } from "@/lib/types";

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
      <InlineGlyphIcon kind={icon} className="h-4 w-4" />
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
      {kind ? <InlineGlyphIcon kind={kind} className="h-full w-full" /> : label}
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

export function BattlePhaseBanner({
  round,
  activeSide,
}: {
  round: number;
  activeSide: "ally" | "enemy";
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-2.5 py-1.25 shadow-[0_8px_14px_rgba(0,0,0,0.16)]">
      <div className="grid h-7 w-7 place-items-center rounded-full border border-[#f5c451]/24 bg-[radial-gradient(circle_at_50%_28%,rgba(255,224,156,0.42),rgba(245,196,81,0.12)_56%,rgba(9,12,18,0.98)_100%)] text-[#f5d498] shadow-[0_8px_14px_rgba(0,0,0,0.18)]">
        <InlineGlyphIcon kind="battle" className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f5d498]">Turn {round}</div>
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/72">
          {activeSide === "ally" ? "Player initiative" : "Enemy initiative"}
        </div>
      </div>
    </div>
  );
}

export function LeaderPanel({
  leader,
  portrait,
  accent,
  mana,
  maxMana,
  hp,
  maxHp,
  shield,
  alive,
  className,
}: {
  leader: LeaderDef;
  portrait: string | null;
  accent: "ally" | "enemy";
  mana: number;
  maxMana: number;
  hp: number;
  maxHp: number;
  shield: number;
  alive: boolean;
  className?: string;
}) {
  const hpWidth = maxHp ? Math.max(0, (hp / maxHp) * 100) : 0;
  return (
    <section
      className={cn(
        "rounded-[20px] px-2.5 py-2.5 shadow-[0_12px_20px_rgba(0,0,0,0.18)] backdrop-blur-lg",
        accent === "ally"
          ? "bg-[linear-gradient(180deg,rgba(22,46,86,0.76),rgba(10,14,22,0.84))]"
          : "bg-[linear-gradient(180deg,rgba(84,30,38,0.76),rgba(10,14,22,0.84))]",
        !alive && "opacity-55 saturate-[0.7]",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <ArtPortrait
          src={portrait}
          alt={leader.name}
          className="h-11 w-11 shrink-0 rounded-[14px] border border-white/10 bg-black/18 shadow-[0_8px_14px_rgba(0,0,0,0.22)] md:h-12 md:w-12"
          imgClassName="object-[center_14%] saturate-[1.12]"
          fallback={<InlineGlyphIcon kind="battle" className="h-7 w-7" />}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[11px] font-black text-white md:text-[12px]">{leader.name}</div>
              <div className="truncate text-[8px] uppercase tracking-[0.18em] text-white/44">{leader.title}</div>
            </div>
            {shield > 0 ? <MetricPill tone="sky" icon="shield" value={shield} /> : null}
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/26">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#ff6b6b,#ffd36f)]" style={{ width: `${hpWidth}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-[8px] font-black uppercase tracking-[0.14em] text-white/54">
            <span>Core hp</span>
            <span>{hp}/{maxHp}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <MetricPill tone="rose" icon="heart" value={hp} />
        <MetricPill tone="gold" icon="power" value={mana} />
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {Array.from({ length: Math.max(maxMana, 1) }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              index < mana ? "bg-[#f5c451] shadow-[0_0_10px_rgba(245,196,81,0.46)]" : "bg-white/14",
            )}
          />
        ))}
      </div>
    </section>
  );
}

export function LeaderPowerPanel({
  leader,
  selected,
  disabled,
  cooldown,
  manaCost,
  onClick,
}: {
  leader: LeaderDef;
  selected?: boolean;
  disabled?: boolean;
  cooldown: number;
  manaCost: number;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-[16px] bg-[linear-gradient(180deg,rgba(32,24,16,0.82),rgba(10,12,18,0.92))] p-2 text-left shadow-[0_10px_18px_rgba(0,0,0,0.18)] transition",
        selected && "ring-4 ring-[#f5c451]/18",
        disabled && "opacity-45",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[13px] border border-[#f5c451]/24 bg-[radial-gradient(circle_at_50%_28%,rgba(255,224,156,0.44),rgba(245,196,81,0.12)_56%,rgba(9,12,18,0.98)_100%)] p-2">
          <InlineGlyphIcon kind="power" className="h-full w-full" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[8px] uppercase tracking-[0.18em] text-[#f5d498]">Leader power</div>
          <div className="mt-0.5 truncate text-[10px] font-black text-white">{leader.power.name}</div>
          <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white/54">
            {manaCost} mana <span className="text-white/28">|</span> cd {cooldown}
          </div>
        </div>
      </div>
    </button>
  );
}

export function BattleContextPanel({
  title,
  body,
  hint,
}: {
  title: string;
  body: string;
  hint: string;
}) {
  return (
    <div className="rounded-[16px] bg-[linear-gradient(180deg,rgba(14,18,28,0.66),rgba(10,12,18,0.88))] px-2.5 py-2 shadow-[0_10px_18px_rgba(0,0,0,0.18)]">
      <div className="text-[8px] font-black uppercase tracking-[0.18em] text-white/44">Command</div>
      <div className="mt-0.5 text-[10px] font-black text-white">{title}</div>
      <div className="mt-1 line-clamp-2 text-[9px] leading-3.5 text-white/58">{body}</div>
      <div className="mt-1.5 rounded-[12px] border border-white/8 bg-white/4 px-2 py-1.25 text-[8px] leading-3.5 text-white/52">{hint}</div>
    </div>
  );
}
