"use client";

import { getHomeCloudLayerAsset, getHomeCrowFlyAsset } from "@/lib/homeAtmosphereAssets";

export function AdventureSkyAtmosphere() {
  const clouds = getHomeCloudLayerAsset();
  const crow = getHomeCrowFlyAsset();

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true" data-adventure-sky-atmosphere="1">
      <style jsx global>{`
        @keyframes adventureCloudDriftNearLeft {
          0% { transform: translate3d(-9%, 0, 0) scale(1.14); }
          100% { transform: translate3d(9%, -2.4%, 0) scale(1.19); }
        }

        @keyframes adventureCloudDriftNearRight {
          0% { transform: translate3d(8%, 0, 0) scale(1.08); }
          100% { transform: translate3d(-9%, 1.8%, 0) scale(1.13); }
        }

        @keyframes adventureCloudDriftFar {
          0% { transform: translate3d(-5%, 0, 0) scale(0.62); }
          100% { transform: translate3d(7%, -1.2%, 0) scale(0.67); }
        }

        @keyframes adventureCrowToHorizon {
          0%, 10% {
            opacity: 0;
            transform: translate3d(-180px, 210px, 0) scale(1.42) rotate(-4deg);
          }
          17% {
            opacity: 0.92;
          }
          48% {
            opacity: 0.82;
          }
          74% {
            opacity: 0.42;
          }
          94%, 100% {
            opacity: 0;
            transform: translate3d(1240px, 54px, 0) scale(0.28) rotate(-10deg);
          }
        }

        @keyframes adventureCrowToHorizonReverse {
          0%, 18% {
            opacity: 0;
            transform: translate3d(2040px, 132px, 0) scale(0.86) rotate(6deg);
          }
          27% {
            opacity: 0.72;
          }
          58% {
            opacity: 0.58;
          }
          88%, 100% {
            opacity: 0;
            transform: translate3d(890px, 40px, 0) scale(0.22) rotate(11deg);
          }
        }

        @keyframes adventureCrowFromRightLow {
          0%, 15% {
            opacity: 0;
            transform: translate3d(2150px, 260px, 0) scale(1.16) rotate(7deg);
          }
          24% {
            opacity: 0.84;
          }
          52% {
            opacity: 0.76;
          }
          78% {
            opacity: 0.34;
          }
          94%, 100% {
            opacity: 0;
            transform: translate3d(980px, 72px, 0) scale(0.24) rotate(14deg);
          }
        }

        @keyframes adventureCrowWingLoop {
          0%, 16.666% { left: 0%; }
          16.667%, 33.333% { left: -100%; }
          33.334%, 50% { left: -200%; }
          50.001%, 66.666% { left: -300%; }
          66.667%, 83.333% { left: -400%; }
          83.334%, 100% { left: -500%; }
        }

        .adventure-cloud-layer {
          position: absolute;
          background-image: var(--adventure-cloud-image);
          background-repeat: no-repeat;
          background-size: 100% 100%;
          background-position: 50% 50%;
          opacity: var(--adventure-cloud-opacity);
          filter: blur(var(--adventure-cloud-blur));
          -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 0 40%, rgba(0,0,0,0.72) 58%, transparent 82%);
          mask-image: radial-gradient(ellipse at 50% 50%, black 0 40%, rgba(0,0,0,0.72) 58%, transparent 82%);
          will-change: transform;
        }

        .adventure-cloud-layer--left {
          left: -12%;
          top: 8%;
          width: 56%;
          height: 18%;
          animation: adventureCloudDriftNearLeft 56s linear infinite alternate;
        }

        .adventure-cloud-layer--right {
          right: -14%;
          top: 15%;
          width: 60%;
          height: 20%;
          animation: adventureCloudDriftNearRight 64s linear infinite alternate;
        }

        .adventure-cloud-layer--far-a {
          left: 18%;
          top: 4%;
          width: 42%;
          height: 10%;
          animation: adventureCloudDriftFar 88s linear infinite alternate;
        }

        .adventure-cloud-layer--far-b {
          right: 18%;
          top: 9%;
          width: 36%;
          height: 9%;
          animation: adventureCloudDriftFar 78s linear infinite alternate-reverse;
        }

        .adventure-crow-flight {
          position: absolute;
          left: 0;
          top: 0;
          width: 1px;
          height: 1px;
          opacity: 0;
          animation: adventureCrowToHorizon 34s cubic-bezier(0.16, 1, 0.3, 1) 5s infinite;
          will-change: transform, opacity;
        }

        .adventure-crow-flight--reverse {
          animation-name: adventureCrowToHorizonReverse;
          animation-duration: 42s;
          animation-delay: 18s;
        }

        .adventure-crow-flight--right-low {
          animation-name: adventureCrowFromRightLow;
          animation-duration: 37s;
          animation-delay: 29s;
        }

        .adventure-crow-sprite {
          position: absolute;
          overflow: hidden;
          width: var(--adventure-crow-width);
          height: var(--adventure-crow-height);
          opacity: var(--adventure-crow-opacity);
          transform: translate3d(var(--adventure-crow-x), var(--adventure-crow-y), 0) scaleX(var(--adventure-crow-flip-x, 1)) scale(var(--adventure-crow-scale));
          transform-origin: center;
          contain: paint;
        }

        .adventure-crow-strip {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 600%;
          background-image: var(--adventure-crow-image);
          background-position: 0 50%;
          background-repeat: no-repeat;
          background-size: 100% auto;
          animation: adventureCrowWingLoop 680ms steps(6) infinite;
          will-change: left;
        }

        @media (max-width: 700px) {
          .adventure-crow-flight {
            display: none;
          }

          .adventure-cloud-layer--far-b {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .adventure-cloud-layer,
          .adventure-crow-flight,
          .adventure-crow-strip {
            animation: none !important;
          }

          .adventure-crow-flight {
            opacity: 0 !important;
          }
        }
      `}</style>

      {clouds ? (
        <>
          <CloudLayer src={clouds.src} className="adventure-cloud-layer--left" opacity="0.28" blur="0.7px" />
          <CloudLayer src={clouds.src} className="adventure-cloud-layer--right" opacity="0.31" blur="0.55px" />
          <CloudLayer src={clouds.src} className="adventure-cloud-layer--far-a" opacity="0.16" blur="1.3px" />
          <CloudLayer src={clouds.src} className="adventure-cloud-layer--far-b" opacity="0.13" blur="1.6px" />
        </>
      ) : null}

      {crow ? (
        <>
          <span className="adventure-crow-flight" data-adventure-crow-flight="1">
            <CrowSprite src={crow.src} x="0px" y="0px" width="74px" height="49px" scale="1" opacity="0.96" />
            <CrowSprite src={crow.src} x="58px" y="28px" width="54px" height="36px" scale="0.88" opacity="0.88" />
            <CrowSprite src={crow.src} x="-54px" y="36px" width="48px" height="32px" scale="0.78" opacity="0.78" />
          </span>
          <span className="adventure-crow-flight adventure-crow-flight--reverse" data-adventure-crow-flight="1">
            <CrowSprite src={crow.src} x="0px" y="0px" width="50px" height="34px" scale="0.78" opacity="0.74" flip />
            <CrowSprite src={crow.src} x="-40px" y="21px" width="38px" height="26px" scale="0.64" opacity="0.62" flip />
          </span>
          <span className="adventure-crow-flight adventure-crow-flight--right-low" data-adventure-crow-flight="1">
            <CrowSprite src={crow.src} x="0px" y="0px" width="62px" height="41px" scale="0.9" opacity="0.82" flip />
            <CrowSprite src={crow.src} x="-52px" y="26px" width="44px" height="30px" scale="0.72" opacity="0.68" flip />
            <CrowSprite src={crow.src} x="38px" y="34px" width="36px" height="24px" scale="0.58" opacity="0.56" flip />
          </span>
        </>
      ) : null}
    </div>
  );
}

function CloudLayer({ src, className, opacity, blur }: { src: string; className: string; opacity: string; blur: string }) {
  return (
    <span
      className={`adventure-cloud-layer ${className}`}
      style={{
        ["--adventure-cloud-image" as string]: `url("${src}")`,
        ["--adventure-cloud-opacity" as string]: opacity,
        ["--adventure-cloud-blur" as string]: blur,
      }}
    />
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
      className="adventure-crow-sprite"
      data-adventure-crow-sprite="1"
      style={{
        ["--adventure-crow-image" as string]: `url("${src}")`,
        ["--adventure-crow-x" as string]: x,
        ["--adventure-crow-y" as string]: y,
        ["--adventure-crow-width" as string]: width,
        ["--adventure-crow-height" as string]: height,
        ["--adventure-crow-scale" as string]: scale,
        ["--adventure-crow-opacity" as string]: opacity,
        ["--adventure-crow-flip-x" as string]: flip ? "-1" : "1",
      }}
    >
      <span className="adventure-crow-strip" />
    </span>
  );
}
