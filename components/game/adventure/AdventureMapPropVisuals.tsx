"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { getAdventureMapInteractionAsset, getAdventureMapInteractionEffectAsset } from "@/lib/adventureMapInteractionAssets";
import { ADVENTURE_PROP_ASSET_IDS, getAdventurePropAsset, type AdventurePropAssetId } from "@/lib/adventureMapAssets";
import type { AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";
import { HomeEffectSprite } from "@/components/game/home/HomeEffectSprite";
import { HOME_EFFECT_IDS, type HomeEffectId } from "@/lib/homeEffectAssets";
import type { AdventureMapPropLayout, AdventureMapPropType } from "@/features/adventure/mapLayout";
import { getEffectDuration } from "@/features/adventure/mapGeometry";

const HOME_EFFECT_PROP_IDS = new Set<string>(HOME_EFFECT_IDS);
const ADVENTURE_PROP_ASSET_ID_SET = new Set<string>(ADVENTURE_PROP_ASSET_IDS);

export function InteractionPropState({ status, selected }: { status: AdventureMapInteractionStatus; selected?: boolean }) {
  if (status === "claimed") {
    return <span className="pointer-events-none absolute -right-1 -top-1 rounded-full border border-emerald-200/36 bg-emerald-950/86 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-emerald-100">OK</span>;
  }
  if (status === "locked") {
    return null;
  }
  if (status === "needs_key") {
    return <span className="pointer-events-none absolute -right-1 -top-1 rounded-full border border-[#f5d498]/24 bg-black/78 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-[#f5d498]">KEY</span>;
  }
  return (
    <>
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 top-[48%] h-[82%] w-[112%] -translate-x-1/2 -translate-y-1/2 rounded-[42%] bg-[#ffd978]/18 blur-[8px] shadow-[0_0_26px_rgba(245,196,81,0.26)]",
          selected && "opacity-90",
        )}
      />
      <span className="pointer-events-none absolute -right-1 -top-1 rounded-full border border-[#f5d498]/34 bg-[#2a1606]/92 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-[#ffe6a8]">OPEN</span>
    </>
  );
}

export function InteractionPropContent({
  prop,
  status,
  fallback,
}: {
  prop: AdventureMapPropLayout;
  status: AdventureMapInteractionStatus;
  fallback: ReactNode;
}) {
  if (prop.interaction?.kind !== "keyChest") return <>{fallback}</>;
  const src = getAdventureMapInteractionAsset(status);
  const shine = getAdventureMapInteractionEffectAsset("gold_shine_loop");
  return (
    <span
      className={cn(
        "relative block h-full w-full",
        status === "ready" && "motion-safe:animate-[adventureKeyChestPulse_1.95s_ease-in-out_infinite]",
      )}
    >
      {status === "ready" && shine ? (
        <span className="pointer-events-none absolute left-1/2 top-[47%] z-[0] block h-[148%] w-[170%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[44%] opacity-[0.68]">
          {Array.from({ length: shine.frameCount }).map((_, index) => (
            <span
              key={`gold-shine-frame-${index}`}
              className="absolute inset-0 opacity-0 motion-safe:animate-[adventureGoldShineFrame_0.65s_steps(1,end)_infinite] motion-reduce:hidden"
              style={{ animationDelay: `${index * (650 / shine.frameCount)}ms` }}
            >
              <span
                className="absolute top-0 h-full bg-[image:var(--adventure-gold-shine)] bg-[length:100%_100%] bg-no-repeat"
                style={{
                  left: `${index * -100}%`,
                  width: `${shine.frameCount * 100}%`,
                  ["--adventure-gold-shine" as string]: `url(${shine.src})`,
                }}
              />
            </span>
          ))}
        </span>
      ) : null}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        className={cn(
          "h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.52)] [transform-origin:50%_58%]",
          status === "ready" && "brightness-110 saturate-[1.12] drop-shadow-[0_12px_18px_rgba(0,0,0,0.56)]",
          status === "ready" && "motion-safe:animate-[adventureKeyChestBreath_2.35s_ease-in-out_infinite]",
        )}
      />
      {status === "ready" ? <span className="pointer-events-none absolute left-[9%] top-[5%] h-[42%] w-[82%] rounded-[45%] bg-[#fff0a8]/18 blur-[6px]" /> : null}
    </span>
  );
}

