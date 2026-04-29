"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
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
import { describeRewards } from "@/features/battle/rewards";
import { FRONTLINE_CARD_BY_ID, FRONTLINE_HERO_BY_ID } from "@/features/frontline/data";
import { sfx } from "@/lib/audio";
import {
  SceneButton,
  ScreenBadge,
  ScreenScaffold,
  SectionTitle,
} from "@/components/game/screens/ScreenChrome";

const INITIAL_SHOP_RESOURCES = { gold: 500, dust: 50, gems: 50, arenaTickets: 5 };
const INITIAL_SHOP_LEVEL = 1;
const RESET_PLACEHOLDER = "--h --m --s";

const CATEGORY_SHOP_ICONS: Record<ShopCategory, ShopIconName> = {
  featured: "featured",
  daily: "daily_offer",
  resources: "premium_pack",
  shards: "bundle",
  consumables: "limited_time",
};

const CATEGORY_TONES: Record<ShopCategory, string> = {
  featured: "from-[#fff4c9] via-[#f5c451] to-[#b86118]",
  daily: "from-[#e4f4ff] via-[#86c8ff] to-[#2d63b5]",
  resources: "from-[#e7ffe9] via-[#78d8a3] to-[#1d7553]",
  shards: "from-[#f4ddff] via-[#ca8cff] to-[#6b35aa]",
  consumables: "from-[#ffe1c4] via-[#ff9f67] to-[#ac4720]",
};

const VALUE_TAG_SHOP_ICONS: Record<string, ShopIconName> = {
  "best value": "best_value",
  "card prep": "premium_pack",
  fortress: "bundle",
  daily: "daily_offer",
  upgrade: "discount",
  crafting: "premium_pack",
  balanced: "discount",
  training: "premium_pack",
  ladder: "bundle",
  tank: "bundle",
  striker: "bundle",
  healer: "bundle",
  breach: "bundle",
  finisher: "bundle",
  support: "bundle",
};

