import { FrontlineCardView, FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { isResourceIconKind, ResourceIcon, type ResourceIconKind } from "@/components/game/shared/ResourceIcon";
import { ShopIcon } from "@/components/game/shared/ShopIcon";
import type { GlyphKind } from "@/components/ui/GameGlyph";
import { SceneButton } from "@/components/game/screens/ScreenChrome";
import { cn } from "@/lib/cn";
import { FRONTLINE_CARD_BY_ID, FRONTLINE_HERO_BY_ID } from "@/features/frontline/data";
import type { ExtendedShopOffer, ShopCategory } from "@/data/shop";
import {
  CATEGORY_SHOP_ICONS,
  CATEGORY_TONES,
  bestUseLabel,
  categoryGlyph,
  offerCost,
  offerDescription,
  offerName,
  offerShopIcon,
  offerStateLabel,
  offerStateShopIcon,
  offerValueTag,
  productLineLabel,
  productLineShopIcon,
  shopIconForValueTag,
  type TranslateFn,
} from "./shopPageHelpers";
import { ShopBadge } from "./ShopChrome";
import {
  StoreGlyph,
  StoreMiniFact,
  StoreStatusLine,
} from "./ShopStorePrimitives";

export function FeaturedOfferStage({
  offer,
  category,
  remaining,
  bought,
  clientReady,
  t,
  feedbackActive,
  feedbackNonce,
  onBuy,
}: {
  offer: ExtendedShopOffer;
  category: ShopCategory;
  remaining: number | null;
  bought: boolean;
  clientReady: boolean;
  t: TranslateFn;
  feedbackActive: boolean;
  feedbackNonce: number;
  onBuy: () => void;
}) {
  const disabled = remaining === 0;
  const offerIcon = categoryGlyph(offer.category);
  const stateLabel = offerStateLabel(offer, remaining, bought, t);
  const stateIcon = offerStateShopIcon(offer, remaining, bought, clientReady);
  const valueTag = offerValueTag(offer, t);

  return (
    <div className={cn("relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(12,12,18,0.88))] p-4 shadow-[0_22px_52px_rgba(0,0,0,0.24)] md:p-5", feedbackActive && "frontline-reward-success")}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,228,175,0.24),transparent_22%),radial-gradient(circle_at_82%_74%,rgba(130,193,255,0.12),transparent_18%)]" />
      <ShopOfferRewardBurst key={`featured-burst-${feedbackNonce}`} offer={offer} active={feedbackActive} t={t} />
      <div className="relative z-[1] grid gap-4 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <ShopBadge icon={shopIconForValueTag(offer.valueTag)}>{valueTag ?? t("shop.states.merchantSpotlight")}</ShopBadge>
            {offer.hot ? <ShopBadge icon="hot_deal" tone="ember">{t("shop.states.hotDrop")}</ShopBadge> : null}
            <ShopBadge icon={stateIcon} tone="neutral">{stateLabel}</ShopBadge>
          </div>

          <div className="mt-3 flex items-start gap-4">
            <OfferShopVisualIcon offer={offer} size="lg" className="hidden h-16 w-16 shrink-0 md:inline-grid" />
            <div className="min-w-0">
              <div className="text-[1.8rem] font-black leading-[0.92] text-white md:text-[2.55rem]">{offerName(offer, t)}</div>
              <p className="mt-2 max-w-[36rem] text-[12px] leading-5 text-white/64 md:text-[13px]">{offerDescription(offer, t)}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <BundleShowcase icon={offerIcon} offer={offer} t={t} />
            <div className="grid gap-4">
              <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(10,11,17,0.84))] p-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#f5d498]">
                  <ProgressionIcon name="reward_chest" size="sm" />
                  {t("shop.facts.whatYouGet")}
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {buildRewardTokens(offer, t).map((token) => (
                    <RewardToken key={`${token.label}-${token.hint}`} {...token} featured />
                  ))}
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <StoreMiniFact shopIcon={productLineShopIcon(offer)} icon="offers" label={t("shop.facts.bundleType")} value={productLineLabel(offer, t)} />
                <StoreMiniFact resourceIcon={offer.cost.gems ? "gems" : offer.cost.gold ? "gold" : undefined} shopIcon={!offer.cost.gems && !offer.cost.gold ? "free_claim" : undefined} icon={offer.cost.gems ? "gem" : "gold"} label={t("shop.facts.checkout")} value={offerCost(offer, t)} />
                <StoreMiniFact shopIcon={stateIcon} icon="rewards" label={t("shop.facts.availability")} value={stateLabel} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(9,11,17,0.9))] p-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#f5d498]">{t("shop.facts.checkoutRail")}</div>
            <div className="mt-1 text-xl font-black text-white">{t("shop.facts.primaryOffer")}</div>
            <div className="mt-3 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(8,10,16,0.86))] p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/44">{t("shop.facts.price")}</div>
              <div className="mt-1 text-3xl font-black text-[#ffe4a8]">{offerCost(offer, t)}</div>
            </div>

            <SceneButton onClick={onBuy} disabled={disabled} icon={disabled ? undefined : offer.cost.gems ? "gem" : offer.cost.gold ? "gold" : "offers"} tone={offer.cost.gems ? "sky" : "gold"} className={cn("mt-4 w-full", !disabled && "frontline-feedback-purchase")}>
              {disabled ? (
                <span className="inline-flex items-center gap-2">
                  <ShopIcon name={stateIcon} size="sm" className="h-7 w-7" />
                  {offer.oneTime ? t("shop.states.owned") : t("shop.states.soldOut")}
                </span>
              ) : (
                t("shop.actions.buy", { cost: offerCost(offer, t) })
              )}
            </SceneButton>

            <div className="mt-4 grid gap-2">
              <StoreStatusLine shopIcon={shopIconForValueTag(offer.valueTag)} icon="offers" label={t("shop.facts.valueTag")} value={valueTag ?? t("shop.facts.premiumStock")} />
              <StoreStatusLine icon="heroes" label={t("shop.facts.bestUse")} value={bestUseLabel(category, t)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MerchantConsole({
  resetLabel,
  gold,
  gems,
  dust,
  category,
  stockState,
  t,
}: {
  resetLabel: string;
  gold: number;
  gems: number;
  dust: number;
  category: ShopCategory;
  stockState: string;
  t: TranslateFn;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(9,11,17,0.9))] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{t("shop.facts.marketPulse")}</div>
          <div className="mt-1 text-lg font-black text-white">{stockState}</div>
        </div>
        <ShopIcon name={CATEGORY_SHOP_ICONS[category]} size="lg" className="h-14 w-14" />
      </div>
      <div className="mt-3 grid gap-2">
        <StoreStatusLine shopIcon="refresh" icon="rewards" label={t("shop.facts.reset")} value={resetLabel} compact />
        <StoreStatusLine resourceIcon="gold" icon="gold" label={t("shop.facts.gold")} value={`${gold}`} compact />
        <StoreStatusLine resourceIcon="dust" icon="dust" label={t("shop.facts.dust")} value={`${dust}`} compact />
        <StoreStatusLine resourceIcon="gems" icon="gem" label={t("shop.facts.gems")} value={`${gems}`} compact />
      </div>
    </div>
  );
}

