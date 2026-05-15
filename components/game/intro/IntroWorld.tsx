import { INTRO_ASSETS } from "@/lib/introAssets";
import { IntroBoss } from "./IntroBoss";
import { IntroCrows } from "./IntroCrows";
import { IntroLayer } from "./IntroLayer";

type IntroWorldProps = {
  bossOpacity: number;
  bossScale: number;
  cameraDriftX: number;
  cameraDriftY: number;
  cameraOrigin: {
    x: number;
    y: number;
  };
  cameraScale: number;
  crowLeadVw: number;
  crowOpacity: number;
  crowTrailVw: number;
  fogOpacity: number;
  fogShiftA: number;
  fogShiftB: number;
  keepGlow: number;
  lightningOpacity: number;
  reducedMotion: boolean;
  shake: {
    x: number;
    y: number;
  };
};

export function IntroWorld({
  bossOpacity,
  bossScale,
  cameraDriftX,
  cameraDriftY,
  cameraOrigin,
  cameraScale,
  crowLeadVw,
  crowOpacity,
  crowTrailVw,
  fogOpacity,
  fogShiftA,
  fogShiftB,
  keepGlow,
  lightningOpacity,
  reducedMotion,
  shake,
}: IntroWorldProps) {
  return (
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

      {/* Two parallax fog layers - A is the high band that's always been
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

      <IntroCrows opacity={crowOpacity} leadVw={crowLeadVw} trailVw={crowTrailVw} />

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

      <IntroBoss opacity={bossOpacity} reducedMotion={reducedMotion} scale={bossScale} />

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
  );
}
