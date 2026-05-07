"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FrontlineCardView, FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import GameBackNav from "@/components/game/shared/GameBackNav";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameResourceBar, GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { RewardFlightOverlay } from "@/components/game/shared/RewardFlightOverlay";
import { isResourceIconKind, ResourceIcon, type ResourceIconKind } from "@/components/game/shared/ResourceIcon";
import { ShopIcon, type ShopIconName } from "@/components/game/shared/ShopIcon";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import { resolveGlyphAssetIcon } from "@/lib/iconAssets";
import { useGameStore } from "@/lib/store";
import {
  SHOP_CATEGORIES,
  SHOP_CATEGORY_UNLOCK_LEVEL,
  SHOP_OFFERS,
  type ExtendedShopOffer,
  type ShopCategory,
} from "@/data/shop";
import { isShopSectionUnlocked } from "@/data/unlocks";
import { isAdventureKeySystemUnlocked } from "@/features/adventure/mapInteractions";
import { FRONTLINE_CARD_BY_ID, FRONTLINE_HERO_BY_ID } from "@/features/frontline/data";
import { sfx } from "@/lib/audio";
import {
  SceneButton,
  ScreenBadge,
  ScreenScaffold,
  SectionTitle,
} from "@/components/game/screens/ScreenChrome";
import {
  CATEGORY_SHOP_ICONS,
  CATEGORY_TONES,
  bestUseLabel,
  categoryGlyph,
  categoryLabel,
  fmtMs,
  handleBuy,
  isOfferConsumed,
  nextMidnightMs,
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

const INITIAL_SHOP_RESOURCES = { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 };
const INITIAL_SHOP_LEVEL = 1;
const RESET_PLACEHOLDER = "--h --m --s";

export default function ShopPage() {
  const { t } = useI18n();
  const [category, setCategory] = useState<ShopCategory>("featured");
  const [clientReady, setClientReady] = useState(false);
  const [ms, setMs] = useState(0);
  const [purchaseFx, setPurchaseFx] = useState<{ offerId: string; nonce: number } | null>(null);
  const purchaseFxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const purchaseFxNonce = useRef(0);
  const resources = useGameStore((s) => s.resources);
  const adventureProgress = useGameStore((s) => s.adventureProgress);
  const level = useGameStore((s) => s.account.level);
  const buy = useGameStore((s) => s.purchaseOffer);
  const pushNote = useGameStore((s) => s.pushNotification);
  const refresh = useGameStore((s) => s.refreshShopIfNeeded);
  const remaining = useGameStore((s) => s.offerRemaining);
  const shopPurchases = useGameStore((s) => s.shopPurchases);
  const dailyShop = useGameStore((s) => s.dailyShopPurchases);

  useEffect(() => {
    setClientReady(true);
    refresh();
    setMs(nextMidnightMs());
    const id = setInterval(() => setMs(nextMidnightMs()), 1000);
    return () => {
      clearInterval(id);
      if (purchaseFxTimer.current) clearTimeout(purchaseFxTimer.current);
    };
  }, [refresh]);

  const offers = useMemo(() => SHOP_OFFERS.filter((offer) => offer.category === category), [category]);
  const displayLevel = clientReady ? level : INITIAL_SHOP_LEVEL;
  const displayResources = clientReady ? resources : INITIAL_SHOP_RESOURCES;
  const adventureKeysUnlocked = clientReady && isAdventureKeySystemUnlocked(adventureProgress);
  const resetLabel = clientReady ? fmtMs(ms) : RESET_PLACEHOLDER;
  const getVisibleRemaining = (offer: ExtendedShopOffer) => (clientReady ? remaining(offer.id) : offer.dailyLimit ?? null);
  const getVisibleBought = (offer: ExtendedShopOffer) =>
    clientReady ? (shopPurchases[offer.id] ?? 0) + (dailyShop[offer.id] ?? 0) > 0 : false;
  const unlocked = isShopSectionUnlocked(category, displayLevel);
  const reqLevel = SHOP_CATEGORY_UNLOCK_LEVEL[category] ?? 1;
  const visibleOffers = offers.filter((offer) => {
    const isFeedbackOffer = purchaseFx?.offerId === offer.id;
    if (isFeedbackOffer) return true;
    if (offer.contents.adventureKeys && !adventureKeysUnlocked) return false;
    return !isOfferConsumed(offer, getVisibleRemaining(offer), getVisibleBought(offer), clientReady);
  });
  const featured = visibleOffers[0] ?? null;
  const spotlight = visibleOffers.slice(1, 4);
  const reserve = visibleOffers.slice(4);
  const purchaseFlightRewards = purchaseFx ? SHOP_OFFERS.find((offer) => offer.id === purchaseFx.offerId)?.contents ?? null : null;
  const totalRemaining = visibleOffers
    .map((offer) => getVisibleRemaining(offer))
    .filter((value): value is number => value !== null)
    .reduce((sum, value) => sum + value, 0);
  const stockState = visibleOffers.some((offer) => getVisibleRemaining(offer) === null)
    ? t("shop.openStock")
    : t("shop.left", { count: totalRemaining });
  const buyWithFeedback = (offer: ExtendedShopOffer) => {
    const ok = handleBuy(offer, buy, pushNote, t);
    if (!ok) return;
    purchaseFxNonce.current += 1;
    setPurchaseFx({ offerId: offer.id, nonce: purchaseFxNonce.current });
    if (purchaseFxTimer.current) clearTimeout(purchaseFxTimer.current);
    purchaseFxTimer.current = setTimeout(() => setPurchaseFx(null), 1500);
  };

  return (
    <ScreenScaffold scene="shop" dock={false} hud={false} homeNav={false}>
      <MarketTopChrome resources={displayResources} showAdventureKeys={adventureKeysUnlocked} />
      <RewardFlightOverlay rewards={purchaseFlightRewards} active={Boolean(purchaseFx && purchaseFlightRewards)} nonce={purchaseFx?.nonce} origin="center" />
      <div className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-3 pb-20 pt-40 sm:pt-32 md:px-6 md:pb-24 md:pt-24 xl:px-8">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(92,63,36,0.74),rgba(39,24,24,0.86)_34%,rgba(11,12,18,0.94)_72%)] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_16%,rgba(255,226,172,0.26),transparent_20%),radial-gradient(circle_at_83%_18%,rgba(130,193,255,0.16),transparent_17%),radial-gradient(circle_at_56%_82%,rgba(255,144,94,0.14),transparent_21%)]" />
          <div className="pointer-events-none absolute left-[-4%] top-[12%] h-56 w-56 rounded-full bg-[#f5c451]/14 blur-[88px]" />
          <div className="pointer-events-none absolute right-[-2%] top-[10%] h-52 w-52 rounded-full bg-sky-300/10 blur-[84px]" />

          <div className="relative z-[1] px-4 py-4 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <ScreenBadge tone="gold">{t("shop.grandBazaar")}</ScreenBadge>
                  <ScreenBadge tone="sky">{t("shop.wing", { category: categoryLabel(category, t) })}</ScreenBadge>
                  <ScreenBadge tone="neutral">{stockState}</ScreenBadge>
                </div>
                <div className="mt-3 max-w-[36rem] text-[2rem] font-black leading-[0.92] text-white md:text-[3rem]">
                  {t("shop.grandBazaar")}
                </div>
              </div>

              <div className="grid min-w-[14rem] gap-2 sm:grid-cols-2">
                <StoreSummaryPill label={t("shop.facts.reset")} value={resetLabel} icon="rewards" shopIcon="refresh" />
                <StoreSummaryPill label={t("shop.facts.level")} value={t("shop.levelValue", { level: displayLevel })} icon="fortress" progressionIcon="level_up" />
                <StoreSummaryPill label={t("shop.facts.gold")} value={`${displayResources.gold}`} icon="gold" resourceIcon="gold" />
                <StoreSummaryPill label={t("shop.facts.gems")} value={`${displayResources.gems}`} icon="gem" resourceIcon="gems" />
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-5">
              {SHOP_CATEGORIES.map((item) => {
                const itemUnlocked = isShopSectionUnlocked(item.id, displayLevel);
                const active = category === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCategory(item.id);
                      sfx.tap();
                    }}
                    className={cn(
                      "frontline-motion-tab group relative overflow-hidden rounded-[20px] border px-3 py-2.5 text-left transition",
                      active
                        ? "border-[#ffe6a8]/34 bg-[linear-gradient(180deg,rgba(255,248,217,0.18),rgba(84,52,22,0.36),rgba(10,11,18,0.92))] shadow-[0_20px_42px_rgba(245,196,81,0.2)]"
                        : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(10,11,18,0.88))] hover:border-[#f5c451]/24 hover:bg-[#f5c451]/8",
                      !itemUnlocked && "opacity-55",
                    )}
                  >
                    <span className={cn("pointer-events-none absolute inset-x-6 top-0 h-10 rounded-full bg-gradient-to-b opacity-0 blur-lg transition group-hover:opacity-100", CATEGORY_TONES[item.id])} />
                    <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.26),transparent)]" />
                    <div className="relative z-[1] flex items-center gap-3">
                      <ShopIcon name={CATEGORY_SHOP_ICONS[item.id]} size="md" className="h-11 w-11 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-white/42">
                          {itemUnlocked ? t("shop.openDistrict") : t("shop.levelValue", { level: SHOP_CATEGORY_UNLOCK_LEVEL[item.id] ?? 1 })}
                        </div>
                        <div className="mt-1 text-sm font-black text-white">{categoryLabel(item.id, t)}</div>
                      </div>
                    </div>
                    <div className="relative z-[1] mt-2 inline-flex rounded-full border border-white/10 bg-black/24 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/58">
                      {active ? t("shop.states.selected") : itemUnlocked ? t("shop.states.open") : t("shop.states.locked")}
                    </div>
                  </button>
                );
              })}
            </div>

            {!unlocked ? (
              <LockedWingCard
                reqLevel={reqLevel}
                level={displayLevel}
                t={t}
              />
            ) : featured ? (
              <>
                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_17rem]">
                  <FeaturedOfferStage
                    offer={featured}
                    category={category}
                    remaining={getVisibleRemaining(featured)}
                    bought={getVisibleBought(featured)}
                    clientReady={clientReady}
                    t={t}
                    feedbackActive={purchaseFx?.offerId === featured.id}
                    feedbackNonce={purchaseFx?.nonce ?? 0}
                    onBuy={() => buyWithFeedback(featured)}
                  />
                  <MerchantConsole
                    resetLabel={resetLabel}
                    gold={displayResources.gold}
                    gems={displayResources.gems}
                    dust={displayResources.dust}
                    category={category}
                    stockState={stockState}
                    t={t}
                  />
                </div>

                {spotlight.length ? (
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {spotlight.map((offer) => (
                      <SpotlightOfferCard
                        key={offer.id}
                        offer={offer}
                        remaining={getVisibleRemaining(offer)}
                        bought={getVisibleBought(offer)}
                        clientReady={clientReady}
                        t={t}
                        feedbackActive={purchaseFx?.offerId === offer.id}
                        feedbackNonce={purchaseFx?.nonce ?? 0}
                        onBuy={() => buyWithFeedback(offer)}
                      />
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyShopStock category={category} resetLabel={resetLabel} t={t} />
            )}
          </div>
        </section>

        {unlocked && featured ? (
          <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(10,11,18,0.88))] px-4 py-4 shadow-[0_22px_58px_rgba(0,0,0,0.24)] md:px-5">
            <SectionTitle
              eyebrow={t("shop.reserve.eyebrow")}
              title={t("shop.reserve.title")}
              aside={<ScreenBadge tone="sky">{t("shop.reserve.items", { count: reserve.length })}</ScreenBadge>}
            />
            <div className="mt-4 grid gap-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {reserve.length ? (
                  reserve.map((offer) => (
                    <ReserveOfferCard
                      key={offer.id}
                      offer={offer}
                      remaining={getVisibleRemaining(offer)}
                      bought={getVisibleBought(offer)}
                      clientReady={clientReady}
                      t={t}
                      feedbackActive={purchaseFx?.offerId === offer.id}
                      feedbackNonce={purchaseFx?.nonce ?? 0}
                      onBuy={() => buyWithFeedback(offer)}
                    />
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-5 text-center text-sm text-white/56 md:col-span-2 xl:col-span-4">
                    {t("shop.reserve.empty")}
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </ScreenScaffold>
  );
}

function LockedWingCard({
  reqLevel,
  level,
  t,
}: {
  reqLevel: number;
  level: number;
  t: TranslateFn;
}) {
  return (
    <div className="mt-5 grid min-h-[22rem] place-items-center rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(10,11,18,0.92))] px-6 py-8 text-center">
      <div className="max-w-[32rem]">
        <ProgressionIcon name="unlock" size="xl" className="mx-auto h-24 w-24" />
        <div className="mt-5 text-[10px] uppercase tracking-[0.24em] text-white/44">{t("shop.lockedWing.eyebrow")}</div>
        <div className="mt-2 text-3xl font-black text-white">{t("shop.lockedWing.title", { level: reqLevel })}</div>
        <div className="mt-3 text-sm leading-7 text-white/64">
          {t("shop.lockedWing.body", { level })}
        </div>
      </div>
    </div>
  );
}

function EmptyShopStock({ category, resetLabel, t }: { category: ShopCategory; resetLabel: string; t: TranslateFn }) {
  return (
    <div className="mt-5 grid min-h-[22rem] place-items-center rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(10,11,18,0.92))] px-6 py-8 text-center">
      <div className="max-w-[34rem]">
        <ShopIcon name={category === "daily" ? "refresh" : "sold_out"} size="xl" className="mx-auto h-24 w-24" />
        <div className="mt-5 text-[10px] uppercase tracking-[0.24em] text-white/44">{t("shop.emptyStock.eyebrow")}</div>
        <div className="mt-2 text-3xl font-black text-white">{t("shop.emptyStock.title", { category: categoryLabel(category, t) })}</div>
        <div className="mt-3 text-sm leading-7 text-white/64">
          {category === "daily" ? t("shop.emptyStock.daily", { reset: resetLabel }) : t("shop.emptyStock.default")}
        </div>
      </div>
    </div>
  );
}

function MarketTopChrome({ resources, showAdventureKeys }: { resources: { gold: number; dust: number; gems: number; adventureKeys?: number }; showAdventureKeys?: boolean }) {
  const { t } = useI18n();

  return (
    <div className="pointer-events-none fixed inset-x-3 top-4 z-30 flex items-start justify-between gap-2 md:inset-x-5 md:gap-3">
      <div className="pointer-events-auto">
        <GameBackNav label={t("common.home")} eyebrow={t("nav.market")} icon="market" tone="emerald" placement="top-left" />
      </div>
      <GameResourceBar resources={resources} adventureKeys={showAdventureKeys ? resources.adventureKeys ?? 0 : undefined} size="md" className="pointer-events-auto max-w-[calc(100vw-9rem)] md:max-w-none" />
    </div>
  );
}

function ShopBadge({
  icon,
  children,
  tone = "gold",
}: {
  icon: ShopIconName;
  children: ReactNode;
  tone?: "gold" | "ember" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]",
        tone === "ember"
          ? "border-orange-200/18 bg-orange-400/12 text-orange-100"
          : tone === "neutral"
            ? "border-white/10 bg-black/20 text-white/62"
            : "border-[#f5c451]/22 bg-[#f5c451]/12 text-[#f5d498]",
      )}
    >
      <ShopIcon name={icon} size="sm" className="h-6 w-6" />
      <span>{children}</span>
    </span>
  );
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

function FeaturedOfferStage({
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

function MerchantConsole({
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

function SpotlightOfferCard({
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

function ReserveOfferCard({
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

function StoreMiniFact({
  label,
  value,
  icon,
  shopIcon,
  resourceIcon,
  progressionIcon,
}: {
  label: string;
  value: string;
  icon: GlyphKind;
  shopIcon?: ShopIconName;
  resourceIcon?: ResourceIconKind;
  progressionIcon?: "claim" | "unlock" | "reward_chest" | "level_up";
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/18 px-3 py-3">
      <div className="flex items-start gap-3">
        {shopIcon ? (
          <ShopIcon name={shopIcon} size="md" className="h-10 w-10 shrink-0" />
        ) : resourceIcon ? (
          <ResourceIcon kind={resourceIcon} size="medium" className="h-10 w-10 shrink-0" />
        ) : progressionIcon ? (
          <ProgressionIcon name={progressionIcon} size="md" />
        ) : (
          <StoreGlyph icon={icon} tone="from-[#fff3c7] via-[#f5c451] to-[#c77716]" className="h-10 w-10 shrink-0" />
        )}
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/46">{label}</div>
          <div className="mt-1 text-sm font-black leading-5 text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function StoreSummaryPill({
  label,
  value,
  icon,
  shopIcon,
  resourceIcon,
  progressionIcon,
}: {
  label: string;
  value: string;
  icon: GlyphKind;
  shopIcon?: ShopIconName;
  resourceIcon?: ResourceIconKind;
  progressionIcon?: "claim" | "unlock" | "reward_chest" | "level_up";
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(9,11,17,0.94))] px-3 py-3">
      <div className="flex items-center gap-3">
        {shopIcon ? (
          <ShopIcon name={shopIcon} size="md" className="h-10 w-10 shrink-0" />
        ) : resourceIcon ? (
          <ResourceIcon kind={resourceIcon} size="medium" className="h-10 w-10 shrink-0" />
        ) : progressionIcon ? (
          <ProgressionIcon name={progressionIcon} size="md" className="h-10 w-10 shrink-0" />
        ) : (
          <StoreGlyph icon={icon} tone="from-[#fff3c7] via-[#f5c451] to-[#c77716]" className="h-10 w-10 shrink-0" />
        )}
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.16em] text-white/44">{label}</div>
          <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function StoreStatusLine({
  icon,
  label,
  value,
  shopIcon,
  resourceIcon,
  progressionIcon,
  compact,
}: {
  icon: GlyphKind;
  label: string;
  value: string;
  shopIcon?: ShopIconName;
  resourceIcon?: ResourceIconKind;
  progressionIcon?: "claim" | "unlock" | "reward_chest" | "level_up";
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] px-3", compact ? "py-2" : "py-3")}>
      {shopIcon ? (
        <ShopIcon name={shopIcon} size="md" className={cn("shrink-0", compact ? "h-8 w-8" : "h-10 w-10")} />
      ) : resourceIcon ? (
        <ResourceIcon kind={resourceIcon} size="medium" className={cn("shrink-0", compact ? "h-8 w-8" : "h-10 w-10")} />
      ) : progressionIcon ? (
        <ProgressionIcon name={progressionIcon} size="md" className={cn("shrink-0", compact ? "h-8 w-8" : "h-10 w-10")} />
      ) : (
        <StoreGlyph icon={icon} tone="from-[#fff3c7] via-[#f5c451] to-[#c77716]" className={cn("shrink-0", compact ? "h-8 w-8" : "h-10 w-10")} />
      )}
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-[0.16em] text-white/44">{label}</div>
        <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
      </div>
    </div>
  );
}

function StoreGlyph({
  icon,
  tone,
  className,
}: {
  icon: GlyphKind;
  tone: string;
  className?: string;
}) {
  const assetIcon = resolveGlyphAssetIcon(icon);

  if (assetIcon) {
    return (
      <span
        className={cn(
          "group/store-icon relative isolate inline-grid shrink-0 place-items-center overflow-visible",
          className,
        )}
      >
        <span className={cn("pointer-events-none absolute -inset-4 rounded-[999px] bg-gradient-to-br opacity-38 blur-xl transition group-hover/store-icon:opacity-60", tone)} />
        <span className="pointer-events-none absolute -inset-1 rounded-[999px] bg-[radial-gradient(circle,rgba(255,255,255,0.15),transparent_62%)]" />
        <GameAssetIcon
          category={assetIcon.category}
          name={assetIcon.name}
          size="xl"
          className="relative z-[1] h-[112%] w-[112%]"
          imgClassName="drop-shadow-[0_12px_20px_rgba(0,0,0,0.48)] transition duration-300 group-hover/store-icon:scale-110"
          fallback={<GameGlyph kind={icon} shell="none" className="h-full w-full text-[#1d1204] drop-shadow-[0_5px_8px_rgba(255,255,255,0.18)]" />}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative isolate inline-flex items-center justify-center overflow-hidden rounded-[28px] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(10,12,18,0.98))] shadow-[0_18px_32px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.26),inset_0_-10px_18px_rgba(0,0,0,0.28)]",
        className,
      )}
    >
      <span className={cn("absolute inset-[4px] rounded-[22px] bg-gradient-to-br opacity-95", tone)} />
      <span className="absolute inset-[9px] rounded-[18px] border border-white/24" />
      <span className="absolute left-[14%] top-[12%] h-2 w-2 rounded-full bg-white/45 shadow-[0_0_12px_rgba(255,255,255,0.44)]" />
      <span className="absolute inset-x-[22%] top-[8%] h-[24%] rounded-full bg-white/28 blur-md" />
      <span className="absolute inset-x-[22%] bottom-[10%] h-px bg-black/24" />
      <GameGlyph kind={icon} shell="none" className="relative z-[1] h-[58%] w-[58%] text-[#1d1204] drop-shadow-[0_5px_8px_rgba(255,255,255,0.18)]" />
    </span>
  );
}
