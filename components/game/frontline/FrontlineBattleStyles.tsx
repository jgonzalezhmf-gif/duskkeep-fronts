"use client";

export function FrontlineBattleStyles() {
  return (
      <style>{`
        @keyframes frontline-hit {
          0% { transform: translateX(0) scale(1); filter: brightness(1); box-shadow: 0 0 0 rgba(240,95,114,0); }
          16% { transform: translateX(-10px) scale(1.055); filter: brightness(1.65) saturate(1.18); box-shadow: 0 0 34px rgba(240,95,114,0.42); }
          34% { transform: translateX(9px) scale(1.035); filter: brightness(1.28) saturate(1.1); }
          52% { transform: translateX(-5px) scale(1.02); }
          100% { transform: translateX(0) scale(1); filter: brightness(1); box-shadow: 0 0 0 rgba(240,95,114,0); }
        }
        @keyframes frontline-float {
          0% { opacity: 0; transform: translate(-50%, 18px) scale(0.74); filter: blur(1px); }
          14% { opacity: 1; transform: translate(-50%, -3px) scale(1.22); filter: blur(0); }
          46% { opacity: 1; transform: translate(-50%, -22px) scale(1.05); }
          100% { opacity: 0; transform: translate(-50%, -68px) scale(0.92); }
        }
        @keyframes frontline-breach {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.52) rotate(-8deg); filter: brightness(1); }
          24% { opacity: 1; transform: translate(-50%, -50%) scale(1.08) rotate(0deg); filter: brightness(1.3); }
          64% { opacity: 0.72; transform: translate(-50%, -50%) scale(1.55) rotate(4deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.05) rotate(9deg); }
        }
        @keyframes frontline-idle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.012); }
        }
        @keyframes frontline-attack-ally {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          14% { transform: translate3d(0, 7px, 0) scale(0.97); filter: brightness(1.02); }
          38% { transform: translate3d(0, -24px, 0) scale(1.16); filter: brightness(1.45) drop-shadow(0 0 24px rgba(245,196,81,0.42)); }
          62% { transform: translate3d(0, -20px, 0) scale(1.12); filter: brightness(1.34) drop-shadow(0 0 20px rgba(245,196,81,0.36)); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes frontline-attack-enemy {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          14% { transform: translate3d(0, -7px, 0) scale(0.97); filter: brightness(1.02); }
          38% { transform: translate3d(0, 24px, 0) scale(1.16); filter: brightness(1.45) drop-shadow(0 0 24px rgba(240,95,114,0.42)); }
          62% { transform: translate3d(0, 20px, 0) scale(1.12); filter: brightness(1.34) drop-shadow(0 0 20px rgba(240,95,114,0.36)); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes frontline-shield {
          0% { opacity: 0; transform: scale(0.84); }
          36% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 0; transform: scale(1.18); }
        }
        @keyframes frontline-heal {
          0% { opacity: 0; transform: scale(0.85) translateY(8px); }
          35% { opacity: 1; transform: scale(1.05) translateY(0); }
          100% { opacity: 0; transform: scale(1.18) translateY(-12px); }
        }
        @keyframes frontline-ko {
          0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); filter: blur(0) grayscale(0); }
          100% { opacity: 0.28; transform: translateY(12px) rotate(-3deg) scale(0.88); filter: blur(1px) grayscale(0.6); }
        }
        @keyframes frontline-death-ghost {
          0% { opacity: 0; transform: translate(-50%, -50%) translateY(0) scale(0.94) rotate(0deg); filter: brightness(1.4) saturate(1.15) blur(0); }
          16% { opacity: 1; transform: translate(-50%, -50%) translateY(-3px) scale(1.08) rotate(-1deg); filter: brightness(1.65) saturate(1.25) blur(0); }
          45% { opacity: 0.88; transform: translate(-50%, -50%) translateY(-12px) scale(0.98) rotate(2deg); filter: brightness(1.18) saturate(0.9) grayscale(0.2) blur(0.4px); }
          100% { opacity: 0; transform: translate(-50%, -50%) translateY(-44px) scale(0.68) rotate(8deg); filter: brightness(0.8) saturate(0.35) grayscale(0.85) blur(2px); }
        }
        @keyframes frontline-death-soul {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          20% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.96); }
          100% { opacity: 0; transform: translate(-50%, -78%) scale(1.48); }
        }
        @keyframes frontline-card-ready {
          0%, 100% { filter: brightness(1); box-shadow: 0 18px 38px rgba(0,0,0,0.3); }
          50% { filter: brightness(1.05); box-shadow: 0 22px 44px rgba(245,196,81,0.1), 0 18px 38px rgba(0,0,0,0.3); }
        }
        @keyframes frontline-card-selected {
          0%, 100% { transform: translateY(-7px) scale(1.035); filter: brightness(1.12); }
          50% { transform: translateY(-10px) scale(1.055); filter: brightness(1.24) saturate(1.08); }
        }
        @keyframes frontline-target-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        @keyframes frontline-support-pop {
          0% { opacity: 0; transform: translateY(8px) scale(0.72); }
          45% { opacity: 1; transform: translateY(-2px) scale(1.08); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes frontline-core-hit {
          0% { transform: translateX(0) scale(1); filter: brightness(1); }
          18% { transform: translateX(-7px) scale(1.045); filter: brightness(1.45) saturate(1.2); }
          34% { transform: translateX(6px) scale(1.03); }
          52% { transform: translateX(-3px) scale(1.015); }
          100% { transform: translateX(0) scale(1); filter: brightness(1); }
        }
        @keyframes frontline-core-shock {
          0% { opacity: 0; transform: translate(-50%, 24%) scale(0.55); filter: blur(3px); }
          18% { opacity: 1; transform: translate(-50%, -8%) scale(1.18); filter: blur(0); }
          62% { opacity: 1; transform: translate(-50%, -32%) scale(1.06); }
          100% { opacity: 0; transform: translate(-50%, -64%) scale(0.94); }
        }
        @keyframes frontline-core-shock-flash {
          0% { opacity: 0; transform: scale(0.6); }
          22% { opacity: 0.95; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(2.4); }
        }
        .frontline-core-shock-fx { animation: frontline-core-shock 920ms cubic-bezier(0.18,0.89,0.32,1.28) forwards; }
        .frontline-core-shock-flash-fx { animation: frontline-core-shock-flash 720ms ease-out forwards; }
        @keyframes frontline-power-ready-ring {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(245,196,81,0.42)); opacity: 0.85; }
          50% { filter: drop-shadow(0 0 16px rgba(245,196,81,0.78)); opacity: 1; }
        }
        .frontline-power-ready-ring-fx { animation: frontline-power-ready-ring 1.6s ease-in-out infinite; }
        @keyframes frontline-stun-pulse {
          0%, 100% { filter: drop-shadow(0 0 0 rgba(245,196,81,0)) saturate(1); transform: rotate(0deg); }
          25% { filter: drop-shadow(0 0 12px rgba(245,196,81,0.62)) saturate(0.65); transform: rotate(-1.2deg); }
          75% { filter: drop-shadow(0 0 14px rgba(245,196,81,0.48)) saturate(0.7); transform: rotate(1.2deg); }
        }
        .frontline-stun-pulse-fx { animation: frontline-stun-pulse 1.2s ease-in-out infinite; }
        @keyframes frontline-trait-proc {
          0% { opacity: 0; transform: translate(-50%, 8px) scale(0.78); }
          18% { opacity: 1; transform: translate(-50%, -2px) scale(1.06); }
          70% { opacity: 1; transform: translate(-50%, -10px) scale(1.0); }
          100% { opacity: 0; transform: translate(-50%, -22px) scale(0.92); }
        }
        .frontline-trait-proc-fx { animation: frontline-trait-proc 1.4s ease-out forwards; }
        @keyframes frontline-inferno-cast {
          0% { box-shadow: inset 0 0 0 rgba(255,150,80,0); filter: brightness(1) saturate(1); }
          18% { box-shadow: inset 0 0 220px rgba(255,150,80,0.62); filter: brightness(1.18) saturate(1.16); }
          55% { box-shadow: inset 0 0 180px rgba(240,95,114,0.42); filter: brightness(1.08) saturate(1.08); }
          100% { box-shadow: inset 0 0 0 rgba(255,150,80,0); filter: brightness(1) saturate(1); }
        }
        .frontline-inferno-cast-fx { animation: frontline-inferno-cast 820ms ease-out; }
        @keyframes frontline-boss-breath {
          0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 28px 56px rgba(180,70,40,0.42)) brightness(1); }
          50% { transform: translateY(-3px) scale(1.012); filter: drop-shadow(0 36px 72px rgba(245,140,80,0.5)) brightness(1.06); }
        }
        .frontline-boss-breath-fx { animation: frontline-boss-breath 5.4s ease-in-out infinite; }
        html[data-motion="reduced"] .frontline-core-shock-fx,
        html[data-motion="reduced"] .frontline-core-shock-flash-fx { animation-duration: 180ms !important; }
        html[data-motion="reduced"] .frontline-power-ready-ring-fx,
        html[data-motion="reduced"] .frontline-trait-proc-fx,
        html[data-motion="reduced"] .frontline-stun-pulse-fx,
        html[data-motion="reduced"] .frontline-inferno-cast-fx,
        html[data-motion="reduced"] .frontline-boss-breath-fx { animation: none !important; opacity: 1; transform: none !important; filter: none !important; }
        @keyframes frontline-lane-impact {
          0% { transform: scale(1); filter: brightness(1); }
          28% { transform: scale(1.018); filter: brightness(1.18) saturate(1.12); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes frontline-card-cast {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.42) rotate(-12deg); filter: blur(3px); }
          12% { opacity: 1; transform: translate(-50%, -50%) scale(1.24) rotate(0deg); filter: blur(0); }
          58% { opacity: 1; transform: translate(-50%, -50%) scale(1.06) rotate(1deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.88) rotate(4deg); }
        }
        @keyframes frontline-cast-wave {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.38); }
          22% { opacity: 0.95; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.85); }
        }
        @keyframes frontline-resolve-cta {
          0%, 100% { filter: brightness(1); box-shadow: 0 10px 26px rgba(49,170,107,0.22); }
          50% { filter: brightness(1.14); box-shadow: 0 0 34px rgba(93,211,158,0.34), 0 14px 34px rgba(49,170,107,0.3); }
        }
        @keyframes frontline-clash-spotlight {
          0% { opacity: 0; transform: translateY(-12px) scale(0.94); filter: blur(2px); }
          14% { opacity: 1; transform: translateY(0) scale(1.03); filter: blur(0); }
          84% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-6px) scale(0.98); }
        }
        @keyframes frontline-action-trail-up {
          0% { opacity: 0; transform: translate(-50%, 18px) scaleY(0.08); filter: blur(2px); }
          18% { opacity: 0.95; transform: translate(-50%, 8px) scaleY(0.32); filter: blur(0); }
          44% { opacity: 1; transform: translate(-50%, -8px) scaleY(1); }
          74% { opacity: 0.75; transform: translate(-50%, -18px) scaleY(0.86); }
          100% { opacity: 0; transform: translate(-50%, -26px) scaleY(0.16); }
        }
        @keyframes frontline-action-trail-down {
          0% { opacity: 0; transform: translate(-50%, -18px) scaleY(0.08); filter: blur(2px); }
          18% { opacity: 0.95; transform: translate(-50%, -8px) scaleY(0.32); filter: blur(0); }
          44% { opacity: 1; transform: translate(-50%, 8px) scaleY(1); }
          74% { opacity: 0.75; transform: translate(-50%, 18px) scaleY(0.86); }
          100% { opacity: 0; transform: translate(-50%, 26px) scaleY(0.16); }
        }
        @keyframes frontline-action-impact {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.48) rotate(-8deg); filter: blur(2px); }
          26% { opacity: 1; transform: translate(-50%, -50%) scale(1.14) rotate(0deg); filter: blur(0); }
          58% { opacity: 0.95; transform: translate(-50%, -50%) scale(1) rotate(2deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.62) rotate(9deg); }
        }
        @keyframes frontline-card-use-toast {
          0% { opacity: 0; transform: translate(-50%, 16px) scale(0.88); filter: blur(2px); }
          15% { opacity: 1; transform: translate(-50%, 0) scale(1.03); filter: blur(0); }
          78% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -16px) scale(0.96); }
        }
        @keyframes frontline-ko-burst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.42) rotate(-8deg); filter: blur(2px); }
          18% { opacity: 1; transform: translate(-50%, -50%) scale(1.18) rotate(0deg); filter: blur(0); }
          55% { opacity: 1; transform: translate(-50%, -50%) scale(1.02) rotate(2deg); }
          100% { opacity: 0; transform: translate(-50%, -68%) scale(0.72) rotate(7deg); filter: blur(1px); }
        }
        @keyframes frontline-finish-overlay {
          0% { opacity: 0; backdrop-filter: blur(0); }
          100% { opacity: 1; backdrop-filter: blur(8px); }
        }
        @keyframes frontline-finish-emblem {
          0% { opacity: 0; transform: translateY(18px) scale(0.72); filter: blur(3px); }
          22% { opacity: 1; transform: translateY(-4px) scale(1.08); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .frontline-hit-fx { animation: frontline-hit 620ms cubic-bezier(.22,1,.36,1) both; }
        .frontline-float-fx { animation: frontline-float 1240ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-breach-fx { animation: frontline-breach 1180ms cubic-bezier(.16,1,.3,1) both; transform-origin: center; }
        .frontline-idle-fx { animation: frontline-idle 3.8s ease-in-out infinite; }
        .frontline-attack-ally-fx { animation: frontline-attack-ally 1380ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-attack-enemy-fx { animation: frontline-attack-enemy 1380ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-shield-fx { animation: frontline-shield 900ms ease-out both; }
        .frontline-heal-fx { animation: frontline-heal 900ms ease-out both; }
        .frontline-ko-fx { animation: frontline-ko 820ms ease-out both; }
        .frontline-death-ghost-fx { animation: frontline-death-ghost 1680ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-death-soul-fx { animation: frontline-death-soul 1580ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-card-ready-fx { animation: frontline-card-ready 2.4s ease-in-out infinite; }
        .frontline-card-selected-fx { animation: frontline-card-selected 840ms ease-in-out infinite; }
        .frontline-target-pulse-fx { animation: frontline-target-pulse 760ms ease-in-out infinite; }
        .frontline-support-pop-fx { animation: frontline-support-pop 380ms ease-out both; }
        .frontline-core-hit-fx { animation: frontline-core-hit 720ms cubic-bezier(.22,1,.36,1) both; }
        .frontline-lane-impact-fx { animation: frontline-lane-impact 720ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-card-cast-fx { animation: frontline-card-cast 1780ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-cast-wave-fx { animation: frontline-cast-wave 1600ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-resolve-cta-fx { animation: frontline-resolve-cta 1.45s ease-in-out infinite; }
        .frontline-clash-spotlight-fx { animation: frontline-clash-spotlight 1420ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-action-trail-up-fx { animation: frontline-action-trail-up 1380ms cubic-bezier(.16,1,.3,1) both; transform-origin: bottom center; }
        .frontline-action-trail-down-fx { animation: frontline-action-trail-down 1380ms cubic-bezier(.16,1,.3,1) both; transform-origin: top center; }
        .frontline-action-impact-fx { animation: frontline-action-impact 1320ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-card-use-toast-fx { animation: frontline-card-use-toast 1850ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-ko-burst-fx { animation: frontline-ko-burst 1180ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-finish-overlay-fx { animation: frontline-finish-overlay 520ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-finish-emblem-fx { animation: frontline-finish-emblem 760ms cubic-bezier(.16,1,.3,1) both; }
        html[data-motion="reduced"] .frontline-hit-fx,
        html[data-motion="reduced"] .frontline-float-fx,
        html[data-motion="reduced"] .frontline-breach-fx,
        html[data-motion="reduced"] .frontline-idle-fx,
        html[data-motion="reduced"] .frontline-attack-ally-fx,
        html[data-motion="reduced"] .frontline-attack-enemy-fx,
        html[data-motion="reduced"] .frontline-shield-fx,
        html[data-motion="reduced"] .frontline-heal-fx,
        html[data-motion="reduced"] .frontline-ko-fx,
        html[data-motion="reduced"] .frontline-death-ghost-fx,
        html[data-motion="reduced"] .frontline-death-soul-fx,
        html[data-motion="reduced"] .frontline-card-ready-fx,
        html[data-motion="reduced"] .frontline-card-selected-fx,
        html[data-motion="reduced"] .frontline-target-pulse-fx,
        html[data-motion="reduced"] .frontline-support-pop-fx,
        html[data-motion="reduced"] .frontline-core-hit-fx,
        html[data-motion="reduced"] .frontline-lane-impact-fx,
        html[data-motion="reduced"] .frontline-card-cast-fx,
        html[data-motion="reduced"] .frontline-cast-wave-fx,
        html[data-motion="reduced"] .frontline-resolve-cta-fx,
        html[data-motion="reduced"] .frontline-clash-spotlight-fx,
        html[data-motion="reduced"] .frontline-action-trail-up-fx,
        html[data-motion="reduced"] .frontline-action-trail-down-fx,
        html[data-motion="reduced"] .frontline-action-impact-fx,
        html[data-motion="reduced"] .frontline-card-use-toast-fx,
        html[data-motion="reduced"] .frontline-ko-burst-fx,
        html[data-motion="reduced"] .frontline-finish-overlay-fx,
        html[data-motion="reduced"] .frontline-finish-emblem-fx {
          animation: none !important;
        }
      `}</style>
  );
}