function nextMidnightMs() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function fmtMs(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function tx(t: TranslateFn, key: string, fallback: string, params?: Record<string, string | number>) {
  const value = t(key, params);
  return value === key ? fallback : value;
}

function categoryLabel(category: ShopCategory, t: TranslateFn) {
  return tx(t, `shop.categories.${category}.label`, category);
}

function categoryHint(category: ShopCategory, t: TranslateFn) {
  return tx(t, `shop.categories.${category}.hint`, "");
}

function categoryShort(category: ShopCategory, t: TranslateFn) {
  return tx(t, `shop.categoryShort.${category}`, categoryLabel(category, t));
}

function offerName(offer: ExtendedShopOffer, t: TranslateFn) {
  return tx(t, `shop.offers.${offer.id}.name`, offer.name);
}

function offerDescription(offer: ExtendedShopOffer, t: TranslateFn) {
  return tx(t, `shop.offers.${offer.id}.description`, offer.description);
}

function offerValueTag(offer: ExtendedShopOffer, t: TranslateFn) {
  if (!offer.valueTag) return undefined;
  return tx(t, `shop.offers.${offer.id}.valueTag`, offer.valueTag);
}

function offerCost(offer: ExtendedShopOffer, t: TranslateFn) {
  if (offer.cost.gems && offer.cost.gems > 0) return t("shop.costs.gems", { amount: offer.cost.gems });
  if (offer.cost.gold && offer.cost.gold > 0) return t("shop.costs.gold", { amount: offer.cost.gold });
  return t("shop.costs.free");
}

function offerStateLabel(offer: ExtendedShopOffer, remaining: number | null, bought: boolean, t: TranslateFn, compact = false) {
  if (offer.dailyLimit) return t("shop.left", { count: `${remaining ?? 0}/${offer.dailyLimit}` });
  if (offer.oneTime) return bought ? t(compact ? "shop.states.ownedLower" : "shop.states.owned") : t(compact ? "shop.states.oneTimeLower" : "shop.states.oneTime");
  return compact ? t("shop.states.open") : t("shop.openStock");
}

function productLineLabel(offer: ExtendedShopOffer, t: TranslateFn) {
  if (!offer.productLine) return describeRewards(offer.contents);
  const line = tx(t, `shop.productLines.${offer.productLine}`, offer.productLine);
  return t("shop.productLineStock", { line });
}

function bestUseLabel(category: ShopCategory, t: TranslateFn) {
  if (category === "shards") return t("shop.bestUse.shards");
  if (category === "resources") return t("shop.bestUse.resources");
  return t("shop.bestUse.default");
}

function offerSearchText(offer: ExtendedShopOffer) {
  return `${offer.name} ${offer.description} ${offer.valueTag ?? ""} ${offer.productLine ?? ""}`.toLowerCase();
}

function hasOfferSignal(offer: ExtendedShopOffer, signals: string[]) {
  const text = offerSearchText(offer);
  return signals.some((signal) => text.includes(signal));
}

function offerShopIcon(offer: ExtendedShopOffer): ShopIconName {
  const tagIcon = shopIconForValueTag(offer.valueTag);

  if (!offer.cost.gems && !offer.cost.gold) return "free_claim";
  if (offer.valueTag?.toLowerCase().includes("best")) return "best_value";
  if (offer.hot) return "hot_deal";
  if (tagIcon !== "featured") return tagIcon;
  if (offer.category === "daily") return "daily_offer";
  if (offer.category === "shards" || offer.productLine === "hero") return "bundle";
  if (offer.productLine === "frontline") return "premium_pack";
  if (offer.productLine === "resource" || hasOfferSignal(offer, ["gold", "dust", "supplies", "stock", "chest", "crate", "upgrade"])) return "discount";
  if (offer.productLine === "fortress" || offer.productLine === "arena") return "bundle";
  return CATEGORY_SHOP_ICONS[offer.category] ?? "bundle";
}

function offerStateShopIcon(offer: ExtendedShopOffer, remaining: number | null, bought: boolean, clientReady: boolean): ShopIconName {
  if (!clientReady) return offerShopIcon(offer);
  if (bought && offer.oneTime) return "owned";
  if (remaining === 0) return "sold_out";
  if (!offer.cost.gems && !offer.cost.gold) return "free_claim";
  if (offer.dailyLimit) return "limited_time";
  return offerShopIcon(offer);
}

function isOfferConsumed(offer: ExtendedShopOffer, remaining: number | null, bought: boolean, clientReady: boolean) {
  if (!clientReady) return false;
  if (offer.oneTime && bought) return true;
  if (offer.dailyLimit && remaining === 0) return true;
  return false;
}

function productLineShopIcon(offer: ExtendedShopOffer): ShopIconName {
  if (offer.productLine === "frontline") return "premium_pack";
  if (offer.productLine === "resource") return "discount";
  if (offer.productLine === "hero" || offer.productLine === "fortress" || offer.productLine === "arena") return "bundle";
  return offerShopIcon(offer);
}

function shopIconForValueTag(valueTag?: string): ShopIconName {
  const tag = valueTag?.toLowerCase() ?? "";
  const exactMatch = VALUE_TAG_SHOP_ICONS[tag];
  if (exactMatch) return exactMatch;
  if (tag.includes("best")) return "best_value";
  if (tag.includes("daily")) return "daily_offer";
  if (tag.includes("free")) return "free_claim";
  if (tag.includes("discount")) return "discount";
  if (tag.includes("card") || tag.includes("craft") || tag.includes("train")) return "premium_pack";
  if (tag.includes("fortress") || tag.includes("ladder") || tag.includes("tank") || tag.includes("striker") || tag.includes("healer") || tag.includes("breach") || tag.includes("finisher") || tag.includes("support")) return "bundle";
  if (tag.includes("upgrade") || tag.includes("balanced")) return "discount";
  return "featured";
}

export default function ShopPage() {
  const { t } = useI18n();
  const [category, setCategory] = useState<ShopCategory>("featured");
  const [clientReady, setClientReady] = useState(false);
  const [ms, setMs] = useState(0);
  const [purchaseFx, setPurchaseFx] = useState<{ offerId: string; nonce: number } | null>(null);
  const purchaseFxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const purchaseFxNonce = useRef(0);
  const resources = useGameStore((s) => s.resources);
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
  const resetLabel = clientReady ? fmtMs(ms) : RESET_PLACEHOLDER;
  const getVisibleRemaining = (offer: ExtendedShopOffer) => (clientReady ? remaining(offer.id) : offer.dailyLimit ?? null);
  const getVisibleBought = (offer: ExtendedShopOffer) =>
    clientReady ? (shopPurchases[offer.id] ?? 0) + (dailyShop[offer.id] ?? 0) > 0 : false;
  const unlocked = isShopSectionUnlocked(category, displayLevel);
  const reqLevel = SHOP_CATEGORY_UNLOCK_LEVEL[category] ?? 1;
  const visibleOffers = offers.filter((offer) => {
    const isFeedbackOffer = purchaseFx?.offerId === offer.id;
    if (isFeedbackOffer) return true;
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
      <MarketTopChrome resources={displayResources} />
      <RewardFlightOverlay rewards={purchaseFlightRewards} active={Boolean(purchaseFx && purchaseFlightRewards)} nonce={purchaseFx?.nonce} origin="center" />
      <div className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-3 pb-24 pt-44 sm:pt-36 md:px-6 md:pb-28 md:pt-28 xl:px-8">
        <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(135deg,rgba(92,63,36,0.88),rgba(39,24,24,0.93)_34%,rgba(11,12,18,0.98)_72%)] shadow-[0_34px_92px_rgba(0,0,0,0.36)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_16%,rgba(255,226,172,0.26),transparent_20%),radial-gradient(circle_at_83%_18%,rgba(130,193,255,0.16),transparent_17%),radial-gradient(circle_at_56%_82%,rgba(255,144,94,0.14),transparent_21%)]" />
          <div className="pointer-events-none absolute left-[-4%] top-[12%] h-56 w-56 rounded-full bg-[#f5c451]/14 blur-[88px]" />
          <div className="pointer-events-none absolute right-[-2%] top-[10%] h-52 w-52 rounded-full bg-sky-300/10 blur-[84px]" />

          <div className="relative z-[1] px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <ScreenBadge tone="gold">{t("shop.grandBazaar")}</ScreenBadge>
                  <ScreenBadge tone="sky">{t("shop.wing", { category: categoryLabel(category, t) })}</ScreenBadge>
                  <ScreenBadge tone="neutral">{stockState}</ScreenBadge>
                </div>
                <div className="mt-4 max-w-[50rem] text-[2.2rem] font-black leading-[0.92] text-white md:text-[3.65rem]">
                  {t("shop.heroTitle")}
                </div>
                <p className="mt-3 max-w-[44rem] text-[13px] leading-7 text-white/72 md:text-[14px]">
                  {categoryHint(category, t)}
                </p>
              </div>

              <div className="grid min-w-[16rem] gap-2 sm:grid-cols-2">
                <StoreSummaryPill label={t("shop.facts.reset")} value={resetLabel} icon="rewards" shopIcon="refresh" />
                <StoreSummaryPill label={t("shop.facts.level")} value={t("shop.levelValue", { level: displayLevel })} icon="fortress" progressionIcon="level_up" />
                <StoreSummaryPill label={t("shop.facts.gold")} value={`${displayResources.gold}`} icon="gold" resourceIcon="gold" />
                <StoreSummaryPill label={t("shop.facts.gems")} value={`${displayResources.gems}`} icon="gem" resourceIcon="gems" />
              </div>
            </div>

            <div className="mt-5 grid gap-2 md:grid-cols-3 xl:grid-cols-5">
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
                      "frontline-motion-tab group relative overflow-hidden rounded-[24px] border px-3 py-3 text-left transition",
                      active
                        ? "border-[#ffe6a8]/34 bg-[linear-gradient(180deg,rgba(255,248,217,0.18),rgba(84,52,22,0.36),rgba(10,11,18,0.92))] shadow-[0_20px_42px_rgba(245,196,81,0.2)]"
                        : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(10,11,18,0.88))] hover:border-[#f5c451]/24 hover:bg-[#f5c451]/8",
                      !itemUnlocked && "opacity-55",
                    )}
                  >
                    <span className={cn("pointer-events-none absolute inset-x-6 top-0 h-10 rounded-full bg-gradient-to-b opacity-0 blur-lg transition group-hover:opacity-100", CATEGORY_TONES[item.id])} />
                    <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.26),transparent)]" />
                    <div className="relative z-[1] flex items-center gap-3">
                      <ShopIcon name={CATEGORY_SHOP_ICONS[item.id]} size="lg" className="h-14 w-14 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-white/42">
                          {itemUnlocked ? t("shop.openDistrict") : t("shop.levelValue", { level: SHOP_CATEGORY_UNLOCK_LEVEL[item.id] ?? 1 })}
                        </div>
                        <div className="mt-1 text-sm font-black text-white">{categoryLabel(item.id, t)}</div>
                        <div className="mt-1 text-[11px] leading-5 text-white/56">{categoryShort(item.id, t)}</div>
                      </div>
                    </div>
                    <div className="relative z-[1] mt-3 inline-flex rounded-full border border-white/10 bg-black/24 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/58">
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
                <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.42fr)_20rem]">
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
                    level={displayLevel}
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
          <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(10,11,18,0.94))] px-4 py-5 shadow-[0_26px_72px_rgba(0,0,0,0.28)] md:px-6 md:py-6">
            <SectionTitle
              eyebrow={t("shop.reserve.eyebrow")}
              title={t("shop.reserve.title")}
              aside={<ScreenBadge tone="sky">{t("shop.reserve.items", { count: reserve.length })}</ScreenBadge>}
            />
            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.04] px-4 py-10 text-center text-sm text-white/56 md:col-span-2 xl:col-span-3">
                    {t("shop.reserve.empty")}
                  </div>
                )}
              </div>

              <StoreMerchRail category={category} t={t} />
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

