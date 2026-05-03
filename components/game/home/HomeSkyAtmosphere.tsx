"use client";

import { getHomeCrowFlyAsset } from "@/lib/homeAtmosphereAssets";

export function HomeSkyAtmosphere() {
  const crow = getHomeCrowFlyAsset();

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true" data-home-sky-atmosphere="1">
      <style jsx global>{`
        @keyframes homeCrowFlight {
          0%, 12% {
            opacity: 0;
            transform: translate3d(-170px, 0, 0);
          }
          19% {
            opacity: 0.9;
          }
          48% {
            opacity: 0.96;
          }
          74% {
            opacity: 0.64;
          }
          88%, 100% {
            opacity: 0;
            transform: translate3d(2220px, 38px, 0);
          }
        }

        @keyframes homeCrowFlightReverse {
          0%, 18% {
            opacity: 0;
            transform: translate3d(2050px, -10px, 0);
          }
          26% {
            opacity: 0.82;
          }
          54% {
            opacity: 0.88;
          }
          78% {
            opacity: 0.52;
          }
          92%, 100% {
            opacity: 0;
            transform: translate3d(-190px, 18px, 0);
          }
        }

        @keyframes homeCrowWingLoop {
          0%, 16.666% { left: 0%; }
          16.667%, 33.333% { left: -100%; }
          33.334%, 50% { left: -200%; }
          50.001%, 66.666% { left: -300%; }
          66.667%, 83.333% { left: -400%; }
          83.334%, 100% { left: -500%; }
        }

        .home-crow-flight {
          position: absolute;
          left: 0;
          top: 148px;
          width: 1px;
          height: 1px;
          opacity: 0;
          animation: homeCrowFlight 38s ease-in-out 7s infinite;
          will-change: transform, opacity;
        }

        .home-crow-flight--reverse {
          top: 78px;
          animation-name: homeCrowFlightReverse;
          animation-duration: 44s;
          animation-delay: 16s;
        }

        .home-crow-sprite {
          position: absolute;
          overflow: hidden;
          width: var(--home-crow-width);
          height: var(--home-crow-height);
          opacity: var(--home-crow-opacity);
          transform: translate3d(var(--home-crow-x), var(--home-crow-y), 0) scaleX(var(--home-crow-flip-x, 1)) scale(var(--home-crow-scale));
          transform-origin: center;
          contain: paint;
        }

        .home-crow-strip {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 600%;
          background-image: var(--home-crow-image);
          background-position: 0 50%;
          background-repeat: no-repeat;
          background-size: 100% auto;
          animation: homeCrowWingLoop 720ms steps(6) infinite;
          will-change: left;
        }

        @media (max-width: 700px), (prefers-reduced-motion: reduce) {
          .home-crow-flight {
            display: none;
          }
        }
      `}</style>

      {crow ? (
        <>
          <span className="home-crow-flight" data-home-crow-flight="1">
            <CrowSprite src={crow.src} x="0px" y="0px" width="64px" height="42px" scale="1" opacity="0.94" />
            <CrowSprite src={crow.src} x="42px" y="18px" width="48px" height="32px" scale="0.88" opacity="0.9" />
            <CrowSprite src={crow.src} x="-40px" y="24px" width="43px" height="29px" scale="0.78" opacity="0.82" />
          </span>
          <span className="home-crow-flight home-crow-flight--reverse" data-home-crow-flight="1">
            <CrowSprite src={crow.src} x="0px" y="0px" width="48px" height="32px" scale="0.86" opacity="0.86" flip />
            <CrowSprite src={crow.src} x="-34px" y="18px" width="38px" height="25px" scale="0.72" opacity="0.72" flip />
          </span>
        </>
      ) : null}
    </div>
  );
}

function CrowSprite({
  src,
  x,
  y,
  width,
  height,
  scale,
  opacity,
  flip = false,
}: {
  src: string;
  x: string;
  y: string;
  width: string;
  height: string;
  scale: string;
  opacity: string;
  flip?: boolean;
}) {
  return (
    <span
      className="home-crow-sprite"
      data-home-crow-sprite="1"
      style={{
        ["--home-crow-image" as string]: `url("${src}")`,
        ["--home-crow-x" as string]: x,
        ["--home-crow-y" as string]: y,
        ["--home-crow-width" as string]: width,
        ["--home-crow-height" as string]: height,
        ["--home-crow-scale" as string]: scale,
        ["--home-crow-opacity" as string]: opacity,
        ["--home-crow-flip-x" as string]: flip ? "-1" : "1",
      }}
    >
      <span className="home-crow-strip" />
    </span>
  );
}