export function SpotlightOfferCard({
  offer,
  remaining,
  bought,
  clientReady,
  t,
  feedbackActive,
  feedbackNonce,
  onBuy,
}: {
  offer: ExtendedShopOffer;
  remaining: number | null;
  bought: boolean;
  clientReady: boolean;
  t: TranslateFn;
  feedbackActive: boolean;
  feedbackNonce: number;
  onBuy: () => void;
}) {
  const disabled = remaining === 0;
  const label = offerStateLabel(offer, remaining, bought, t, true);
  const stateIcon = offerStateShopIcon(offer, remaining, bought, clientReady);
  const valueTag = offerValueTag(offer, t);

  return (
    <div className={cn("group relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(10,11,17,0.86))] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.2)]", feedbackActive && "frontline-reward-success")}>
      <div className={cn("pointer-events-none absolute right-[-10%] top-[-12%] h-32 w-32 rounded-full bg-gradient-to-br opacity-18 blur-[54px]", CATEGORY_TONES[offer.category])} />
      <ShopOfferRewardBurst key={`spotlight-burst-${feedbackNonce}`} offer={offer} active={feedbackActive} t={t} compact />
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {valueTag ? <ShopBadge icon={shopIconForValueTag(offer.valueTag)}>{valueTag}</ShopBadge> : null}
            {offer.hot ? <ShopBadge icon="hot_deal" tone="ember">{t("shop.states.hot")}</ShopBadge> : null}
          </div>
          <div className="mt-2 text-lg font-black leading-tight text-white">{offerName(offer, t)}</div>
          <div className="mt-1 line-clamp-2 text-[12px] leading-5 text-white/60">{offerDescription(offer, t)}</div>
        </div>
        <OfferShopVisualIcon offer={offer} size="md" className="h-12 w-12 shrink-0" />
      </div>

      <div className="relative z-[1] mt-3 flex flex-wrap gap-2">
        {buildRewardTokens(offer, t).map((token) => (
          <RewardToken key={`${token.label}-${token.hint}`} {...token} compact />
        ))}
      </div>

      <div className="relative z-[1] mt-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/56">
          <ShopIcon name={stateIcon} size="sm" className="h-6 w-6" />
          <span>{label}</span>
        </div>
        <SceneButton onClick={onBuy} disabled={disabled} icon={offer.cost.gems ? "gem" : offer.cost.gold ? "gold" : "offers"} tone={offer.cost.gems ? "sky" : "gold"} className={cn("px-4 py-2.5 text-[10px]", !disabled && "frontline-feedback-purchase")}>
          {disabled ? (offer.oneTime ? t("shop.states.owned") : t("shop.states.soldOut")) : offerCost(offer, t)}
        </SceneButton>
      </div>
    </div>
  );
}