function MarketTopChrome({ resources }: { resources: { gold: number; dust: number; gems: number } }) {
  const { t } = useI18n();

  return (
    <div className="pointer-events-none fixed inset-x-3 top-4 z-30 flex items-start justify-between gap-2 md:inset-x-5 md:gap-3">
      <div className="pointer-events-auto">
        <GameBackNav label={t("common.home")} eyebrow={t("nav.market")} icon="market" tone="emerald" placement="top-left" />
      </div>
      <GameResourceBar resources={resources} size="md" className="pointer-events-auto max-w-[calc(100vw-9rem)] md:max-w-none" />
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
        <ShopIcon name={offerShopIcon(offer)} size={compact ? "md" : "lg"} className={compact ? "h-10 w-10" : "h-14 w-14"} />
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
    <div className={cn("relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(12,12,18,0.94))] p-5 shadow-[0_26px_58px_rgba(0,0,0,0.26)] md:p-6", feedbackActive && "frontline-reward-success")}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,228,175,0.24),transparent_22%),radial-gradient(circle_at_82%_74%,rgba(130,193,255,0.12),transparent_18%)]" />
      <ShopOfferRewardBurst key={`featured-burst-${feedbackNonce}`} offer={offer} active={feedbackActive} t={t} />
      <div className="relative z-[1] grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <ShopBadge icon={shopIconForValueTag(offer.valueTag)}>{valueTag ?? t("shop.states.merchantSpotlight")}</ShopBadge>
            {offer.hot ? <ShopBadge icon="hot_deal" tone="ember">{t("shop.states.hotDrop")}</ShopBadge> : null}
            <ShopBadge icon={stateIcon} tone="neutral">{stateLabel}</ShopBadge>
          </div>

          <div className="mt-4 flex items-start gap-4">
            <ShopIcon name={offerShopIcon(offer)} size="xl" className="hidden h-20 w-20 shrink-0 md:inline-grid" />
            <div className="min-w-0">
              <div className="text-[2rem] font-black leading-[0.92] text-white md:text-[3.05rem]">{offerName(offer, t)}</div>
              <p className="mt-3 max-w-[40rem] text-[13px] leading-7 text-white/70 md:text-[14px]">{offerDescription(offer, t)}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <BundleShowcase icon={offerIcon} offer={offer} t={t} />
            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(10,11,17,0.92))] p-4">
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

              <div className="grid gap-3 md:grid-cols-3">
                <StoreMiniFact shopIcon={productLineShopIcon(offer)} icon="offers" label={t("shop.facts.bundleType")} value={productLineLabel(offer, t)} />
                <StoreMiniFact resourceIcon={offer.cost.gems ? "gems" : offer.cost.gold ? "gold" : undefined} shopIcon={!offer.cost.gems && !offer.cost.gold ? "free_claim" : undefined} icon={offer.cost.gems ? "gem" : "gold"} label={t("shop.facts.checkout")} value={offerCost(offer, t)} />
                <StoreMiniFact shopIcon={stateIcon} icon="rewards" label={t("shop.facts.availability")} value={stateLabel} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(9,11,17,0.96))] p-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#f5d498]">{t("shop.facts.checkoutRail")}</div>
            <div className="mt-1 text-2xl font-black text-white">{t("shop.facts.primaryOffer")}</div>
            <div className="mt-4 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(8,10,16,0.92))] p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/44">{t("shop.facts.price")}</div>
              <div className="mt-2 text-4xl font-black text-[#ffe4a8]">{offerCost(offer, t)}</div>
              <div className="mt-2 text-[12px] leading-6 text-white/60">
                {t("shop.facts.priceHint")}
              </div>
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
  level,
  resetLabel,
  gold,
  gems,
  dust,
  category,
  stockState,
  t,
}: {
  level: number;
  resetLabel: string;
  gold: number;
  gems: number;
  dust: number;
  category: ShopCategory;
  stockState: string;
  t: TranslateFn;
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(9,11,17,0.96))] p-4">
        <SectionTitle eyebrow={t("shop.facts.merchantDesk")} title={t("shop.facts.readyFunds")} />
        <div className="mt-4 grid gap-2">
          <StoreStatusLine resourceIcon="gold" icon="gold" label={t("shop.facts.gold")} value={`${gold}`} />
          <StoreStatusLine resourceIcon="dust" icon="dust" label={t("shop.facts.dust")} value={`${dust}`} />
          <StoreStatusLine resourceIcon="gems" icon="gem" label={t("shop.facts.gems")} value={`${gems}`} />
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(10,11,17,0.94))] p-4">
        <SectionTitle eyebrow={t("shop.facts.marketPulse")} title={t("shop.facts.refreshRhythm")} />
        <div className="mt-4 grid gap-2">
          <StoreStatusLine shopIcon="refresh" icon="rewards" label={t("shop.facts.reset")} value={resetLabel} />
          <StoreStatusLine progressionIcon="level_up" icon="fortress" label={t("shop.facts.account")} value={t("shop.levelValue", { level })} />
        </div>
        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/44">{t("shop.facts.visibleStock")}</div>
          <div className="mt-1 text-2xl font-black text-[#ffe2a2]">{stockState}</div>
          <div className="mt-2 text-[12px] leading-6 text-white/58">
            {category === "daily" ? t("shop.stockCopy.daily") : t("shop.stockCopy.default")}
          </div>
        </div>
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
    <div className={cn("group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(10,11,17,0.94))] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.22)]", feedbackActive && "frontline-reward-success")}>
      <div className={cn("pointer-events-none absolute right-[-10%] top-[-12%] h-32 w-32 rounded-full bg-gradient-to-br opacity-18 blur-[54px]", CATEGORY_TONES[offer.category])} />
      <ShopOfferRewardBurst key={`spotlight-burst-${feedbackNonce}`} offer={offer} active={feedbackActive} t={t} compact />
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {valueTag ? <ShopBadge icon={shopIconForValueTag(offer.valueTag)}>{valueTag}</ShopBadge> : null}
            {offer.hot ? <ShopBadge icon="hot_deal" tone="ember">{t("shop.states.hot")}</ShopBadge> : null}
          </div>
          <div className="mt-3 text-xl font-black leading-tight text-white">{offerName(offer, t)}</div>
          <div className="mt-2 text-[12px] leading-6 text-white/62">{offerDescription(offer, t)}</div>
        </div>
        <ShopIcon name={offerShopIcon(offer)} size="lg" className="h-14 w-14 shrink-0" />
      </div>

      <div className="relative z-[1] mt-4 flex flex-wrap gap-2">
        {buildRewardTokens(offer, t).map((token) => (
          <RewardToken key={`${token.label}-${token.hint}`} {...token} compact />
        ))}
      </div>

      <div className="relative z-[1] mt-5 flex items-center justify-between gap-3">
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
    <div className={cn("relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(9,11,17,0.94))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)]", feedbackActive && "frontline-reward-success")}>
      <ShopOfferRewardBurst key={`reserve-burst-${feedbackNonce}`} offer={offer} active={feedbackActive} t={t} compact />
      <div className="flex items-start gap-3">
        <ShopIcon name={offerShopIcon(offer)} size="lg" className="h-14 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {valueTag ? <ShopBadge icon={shopIconForValueTag(offer.valueTag)}>{valueTag}</ShopBadge> : null}
            {offer.hot ? <ShopBadge icon="hot_deal" tone="ember">{t("shop.states.hot")}</ShopBadge> : null}
          </div>
          <div className="mt-2 text-lg font-black text-white">{offerName(offer, t)}</div>
          <div className="mt-1 text-[12px] leading-6 text-white/60">{offerDescription(offer, t)}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {buildRewardTokens(offer, t).map((token) => (
          <RewardToken key={`${token.label}-${token.hint}`} {...token} compact />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
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

function StoreMerchRail({ category, t }: { category: ShopCategory; t: TranslateFn }) {
  return (
    <div className="grid gap-4">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(10,11,17,0.95))] p-4">
        <SectionTitle eyebrow={t("shop.facts.connectedStock")} title={t("shop.facts.whereMatters")} />
        <div className="mt-4 grid gap-3">
          <MerchBullet
            icon="deck"
            title={t("shop.merch.deckTitle")}
            body={t("shop.merch.deckBody")}
          />
          <MerchBullet
            icon="fortress"
            title={t("shop.merch.fortressTitle")}
            body={t("shop.merch.fortressBody")}
          />
          <MerchBullet
            icon="heroes"
            title={t("shop.merch.heroesTitle")}
            body={category === "shards" ? t("shop.merch.heroesShardBody") : t("shop.merch.heroesBody")}
          />
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(9,11,17,0.95))] p-4">
        <SectionTitle eyebrow={t("shop.facts.quickRoutes")} title={t("shop.facts.spendContext")} />
        <div className="mt-4 grid gap-2">
          <MarketRoute href="/deck" icon="deck" label={t("shop.actions.openDeck")} value={t("shop.merch.deckRoute")} />
          <MarketRoute href="/fortress" icon="fortress" label={t("shop.actions.openFortress")} value={t("shop.merch.fortressRoute")} />
          <MarketRoute href="/roster" icon="heroes" label={t("shop.actions.openHeroes")} value={t("shop.merch.heroesRoute")} />
        </div>
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
      featured={featured || icon === "gold" || icon === "gem" || icon === "gems" || icon === "dust" || icon === "shards"}
      size={featured ? "lg" : compact ? "sm" : "md"}
    />
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
    <div className="relative min-h-[16rem] overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(10,11,17,0.94))] p-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_50%_0%,rgba(255,231,184,0.24),transparent_62%)]" />
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#f5d498]">{t("shop.facts.bundleDisplay")}</div>
      <div className="mt-1 text-lg font-black text-white">{offerValueTag(offer, t) ?? t("shop.facts.vaultDrop")}</div>

      {previewCards.length || previewHeroes.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {previewCards.map((card) => (
            <FrontlineCardView key={card.id} card={card} compact status="preview" className="min-h-[10.5rem]" />
          ))}
          {previewHeroes.map((hero) => (
            <FrontlineHeroStandee key={hero.heroId} hero={hero} compact label="preview" className="min-h-[10.5rem]" />
          ))}
        </div>
      ) : (
        <>
          <div className="absolute left-[10%] top-[34%]">
            <StoreGlyph icon={icon} tone="from-[#fff3c7] via-[#f5c451] to-[#c77716]" className="h-20 w-20" />
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
                  <ResourceIcon kind={token.icon} size="large" className="h-[92%] w-[92%]" />
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
}: {
  icon: GlyphKind;
  label: string;
  value: string;
  shopIcon?: ShopIconName;
  resourceIcon?: ResourceIconKind;
  progressionIcon?: "claim" | "unlock" | "reward_chest" | "level_up";
}) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] px-3 py-3">
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
  );
}

