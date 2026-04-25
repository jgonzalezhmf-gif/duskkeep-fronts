"use client";

// Parallax-ish illustrated background for the Home banner.
// Pure SVG + gradients so it stays crisp at any size and stays lightweight.
// Switches tone per chapter so the home scene evolves with progress.

type Props = { chapter?: number };

export default function HomeScene({ chapter = 1 }: Props) {
  const palette = PALETTES[chapter] ?? PALETTES[1];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${palette.skyTop} 0%, ${palette.skyMid} 55%, ${palette.skyBot} 100%)`,
        }}
      />
      {/* Sun / moon orb */}
      <div
        className="absolute"
        style={{
          top: "14%",
          right: "12%",
          width: 120,
          height: 120,
          borderRadius: "9999px",
          background: `radial-gradient(circle at 40% 40%, ${palette.sunCore}, ${palette.sunHalo} 55%, transparent 70%)`,
          filter: "blur(0.5px)",
          opacity: 0.85,
        }}
      />
      {/* Distant mountain silhouette */}
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 w-full h-full"
      >
        <defs>
          <linearGradient id={`mtFar-${chapter}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.mtFarTop} />
            <stop offset="100%" stopColor={palette.mtFarBot} />
          </linearGradient>
          <linearGradient id={`mtNear-${chapter}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.mtNearTop} />
            <stop offset="100%" stopColor={palette.mtNearBot} />
          </linearGradient>
          <linearGradient id={`ground-${chapter}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.groundTop} />
            <stop offset="100%" stopColor={palette.groundBot} />
          </linearGradient>
        </defs>

        {/* Far mountain range */}
        <path
          d="M0,170 L30,150 L60,165 L95,130 L130,155 L170,120 L205,155 L240,135 L275,160 L310,130 L345,155 L380,140 L400,155 L400,240 L0,240 Z"
          fill={`url(#mtFar-${chapter})`}
          opacity="0.75"
        />
        {/* Near mountains */}
        <path
          d="M0,200 L40,175 L80,195 L125,160 L170,195 L215,175 L260,200 L305,170 L350,195 L400,180 L400,240 L0,240 Z"
          fill={`url(#mtNear-${chapter})`}
          opacity="0.9"
        />
        {/* Fortress silhouette (center-right) */}
        <g opacity="0.9" transform="translate(240,148)">
          <rect x="0" y="8" width="32" height="30" fill={palette.fortress} />
          <rect x="-10" y="14" width="12" height="24" fill={palette.fortress} />
          <rect x="32" y="14" width="12" height="24" fill={palette.fortress} />
          {/* crenellations */}
          <rect x="0" y="6" width="4" height="4" fill={palette.fortress} />
          <rect x="7" y="6" width="4" height="4" fill={palette.fortress} />
          <rect x="14" y="6" width="4" height="4" fill={palette.fortress} />
          <rect x="21" y="6" width="4" height="4" fill={palette.fortress} />
          <rect x="28" y="6" width="4" height="4" fill={palette.fortress} />
          {/* tower */}
          <polygon points="14,0 22,8 6,8" fill={palette.fortressRoof} />
          {/* flag */}
          <line x1="14" y1="0" x2="14" y2="-10" stroke={palette.fortressRoof} strokeWidth="1" />
          <polygon points="14,-10 22,-8 14,-5" fill={palette.accent} />
        </g>
        {/* Foreground ground */}
        <rect x="0" y="205" width="400" height="35" fill={`url(#ground-${chapter})`} />

        {/* Foreground grass/ash blades */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = (i * 400) / 30 + Math.sin(i) * 4;
          const h = 4 + ((i * 7) % 5);
          return (
            <line
              key={i}
              x1={x}
              y1={218}
              x2={x}
              y2={218 - h}
              stroke={palette.grass}
              strokeWidth="1"
              opacity="0.6"
            />
          );
        })}
      </svg>

      {/* Particles: drifting motes */}
      <div className="absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full anim-sparkle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: palette.accent,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 2}px ${palette.accent}`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom vignette so foreground UI has contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
    </div>
  );
}

type Palette = {
  skyTop: string;
  skyMid: string;
  skyBot: string;
  sunCore: string;
  sunHalo: string;
  mtFarTop: string;
  mtFarBot: string;
  mtNearTop: string;
  mtNearBot: string;
  groundTop: string;
  groundBot: string;
  grass: string;
  fortress: string;
  fortressRoof: string;
  accent: string;
};

const PALETTES: Record<number, Palette> = {
  1: {
    skyTop: "#1b2444",
    skyMid: "#2a3a6b",
    skyBot: "#4a3a2a",
    sunCore: "#ffe19a",
    sunHalo: "rgba(245,196,81,0.55)",
    mtFarTop: "#2c3a5c",
    mtFarBot: "#1a2238",
    mtNearTop: "#1a2235",
    mtNearBot: "#0c1120",
    groundTop: "#142c1e",
    groundBot: "#06110c",
    grass: "#3fa472",
    fortress: "#141a28",
    fortressRoof: "#3b2b1a",
    accent: "#f5c451",
  },
  2: {
    skyTop: "#2a1410",
    skyMid: "#58231a",
    skyBot: "#3c1a0a",
    sunCore: "#ffb46b",
    sunHalo: "rgba(255,120,50,0.55)",
    mtFarTop: "#4a1d15",
    mtFarBot: "#1a0a08",
    mtNearTop: "#2b120d",
    mtNearBot: "#0a0504",
    groundTop: "#2a1408",
    groundBot: "#0c0503",
    grass: "#a85625",
    fortress: "#1a0e08",
    fortressRoof: "#3e1b0c",
    accent: "#ff9248",
  },
  3: {
    skyTop: "#180e2b",
    skyMid: "#3a1e62",
    skyBot: "#1a0c2a",
    sunCore: "#e2b4ff",
    sunHalo: "rgba(185,140,255,0.55)",
    mtFarTop: "#2f1c56",
    mtFarBot: "#120a24",
    mtNearTop: "#1d1036",
    mtNearBot: "#0a0414",
    groundTop: "#1a0a2a",
    groundBot: "#070210",
    grass: "#8c52d6",
    fortress: "#0e081a",
    fortressRoof: "#3c1f64",
    accent: "#c084fc",
  },
};

const PARTICLES = [
  { x: 12, y: 25, size: 2, opacity: 0.7, delay: 0 },
  { x: 30, y: 18, size: 1.5, opacity: 0.5, delay: 0.3 },
  { x: 45, y: 30, size: 2, opacity: 0.8, delay: 0.8 },
  { x: 62, y: 22, size: 2.5, opacity: 0.6, delay: 1.1 },
  { x: 78, y: 38, size: 1.8, opacity: 0.7, delay: 0.5 },
  { x: 88, y: 26, size: 2, opacity: 0.9, delay: 1.4 },
  { x: 20, y: 48, size: 2.2, opacity: 0.6, delay: 0.9 },
  { x: 54, y: 52, size: 1.5, opacity: 0.4, delay: 1.7 },
  { x: 72, y: 44, size: 1.8, opacity: 0.8, delay: 0.2 },
];