export function ReserveOfferCard({
  offer,
  remaining,
  bought,
  clientReady,
  t,
  feedbackActive,
  feedbackNonce,
  onBuy,
}: {
  offer: ExtendedShopOffer;
  remaining: number | null;
  bought: boolean;
  clientReady: boolean;
  t: TranslateFn;
  feedbackActive: boolean;
  feedbackNonce: number;
  onBuy: () => void;
}) {
  const disabled = remaining === 0;
  const label = offer.dailyLimit ? t("shop.left", { count: `${remaining ?? 0}/${offer.dailyLimit}` }) : offer.oneTime ? (bought ? t("shop.states.ownedLower") : t("shop.states.oneTimeLower")) : t("shop.states.always");
  const stateIcon = offerStateShopIcon(offer, remaining, bought, clientReady);
  const valueTag = offerValueTag(offer, t);

  return (
    <div className={cn("relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(9,11,17,0.84))] p-3 shadow-[0_16px_34px_rgba(0,0,0,0.16)]", feedbackActive && "frontline-reward-success")}>
      <ShopOfferRewardBurst key={`reserve-burst-${feedbackNonce}`} offer={offer} active={feedbackActive} t={t} compact />
      <div className="flex items-start gap-3">
        <OfferShopVisualIcon offer={offer} size="md" className="h-12 w-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {valueTag ? <ShopBadge icon={shopIconForValueTag(offer.valueTag)}>{valueTag}</ShopBadge> : null}
            {offer.hot ? <ShopBadge icon="hot_deal" tone="ember">{t("shop.states.hot")}</ShopBadge> : null}
          </div>
          <div className="mt-2 text-base font-black text-white">{offerName(offer, t)}</div>
          <div className="mt-1 line-clamp-2 text-[12px] leading-5 text-white/58">{offerDescription(offer, t)}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {buildRewardTokens(offer, t).map((token) => (
          <RewardToken key={`${token.label}-${token.hint}`} {...token} compact />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/56">
          <ShopIcon name={stateIcon} size="sm" className="h-6 w-6" />
          <span>{label}</span>
        </div>
        <SceneButton onClick={onBuy} disabled={disabled} icon={offer.cost.gems ? "gem" : offer.cost.gold ? "gold" : "offers"} tone={offer.cost.gems ? "sky" : "gold"} className={cn("px-4 py-2.5 text-[10px]", !disabled && "frontline-feedback-purchase")}>
          {disabled ? (offer.oneTime ? t("shop.states.owned") : t("shop.states.soldOut")) : offerCost(offer, t)}
        </SceneButton>
      </div>
    </div>
  );
}

type RewardTokenDef = {
  label: string;
  hint: string;
  icon: GlyphKind | ResourceIconKind;
  tone: GameIconTone;
};

function buildRewardTokens(offer: ExtendedShopOffer, t: TranslateFn): RewardTokenDef[] {
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

function RewardToken({
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

function OfferShopVisualIcon({
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

function ShopOfferRewardBurst({
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

function BundleShowcase({
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