function MarketRoute({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: GlyphKind;
  label: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] px-3 py-3 transition hover:-translate-y-0.5 hover:border-[#f5c451]/24 hover:bg-[#f5c451]/10"
    >
      <StoreGlyph icon={icon} tone="from-[#fff3c7] via-[#f5c451] to-[#c77716]" className="h-10 w-10 shrink-0" />
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-[0.16em] text-white/44">{label}</div>
        <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
      </div>
    </Link>
  );
}

function MerchBullet({
  icon,
  title,
  body,
}: {
  icon: GlyphKind;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-start gap-3">
        <StoreGlyph icon={icon} tone="from-[#fff3c7] via-[#f5c451] to-[#c77716]" className="h-10 w-10 shrink-0" />
        <div>
          <div className="text-sm font-black text-white">{title}</div>
          <div className="mt-1 text-[12px] leading-6 text-white/58">{body}</div>
        </div>
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

function categoryGlyph(category: ShopCategory): GlyphKind {
  switch (category) {
    case "resources":
      return "gem";
    case "shards":
      return "heroes";
    case "consumables":
      return "power";
    case "daily":
      return "rewards";
    default:
      return "offers";
  }
}

function handleBuy(
  offer: ExtendedShopOffer,
  buy: (offerId: string) => { ok: boolean; reason?: string },
  pushNote: (kind: "success" | "error" | "info", message: string) => void,
  t: TranslateFn,
) {
  const result = buy(offer.id);
  if (result.ok) {
    sfx.purchase();
    pushNote("success", t("shop.notifications.bought", { name: offerName(offer, t) }));
    return true;
  } else {
    sfx.error();
    pushNote("error", result.reason ?? t("shop.notifications.purchaseFailed"));
    return false;
  }
}
