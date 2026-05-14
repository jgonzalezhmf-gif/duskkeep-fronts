"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type IntroSpriteEffectProps = {
  /** Horizontal spritesheet (frames laid out left-to-right). */
  src: string;
  /** Number of frames in the spritesheet. */
  frameCount: number;
  /** Total loop length in ms. */
  loopMs: number;
  className?: string;
  style?: CSSProperties;
  /** Optional id so multiple instances don't collide on the same animation name. */
  loopId?: string;
  /**
   * Blend mode applied to the strip. Use "multiply" for spritesheets that
   * ship with a white background (the crow loop), so the white pixels
   * disappear against the sky and only the silhouette remains visible.
   */
  blendMode?: CSSProperties["mixBlendMode"];
};

/**
 * Animates a horizontal spritesheet using a wide strip + steps() so each
 * frame snaps into place without blur or sub-pixel artifacts. Mirrors the
 * pattern already used by HomeSkyAtmosphere / AdventureMapPropVisuals so the
 * intro stays consistent with the rest of the project's sprite loops.
 *
 * Silently no-ops if the spritesheet 404s.
 */
export function IntroSpriteEffect({
  src,
  frameCount,
  loopMs,
  className,
  style,
  loopId,
  blendMode,
}: IntroSpriteEffectProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const img = new window.Image();
    img.onerror = () => {
      if (!cancelled) setFailed(true);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  // A unique keyframe name per source keeps multiple instances independent and
  // avoids global selector collisions.
  const animationName = useMemo(() => {
    const safeId = (loopId ?? src).replace(/[^a-zA-Z0-9_-]/g, "_");
    return `introSprite_${safeId}`;
  }, [src, loopId]);

  if (failed) return null;

  // The strip is N times wider than the visible window. `steps(N)` on a
  // translateX from 0% to -((N-1)/N * 100%) parks each frame at the same
  // x position, one frame at a time.
  const stripWidthPct = frameCount * 100;
  const endShiftPct = ((frameCount - 1) / frameCount) * -100;

  return (
    <div
      className={className}
      style={{
        overflow: "hidden",
        position: "absolute",
        // Force the wrapper to fill its positioned parent. Without these the
        // element collapsed to 0×0 in some layout contexts and the strip
        // inside (width: stripWidthPct%) ended up sized to nothing.
        inset: 0,
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${stripWidthPct}%`,
          backgroundImage: `url('${src}')`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 50%",
          // Critical: preserve the spritesheet's aspect ratio. The earlier
          // `100% 100%` stretched each frame both axes, which turned the
          // crows into rectangular smears. `100% auto` matches the home
          // sky implementation and keeps frames in their authored shape.
          backgroundSize: "100% auto",
          animation: `${animationName} ${loopMs}ms steps(${frameCount}) infinite`,
          willChange: "transform",
          mixBlendMode: blendMode,
        }}
      />
      <style jsx>{`
        @keyframes ${animationName} {
          from {
            transform: translate3d(0%, 0, 0);
          }
          to {
            transform: translate3d(${endShiftPct}%, 0, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          div > div {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
