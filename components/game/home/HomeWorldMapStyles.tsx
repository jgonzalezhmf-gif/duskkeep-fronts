"use client";

export default function HomeWorldMapStyles() {
  return (
    <style jsx global>{`
      @keyframes homeHudPulse {
        0%, 100% { opacity: 0.4; transform: scale(0.98); }
        50% { opacity: 0.95; transform: scale(1.06); }
      }
      @keyframes homeMarkerFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes homeDockBreathe {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
      @keyframes homeIconAura {
        0%, 100% { opacity: 0.56; transform: scale(0.94); }
        50% { opacity: 1; transform: scale(1.05); }
      }
      @keyframes homeIconSweep {
        0%, 100% { opacity: 0.16; transform: translateY(-6%) scaleX(0.84); }
        50% { opacity: 0.42; transform: translateY(6%) scaleX(1); }
      }
      @keyframes homeResourceGlint {
        0%, 100% { opacity: 0.3; transform: translateX(-10%) skewX(-18deg); }
        50% { opacity: 0.8; transform: translateX(10%) skewX(-18deg); }
      }
      @keyframes homeBeaconPulse {
        0%, 100% { opacity: 0.36; transform: scale(0.92); }
        50% { opacity: 0.92; transform: scale(1.1); }
      }
      @keyframes homeBeaconOrbit {
        0% { transform: rotate(0deg) translateX(13px) rotate(0deg); opacity: 0.42; }
        50% { opacity: 0.9; }
        100% { transform: rotate(360deg) translateX(13px) rotate(-360deg); opacity: 0.42; }
      }
      @keyframes homeBeaconRay {
        0%, 100% { opacity: 0.12; transform: translate(-50%, -50%) scaleY(0.92); }
        50% { opacity: 0.44; transform: translate(-50%, -50%) scaleY(1.08); }
      }
      @keyframes homePlaqueGlow {
        0%, 100% { box-shadow: 0 16px 28px rgba(0,0,0,0.32); }
        50% { box-shadow: 0 18px 34px rgba(0,0,0,0.34), 0 0 22px rgba(255,255,255,0.08); }
      }
      @keyframes homeZoneBreath {
        0%, 100% { opacity: 0.22; transform: scale(0.96); }
        50% { opacity: 0.7; transform: scale(1.04); }
      }
      @keyframes homeRibbonSweep {
        0% { opacity: 0; transform: translateX(-42%) skewX(-18deg); }
        18% { opacity: 0.34; }
        46% { opacity: 0.12; }
        100% { opacity: 0; transform: translateX(40%) skewX(-18deg); }
      }
    `}</style>
  );
}
