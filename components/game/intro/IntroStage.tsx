"use client";

import { useMemo } from "react";
import { INTRO_ASSETS } from "@/lib/introAssets";
import { useI18n } from "@/lib/i18n/useI18n";
import { activeIntroScene } from "./introScenes";
import { IntroLayer } from "./IntroLayer";

type IntroStageProps = {
  elapsedMs: number;
  totalMs: number;
  reducedMotion: boolean;
  onEnter: () => void;
  onSkip: () => void;
};

export function IntroStage({ elapsedMs, totalMs, reducedMotion, onEnter, onSkip }: IntroStageProps) {
  const { t } = useI18n();
  const scene = activeIntroScene(elapsedMs);
  const finished = elapsedMs >= totalMs;

  // Camera scale 1.06 to 1.02 over the full timeline (very subtle).
  const cameraScale = useMemo(() => {
    if (reducedMotion) return 1;
    const progress = Math.min(1, elapsedMs / totalMs);
    return 1.06 - 0.04 * progress;
  }, [elapsedMs, totalMs, reducedMotion]);

  // Lightning flashes: brief peaks at ~2s and ~9.5s (also during the boss reveal).
  const lightningOpacity = useMemo(() => {
    if (reducedMotion) return 0;
    return lightningAt(elapsedMs);
  }, [elapsedMs, reducedMotion]);

  // Boss shadow appears in scene 4 (9000 to 11500).
  const bossOpacity = useMemo(() => {
    if (elapsedMs < 9000 || elapsedMs > 11500) return 0;
    const local = (elapsedMs - 9000) / 2500; // 0..1
    // Ramp up to 0.65 at 0.5, then back to 0.
    return 0.65 * Math.sin(Math.PI * local);
  }, [elapsedMs]);

  // Fortress fades in during scene 3.
  const fortressOpacity = useMemo(() => {
    if (elapsedMs < 6000) return 0;
    if (elapsedMs > 12000) return Math.max(0, 1 - (elapsedMs - 12000) / 1500);
    return Math.min(1, (elapsedMs - 6000) / 1200);
  }, [elapsedMs]);

  // Fog drifts horizontally.
  const fogShift = useMemo(() => {
    if (reducedMotion) return 0;
    return (elapsedMs / 1000) * 14; // 14 px per second
  }, [elapsedMs, reducedMotion]);

  const fogOpacity = useMemo(() => {
    if (elapsedMs < 500) return Math.max(0, (elapsedMs - 200) / 300) * 0.45;
    if (elapsedMs > 12500) return Math.max(0, 1 - (elapsedMs - 12500) / 2000) * 0.55;
    return 0.55;
  }, [elapsedMs]);

  // Crest opacity: appears during scene 5.
  const crestOpacity = useMemo(() => {
    if (elapsedMs < 11500) return 0;
    return Math.min(1, (elapsedMs - 11500) / 700);
  }, [elapsedMs]);

  // Small camera shake when boss is at peak.
  const shake = useMemo(() => {
    if (reducedMotion) return { x: 0, y: 0 };
    if (elapsedMs < 9500 || elapsedMs > 11200) return { x: 0, y: 0 };
    const t2 = elapsedMs - 9500;
    return {
      x: Math.sin(t2 / 35) * 3,
      y: Math.cos(t2 / 47) * 2,
    };
  }, [elapsedMs, reducedMotion]);

  const sceneText = scene?.id !== "crest" ? (scene ? t(scene.textKey) : "") : "";
  const crestText = t("intro.title");
  const showCta = elapsedMs >= 12500 || finished;

  return (
    <div className="intro-stage" role="dialog" aria-modal="true" aria-label={crestText}>
      <div
        className="intro-stage__camera"
        style={{
          transform: `translate3d(${shake.x}px, ${shake.y}px, 0) scale(${cameraScale.toFixed(4)})`,
        }}
      >
        <IntroLayer
          src={INTRO_ASSETS.eclipseSky.src}
          className="intro-stage__layer intro-stage__layer--sky"
          fallbackColor="#070912"
        />

        <IntroLayer
          src={INTRO_ASSETS.fogLayer.src}
          className="intro-stage__layer intro-stage__layer--fog"
          fallbackColor="rgba(40, 36, 48, 0)"
          style={{
            opacity: fogOpacity,
            transform: `translate3d(${-fogShift}px, 0, 0)`,
          }}
        />

        <IntroLayer
          src={INTRO_ASSETS.fortressLayer.src}
          className="intro-stage__layer intro-stage__layer--fortress"
          fallbackColor="rgba(20, 16, 24, 0)"
          style={{
            opacity: fortressOpacity,
            transform: `translate3d(0, ${reducedMotion ? 0 : (1 - fortressOpacity) * 14}px, 0)`,
          }}
        />

        <IntroLayer
          src={INTRO_ASSETS.bossShadow.src}
          className="intro-stage__layer intro-stage__layer--boss"
          fallbackColor="rgba(0, 0, 0, 0)"
          style={{
            opacity: bossOpacity,
            transform: `translate3d(0, ${reducedMotion ? 0 : (1 - bossOpacity) * 16}px, 0)`,
          }}
        />

        <IntroLayer
          src={INTRO_ASSETS.lightningBolt.src}
          className="intro-stage__layer intro-stage__layer--lightning"
          fallbackColor="rgba(255, 244, 200, 0)"
          style={{ opacity: lightningOpacity }}
        />

        <div
          className="intro-stage__flash"
          style={{ opacity: lightningOpacity * 0.55 }}
          aria-hidden="true"
        />
        <div className="intro-stage__vignette" aria-hidden="true" />
      </div>

      <div className="intro-stage__center">
        <div
          className="intro-stage__crest"
          style={{ opacity: crestOpacity }}
        >
          <IntroLayer
            src={INTRO_ASSETS.titleCrest.src}
            className="intro-stage__crest-img"
            fallbackColor="rgba(0,0,0,0)"
          />
          <div className="intro-stage__crest-text">{crestText}</div>
        </div>
        <div
          className="intro-stage__text"
          // Keyed so a new line fades in cleanly per scene.
          key={scene?.id ?? "none"}
        >
          {sceneText}
        </div>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="intro-stage__skip"
        aria-label={t("intro.skip")}
      >
        {t("intro.skip")}
      </button>

      {showCta ? (
        <button type="button" onClick={onEnter} className="intro-stage__cta">
          {t("intro.enter")}
        </button>
      ) : null}

      <style jsx>{`
        .intro-stage {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #050608;
          overflow: hidden;
          font-family: inherit;
          color: #f5e7c1;
          animation: introFadeIn 700ms ease both;
          will-change: opacity;
        }
        .intro-stage__camera {
          position: absolute;
          inset: 0;
          transform-origin: 50% 55%;
          will-change: transform;
        }
        .intro-stage__layer {
          position: absolute;
          inset: 0;
          will-change: opacity, transform;
        }
        .intro-stage__layer--sky {
          z-index: 1;
        }
        .intro-stage__layer--fog {
          z-index: 2;
          mix-blend-mode: screen;
          /* Wider element so horizontal drift never reveals the edge. */
          left: -10%;
          right: -10%;
          width: 120%;
        }
        .intro-stage__layer--fortress {
          z-index: 3;
        }
        .intro-stage__layer--boss {
          z-index: 4;
          mix-blend-mode: screen;
        }
        .intro-stage__layer--lightning {
          z-index: 5;
          mix-blend-mode: screen;
        }
        .intro-stage__flash {
          position: absolute;
          inset: 0;
          z-index: 6;
          background: radial-gradient(circle at 50% 40%, rgba(255, 244, 200, 0.55), transparent 65%);
          pointer-events: none;
        }
        .intro-stage__vignette {
          position: absolute;
          inset: 0;
          z-index: 7;
          background: radial-gradient(circle at 50% 50%, transparent 55%, rgba(5, 6, 8, 0.78) 100%);
          pointer-events: none;
        }
        .intro-stage__center {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0 6vw 14vh;
          pointer-events: none;
        }
        .intro-stage__crest {
          position: relative;
          width: min(34vw, 280px);
          height: min(34vw, 280px);
          transition: opacity 600ms ease;
        }
        .intro-stage__crest-img {
          position: absolute;
          inset: 0;
        }
        .intro-stage__crest-text {
          position: absolute;
          left: 0;
          right: 0;
          bottom: -2.6rem;
          text-align: center;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: clamp(18px, 3.4vw, 32px);
          color: #f5d498;
          text-shadow: 0 2px 18px rgba(245, 196, 81, 0.32);
        }
        .intro-stage__text {
          margin-top: clamp(2rem, 6vh, 5rem);
          font-size: clamp(18px, 3.2vw, 30px);
          font-weight: 700;
          letter-spacing: 0.06em;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.6);
          opacity: 0;
          animation: introTextIn 1100ms ease both;
          max-width: 92vw;
          text-align: center;
        }
        .intro-stage__skip,
        .intro-stage__cta {
          position: absolute;
          z-index: 20;
          pointer-events: auto;
          border: 1px solid rgba(245, 196, 81, 0.5);
          background: rgba(7, 9, 12, 0.55);
          color: #f5e7c1;
          padding: 0.55rem 1.1rem;
          border-radius: 999px;
          font-weight: 700;
          letter-spacing: 0.16em;
          font-size: 11px;
          text-transform: uppercase;
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: background 200ms ease, transform 160ms ease, border-color 200ms ease;
        }
        .intro-stage__skip {
          top: max(env(safe-area-inset-top, 0px) + 16px, 22px);
          right: max(env(safe-area-inset-right, 0px) + 16px, 22px);
        }
        .intro-stage__cta {
          bottom: max(env(safe-area-inset-bottom, 0px) + 28px, 36px);
          left: 50%;
          transform: translateX(-50%);
          padding: 0.85rem 1.6rem;
          font-size: 13px;
          background: rgba(245, 196, 81, 0.18);
          border-color: rgba(245, 196, 81, 0.8);
          animation: introCtaIn 600ms ease both;
        }
        .intro-stage__skip:hover,
        .intro-stage__cta:hover {
          background: rgba(245, 196, 81, 0.24);
          border-color: rgba(245, 196, 81, 0.95);
        }
        .intro-stage__cta:hover {
          transform: translateX(-50%) translateY(-1px);
        }

        @keyframes introFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes introTextIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          25% {
            opacity: 1;
            transform: translateY(0);
          }
          85% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-6px);
          }
        }
        @keyframes introCtaIn {
          from {
            opacity: 0;
            transform: translate(-50%, 12px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-stage__camera {
            transform: none !important;
          }
          .intro-stage__layer--fog {
            transform: none !important;
          }
          .intro-stage__text {
            animation-duration: 600ms;
          }
        }

        @media (max-width: 700px) {
          .intro-stage__crest {
            width: min(60vw, 260px);
            height: min(60vw, 260px);
          }
          .intro-stage__center {
            padding-bottom: 18vh;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Returns a 0..1 opacity for the lightning bolt based on two short flashes.
 * Each flash is a fast attack-decay curve so the SVG/PNG never sits visible
 * for more than ~280ms at a time.
 */
function lightningAt(ms: number): number {
  const flashes = [
    { peakMs: 2000, attackMs: 90, decayMs: 220 },
    { peakMs: 9700, attackMs: 70, decayMs: 280 },
    { peakMs: 10500, attackMs: 60, decayMs: 220 },
  ];
  let opacity = 0;
  for (const flash of flashes) {
    if (ms < flash.peakMs - flash.attackMs) continue;
    if (ms > flash.peakMs + flash.decayMs) continue;
    const local = ms - flash.peakMs;
    const value = local <= 0 ? 1 + local / flash.attackMs : 1 - local / flash.decayMs;
    opacity = Math.max(opacity, Math.max(0, Math.min(1, value)));
  }
  return opacity;
}
