"use client";

import { ShopIcon } from "@/components/game/shared/ShopIcon";
import { SHOP_CATEGORIES, SHOP_CATEGORY_UNLOCK_LEVEL, type ShopCategory } from "@/data/shop";
import { isShopSectionUnlocked } from "@/data/unlocks";
import { cn } from "@/lib/cn";
import {
  CATEGORY_SHOP_ICONS,
  CATEGORY_TONES,
  categoryLabel,
  type TranslateFn,
} from "./shopPageHelpers";

export function ShopCategoryTabs({
  activeCategory,
  displayLevel,
  onSelect,
  t,
}: {
  activeCategory: ShopCategory;
  displayLevel: number;
  onSelect: (category: ShopCategory) => void;
  t: TranslateFn;
}) {
  return (
    <div className="mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-5">
      {SHOP_CATEGORIES.map((item) => {
        const itemUnlocked = isShopSectionUnlocked(item.id, displayLevel);
        const active = activeCategory === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
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
  );
}
