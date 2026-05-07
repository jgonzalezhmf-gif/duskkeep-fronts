import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { ResourceIcon, type ResourceIconKind } from "@/components/game/shared/ResourceIcon";
import { ShopIcon, type ShopIconName } from "@/components/game/shared/ShopIcon";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import { cn } from "@/lib/cn";
import { resolveGlyphAssetIcon } from "@/lib/iconAssets";

type ProgressionIconName = "claim" | "unlock" | "reward_chest" | "level_up";

export function StoreMiniFact({
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
  progressionIcon?: ProgressionIconName;
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

export function StoreSummaryPill({
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
  progressionIcon?: ProgressionIconName;
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

export function StoreStatusLine({
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
  progressionIcon?: ProgressionIconName;
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

export function StoreGlyph({
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
