import { INTRO_SPRITE_ASSETS } from "@/lib/introAssets";
import { IntroSpriteEffect } from "./IntroSpriteEffect";

type IntroCrowsProps = {
  opacity: number;
  leadVw: number;
  trailVw: number;
};

export function IntroCrows({ opacity, leadVw, trailVw }: IntroCrowsProps) {
  return (
    <div className="intro-stage__crows" style={{ opacity }} aria-hidden="true">
      <div
        className="intro-stage__crow intro-stage__crow--lead"
        style={{ transform: `translate3d(${leadVw.toFixed(2)}vw, 0, 0)` }}
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
        style={{ transform: `translate3d(${trailVw.toFixed(2)}vw, 0, 0)` }}
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
  );
}
