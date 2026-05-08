"use client";

import { HomeEffectSpriteStyles } from "@/components/game/home/HomeEffectSprite";

export function HomeSceneStyles() {
  return (
    <>
      <style jsx global>{`
        @keyframes homeCloudDrift {
          0% { transform: translateX(-5%); }
          100% { transform: translateX(5%); }
        }
        @keyframes homeCloudDriftReverse {
          0% { transform: translateX(5%); }
          100% { transform: translateX(-5%); }
        }
        @keyframes homeBannerWave {
          0%, 100% { transform: rotate(-1deg) skewY(0deg); }
          50% { transform: rotate(2deg) skewY(4deg); }
        }
        @keyframes homePulseWindow {
          0%, 100% { opacity: 0.52; }
          50% { opacity: 1; }
        }
        @keyframes homeTorchFlicker {
          0%, 100% { opacity: 0.54; transform: scale(0.92); filter: drop-shadow(0 0 8px rgba(255,215,122,0.26)); }
          45% { opacity: 0.98; transform: scale(1.08); filter: drop-shadow(0 0 18px rgba(255,215,122,0.48)); }
          72% { opacity: 0.8; transform: scale(1); filter: drop-shadow(0 0 10px rgba(255,215,122,0.32)); }
        }
        @keyframes homeRuneOrbit {
          0%, 100% { opacity: 0.34; transform: translateY(0) rotate(0deg); }
          50% { opacity: 0.88; transform: translateY(-6px) rotate(18deg); }
        }
        @keyframes homeAwningSway {
          0%, 100% { transform: skewX(0deg) translateY(0); }
          50% { transform: skewX(7deg) translateY(1px); }
        }
        @keyframes homeSmokeLift {
          0% { transform: translateY(0) scale(0.9); opacity: 0.18; }
          40% { opacity: 0.34; }
          100% { transform: translateY(-24px) scale(1.24); opacity: 0; }
        }
        @keyframes homeWindmillSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes homeBoatBob {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-3px) rotate(1deg); }
        }
        @keyframes homeZoneSweep {
          0%, 100% { opacity: 0.16; transform: scaleX(0.94); }
          50% { opacity: 0.44; transform: scaleX(1.04); }
        }
        .home-flag,
        .home-lantern,
        .home-window,
        .home-awning,
        .home-rune,
        .home-sail,
        .home-smoke,
        .home-windmill,
        .home-boat {
          transform-box: fill-box;
          transform-origin: center;
        }
        .home-flag { animation: homeBannerWave 3.8s ease-in-out infinite; transform-origin: top center; }
        .home-lantern { animation: homePulseWindow 5.2s ease-in-out infinite; }
        .home-window { animation: homePulseWindow 4s ease-in-out infinite; }
        .home-torch { animation: homeTorchFlicker 2.6s ease-in-out infinite; }
        .home-rune { animation: homeRuneOrbit 4.4s ease-in-out infinite; }
        .home-awning { animation: homeAwningSway 3.8s ease-in-out infinite; transform-origin: top center; }
        .home-sail { animation: homeBannerWave 4.4s ease-in-out infinite; transform-origin: left center; }
        .home-smoke { animation: homeSmokeLift 5.4s ease-out infinite; }
        .home-windmill { animation: homeWindmillSpin 10s linear infinite; transform-origin: center; }
        .home-boat { animation: homeBoatBob 4.6s ease-in-out infinite; transform-origin: center; }
        .home-landmark-piece {
          transform: translate(-50%, -100%);
          filter: saturate(0.9) contrast(1.03) brightness(0.9);
          transition: filter 220ms ease, transform 220ms ease, opacity 220ms ease;
          contain: layout paint;
        }
        .home-landmark-piece[data-active="1"] {
          transform: translate(-50%, -101%) scale(1.018);
          filter: saturate(0.98) contrast(1.04) brightness(0.98);
        }
        .home-landmark-piece[data-home-landmark="fortress"] {
          filter: saturate(0.88) contrast(1.04) brightness(0.9);
        }
        .home-landmark-piece[data-home-landmark="adventure"] {
          filter: saturate(0.94) contrast(1.04) brightness(0.92);
        }
        .home-landmark-piece[data-home-landmark="events"] {
          filter: saturate(0.96) contrast(1.04) brightness(0.92);
        }
        .home-landmark-image {
          image-rendering: auto;
          user-select: none;
        }
        .home-landmark-life {
          pointer-events: none;
          overflow: visible;
          contain: paint;
        }
        @media (max-width: 700px), (prefers-reduced-motion: reduce) {
          .home-flag,
          .home-lantern,
          .home-window,
          .home-torch,
          .home-rune,
          .home-awning,
          .home-sail,
          .home-smoke,
          .home-windmill,
          .home-boat {
            animation: none !important;
          }
        }
      `}</style>
      <HomeEffectSpriteStyles />
    </>
  );
}
