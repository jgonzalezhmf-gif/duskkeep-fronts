"use client";

import { useMemo } from "react";
import { INTRO_ASSETS, INTRO_SPRITE_ASSETS } from "@/lib/introAssets";
import { useI18n, translate } from "@/lib/i18n/useI18n";
import { activeIntroScene } from "./introScenes";
import { IntroLayer } from "./IntroLayer";
import {
  introBossOpacity,
  introBossScale,
  introCameraDriftX,
  introCameraDriftY,
  introCameraOrigin,
  introCameraScale,
  introCrestOpacity,
  introCrestScale,
  introCrowOpacity,
  introCrowProgress,
  introFogOpacity,
  introGoldShineOpacity,
  introKeepGlow,
  introLightningOpacity,
  introShake,
} from "./introMotion";
import { IntroSpriteEffect } from "./IntroSpriteEffect";
import { useIntroLocale } from "./useIntroLocale";

type IntroStageProps = {
  elapsedMs: number;
  totalMs: number;
  reducedMotion: boolean;
  onEnter: () => void;
  onSkip: () => void;
};

/**
 * 24-second cinematic. See `introScenes.ts` for the scene table — every
 * memo below maps a visual to one or more of those beats. Camera moves
 * are intentionally subtle and additive (drift + scene-specific bumps)
 * so the playback never feels like discrete cuts.
 */
