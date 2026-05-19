import ArtPortrait from "@/components/ui/ArtPortrait";
import { type GlyphKind } from "@/components/ui/GameGlyph";
import { InlineGlyphIcon } from "@/components/game/shared/InlineGlyphIcon";
import { getCard } from "@/data/cards";
import { getHero } from "@/data/heroes";
import { getHeroPortrait } from "@/lib/art";
import { cn } from "@/lib/cn";

function compactHeroStat(value: number, divisor: number) {
  return Math.max(1, Math.round(value / divisor));
}

function heroGlyph(cardId: string): GlyphKind {
  const card = getCard(cardId);
  if (card.kind === "spell") return card.id === "spell_sanctuary" ? "heal" : card.id === "spell_guardian_aegis" ? "shield" : card.id === "spell_battle_hymn" ? "power" : "attack";
  const hero = getHero(card.heroId);
  return hero.role === "tank"
    ? "shield"
    : hero.role === "support"
      ? "heal"
      : hero.role === "mage"
        ? "skill"
        : "attack";
}

export function BattleHandCard({
  cardId,
  selected,
  playable,
  blockedLabel,
}: {
  cardId: string;
  selected?: boolean;
  playable?: boolean;
  blockedLabel?: string | null;
}) {
  const card = getCard(cardId);
  const hero = card.kind === "hero" ? getHero(card.heroId) : null;
  const portrait = card.kind === "hero" ? getHeroPortrait(card.heroId) : null;
  const glyph = heroGlyph(cardId);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border shadow-[0_20px_30px_rgba(0,0,0,0.28)] transition",
        selected ? "border-[#f5c451]/46 ring-2 ring-[#f5c451]/20 -translate-y-1.5" : "border-white/8 hover:-translate-y-0.5",
        !playable && "opacity-55",
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          card.kind === "hero"
            ? "bg-[linear-gradient(180deg,rgba(52,106,183,0.82),rgba(18,24,34,0.98))]"
            : "bg-[linear-gradient(180deg,rgba(112,79,199,0.82),rgba(18,24,34,0.98))]",
        )}
      />
      <div className="absolute inset-[1px] overflow-hidden rounded-[22px] border border-white/8 bg-black/18">
        <ArtPortrait
          src={portrait}
          alt={card.name}
          className="absolute inset-0"
          imgClassName="scale-[1.16] object-[center_14%] saturate-[1.14] contrast-[1.04]"
          fallback={
            <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),rgba(0,0,0,0.2)_42%,rgba(0,0,0,0.5)_100%)]">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-black/18 p-3">
                <InlineGlyphIcon kind={glyph} className="h-8 w-8" />
              </div>
            </div>
          }
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(180deg,transparent_0%,transparent_34%,rgba(7,10,18,0.22)_58%,rgba(7,10,18,0.92)_100%)]" />
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-[13%] bg-gradient-to-b opacity-90",
            card.rarity === "legendary"
              ? "from-amber-300/90 to-amber-500/0"
              : card.rarity === "epic"
                ? "from-fuchsia-300/90 to-fuchsia-500/0"
                : card.rarity === "rare"
                  ? "from-sky-300/90 to-sky-500/0"
                  : "from-white/80 to-white/0",
          )}
        />
      </div>

      <div className="relative flex h-[7.8rem] flex-col justify-between p-[0.45rem] md:h-[8.35rem] md:p-2">
        <div className="flex items-start justify-between gap-2">
          <CardToken tone="gold" value={card.cost} />
          <div className="rounded-full border border-white/12 bg-black/44 px-2 py-0.75 text-[7px] font-black uppercase tracking-[0.14em] text-white/78 shadow-[0_10px_18px_rgba(0,0,0,0.22)]">
            {hero ? hero.role : "spell"}
          </div>
        </div>

        {blockedLabel ? (
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2 rounded-full border border-white/12 bg-black/64 px-2.5 py-0.75 text-[7px] font-black uppercase tracking-[0.16em] text-white/78 shadow-[0_12px_20px_rgba(0,0,0,0.3)]">
            {blockedLabel}
          </div>
        ) : null}

        <div className="mt-auto rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.46),rgba(9,12,18,0.9))] px-2 py-[0.45rem] shadow-[0_12px_18px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[9px] font-black text-white">{card.name}</div>
              <div className="mt-0.5 truncate text-[7px] font-black uppercase tracking-[0.16em] text-white/44">
                {hero ? hero.faction : card.rarity}
              </div>
            </div>
            <div className="grid h-[1.625rem] w-[1.625rem] place-items-center rounded-[10px] border border-white/10 bg-black/34 p-[0.3rem]">
              <InlineGlyphIcon kind={glyph} className="h-full w-full" />
            </div>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {hero ? (
                <>
                  <CardToken tone="sky" value={compactHeroStat(hero.baseStats.hp, 300)} icon="heart" />
                  <CardToken tone="rose" value={compactHeroStat(hero.baseStats.atk, 25)} icon="attack" />
                </>
              ) : (
                <div className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[7px] font-black uppercase tracking-[0.14em] text-white/68">
                  {card.description.slice(0, 14)}
                </div>
              )}
            </div>
            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full",
                  card.rarity === "legendary"
                    ? "bg-amber-300"
                    : card.rarity === "epic"
                      ? "bg-fuchsia-300"
                      : card.rarity === "rare"
                        ? "bg-sky-300"
                        : "bg-white/70",
                )}
                style={{ width: hero ? `${Math.min(100, 46 + compactHeroStat(hero.baseStats.spd, 2))}%` : "72%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardToken({
  tone,
  value,
  icon,
}: {
  tone: "gold" | "rose" | "sky";
  value: number;
  icon?: GlyphKind;
}) {
  const palette =
    tone === "gold"
      ? "from-[#f7d46f] to-[#da931f] border-[#fff0b7]/50 text-[#2b1603]"
      : tone === "rose"
        ? "from-[#ff8b77] to-[#cf3f38] border-[#ffd5cf]/50 text-white"
        : "from-[#71c7ff] to-[#247fd9] border-[#def4ff]/50 text-white";

  return (
    <div className={cn("inline-flex min-w-[2.35rem] items-center justify-center gap-1 rounded-[14px] border bg-gradient-to-b px-2 py-1 text-[10px] font-black shadow-[0_10px_18px_rgba(0,0,0,0.24)]", palette)}>
      {icon ? (
        <span className="h-3.5 w-3.5">
          <InlineGlyphIcon kind={icon} className="h-full w-full" />
        </span>
      ) : null}
      {value}
    </div>
  );
}
