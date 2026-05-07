import type { ReactNode } from "react";
import GameBackNav from "@/components/game/shared/GameBackNav";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { ShopIcon, type ShopIconName } from "@/components/game/shared/ShopIcon";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import type { ShopCategory } from "@/data/shop";
import { categoryLabel, type TranslateFn } from "./shopPageHelpers";

export function LockedWingCard({
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

export function EmptyShopStock({ category, resetLabel, t }: { category: ShopCategory; resetLabel: string; t: TranslateFn }) {
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

export function MarketTopChrome({ resources, showAdventureKeys }: { resources: { gold: number; dust: number; gems: number; adventureKeys?: number }; showAdventureKeys?: boolean }) {
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

export function ShopBadge({
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
