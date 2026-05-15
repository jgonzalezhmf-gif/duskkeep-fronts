import { INTRO_ASSETS } from "@/lib/introAssets";
import { IntroLayer } from "./IntroLayer";

type IntroCrestProps = {
  opacity: number;
  scale: number;
  shineOpacity: number;
  title: string;
};

export function IntroCrest({ opacity, scale, shineOpacity, title }: IntroCrestProps) {
  return (
    <div
      className="intro-stage__crest"
      style={{
        opacity,
        transform: `scale(${scale.toFixed(4)})`,
      }}
    >
      <div
        className="intro-stage__crest-glow"
        style={{ opacity: shineOpacity }}
        aria-hidden="true"
      />
      <div
        className="intro-stage__crest-rays"
        style={{ opacity: shineOpacity * 0.6 }}
        aria-hidden="true"
      />
      <IntroLayer
        src={INTRO_ASSETS.titleCrest.src}
        className="intro-stage__crest-img"
        fallbackColor="rgba(0,0,0,0)"
      />
      <div className="intro-stage__crest-text">{title}</div>
    </div>
  );
}
