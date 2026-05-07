import { FrontlineCardView, FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { isResourceIconKind, ResourceIcon, type ResourceIconKind } from "@/components/game/shared/ResourceIcon";
import { ShopIcon } from "@/components/game/shared/ShopIcon";
import type { GlyphKind } from "@/components/ui/GameGlyph";
import { FRONTLINE_CARD_BY_ID, FRONTLINE_HERO_BY_ID } from "@/features/frontline/data";
import { cn } from "@/lib/cn";
import type { ExtendedShopOffer } from "@/data/shop";
import { offerShopIcon, offerValueTag, type TranslateFn } from "./shopPageHelpers";
import { StoreGlyph } from "./ShopStorePrimitives";

type RewardTokenDef = {
  label: string;
  hint: string;
  icon: GlyphKind | ResourceIconKind;
  tone: GameIconTone;
};

export function buildRewardTokens(offer: ExtendedShopOffer, t: TranslateFn): RewardTokenDef[] {
  const contents = offer.contents;
  return [
    contents.gold ? { label: `${contents.gold}`, hint: t("shop.rewardHints.gold"), icon: "gold", tone: "gold" } : null,
    contents.dust ? { label: `${contents.dust}`, hint: t("shop.rewardHints.dust"), icon: "dust", tone: "violet" } : null,
    contents.gems ? { label: `${contents.gems}`, hint: t("shop.rewardHints.gems"), icon: "gem", tone: "sky" } : null,
    contents.xp ? { label: `${contents.xp}`, hint: t("shop.rewardHints.xp"), icon: "power", tone: "emerald" } : null,
    contents.accountXp ? { label: `${contents.accountXp}`, hint: t("shop.rewardHints.accountXp"), icon: "rewards", tone: "ember" } : null,
    contents.arenaTickets ? { label: `${contents.arenaTickets}`, hint: t("shop.rewardHints.tickets"), icon: "tickets", tone: "ember" } : null,
    contents.adventureKeys ? { label: `${contents.adventureKeys}`, hint: t("shop.rewardHints.adventureKeys"), icon: "adventure_key", tone: "gold" } : null,
    contents.shards?.length
      ? {
          label: `${contents.shards.reduce((sum, shard) => sum + shard.amount, 0)}`,
          hint: t("shop.rewardHints.shards"),
          icon: "shards",
          tone: "violet",
        }
      : null,
  ].filter(Boolean) as RewardTokenDef[];
}

export function RewardToken({
  label,
  hint,
  icon,
  tone,
  featured,
  compact,
}: RewardTokenDef & {
  featured?: boolean;
  compact?: boolean;
}) {
  return (
    <GameRewardToken
      icon={icon}
      tone={tone}
      label={hint}
      value={label}
      featured={featured || icon === "gold" || icon === "gem" || icon === "gems" || icon === "dust" || icon === "shards" || icon === "adventure_key"}
      size={featured ? "lg" : compact ? "sm" : "md"}
    />
  );
}

export function OfferShopVisualIcon({
  offer,
  size,
  className,
}: {
  offer: ExtendedShopOffer;
  size: "sm" | "md" | "lg";
  className?: string;
}) {
  if (offer.contents.adventureKeys) {
    return (
      <span className={cn("relative inline-grid shrink-0 place-items-center overflow-visible", className)}>
        <span className="pointer-events-none absolute -inset-2 rounded-[24px] border border-[#f5d498]/16 bg-[linear-gradient(180deg,rgba(245,196,81,0.14),rgba(8,8,12,0.76))] shadow-[0_12px_24px_rgba(0,0,0,0.34)]" />
        <ResourceIcon kind="adventure_key" size={size === "lg" ? "large" : "medium"} className="relative z-[1] h-[118%] w-[118%]" />
      </span>
    );
  }
  return <ShopIcon name={offerShopIcon(offer)} size={size} className={className} />;
}

export function ShopOfferRewardBurst({
  offer,
  active,
  compact,
  t,
}: {
  offer: ExtendedShopOffer;
  active: boolean;
  compact?: boolean;
  t: TranslateFn;
}) {
  if (!active) return null;
  const tokens = buildRewardTokens(offer, t).slice(0, compact ? 2 : 3);

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
      <div className="frontline-reward-burst flex max-w-[88%] flex-col items-center gap-3 rounded-[30px] border border-[#ffe6a8]/26 bg-[radial-gradient(circle_at_50%_0%,rgba(255,236,178,0.28),transparent_44%),linear-gradient(180deg,rgba(22,16,9,0.88),rgba(7,9,14,0.72))] px-3 py-3 shadow-[0_24px_70px_rgba(0,0,0,0.42),0_0_34px_rgba(245,196,81,0.16)] backdrop-blur-md">
        <OfferShopVisualIcon offer={offer} size={compact ? "md" : "lg"} className={compact ? "h-10 w-10" : "h-14 w-14"} />
        <div className="flex flex-wrap justify-center gap-2">
          {tokens.map((token) => (
            <RewardToken key={`burst-${offer.id}-${token.label}-${token.hint}`} {...token} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BundleShowcase({
  icon,
  offer,
  t,
}: {
  icon: GlyphKind;
  offer: ExtendedShopOffer;
  t: TranslateFn;
}) {
  const tokenIcons = buildRewardTokens(offer, t).slice(0, 3);
  const previewCards = (offer.previewCards ?? [])
    .map((cardId) => FRONTLINE_CARD_BY_ID[cardId])
    .filter(Boolean)
    .slice(0, 2);
  const previewHeroes = (offer.previewHeroes ?? [])
    .map((heroId) => FRONTLINE_HERO_BY_ID[heroId])
    .filter(Boolean)
    .slice(0, 2);

  return (
    <div className="relative min-h-[12rem] overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(10,11,17,0.86))] p-3">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_50%_0%,rgba(255,231,184,0.24),transparent_62%)]" />
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#f5d498]">{t("shop.facts.bundleDisplay")}</div>
      <div className="mt-1 text-lg font-black text-white">{offerValueTag(offer, t) ?? t("shop.facts.vaultDrop")}</div>

      {previewCards.length || previewHeroes.length ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {previewCards.map((card) => (
            <FrontlineCardView key={card.id} card={card} compact status="preview" className="min-h-[9rem]" />
          ))}
          {previewHeroes.map((hero) => (
            <FrontlineHeroStandee key={hero.heroId} hero={hero} compact label="preview" className="min-h-[9rem]" />
          ))}
        </div>
      ) : (
        <>
          <div className="absolute left-[10%] top-[34%]">
            {offer.contents.adventureKeys ? (
              <span className="grid h-24 w-24 place-items-center rounded-[28px] border border-[#f5d498]/18 bg-[linear-gradient(180deg,rgba(245,196,81,0.12),rgba(8,8,12,0.72))]">
                <ResourceIcon kind="adventure_key" size="large" className="h-24 w-24" imgClassName="scale-[1.28]" />
              </span>
            ) : (
              <StoreGlyph icon={icon} tone="from-[#fff3c7] via-[#f5c451] to-[#c77716]" className="h-20 w-20" />
            )}
          </div>

          {tokenIcons.map((token, index) => (
            <div
              key={`${token.hint}-${index}`}
              className={cn(
                "absolute",
                index === 0 ? "left-[48%] top-[28%]" : index === 1 ? "left-[58%] top-[50%]" : "left-[28%] top-[60%]",
              )}
            >
              {isResourceIconKind(token.icon) ? (
                <span className={cn("grid place-items-center rounded-[20px] border border-white/10 bg-black/18 shadow-[0_14px_28px_rgba(0,0,0,0.24)]", index === 0 ? "h-16 w-16" : "h-12 w-12")}>
                  <ResourceIcon kind={token.icon} size="large" className="h-[92%] w-[92%]" imgClassName={token.icon === "adventure_key" ? "scale-[1.28]" : undefined} />
                </span>
              ) : (
                <GameIcon kind={token.icon} tone={token.tone} size="lg" className={index === 0 ? "h-16 w-16" : "h-12 w-12"} />
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