export function AdventureMapInteractionStyles() {
  return (
    <style jsx global>{`
      @keyframes adventureKeyChestPulse {
        0%,
        100% {
          filter: brightness(1) saturate(1);
        }
        48% {
          filter: brightness(1.13) saturate(1.14);
        }
      }

      @keyframes adventureKeyChestBreath {
        0%,
        100% {
          transform: translateZ(0) scale(1);
        }
        45% {
          transform: translateZ(0) scale(1.035);
        }
        62% {
          transform: translateZ(0) scale(1.015);
        }
      }

      @keyframes adventureGoldShineFrame {
        0%,
        19.999% {
          opacity: 0.86;
          transform: translateZ(0) scale(1);
        }
        20%,
        100% {
          opacity: 0;
          transform: translateZ(0) scale(1);
        }
      }
    `}</style>
  );
}

export function getPropContent(prop: AdventureMapPropLayout) {
  const type = prop.type;
  if (type === "key_chest") {
    const src = getAdventureMapInteractionAsset("locked");
    return (
      <span className="relative block h-full w-full">
        <img
          src={src}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.52)]"
        />
      </span>
    );
  }
  if (isAdventurePropAsset(type)) {
    const asset = getAdventurePropAsset(type);
    if (asset) {
      return (
        <span className="relative block h-full w-full">
          <img
            src={asset.src}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.48)]"
          />
          {prop.effect?.enabled !== false ? <AdventurePropEffect prop={prop} /> : null}
        </span>
      );
    }
  }
  if (isHomeEffectProp(type)) {
    return (
      <HomeEffectSprite
        effect={type}
        durationMs={type === "clouds_dark_layer" ? 90000 : type === "crow_fly_loop" ? 720 : 720}
        width="100%"
        height="100%"
        dataId={prop.id}
        opacity={1}
        mobileDisabled={false}
        className="left-1/2 top-1/2"
      />
    );
  }
  if (type === "camp_prop") return <span className="block h-full w-full rounded-[40%] border border-[#f5d498]/24 bg-[linear-gradient(180deg,rgba(245,196,81,0.24),rgba(46,28,12,0.76))]" />;
  if (type === "chest_prop") return <span className="block h-[70%] w-full rounded-[18%] border border-[#f5d498]/28 bg-[linear-gradient(180deg,rgba(245,196,81,0.28),rgba(70,38,16,0.82))]" />;
  return <span className="block h-full w-full rounded-full bg-amber-300/36 blur-[1px] shadow-[0_0_14px_currentColor]" />;
}

function AdventurePropEffect({ prop }: { prop: AdventureMapPropLayout }) {
  if (!prop.effect || !HOME_EFFECT_PROP_IDS.has(prop.effect.type)) return null;
  return (
    <HomeEffectSprite
      effect={prop.effect.type}
      durationMs={prop.effect.durationMs ?? getEffectDuration(prop.effect.type)}
      width={`${prop.effect.widthPercent}%`}
      height={`${prop.effect.heightPercent}%`}
      dataId={`${prop.id}-effect`}
      opacity={prop.effect.opacity ?? 0.85}
      mobileDisabled={false}
      className="absolute"
      style={{
        left: `${prop.effect.xPercent}%`,
        top: `${prop.effect.yPercent}%`,
      }}
    />
  );
}

function isHomeEffectProp(type: AdventureMapPropType): type is HomeEffectId {
  return HOME_EFFECT_PROP_IDS.has(type);
}

function isAdventurePropAsset(type: AdventureMapPropType): type is AdventurePropAssetId {
  return ADVENTURE_PROP_ASSET_ID_SET.has(type);
}
