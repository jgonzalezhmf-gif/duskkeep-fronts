"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LazyRewardFlightOverlay } from "@/components/game/shared/LazyRewardFlightOverlay";
import { usePendingActions } from "@/components/game/shared/PendingActionFeedback";
import { useI18n } from "@/lib/i18n/useI18n";
import { createPendingActionKey, isPendingAction } from "@/lib/pendingActions";
import { useGameStore } from "@/lib/store";
import {
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
  ScreenBadge,
  ScreenScaffold,
  SectionTitle,
} from "@/components/game/screens/ScreenChrome";
import {
  categoryLabel,
  fmtMs,
  handleBuyAsync,
  isOfferConsumed,
  nextMidnightMs,
} from "./shopPageHelpers";
import { ShopCategoryTabs } from "./ShopCategoryTabs";
import {
  StoreSummaryPill,
} from "./ShopStorePrimitives";
import {
  EmptyShopStock,
  LockedWingCard,
  MarketTopChrome,
} from "./ShopChrome";
import {
  FeaturedOfferStage,
  MerchantConsole,
  ReserveOfferCard,
  SpotlightOfferCard,
} from "./ShopOfferCards";

const INITIAL_SHOP_RESOURCES = { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 };
const INITIAL_SHOP_LEVEL = 1;
const RESET_PLACEHOLDER = "--h --m --s";

export default function ShopPage() {
  const { t } = useI18n();
  const [category, setCategory] = useState<ShopCategory>("featured");
  const [clientReady, setClientReady] = useState(false);
  const [ms, setMs] = useState(0);
  const [purchaseFx, setPurchaseFx] = useState<{ offerId: string; nonce: number } | null>(null);
  const { activeKeys: pendingKeys, runPendingAction } = usePendingActions();
  const purchasePending = pendingKeys.length > 0;
  const purchaseFxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const purchaseFxNonce = useRef(0);
  const resources = useGameStore((s) => s.resources);
  const adventureProgress = useGameStore((s) => s.adventureProgress);
  const level = useGameStore((s) => s.account.level);
  const buy = useGameStore((s) => s.purchaseOfferOnlineFirst);
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
  const buyWithFeedback = async (offer: ExtendedShopOffer) => {
    await runPendingAction(createPendingActionKey("shop.purchase", offer.id), async () => {
      const ok = await handleBuyAsync(offer, buy, pushNote, t);
      if (!ok) return;
      purchaseFxNonce.current += 1;
      setPurchaseFx({ offerId: offer.id, nonce: purchaseFxNonce.current });
      if (purchaseFxTimer.current) clearTimeout(purchaseFxTimer.current);
      purchaseFxTimer.current = setTimeout(() => setPurchaseFx(null), 1500);
    }, true);
  };

  return (
    <ScreenScaffold scene="shop" dock={false} hud={false} homeNav={false}>
      <MarketTopChrome resources={displayResources} showAdventureKeys={adventureKeysUnlocked} />
      <LazyRewardFlightOverlay rewards={purchaseFlightRewards} active={Boolean(purchaseFx && purchaseFlightRewards)} nonce={purchaseFx?.nonce} origin="center" />
      <div className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-3 pb-20 pt-40 sm:pt-32 md:px-6 md:pb-24 md:pt-24 xl:px-8">
        {!clientReady ? (
          <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(92,63,36,0.68),rgba(39,24,24,0.84)_38%,rgba(11,12,18,0.92)_74%)] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.34)]" aria-busy="true">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_16%,rgba(255,226,172,0.18),transparent_20%),radial-gradient(circle_at_83%_18%,rgba(130,193,255,0.12),transparent_17%)]" />
            <div className="relative z-[1]">
              <div className="flex flex-wrap gap-2">
                <div className="h-7 w-28 rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10" />
                <div className="h-7 w-24 rounded-full border border-sky-200/15 bg-sky-200/10" />
                <div className="h-7 w-20 rounded-full border border-white/10 bg-white/[0.05]" />
              </div>
              <div className="mt-4 h-10 max-w-[24rem] rounded-full bg-white/[0.07]" />
              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_17rem]">
                <div className="h-[23rem] rounded-[28px] border border-white/10 bg-white/[0.045]" />
                <div className="hidden h-[23rem] rounded-[28px] border border-white/10 bg-white/[0.04] xl:block" />
              </div>
            </div>
          </section>
        ) : (
          <>
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

            <ShopCategoryTabs
              activeCategory={category}
              displayLevel={displayLevel}
              t={t}
              onSelect={(nextCategory) => {
                setCategory(nextCategory);
                sfx.tap();
              }}
            />

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
                    pending={isPendingAction(pendingKeys, createPendingActionKey("shop.purchase", featured.id))}
                    busy={purchasePending}
                    pendingLabel={t("shop.actions.buying")}
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
                        pending={isPendingAction(pendingKeys, createPendingActionKey("shop.purchase", offer.id))}
                        busy={purchasePending}
                        pendingLabel={t("shop.actions.buying")}
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
                      pending={isPendingAction(pendingKeys, createPendingActionKey("shop.purchase", offer.id))}
                      busy={purchasePending}
                      pendingLabel={t("shop.actions.buying")}
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
          </>
        )}
      </div>
    </ScreenScaffold>
  );
}