export function IntroStage({ elapsedMs, totalMs, reducedMotion, onEnter, onSkip }: IntroStageProps) {
  const { locale: storeLocale } = useI18n();
  const introLocale = useIntroLocale(storeLocale);
  const t = (key: string) => translate(introLocale, key);
  const scene = activeIntroScene(elapsedMs);
  const finished = elapsedMs >= totalMs;

  // Stage fade-in and the omen darkening are driven by CSS animations
  // (introStageFadeIn / introOmenLift) rather than the RAF-driven
  // elapsedMs. Hydration adds ~2 seconds before the first animation
  // frame, so anything tied to elapsedMs misses the opening beat
  // entirely. CSS animations start the moment the component mounts.

  // Camera scale, piecewise per beat.
  //   omen     1.40 → 1.18   tight push, the world is still hidden
  //   eclipse  1.18 → 1.05   slow pull-back revealing the sky
  //   roads    1.05 → 1.12   push back in toward the valley
  //   keep     1.12 → 1.28   strong push toward the fortress
  //   shadow   1.28 → 0.98   sharp pull-back so the boss looms
  //   gather   0.98 → 1.00   settle for the title reveal
  const cameraScale = useMemo(() => {
    return introCameraScale(elapsedMs, reducedMotion);
  }, [elapsedMs, reducedMotion]);

  // Transform-origin shifts per beat so each push/pull zooms on a
  // different focal point of the same background:
  //   eclipse → upper-left (where the eclipse sits)
  //   roads   → mid-bottom (toward the valley path)
  //   keep    → right (the fortress silhouette in the sky bg)
  //   shadow  → centre-bottom (boss rises from the bottom)
  //   crest   → centre
  const cameraOrigin = useMemo(() => {
    return introCameraOrigin(elapsedMs, reducedMotion);
  }, [elapsedMs, reducedMotion]);

  // Lateral pan. Roads beat now sweeps a noticeable arc to the right and
  // the keep beat keeps the framing slightly off-centre toward the keep
  // (right side of the sky). Larger amplitudes so the move reads.
  const cameraDriftX = useMemo(() => {
    return introCameraDriftX(elapsedMs, reducedMotion);
  }, [elapsedMs, reducedMotion]);

  // Vertical tilt — start looking up at the sky, drift down to the valley,
  // then lock for the boss rise. Bigger range so the tilt actually reads.
  const cameraDriftY = useMemo(() => {
    return introCameraDriftY(elapsedMs, reducedMotion);
  }, [elapsedMs, reducedMotion]);

  // 4 lightning beats spread along the cinematic — one distant in the omen
  // (1.6s, faint), one mid-roads (8.6s), and the boss-reveal pair (15.4s,
  // 16.4s). Reduced motion strips the strikes entirely so nothing flashes.
  const lightningOpacity = useMemo(() => {
    if (reducedMotion) return 0;
    return introLightningOpacity(elapsedMs);
  }, [elapsedMs, reducedMotion]);

  // Fog stays ambient — 0.10 alpha so it reads as atmospheric weather, not
  // a grey band pasted on the sky. Drops further as the crest takes over.
  const fogOpacity = useMemo(() => {
    return introFogOpacity(elapsedMs);
  }, [elapsedMs]);

  // Two fog layers, both confined to the lower half of the sky.
  // Layer A drifts right at ~7 px/s; layer B drifts left at ~4 px/s. The
  // contrasting directions give parallax depth without piling up on the
  // top band of the viewport.
  const fogShiftA = useMemo(() => (reducedMotion ? 0 : (elapsedMs / 1000) * 7), [elapsedMs, reducedMotion]);
  const fogShiftB = useMemo(
    () => (reducedMotion ? 0 : (elapsedMs / 1000) * 4 * -1),
    [elapsedMs, reducedMotion],
  );

  // Crows fly during the eclipse beat (4.0s–7.5s).
  const crowOpacity = useMemo(() => {
    return introCrowOpacity(elapsedMs);
  }, [elapsedMs]);

  const crowProgress = useMemo(() => {
    return introCrowProgress(elapsedMs, reducedMotion);
  }, [elapsedMs, reducedMotion]);

  const crowLeadVw = 110 - crowProgress * 140;
  const crowTrailVw = 105 - crowProgress * 130;

  // Keep glow during the keep beat (11s–15s). Held briefly, then released.
  const keepGlow = useMemo(() => {
    return introKeepGlow(elapsedMs);
  }, [elapsedMs]);

  // (The intro_fortress_layer PNG ships with a near-white background, so
  // mix-blend-mode multiply works for the crow loop but not for the dark
  // fortress silhouette against the already-dark sky — multiply renders
  // it invisible. We commit to the brief's fallback: rely on the sky's
  // own keep, plus the keep glow + camera push.)

  // Boss reveal: 4-second window with a slow attack, longer hold, slow
  // decay so the silhouette emerges from the fog rather than flicker in.
  // Peak opacity capped at 0.6 per the polish brief — the boss is a
  // shadow, not a hero portrait.
  const bossOpacity = useMemo(() => {
    return introBossOpacity(elapsedMs);
  }, [elapsedMs]);

  // Boss scale: very slow advance from 1.05 to 1.0 across the window so
  // the silhouette feels like it sets into place. Big scale ranges (the
  // 0.78→1.08 of the previous pass) read as gimmicky.
  const bossScale = useMemo(() => {
    return introBossScale(elapsedMs, reducedMotion);
  }, [elapsedMs, reducedMotion]);

  // Small shake aligned with the boss lightning hits.
  const shake = useMemo(() => {
    return introShake(elapsedMs, reducedMotion);
  }, [elapsedMs, reducedMotion]);

  // Crest enters during the gather beat tail (21s+), holds through crest.
  const crestOpacity = useMemo(() => {
    return introCrestOpacity(elapsedMs);
  }, [elapsedMs]);

  const crestScale = useMemo(() => {
    return introCrestScale(elapsedMs, reducedMotion);
  }, [elapsedMs, reducedMotion]);

  // Gold spectral glow behind the crest — pulses gently once the crest is in.
  const goldShineOpacity = useMemo(() => {
    return introGoldShineOpacity(elapsedMs);
  }, [elapsedMs]);

  const sceneText = scene?.id === "crest" || !scene?.textKey ? "" : t(scene.textKey);
  const crestText = t("intro.title");
  // CTA fades in once the crest beat opens; doesn't wait for end-of-timeline.
  const showCta = elapsedMs >= 22500 || finished;

  return (
    <div
      className="intro-stage"
      role="dialog"
      aria-modal="true"
      aria-label={crestText}
    >
      <div
        className="intro-stage__camera"
        style={{
          transform: `translate3d(${(shake.x + cameraDriftX).toFixed(2)}px, ${(shake.y + cameraDriftY).toFixed(2)}px, 0) scale(${cameraScale.toFixed(4)})`,
          transformOrigin: `${cameraOrigin.x.toFixed(1)}% ${cameraOrigin.y.toFixed(1)}%`,
        }}
      >
        <IntroLayer
          src={INTRO_ASSETS.eclipseSky.src}
          className="intro-stage__layer intro-stage__layer--sky"
          fallbackColor="#070912"
        />

        {/* Two parallax fog layers — A is the high band that's always been
            there; B is a deeper, slower band beneath that adds depth. */}
        <IntroLayer
          src={INTRO_ASSETS.fogLayer.src}
          className="intro-stage__layer intro-stage__layer--fog intro-stage__layer--fog-a"
          fallbackColor="rgba(40, 36, 48, 0)"
          style={{
            opacity: fogOpacity,
            transform: `translate3d(${-fogShiftA}px, 0, 0)`,
          }}
        />
        <IntroLayer
          src={INTRO_ASSETS.fogLayer.src}
          className="intro-stage__layer intro-stage__layer--fog intro-stage__layer--fog-b"
          fallbackColor="rgba(40, 36, 48, 0)"
          style={{
            opacity: fogOpacity * 0.7,
            transform: `translate3d(${-fogShiftB}px, 0, 0) scaleY(1.15)`,
          }}
        />

        {/* Crows during scene 2. */}
        <div className="intro-stage__crows" style={{ opacity: crowOpacity }} aria-hidden="true">
          <div
            className="intro-stage__crow intro-stage__crow--lead"
            style={{ transform: `translate3d(${crowLeadVw.toFixed(2)}vw, 0, 0)` }}
          >
            <IntroSpriteEffect
              src={INTRO_SPRITE_ASSETS.crowLoop.src}
              frameCount={INTRO_SPRITE_ASSETS.crowLoop.frameCount}
              loopMs={INTRO_SPRITE_ASSETS.crowLoop.loopMs}
              className="intro-stage__crow-sprite"
              loopId="crowLead"
              blendMode="multiply"
            />
          </div>
          <div
            className="intro-stage__crow intro-stage__crow--trail"
            style={{ transform: `translate3d(${crowTrailVw.toFixed(2)}vw, 0, 0)` }}
          >
            <IntroSpriteEffect
              src={INTRO_SPRITE_ASSETS.crowLoop.src}
              frameCount={INTRO_SPRITE_ASSETS.crowLoop.frameCount}
              loopMs={INTRO_SPRITE_ASSETS.crowLoop.loopMs}
              className="intro-stage__crow-sprite"
              loopId="crowTrail"
              blendMode="multiply"
            />
          </div>
        </div>

        {/* Keep beat focus: subtle violet halo over the castle silhouette
            already drawn into the sky background. The PNG already ships
            with lit windows / torches, so we don't stack custom torch
            sprites on top (they read as duplicates and rarely line up
            with the painted windows). */}
        <div
          className="intro-stage__keep-glow"
          style={{ opacity: keepGlow }}
          aria-hidden="true"
        />

        {/* Boss + eye pulse share the same transform wrapper so the glow
            stays locked to the silhouette as it scales and translates.
            Earlier the eyes lived on a separate fixed overlay, which made
            them drift relative to the boss whenever the boss moved. */}
        <div
          className="intro-stage__boss-wrapper"
          style={{
            opacity: bossOpacity,
            // translateX(-50%) is required because the wrapper is anchored
            // with left: 50%; inline transform would otherwise override
            // the CSS translateX and shift the boss off-centre to the right.
            transform: `translate3d(calc(-50% + 0px), ${reducedMotion ? 0 : (1 - Math.min(1, bossOpacity / 0.75)) * 12}px, 0) scale(${bossScale.toFixed(4)})`,
            transformOrigin: "50% 95%",
          }}
        >
          <IntroLayer
            src={INTRO_ASSETS.bossShadow.src}
            className="intro-stage__layer--boss-img"
            fallbackColor="rgba(0, 0, 0, 0)"
            position="center bottom"
            size="contain"
          />
          {/* Eye-glow overlay removed: aligning two CSS dots with the
              painted eyes proved fragile across viewport aspect ratios.
              The PNG already includes lit eyes; we let those carry the
              effect instead of stacking a second pair on top. */}
        </div>

        <IntroLayer
          src={INTRO_ASSETS.lightningBolt.src}
          className="intro-stage__layer intro-stage__layer--lightning"
          fallbackColor="rgba(255, 244, 200, 0)"
          size="contain"
          position="left top"
          style={{ opacity: lightningOpacity }}
        />

        <div
          className="intro-stage__flash"
          style={{ opacity: lightningOpacity * 0.32 }}
          aria-hidden="true"
        />
        <div className="intro-stage__vignette" aria-hidden="true" />

        {/* Omen veil: opacity driven by a CSS animation so the opening
            reads as black even before the RAF timer kicks in. */}
        <div className="intro-stage__omen-veil" aria-hidden="true" />
      </div>

      <div
        className={`intro-stage__center ${scene?.id === "shadow" ? "intro-stage__center--lower" : ""}`}
      >
        <div
          className="intro-stage__crest"
          style={{
            opacity: crestOpacity,
            transform: `scale(${crestScale.toFixed(4)})`,
          }}
        >
          <div
            className="intro-stage__crest-glow"
            style={{ opacity: goldShineOpacity }}
            aria-hidden="true"
          />
          <div
            className="intro-stage__crest-rays"
            style={{ opacity: goldShineOpacity * 0.6 }}
            aria-hidden="true"
          />
          <IntroLayer
            src={INTRO_ASSETS.titleCrest.src}
            className="intro-stage__crest-img"
            fallbackColor="rgba(0,0,0,0)"
          />
          <div className="intro-stage__crest-text">{crestText}</div>
        </div>
        <div
          className={`intro-stage__text ${scene?.id === "shadow" ? "intro-stage__text--delayed" : ""}`}
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

      <style jsx global>{`
        .intro-stage {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #050608;
          overflow: hidden;
          font-family: inherit;
          color: #f5e7c1;
          /* No stage fade-in: the omen veil already handles the "open from
             black" beat, and a global opacity fade was letting Home/HUD
             bleed through during the first frames. */
          will-change: auto;
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
          left: -10% !important;
          right: -10% !important;
          /* Soft vertical mask so the fog dissolves at top and bottom. */
          mask-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 1) 32%,
            rgba(0, 0, 0, 1) 55%,
            rgba(0, 0, 0, 0.5) 80%,
            rgba(0, 0, 0, 0) 100%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 1) 32%,
            rgba(0, 0, 0, 1) 55%,
            rgba(0, 0, 0, 0.5) 80%,
            rgba(0, 0, 0, 0) 100%
          );
        }
        .intro-stage__layer--fog-a {
          /* Main fog body sits in the lower third of the sky — over the
             valley, not pasted across the top horizon. */
          top: 48% !important;
          bottom: 6% !important;
          filter: blur(1px);
        }
        .intro-stage__layer--fog-b {
          /* Secondary very-soft band hugging the mid-distance, fades top
             and bottom so it never reads as a rectangle. */
          top: 32% !important;
          bottom: 38% !important;
          filter: blur(3px);
        }
        .intro-stage__crows {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          will-change: opacity;
        }
        .intro-stage__crow {
          position: absolute;
          /* Aspect 1.5:1 (matches the sprite). Sized so the silhouettes
             are clearly visible against the sky in a typical viewport. */
          width: 72px;
          height: 48px;
          will-change: transform;
        }
        .intro-stage__crow--lead {
          top: 16%;
          left: 0;
        }
        .intro-stage__crow--trail {
          top: 26%;
          left: 0;
          width: 56px;
          height: 38px;
        }
        @media (max-width: 700px) {
          .intro-stage__crow {
            width: 52px;
            height: 35px;
          }
          .intro-stage__crow--trail {
            width: 40px;
            height: 27px;
          }
        }
        .intro-stage__keep-glow {
          position: absolute;
          /* Anchored over the castle silhouette in the upper-right of the
             eclipse-sky background. The previous box stretched too low so
             the bottom edge of the glow read as a separate light bleeding
             over the valley. */
          top: 14%;
          right: 6%;
          width: 30%;
          height: 38%;
          z-index: 3;
          pointer-events: none;
          background:
            radial-gradient(
              circle at 50% 50%,
              rgba(206, 186, 240, 0.22) 0%,
              rgba(150, 130, 220, 0.1) 24%,
              rgba(0, 0, 0, 0) 48%
            );
          mix-blend-mode: screen;
          filter: blur(14px);
          transition: opacity 800ms ease;
          animation: introKeepGlowBreath 3800ms ease-in-out infinite;
          will-change: opacity, transform;
        }
        @media (max-width: 700px) {
          .intro-stage__keep-glow {
            width: 46%;
            right: -2%;
          }
        }
        .intro-stage__layer--boss {
          z-index: 4;
        }
        .intro-stage__boss-wrapper {
          /* Sized to match the boss PNG (1536×1024 → 1.5:1) and anchored
             to the bottom-centre of the viewport. The image fills the
             wrapper exactly, so the boss-eyes overlay can be positioned
             with percentages that are PNG-relative, not viewport-relative.
             That keeps the glow locked onto the painted eyes regardless
             of the host viewport aspect ratio. */
          position: absolute;
          left: 50%;
          bottom: 0;
          height: 100%;
          aspect-ratio: 1536 / 1024;
          max-width: 100%;
          transform: translateX(-50%);
          z-index: 4;
          will-change: opacity, transform;
        }
        .intro-stage__layer--boss-img {
          position: absolute;
          inset: 0;
          /* The boss PNG ships with a near-white background, so multiply
             drops the white out (white × sky = sky) and leaves the dark
             silhouette + ember details visible against the night sky.
             Same trick as the crow loop. */
          mix-blend-mode: multiply;
        }
        .intro-stage__layer--lightning {
          z-index: 6;
          mix-blend-mode: screen;
          /* Smaller, off-centre to the upper-left so the bolt never slices
             through the boss silhouette or the text line. */
          top: -4%;
          left: -8%;
          width: 55%;
          height: 70%;
          inset: auto;
          opacity: 0.85; /* base intensity multiplied by lightningOpacity */
        }
        .intro-stage__flash {
          position: absolute;
          inset: 0;
          z-index: 7;
          background: radial-gradient(circle at 50% 38%, rgba(255, 244, 200, 0.78), rgba(255, 244, 200, 0.15) 38%, transparent 70%);
          pointer-events: none;
        }
        .intro-stage__vignette {
          position: absolute;
          inset: 0;
          z-index: 8;
          background: radial-gradient(circle at 50% 50%, transparent 55%, rgba(5, 6, 8, 0.78) 100%);
          pointer-events: none;
        }
        .intro-stage__omen-veil {
          position: absolute;
          inset: 0;
          z-index: 9;
          pointer-events: none;
          /* Solid black during the hold (controlled via animation opacity).
             The radial centre being 0.7 alpha previously let too much of
             the sky bleed through and killed the "opens from black" beat. */
          background: #050608;
          animation: introOmenLift 3500ms ease-out both;
          will-change: opacity;
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
          transition: justify-content 600ms ease;
        }
        .intro-stage__center--lower {
          /* During the boss reveal the narrative line drops into the
             lower third so it never overlaps the silhouette's eyes/core
             (which sit in the upper third of the frame). */
          justify-content: flex-end;
          padding-top: 0;
          padding-bottom: 8vh;
        }
        .intro-stage__text--delayed {
          /* Boss enters first, text comes ~800ms later so the audience
             reads the silhouette before the narrative names it. */
          animation-delay: 800ms;
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
          z-index: 2;
        }
        .intro-stage__crest-glow {
          position: absolute;
          inset: -32%;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(176, 142, 232, 0.58) 0%,
            rgba(108, 88, 184, 0.28) 35%,
            rgba(60, 50, 110, 0.12) 60%,
            rgba(60, 50, 110, 0) 72%
          );
          mix-blend-mode: screen;
          filter: blur(0.5px);
          animation: introCrestGlowPulse 2200ms ease-in-out infinite;
          will-change: opacity, transform;
        }
        .intro-stage__crest-rays {
          position: absolute;
          inset: -55%;
          z-index: 0;
          pointer-events: none;
          background: conic-gradient(
            from 0deg,
            rgba(176, 142, 232, 0) 0deg,
            rgba(176, 142, 232, 0.2) 10deg,
            rgba(176, 142, 232, 0) 30deg,
            rgba(225, 210, 255, 0.16) 70deg,
            rgba(225, 210, 255, 0) 90deg,
            rgba(176, 142, 232, 0.2) 130deg,
            rgba(176, 142, 232, 0) 150deg,
            rgba(225, 210, 255, 0.16) 190deg,
            rgba(225, 210, 255, 0) 210deg,
            rgba(176, 142, 232, 0.2) 250deg,
            rgba(176, 142, 232, 0) 270deg,
            rgba(225, 210, 255, 0.16) 310deg,
            rgba(225, 210, 255, 0) 330deg
          );
          mix-blend-mode: screen;
          mask: radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 1) 30%, transparent 75%);
          -webkit-mask: radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 1) 30%, transparent 75%);
          animation: introCrestRaysSpin 9s linear infinite;
          will-change: transform, opacity;
        }
        .intro-stage__crest-text {
          position: absolute;
          left: 0;
          right: 0;
          bottom: -3rem;
          text-align: center;
          font-family: "IM Fell English SC", "Cormorant SC", "Cormorant Garamond",
            "Trajan Pro", "Garamond", "Georgia", serif;
          font-weight: 700;
          font-variant: small-caps;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          font-size: clamp(20px, 3.6vw, 36px);
          color: #e7d6b3;
          text-shadow:
            0 0 14px rgba(196, 168, 240, 0.45),
            0 2px 10px rgba(60, 40, 90, 0.55),
            0 0 2px rgba(245, 220, 180, 0.5);
        }
        .intro-stage__text {
          margin-top: clamp(2rem, 6vh, 5rem);
          font-size: clamp(18px, 3.2vw, 30px);
          font-weight: 700;
          letter-spacing: 0.06em;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.6);
          opacity: 0;
          /* Each beat is 4s, so the text now holds longer: 0.6s in, 2.6s hold, 0.8s out. */
          animation: introTextIn 4000ms ease both;
          max-width: 92vw;
          text-align: center;
        }
        /* Buttons styled as dark-fantasy chips: muted dark ink, thin gold
           trim, serif label, no glassy web vibe. */
        .intro-stage__skip,
        .intro-stage__cta {
          position: absolute;
          z-index: 20;
          pointer-events: auto;
          font-family: "IM Fell English SC", "Cormorant SC", "Cormorant Garamond",
            "Trajan Pro", "Garamond", "Georgia", serif;
          color: #e8d59a;
          cursor: pointer;
          transition: background 220ms ease, transform 180ms ease,
            border-color 220ms ease, color 200ms ease;
        }
        .intro-stage__skip {
          /* Compact chip in the corner — easy to focus, hard to misread
             as the main CTA. */
          top: max(env(safe-area-inset-top, 0px) + 16px, 18px);
          right: max(env(safe-area-inset-right, 0px) + 16px, 18px);
          border: 1px solid rgba(196, 162, 92, 0.35);
          background: rgba(7, 9, 12, 0.45);
          padding: 0.32rem 0.78rem;
          border-radius: 4px;
          font-weight: 700;
          font-variant: small-caps;
          letter-spacing: 0.22em;
          font-size: 10px;
          text-transform: lowercase;
        }
        .intro-stage__cta {
          bottom: max(env(safe-area-inset-bottom, 0px) + 32px, 40px);
          left: 50%;
          transform: translateX(-50%);
          /* Larger, gold-trimmed plate with a double-line border for the
             medieval/dark-fantasy look. */
          padding: 0.85rem 2.2rem;
          font-size: 14px;
          font-weight: 700;
          font-variant: small-caps;
          letter-spacing: 0.28em;
          text-transform: lowercase;
          color: #f3e2b4;
          background: linear-gradient(
            180deg,
            rgba(28, 22, 16, 0.85),
            rgba(14, 10, 6, 0.9)
          );
          border: 1px solid rgba(196, 162, 92, 0.7);
          border-radius: 2px;
          box-shadow:
            inset 0 0 0 1px rgba(245, 220, 160, 0.18),
            0 6px 24px rgba(0, 0, 0, 0.55);
          animation: introCtaIn 600ms ease both;
        }
        .intro-stage__skip:hover {
          background: rgba(20, 14, 6, 0.6);
          border-color: rgba(220, 184, 110, 0.55);
          color: #f5e7c1;
        }
        .intro-stage__cta:hover {
          transform: translateX(-50%) translateY(-1px);
          border-color: rgba(245, 220, 160, 0.95);
          color: #fff3cc;
        }

        @keyframes introStageFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes introOmenLift {
          0% {
            opacity: 1;
          }
          40% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes introKeepGlowBreath {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }
        @keyframes introCrestGlowPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }
        @keyframes introCrestRaysSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes introTextIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          15% {
            opacity: 1;
            transform: translateY(0);
          }
          82% {
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
          .intro-stage__layer--boss {
            transform: none !important;
          }
          .intro-stage__crest-rays,
          .intro-stage__crest-glow,
          .intro-stage__keep-glow,
          .intro-stage__torch {
            animation: none !important;
            transform: none !important;
          }
          .intro-stage__text {
            animation-duration: 2400ms;
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
 * Lightning curve over the full timeline. Brief, dramatic strikes — each
 * peak lasts under ~160 ms and most decay in <250 ms. Only three flashes
 * in total to keep the cinematic from feeling lightning-heavy.
 *  - 2200 ms: distant flicker far in the omen background.
 *  - 9500 ms: mid-roads strike, low intensity.
 *  - 16200 ms: revealing strike on the boss, short but bright.
 */
