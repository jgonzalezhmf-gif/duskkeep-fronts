"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RewardFlightOverlay } from "@/components/game/shared/RewardFlightOverlay";
import { ShopIcon } from "@/components/game/shared/ShopIcon";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
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
} from "./shopPageHelpers";
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
