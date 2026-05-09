"use client";

import { FRONTLINE_BATTLE_CORE_STYLES } from "./FrontlineBattleCoreStyles";

export function FrontlineBattleStyles() {
  return (
      <style>{`
        ${FRONTLINE_BATTLE_CORE_STYLES}
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
