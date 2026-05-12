"use client";

import { useEffect, useState, type CSSProperties } from "react";

type IntroLayerProps = {
  src: string;
  className?: string;
  style?: CSSProperties;
  /** Color used as background if the image fails to load. */
  fallbackColor?: string;
  /** background-position passthrough. */
  position?: string;
  /** background-size passthrough. */
  size?: "cover" | "contain";
};

/**
 * Single visual layer for the intro. Uses background-image so we can keep a
 * fallback tint underneath that stays visible if the asset 404s. Keeps the
 * cinematic from collapsing when an asset is missing.
 */
export function IntroLayer({
  src,
  className,
  style,
  fallbackColor = "rgba(7, 9, 12, 0.85)",
  position = "center center",
  size = "cover",
}: IntroLayerProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setLoaded(true);
    };
    img.onerror = () => {
      if (!cancelled) setFailed(true);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className={className} style={style}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: fallbackColor,
          opacity: failed || !loaded ? 1 : 0,
          transition: "opacity 400ms ease",
        }}
      />
      {failed ? null : (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${src}')`,
            backgroundPosition: position,
            backgroundRepeat: "no-repeat",
            backgroundSize: size,
            opacity: loaded ? 1 : 0,
            transition: "opacity 600ms ease",
          }}
        />
      )}
    </div>
  );
}
