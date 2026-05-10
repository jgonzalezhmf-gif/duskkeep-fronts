"use client";

import type { CSSProperties } from "react";

import { getHomeEffectRenderAsset, type HomeEffectId } from "@/lib/homeEffectAssets";

type HomeEffectSpriteProps = {
  effect: HomeEffectId;
  durationMs: number;
  width: number | string;
  height: number | string;
  dataId?: string;
  className?: string;
  style?: CSSProperties;
  ariaHidden?: boolean;
  mobileDisabled?: boolean;
  opacity?: number;
  backgroundY?: string;
  rotationDeg?: number;
  yawDeg?: number;
  originXPercent?: number;
  originYPercent?: number;
  anchorXPercent?: number;
  anchorYPercent?: number;
  flipX?: boolean;
  flipY?: boolean;
};

function toCssSize(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

function cssImageSource(src: string, webpSrc?: string) {
  return webpSrc ? `image-set(url("${webpSrc}") type("image/webp"), url("${src}") type("image/png"))` : `url("${src}")`;
}

export function HomeEffectSpriteStyles() {
  return (
    <style jsx global>{`
      @keyframes homeEffectSpriteLoop {
        from { left: 0; }
        to { left: var(--home-effect-strip-end); }
      }

      @keyframes homeEffectSpriteLoopFlame {
        0%, 16.666% { left: -25.86%; }
        16.667%, 33.333% { left: -108.13%; }
        33.334%, 50% { left: -198.52%; }
        50.001%, 66.666% { left: -284.18%; }
        66.667%, 83.333% { left: -375.43%; }
        83.334%, 100% { left: -472.62%; }
      }

      @keyframes homeEffectSpriteLoopCrystal {
        0%, 16.666% { left: -13.28%; }
        16.667%, 33.333% { left: -109.96%; }
        33.334%, 50% { left: -209.34%; }
        50.001%, 66.666% { left: -311.29%; }
        66.667%, 83.333% { left: -407.11%; }
        83.334%, 100% { left: -501.09%; }
      }

      @keyframes homeEffectSpriteLoopFlagRed {
        0%, 20% { left: 0%; }
        20.001%, 40% { left: -100%; }
        40.001%, 60% { left: -200%; }
        60.001%, 80% { left: -300%; }
        80.001%, 100% { left: -400%; }
      }

      @keyframes homeEffectSpriteLoopSixFixed {
        0%, 16.666% { left: 0%; }
        16.667%, 33.333% { left: -100%; }
        33.334%, 50% { left: -200%; }
        50.001%, 66.666% { left: -300%; }
        66.667%, 83.333% { left: -400%; }
        83.334%, 100% { left: -500%; }
      }

      @keyframes homeEffectSpriteLoopSevenFixed {
        0%, 14.285% { left: 0%; }
        14.286%, 28.571% { left: -100%; }
        28.572%, 42.857% { left: -200%; }
        42.858%, 57.142% { left: -300%; }
        57.143%, 71.428% { left: -400%; }
        71.429%, 85.714% { left: -500%; }
        85.715%, 100% { left: -600%; }
      }

      @keyframes homeEffectSpriteLoopPortalBlue {
        0%, 16.666% { left: -7.27%; }
        16.667%, 33.333% { left: -107.73%; }
        33.334%, 50% { left: -207.23%; }
        50.001%, 66.666% { left: -309.11%; }
        66.667%, 83.333% { left: -406.45%; }
        83.334%, 100% { left: -498.20%; }
      }

      @keyframes homeEffectSpriteLoopCandle {
        0%, 16.666% { left: -12.89%; }
        16.667%, 33.333% { left: -104.30%; }
        33.334%, 50% { left: -199.80%; }
        50.001%, 66.666% { left: -299.80%; }
        66.667%, 83.333% { left: -395.12%; }
        83.334%, 100% { left: -491.41%; }
      }

      @keyframes homeEffectSpriteLoopLanternWarm {
        0%, 16.666% { left: -6.25%; }
        16.667%, 33.333% { left: -108.59%; }
        33.334%, 50% { left: -199.80%; }
        50.001%, 66.666% { left: -299.61%; }
        66.667%, 83.333% { left: -392.19%; }
        83.334%, 100% { left: -493.36%; }
      }

      @keyframes homeEffectSpriteLoopBannerRed {
        0%, 16.666% { left: -9.18%; }
        16.667%, 33.333% { left: -105.08%; }
        33.334%, 50% { left: -199.80%; }
        50.001%, 66.666% { left: -299.80%; }
        66.667%, 83.333% { left: -399.80%; }
        83.334%, 100% { left: -494.34%; }
      }

      @keyframes homeCloudLayerDrift {
        0% {
          transform: translate3d(-7%, 0, 0) scale(1);
        }
        100% {
          transform: translate3d(5%, 0, 0) scale(1.015);
        }
      }

      @keyframes homeLanternInternalFlicker {
        0%, 100% {
          opacity: 0.34;
          transform: translate(-50%, -50%) scale(0.96);
        }
        32% {
          opacity: 0.7;
          transform: translate(-50%, -50%) scale(1.04);
        }
        57% {
          opacity: 0.48;
          transform: translate(-50%, -50%) scale(0.99);
        }
        78% {
          opacity: 0.62;
          transform: translate(-50%, -50%) scale(1.02);
        }
      }

      @keyframes homeCandleInternalFlicker {
        0%, 100% {
          opacity: 0.42;
          transform: translate(-50%, -50%) scale(0.92);
        }
        28% {
          opacity: 0.86;
          transform: translate(-50%, -50%) scale(1.08);
        }
        52% {
          opacity: 0.56;
          transform: translate(-50%, -50%) scale(0.97);
        }
        74% {
          opacity: 0.74;
          transform: translate(-50%, -50%) scale(1.03);
        }
      }

      @keyframes homeBannerClothShimmer {
        0%, 100% {
          opacity: 0.62;
          transform: scaleX(0.985) skewY(-1.3deg) rotate(-0.45deg);
        }
        50% {
          opacity: 0.86;
          transform: scaleX(1.018) skewY(1.6deg) rotate(0.6deg);
        }
      }

      .home-effect-sprite {
        position: absolute;
        display: block;
        pointer-events: none;
        overflow: hidden;
        transform:
          translate(calc(-1 * var(--home-effect-anchor-x, 50%)), calc(-1 * var(--home-effect-anchor-y, 50%)))
          perspective(520px)
          rotate(var(--home-effect-rotation, 0deg))
          rotateY(var(--home-effect-yaw, 0deg))
          scale(var(--home-effect-flip-x, 1), var(--home-effect-flip-y, 1));
        transform-origin: var(--home-effect-origin-x, 50%) var(--home-effect-origin-y, 50%);
        backface-visibility: visible;
        contain: paint;
      }

      .home-effect-sprite-strip {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: var(--home-effect-strip-width);
        background-image: var(--home-effect-image);
        background-repeat: no-repeat;
        background-size: 100% auto;
        background-position: 0 var(--home-effect-y);
        image-rendering: auto;
        animation-name: homeEffectSpriteLoop;
        animation-duration: var(--home-effect-duration);
        animation-timing-function: steps(var(--home-effect-step-count));
        animation-iteration-count: infinite;
        will-change: left;
      }

      .home-effect-sprite-static {
        position: absolute;
        inset: 0;
        background-image: var(--home-effect-static-image);
        background-repeat: no-repeat;
        background-size: 100% auto;
        background-position: 0 var(--home-effect-y);
        image-rendering: auto;
        pointer-events: none;
        z-index: 2;
      }

      .home-effect-sprite[data-home-render-effect="banner_red_loop"] .home-effect-sprite-static {
        z-index: 0;
      }

      .home-effect-sprite[data-home-render-effect="clouds_dark_layer"] {
        overflow: hidden;
        border-radius: 999px;
        -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 0 42%, rgba(0,0,0,0.72) 55%, transparent 78%);
        mask-image: radial-gradient(ellipse at 50% 50%, black 0 42%, rgba(0,0,0,0.72) 55%, transparent 78%);
      }

      .home-effect-sprite[data-home-effect-frames="1"] .home-effect-sprite-strip {
        animation: none !important;
        left: 0 !important;
      }

      .home-effect-sprite[data-home-effect-render-mode="staticFirstFrame"] .home-effect-sprite-strip {
        animation: none !important;
        left: 0 !important;
      }

      .home-effect-sprite[data-home-effect-render-mode="staticWithLocalAnimation"] .home-effect-sprite-strip {
        animation: none !important;
        left: 0 !important;
      }

      .home-effect-local-animation {
        position: absolute;
        display: block;
        pointer-events: none;
        z-index: 3;
      }

      .home-effect-sprite[data-home-render-effect="lantern_warm_loop"] .home-effect-local-animation {
        left: 52%;
        top: 43%;
        width: 26%;
        height: 19%;
        border-radius: 48% 52% 54% 46%;
        background:
          radial-gradient(ellipse at 50% 46%, rgba(255, 234, 157, 0.72) 0 15%, rgba(255, 171, 73, 0.48) 38%, rgba(224, 95, 37, 0.18) 64%, transparent 76%);
        animation: homeLanternInternalFlicker 940ms ease-in-out infinite;
      }

      .home-effect-sprite[data-home-render-effect="candle_loop"] .home-effect-local-animation {
        left: 51%;
        top: 31%;
        width: 21%;
        height: 18%;
        border-radius: 58% 42% 52% 48%;
        clip-path: polygon(50% 0%, 75% 34%, 65% 100%, 35% 100%, 25% 34%);
        background:
          radial-gradient(ellipse at 50% 44%, rgba(255, 245, 176, 0.86) 0 18%, rgba(255, 168, 65, 0.58) 48%, rgba(221, 89, 35, 0.18) 72%, transparent 82%);
        animation: homeCandleInternalFlicker 760ms ease-in-out infinite;
      }

      .home-effect-sprite[data-home-render-effect="banner_red_loop"] .home-effect-local-animation {
        inset: 0;
        transform-origin: 38% 44%;
        clip-path: polygon(34% 13%, 92% 6%, 93% 82%, 35% 78%);
        background-image: var(--home-effect-image);
        background-repeat: no-repeat;
        background-size: var(--home-effect-strip-width) auto;
        background-position: 0 var(--home-effect-y);
        animation: homeBannerClothShimmer 2900ms ease-in-out infinite;
      }

      .home-effect-sprite[data-home-render-effect="flame_loop"] .home-effect-sprite-strip {
        animation-name: homeEffectSpriteLoopFlame;
        animation-timing-function: linear;
      }

      .home-effect-sprite[data-home-render-effect="crystal_purple_loop"] .home-effect-sprite-strip {
        animation-name: homeEffectSpriteLoopCrystal;
        animation-timing-function: linear;
      }

      .home-effect-sprite[data-home-render-effect="flag_red_loop"] .home-effect-sprite-strip {
        animation-name: homeEffectSpriteLoopFlagRed;
        animation-timing-function: linear;
      }

      .home-effect-sprite[data-home-render-effect="portal_blue_loop"] .home-effect-sprite-strip {
        animation-name: homeEffectSpriteLoopPortalBlue;
        animation-timing-function: linear;
      }

      .home-effect-sprite[data-home-render-effect="blue_flame_loop"] .home-effect-sprite-strip,
      .home-effect-sprite[data-home-render-effect="purple_flame_loop"] .home-effect-sprite-strip,
      .home-effect-sprite[data-home-render-effect="crow_fly_loop"] .home-effect-sprite-strip {
        animation-name: homeEffectSpriteLoopSixFixed;
        animation-timing-function: linear;
      }

      .home-effect-sprite[data-home-render-effect="lantern_warm_loop"] .home-effect-sprite-strip {
        animation-name: homeEffectSpriteLoopLanternWarm;
        animation-timing-function: linear;
      }

      .home-effect-sprite[data-home-render-effect="candle_loop"] .home-effect-sprite-strip {
        animation-name: homeEffectSpriteLoopCandle;
        animation-timing-function: linear;
      }

      .home-effect-sprite[data-home-render-effect="banner_red_loop"] .home-effect-sprite-strip {
        animation-name: homeEffectSpriteLoopFlagRed;
        animation-timing-function: linear;
      }

      .home-effect-sprite[data-home-render-effect="clouds_dark_layer"] .home-effect-sprite-strip {
        left: -8% !important;
        width: 116% !important;
        background-size: 100% 100%;
        background-position: 50% 42%;
        animation: homeCloudLayerDrift var(--home-effect-duration) linear infinite alternate !important;
        will-change: transform;
      }

      @media (max-width: 700px) {
        .home-effect-sprite[data-mobile-disabled="1"] {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .home-effect-sprite-strip {
          animation: none !important;
          left: 0 !important;
        }

        .home-effect-local-animation {
          animation: none !important;
        }
      }
    `}</style>
  );
}

export function HomeEffectSprite({
  effect,
  durationMs,
  width,
  height,
  dataId,
  className = "",
  style,
  ariaHidden = true,
  mobileDisabled = true,
  opacity = 1,
  backgroundY = "52%",
  rotationDeg = 0,
  yawDeg = 0,
  originXPercent = 50,
  originYPercent = 50,
  anchorXPercent = 50,
  anchorYPercent = 50,
  flipX = false,
  flipY = false,
}: HomeEffectSpriteProps) {
  const renderAsset = getHomeEffectRenderAsset(effect);

  if (!renderAsset) {
    return null;
  }

  const { asset, requestedAsset, effect: renderEffect } = renderAsset;
  const frameStepCount = Math.max(1, asset.frameCount);
  const stripEnd = `-${(asset.frameCount - 1) * 100}%`;
  const hasLocalAnimation = requestedAsset.renderMode === "staticWithLocalAnimation";
  const animatedSrc = asset.animatedSrc ?? asset.src;
  const animatedWebpSrc = asset.animatedWebpSrc ?? asset.webpSrc;

  return (
    <span
      aria-hidden={ariaHidden}
      data-home-effect={effect}
      data-home-render-effect={renderEffect}
      data-home-effect-id={dataId}
      data-home-effect-render-mode={requestedAsset.renderMode}
      data-home-effect-anchor={requestedAsset.anchor.name}
      data-home-effect-frames={asset.frameCount}
      data-home-effect-local-animation={hasLocalAnimation ? "1" : "0"}
      data-mobile-disabled={mobileDisabled ? "1" : "0"}
      className={`home-effect-sprite ${className}`}
      style={{
        ...style,
        width: toCssSize(width),
        height: toCssSize(height),
        opacity,
        ["--home-effect-rotation" as string]: `${rotationDeg}deg`,
        ["--home-effect-yaw" as string]: `${yawDeg}deg`,
        ["--home-effect-origin-x" as string]: `${originXPercent}%`,
        ["--home-effect-origin-y" as string]: `${originYPercent}%`,
        ["--home-effect-anchor-x" as string]: `${anchorXPercent}%`,
        ["--home-effect-anchor-y" as string]: `${anchorYPercent}%`,
        ["--home-effect-flip-x" as string]: flipX ? "-1" : "1",
        ["--home-effect-flip-y" as string]: flipY ? "-1" : "1",
        ["--home-effect-image" as string]: cssImageSource(animatedSrc, animatedWebpSrc),
        ["--home-effect-strip-width" as string]: `${asset.frameCount * 100}%`,
        ["--home-effect-y" as string]: backgroundY,
      }}
    >
      <span
        className="home-effect-sprite-strip"
        style={{
          ["--home-effect-strip-end" as string]: stripEnd,
          ["--home-effect-duration" as string]: `${durationMs}ms`,
          ["--home-effect-step-count" as string]: frameStepCount,
        }}
      />
      {asset.staticSrc ? (
        <span
          className="home-effect-sprite-static"
          style={{
            ["--home-effect-static-image" as string]: cssImageSource(asset.staticSrc, asset.staticWebpSrc),
            ["--home-effect-y" as string]: backgroundY,
          }}
        />
      ) : null}
      {hasLocalAnimation ? <span className="home-effect-local-animation" aria-hidden="true" /> : null}
    </span>
  );
}
