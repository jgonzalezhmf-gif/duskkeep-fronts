export function FortressDefenseSceneStyles() {
  return (
    <style>{`
      @keyframes fortress-defense-enemy-advance {
        0% { opacity: 0.86; transform: translate(-50%, -50%) translate(var(--enemy-advance-x), var(--enemy-advance-y)) scale(calc(var(--enemy-scale) * 0.94)); }
        72% { opacity: 1; transform: translate(-50%, -50%) translate(-4px, 0) scale(calc(var(--enemy-scale) * 1.02)); }
        100% { opacity: 1; transform: translate(-50%, -50%) translateX(0) scale(var(--enemy-scale)); }
      }
      @keyframes fortress-defense-enemy-attack {
        0% { transform: translate(-50%, -50%) translateX(0) scale(var(--enemy-scale)); filter: brightness(1); }
        26% { transform: translate(-50%, -50%) translateX(16px) scale(calc(var(--enemy-scale) * 0.98)); filter: brightness(1.04); }
        58% { transform: translate(-50%, -50%) translateX(-34px) scale(calc(var(--enemy-scale) * 1.1)); filter: brightness(1.28) drop-shadow(0 0 20px rgba(240,95,114,0.32)); }
        100% { transform: translate(-50%, -50%) translateX(0) scale(var(--enemy-scale)); filter: brightness(1); }
      }
      @keyframes fortress-defense-enemy-ranged-attack {
        0% { transform: translate(-50%, -50%) translateX(0) scale(var(--enemy-scale)); filter: brightness(1); }
        34% { transform: translate(-50%, -50%) translateX(12px) scale(calc(var(--enemy-scale) * 0.98)); filter: brightness(1.2) drop-shadow(0 0 20px rgba(245,196,81,0.24)); }
        66% { transform: translate(-50%, -50%) translateX(-6px) scale(calc(var(--enemy-scale) * 1.04)); filter: brightness(1.12); }
        100% { transform: translate(-50%, -50%) translateX(0) scale(var(--enemy-scale)); filter: brightness(1); }
      }
      @keyframes fortress-defense-enemy-defeat {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(var(--enemy-scale)); filter: brightness(1.25) saturate(1.12); }
        100% { opacity: 0; transform: translate(-50%, -38%) scale(calc(var(--enemy-scale) * 0.72)); filter: grayscale(0.8) brightness(0.72); }
      }
      @keyframes fortress-defense-guard-enter {
        0% { opacity: 0; transform: translate(-92%, -50%) scale(0.72); filter: brightness(1.24); }
        72% { opacity: 1; transform: translate(-46%, -50%) scale(1.08); filter: brightness(1.08); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
      }
      @keyframes fortress-defense-guard-block {
        0% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
        28% { transform: translate(-44%, -50%) scale(1.08); filter: brightness(1.36) drop-shadow(0 0 18px rgba(101,210,200,0.36)); }
        58% { transform: translate(-54%, -50%) scale(0.98); }
        100% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
      }
      @keyframes fortress-defense-guard-strike {
        0% { transform: translate(-50%, -50%) translateX(0) scale(1); filter: brightness(1); }
        30% { transform: translate(-43%, -52%) translateX(12px) scale(1.08); filter: brightness(1.32) drop-shadow(0 0 18px rgba(245,212,152,0.34)); }
        62% { transform: translate(-55%, -50%) translateX(-4px) scale(0.98); }
        100% { transform: translate(-50%, -50%) translateX(0) scale(1); filter: brightness(1); }
      }
      @keyframes fortress-defense-guard-defeat {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: brightness(1.3); }
        100% { opacity: 0; transform: translate(-50%, -34%) scale(0.68); filter: grayscale(0.8) brightness(0.72); }
      }
      @keyframes fortress-defense-wave-enter {
        0% { opacity: 0; transform: translate(-50%, -50%) translateX(140px) scale(calc(var(--enemy-scale) * 0.86)); }
        100% { opacity: 1; transform: translate(-50%, -50%) translateX(0) scale(var(--enemy-scale)); }
      }
      @keyframes fortress-defense-castle-hit {
        0% { transform: translateX(0) scale(1); filter: brightness(1); }
        18% { transform: translateX(-8px) scale(1.025); filter: brightness(1.42) saturate(1.14); }
        38% { transform: translateX(7px) scale(1.01); }
        62% { transform: translateX(-3px) scale(1.005); }
        100% { transform: translateX(0) scale(1); filter: brightness(1); }
      }
      @keyframes fortress-defense-castle-alarm {
        0%, 100% { filter: drop-shadow(0 0 0 rgba(240,95,114,0)); }
        50% { filter: drop-shadow(0 0 18px rgba(240,95,114,0.42)); }
      }
      @keyframes fortress-defense-shield-dome {
        0% { opacity: 0; transform: scale(0.88); }
        28% { opacity: 1; transform: scale(1.04); }
        100% { opacity: 0.72; transform: scale(1); }
      }
      @keyframes fortress-defense-mend-glow {
        0% { opacity: 0; transform: translateY(12px) scale(0.88); }
        34% { opacity: 1; transform: translateY(0) scale(1.04); }
        100% { opacity: 0; transform: translateY(-8px) scale(1.14); }
      }
      @keyframes fortress-defense-bolt {
        0% { opacity: 0; transform: scaleX(0.08); }
        24% { opacity: 1; transform: scaleX(0.72); }
        74% { opacity: 0.92; transform: scaleX(1); }
        100% { opacity: 0; transform: scaleX(1.08); }
      }
      @keyframes fortress-defense-impact-pop {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.42); }
        28% { opacity: 1; transform: translate(-50%, -50%) scale(1.12); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.58); }
      }
      @keyframes fortress-defense-arrow {
        0% { opacity: 0; transform: translateX(-24px) scaleX(0.08); }
        22% { opacity: 1; transform: translateX(12px) scaleX(0.76); }
        72% { opacity: 0.86; transform: translateX(88px) scaleX(1); }
        100% { opacity: 0; transform: translateX(118px) scaleX(0.7); }
      }
      @keyframes fortress-defense-arcane {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.48); }
        34% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.74); }
      }
      @keyframes fortress-defense-trap {
        0% { opacity: 0; transform: translate(-50%, 18px) scaleX(0.4); }
        32% { opacity: 1; transform: translate(-50%, 0) scaleX(1.04); }
        100% { opacity: 0; transform: translate(-50%, -18px) scaleX(1.14); }
      }
      @keyframes fortress-defense-trap-arm {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.62); filter: brightness(1.35); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
      }
      @keyframes fortress-defense-trap-spring {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: brightness(1.3); }
        48% { opacity: 1; transform: translate(-50%, -58%) scale(1.2); filter: brightness(1.8) drop-shadow(0 0 22px rgba(167,139,250,0.42)); }
        100% { opacity: 0; transform: translate(-50%, -76%) scale(0.72); filter: brightness(0.7); }
      }
      @keyframes fortress-defense-slash {
        0% { opacity: 0; transform: translate(-50%, -50%) rotate(-18deg) scale(0.44); }
        34% { opacity: 1; transform: translate(-50%, -50%) rotate(-18deg) scale(1.08); }
        100% { opacity: 0; transform: translate(-50%, -50%) rotate(-18deg) scale(1.55); }
      }
      @keyframes fortress-defense-chant {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        38% { opacity: 0.86; transform: translate(-50%, -50%) scale(1.08); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.72); }
      }
      @keyframes fortress-defense-enemy-trail {
        0% { opacity: 0; transform: scaleX(0.08); }
        28% { opacity: 0.95; transform: scaleX(0.86); }
        100% { opacity: 0; transform: scaleX(1.08); }
      }
      @keyframes fortress-defense-enemy-slash {
        0% { opacity: 0; transform: translateX(88px) rotate(var(--slash-rotate)) scaleX(0.08); }
        28% { opacity: 1; transform: translateX(18px) rotate(var(--slash-rotate)) scaleX(0.72); }
        78% { opacity: 0.92; transform: translateX(0) rotate(var(--slash-rotate)) scaleX(1); }
        100% { opacity: 0; transform: translateX(-18px) rotate(var(--slash-rotate)) scaleX(1.04); }
      }
      @keyframes fortress-defense-phase-banner {
        0% { opacity: 0; transform: translateY(-8px) scale(0.96); }
        24% { opacity: 1; transform: translateY(0) scale(1.02); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes fortress-defense-battle-enter {
        0% { opacity: 1; }
        54% { opacity: 0.88; }
        100% { opacity: 0; visibility: hidden; }
      }
      @keyframes fortress-defense-path-pulse {
        0% { opacity: 0.12; transform: translateY(6px) scaleX(0.96); }
        42% { opacity: 0.42; transform: translateY(0) scaleX(1.01); }
        100% { opacity: 0.24; transform: translateY(0) scaleX(1); }
      }
      @keyframes fortress-defense-action-ready {
        0%, 100% { opacity: 0.56; box-shadow: inset 0 0 0 1px rgba(245,212,152,0.22), 0 0 16px rgba(245,196,81,0.2); }
        50% { opacity: 0.94; box-shadow: inset 0 0 0 1px rgba(245,212,152,0.44), 0 0 28px rgba(245,196,81,0.34); }
      }
      @keyframes fortress-defense-gate-flash {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.82); filter: brightness(1); }
        28% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); filter: brightness(1.42); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.28); filter: brightness(1); }
      }
      @keyframes fortress-defense-gate-panel-flash {
        0% { opacity: 0; transform: scale(0.92); filter: brightness(1); }
        28% { opacity: 1; transform: scale(1.05); filter: brightness(1.36); }
        100% { opacity: 0; transform: scale(1.16); filter: brightness(1); }
      }
      @keyframes fortress-defense-enemy-threat {
        0%, 100% { filter: drop-shadow(0 0 0 rgba(240,95,114,0)); }
        50% { filter: drop-shadow(0 0 18px rgba(240,95,114,0.36)); }
      }
      .fortress-defense-enemy-standee { transform: translate(-50%, -50%) scale(var(--enemy-scale)); }
      .fortress-defense-guard-image { clip-path: polygon(9% 0%, 91% 0%, 96% 89%, 80% 100%, 20% 100%, 4% 89%); }
      .fortress-defense-enemy-advance-fx { animation: fortress-defense-enemy-advance 880ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-enemy-attack-fx { animation: fortress-defense-enemy-attack 720ms cubic-bezier(.22,1,.36,1) both; }
      .fortress-defense-enemy-ranged-attack-fx { animation: fortress-defense-enemy-ranged-attack 720ms cubic-bezier(.22,1,.36,1) both; }
      .fortress-defense-enemy-defeat-fx { animation: fortress-defense-enemy-defeat 720ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-guard-enter-fx { animation: fortress-defense-guard-enter 680ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-guard-strike-fx { animation: fortress-defense-guard-strike 620ms cubic-bezier(.22,1,.36,1) both; }
      .fortress-defense-guard-block-fx { animation: fortress-defense-guard-block 680ms cubic-bezier(.22,1,.36,1) both; }
      .fortress-defense-guard-defeat-fx { animation: fortress-defense-guard-defeat 720ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-wave-enter-fx { animation: fortress-defense-wave-enter 940ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-castle-hit-fx { animation: fortress-defense-castle-hit 780ms cubic-bezier(.22,1,.36,1) both; }
      .fortress-defense-castle-alarm-fx { animation: fortress-defense-castle-alarm 1.3s ease-in-out infinite; }
      .fortress-defense-shield-dome-fx { animation: fortress-defense-shield-dome 760ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-mend-glow-fx { animation: fortress-defense-mend-glow 820ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-bolt-fx { animation: fortress-defense-bolt 760ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-impact-pop-fx { animation: fortress-defense-impact-pop 720ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-arrow-fx { animation: fortress-defense-arrow 780ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-arcane-fx { animation: fortress-defense-arcane 760ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-trap-fx { animation: fortress-defense-trap 720ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-trap-arm-fx { animation: fortress-defense-trap-arm 520ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-trap-spring-fx { animation: fortress-defense-trap-spring 720ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-slash-fx { animation: fortress-defense-slash 680ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-chant-fx { animation: fortress-defense-chant 780ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-enemy-trail-fx { animation: fortress-defense-enemy-trail 720ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-enemy-slash-fx { animation: fortress-defense-enemy-slash 760ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-phase-banner-fx { animation: fortress-defense-phase-banner 560ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-battle-enter-fx { animation: fortress-defense-battle-enter 780ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-path-pulse-fx { animation: fortress-defense-path-pulse 900ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-action-ready-fx::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: -1px;
        border-radius: 24px;
        animation: fortress-defense-action-ready 1.45s ease-in-out infinite;
      }
      .fortress-defense-gate-flash-fx { animation: fortress-defense-gate-flash 720ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-gate-panel-flash-fx { animation: fortress-defense-gate-panel-flash 720ms cubic-bezier(.16,1,.3,1) both; }
      .fortress-defense-enemy-threat-fx { animation: fortress-defense-enemy-threat 1.4s ease-in-out infinite; }
      html[data-motion="reduced"] .fortress-defense-enemy-advance-fx,
      html[data-motion="reduced"] .fortress-defense-enemy-attack-fx,
      html[data-motion="reduced"] .fortress-defense-enemy-ranged-attack-fx,
      html[data-motion="reduced"] .fortress-defense-enemy-defeat-fx,
      html[data-motion="reduced"] .fortress-defense-guard-enter-fx,
      html[data-motion="reduced"] .fortress-defense-guard-strike-fx,
      html[data-motion="reduced"] .fortress-defense-guard-block-fx,
      html[data-motion="reduced"] .fortress-defense-guard-defeat-fx,
      html[data-motion="reduced"] .fortress-defense-wave-enter-fx,
      html[data-motion="reduced"] .fortress-defense-castle-hit-fx,
      html[data-motion="reduced"] .fortress-defense-castle-alarm-fx,
      html[data-motion="reduced"] .fortress-defense-shield-dome-fx,
      html[data-motion="reduced"] .fortress-defense-mend-glow-fx,
      html[data-motion="reduced"] .fortress-defense-bolt-fx,
      html[data-motion="reduced"] .fortress-defense-impact-pop-fx,
      html[data-motion="reduced"] .fortress-defense-arrow-fx,
      html[data-motion="reduced"] .fortress-defense-arcane-fx,
      html[data-motion="reduced"] .fortress-defense-trap-fx,
      html[data-motion="reduced"] .fortress-defense-trap-arm-fx,
      html[data-motion="reduced"] .fortress-defense-trap-spring-fx,
      html[data-motion="reduced"] .fortress-defense-slash-fx,
      html[data-motion="reduced"] .fortress-defense-chant-fx,
      html[data-motion="reduced"] .fortress-defense-enemy-trail-fx,
      html[data-motion="reduced"] .fortress-defense-enemy-slash-fx,
      html[data-motion="reduced"] .fortress-defense-phase-banner-fx,
      html[data-motion="reduced"] .fortress-defense-battle-enter-fx,
      html[data-motion="reduced"] .fortress-defense-path-pulse-fx,
      html[data-motion="reduced"] .fortress-defense-action-ready-fx::before,
      html[data-motion="reduced"] .fortress-defense-gate-flash-fx,
      html[data-motion="reduced"] .fortress-defense-gate-panel-flash-fx,
      html[data-motion="reduced"] .fortress-defense-enemy-threat-fx { animation-duration: 160ms !important; animation-iteration-count: 1 !important; }
    `}</style>
  );
}
