import { INTRO_ASSETS } from "@/lib/introAssets";
import { IntroLayer } from "./IntroLayer";

type IntroBossProps = {
  opacity: number;
  reducedMotion: boolean;
  scale: number;
};

export function IntroBoss({ opacity, reducedMotion, scale }: IntroBossProps) {
  return (
    <div
      className="intro-stage__boss-wrapper"
      style={{
        opacity,
        // translateX(-50%) is required because the wrapper is anchored
        // with left: 50%; inline transform would otherwise override
        // the CSS translateX and shift the boss off-centre to the right.
        transform: `translate3d(calc(-50% + 0px), ${reducedMotion ? 0 : (1 - Math.min(1, opacity / 0.75)) * 12}px, 0) scale(${scale.toFixed(4)})`,
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
      {/* Eye-glow overlay removed: aligning two CSS dots with the painted eyes
          proved fragile across viewport aspect ratios. The PNG already includes
          lit eyes, so it carries the effect without a second overlay. */}
    </div>
  );
}
