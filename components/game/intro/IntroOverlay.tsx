import { IntroCrest } from "./IntroCrest";

type IntroOverlayProps = {
  crestOpacity: number;
  crestScale: number;
  crestText: string;
  goldShineOpacity: number;
  isShadowScene: boolean;
  onEnter: () => void;
  onSkip: () => void;
  sceneId?: string;
  sceneText: string;
  showCta: boolean;
  skipLabel: string;
  enterLabel: string;
};

export function IntroOverlay({
  crestOpacity,
  crestScale,
  crestText,
  goldShineOpacity,
  isShadowScene,
  onEnter,
  onSkip,
  sceneId,
  sceneText,
  showCta,
  skipLabel,
  enterLabel,
}: IntroOverlayProps) {
  return (
    <>
      <div
        className={`intro-stage__center ${isShadowScene ? "intro-stage__center--lower" : ""}`}
      >
        <IntroCrest
          opacity={crestOpacity}
          scale={crestScale}
          shineOpacity={goldShineOpacity}
          title={crestText}
        />
        <div
          className={`intro-stage__text ${isShadowScene ? "intro-stage__text--delayed" : ""}`}
          key={sceneId ?? "none"}
        >
          {sceneText}
        </div>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="intro-stage__skip"
        aria-label={skipLabel}
      >
        {skipLabel}
      </button>

      {showCta ? (
        <button type="button" onClick={onEnter} className="intro-stage__cta">
          {enterLabel}
        </button>
      ) : null}
    </>
  );
}
