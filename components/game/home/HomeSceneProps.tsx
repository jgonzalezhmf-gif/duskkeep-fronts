"use client";

export function ForestPatch({ x, y, scale, tone }: { x: number; y: number; scale: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="26" rx="46" ry="14" fill="#162732" opacity=".4" />
      <path d="M-32 24-18-10-4 24Z" fill={tone} />
      <path d="M-8 26 6-18 22 26Z" fill={tone} opacity=".96" />
      <path d="M18 24 34-8 48 24Z" fill={tone} opacity=".9" />
      <path d="M-10 28h8v18h-8zM12 30h8v16h-8z" fill="#4f3b2c" />
    </g>
  );
}

export function RuinProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="28" rx="36" ry="10" fill="#0f1b26" opacity=".3" />
      <path d="M-30 30V-8h18V30M6 30V-18h18V30" fill="#8fa0b2" stroke="#354050" strokeWidth="6" />
      <path d="M-34 -8H-8M2 -18h26" stroke="#b9c8d6" strokeWidth="6" strokeLinecap="round" />
      <path d="M-14 8h18M10 -2h12" stroke="#354050" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </g>
  );
}

export function BridgeProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-80 18c24-18 46-26 80-26 34 0 56 8 80 26" fill="none" stroke="#7f6547" strokeWidth="12" strokeLinecap="round" />
      <path d="M-84 18c24-18 48-26 84-26 36 0 60 8 84 26" fill="none" stroke="#e7c89a" strokeWidth="3" strokeLinecap="round" opacity=".54" />
      <path d="M-46 10v18M-18 0v24M18 0v24M46 10v18" stroke="#6d5338" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

export function WindmillProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="44" rx="42" ry="12" fill="#0f1b26" opacity=".26" />
      <path d="M-18 44h36L8 -8h-16Z" fill="#7c6347" />
      <path d="M0 6v-20" stroke="#3c2a1b" strokeWidth="5" strokeLinecap="round" />
      <g className="home-windmill">
        <path d="M0 -20 26 -6 0 0Z" fill="#f0ead9" stroke="#8b7a67" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -20-26 -6 0 0Z" fill="#f0ead9" stroke="#8b7a67" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -20 14 -44 0 -30Z" fill="#f0ead9" stroke="#8b7a67" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -20-14 -44 0 -30Z" fill="#f0ead9" stroke="#8b7a67" strokeWidth="3" strokeLinejoin="round" />
      </g>
    </g>
  );
}

export function WatchTowerProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="36" rx="32" ry="10" fill="#0f1b26" opacity=".26" />
      <path d="M-18 36h36L10 -12H-10Z" fill="#7a6248" />
      <path d="M-26 -12H26L18 -26H-18Z" fill="#9d7854" stroke="#4c3625" strokeWidth="5" />
      <path d="M-10 6h20" stroke="#4c3625" strokeWidth="4" strokeLinecap="round" />
      <circle cx="0" cy="-4" r="5" className="home-torch" fill="#ffd57a" opacity=".82" />
    </g>
  );
}

export function CampGlowProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="30" ry="10" fill="#101824" opacity=".24" />
      <circle cx="0" cy="4" r="8" className="home-torch" fill="#ffd57a" opacity=".84" />
      <path d="M-10 16 0 0 10 16" fill="none" stroke="#6b4a2f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0 2v18" stroke="#8a6442" strokeWidth="4" strokeLinecap="round" />
      <path d="M-4 -6c0-8 4-12 8-16" className="home-smoke" fill="none" stroke="#c3d2db" strokeWidth="3" strokeLinecap="round" opacity=".5" />
    </g>
  );
}

export function SignpostProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="22" ry="7" fill="#0e1823" opacity=".2" />
      <path d="M0 18V-8" stroke="#6e553e" strokeWidth="5" strokeLinecap="round" />
      <path d="M0 -2h20l-6 8H0Z" fill="#d7b37d" stroke="#6e553e" strokeWidth="3" strokeLinejoin="round" />
      <path d="M0 8h-18l6 8H0Z" fill="#d7b37d" stroke="#6e553e" strokeWidth="3" strokeLinejoin="round" />
    </g>
  );
}

export function LanternPostProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="24" rx="20" ry="7" fill="#0f1721" opacity=".22" />
      <path d="M0 24V-12" stroke="#5b4835" strokeWidth="5" strokeLinecap="round" />
      <path d="M0 -12h12" stroke="#5b4835" strokeWidth="4" strokeLinecap="round" />
      <circle cx="16" cy="-10" r="6" className="home-lantern" fill="#ffd57a" opacity=".82" />
      <circle cx="16" cy="-10" r="10" fill="#ffd57a" opacity=".12" className="home-window" />
    </g>
  );
}

export function CartProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="24" ry="8" fill="#101824" opacity=".22" />
      <path d="M-20 12h34l6-12h-28Z" fill="#7b573b" stroke="#563b28" strokeWidth="4" strokeLinejoin="round" />
      <path d="M12 6h12" stroke="#8a674a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="-10" cy="18" r="6" fill="#304558" stroke="#8aa1b6" strokeWidth="3" />
      <circle cx="12" cy="18" r="6" fill="#304558" stroke="#8aa1b6" strokeWidth="3" />
    </g>
  );
}

export function RuinedArchProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="24" rx="26" ry="8" fill="#0f1b26" opacity=".22" />
      <path d="M-18 24V-4h10v28M8 24V-4h10v28" fill="#97a6b5" stroke="#435061" strokeWidth="4" />
      <path d="M-20 -4c6-10 14-16 24-16s18 6 24 16" fill="none" stroke="#c4d0da" strokeWidth="4" strokeLinecap="round" />
      <path d="M-4 4h8" stroke="#435061" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

export function Statue({ x, y, tone }: { x: number; y: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="18" rx="18" ry="6" fill="#172330" opacity=".24" />
      <path d="M-6 16V-16h12V16" fill={tone} stroke="#556474" strokeWidth="4" />
      <circle cx="0" cy="-22" r="6" fill={tone} stroke="#556474" strokeWidth="3" />
      <path d="M-12 16h24" stroke="#556474" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

export function HouseClusterProp({
  x,
  y,
  scale,
  roof,
  wall,
}: {
  x: number;
  y: number;
  scale: number;
  roof: string;
  wall: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="26" ry="8" fill="#101822" opacity=".22" />
      <path d="M-24 16h18V4h-18ZM2 16h20V0H2Z" fill={wall} stroke="#425162" strokeWidth="4" />
      <path d="M-28 4-16-6-4 4ZM-2 0 12-12 26 0" fill={roof} stroke="#4b3526" strokeWidth="4" strokeLinejoin="round" />
      <rect x="-19" y="8" width="6" height="8" rx="2" className="home-window" fill="#ffdca0" />
      <rect x="8" y="6" width="7" height="10" rx="2" className="home-window" fill="#ffe4b5" />
    </g>
  );
}

export function CrystalClusterProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="20" rx="24" ry="8" fill="#0f1824" opacity=".2" />
      <path d="M-18 18-10-8-2 18Z" fill="#77d8ff" stroke="#355b8f" strokeWidth="4" strokeLinejoin="round" />
      <path d="M-2 20 8-18 18 20Z" fill="#c88cff" stroke="#5b2a79" strokeWidth="4" strokeLinejoin="round" />
      <path d="M16 18 24 0 30 18Z" fill="#f5d88d" stroke="#7d5a20" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="8" cy="-10" r="5" className="home-window" fill="#fff0ff" opacity=".82" />
    </g>
  );
}

export function CrateStackProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="24" ry="8" fill="#101822" opacity=".22" />
      <path d="M-22 16h18V2h-18ZM2 16h18V6H2Z" fill="#8b6141" stroke="#5a3f2c" strokeWidth="4" />
      <path d="M-22 8h18M-13 2v14M2 11h18M11 6v10" stroke="#c69a74" strokeWidth="2.5" strokeLinecap="round" opacity=".54" />
      <path d="M16 10c7 0 11 3 11 8 0 4-3 6-9 6" fill="none" stroke="#d6c7a1" strokeWidth="3" strokeLinecap="round" opacity=".68" />
    </g>
  );
}

export function BrazierProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="22" rx="20" ry="7" fill="#101821" opacity=".24" />
      <path d="M0 22V8" stroke="#694c34" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M-10 8h20l-4-8H-6Z" fill="#6f5137" stroke="#4c3624" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="0" cy="0" r="6.5" className="home-torch" fill="#ffd57a" opacity=".86" />
      <path d="M0 -2c2-8 4-12 8-16" className="home-smoke" fill="none" stroke="#d1d7dc" strokeWidth="2.5" strokeLinecap="round" opacity=".42" />
    </g>
  );
}

export function PennantLineProp({
  x,
  y,
  scale,
  tone,
  accent,
}: {
  x: number;
  y: number;
  scale: number;
  tone: string;
  accent: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-54 0C-26 10 26 10 54 0" fill="none" stroke="#b89672" strokeWidth="3" strokeLinecap="round" opacity=".78" />
      <g className="home-flag" style={{ animationDelay: ".3s" }}>
        <path d="M-34 0h14l-5 10h-9Z" fill={tone} stroke="#55311f" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
      <g className="home-flag" style={{ animationDelay: "1s" }}>
        <path d="M-4 2H8L3 11h-7Z" fill={accent} stroke="#2b4056" strokeWidth="2.2" strokeLinejoin="round" />
      </g>
      <g className="home-flag" style={{ animationDelay: "1.5s" }}>
        <path d="M24 0h14l-5 10h-9Z" fill={tone} stroke="#55311f" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
    </g>
  );
}

export function RuneObeliskProp({ x, y, scale, tone }: { x: number; y: number; scale: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="22" rx="18" ry="6" fill="#0f1822" opacity=".22" />
      <path d="M-10 22V-6L0-18 10-6V22Z" fill="#516578" stroke="#324252" strokeWidth="4" strokeLinejoin="round" />
      <rect x="-3.5" y="-2" width="7" height="11" rx="2" className="home-rune" fill={tone} opacity=".86" />
      <circle cx="0" cy="4" r="7" fill={tone} opacity=".12" className="home-window" />
    </g>
  );
}

export function StoneCircleProp({ x, y, scale }: { x: string; y: string; scale: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="36" ry="12" fill="none" stroke="#d8c29a" strokeWidth="5" opacity=".58" />
      <ellipse cx="0" cy="0" rx="22" ry="8" fill="none" stroke="#f5e4c8" strokeWidth="3" opacity=".4" />
      <path d="M-16 -10v20M16 -10v20" stroke="#d8c29a" strokeWidth="4" strokeLinecap="round" opacity=".54" />
    </g>
  );
}

export function DockProp({ x, y, scale, reverse }: { x: number; y: number; scale: number; reverse?: boolean }) {
  const mirror = reverse ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * mirror} ${scale})`}>
      <path d="M-34 0H34" stroke="#7f6547" strokeWidth="8" strokeLinecap="round" />
      <path d="M-22 0v18M0 0v22M22 0v18" stroke="#5f4a35" strokeWidth="5" strokeLinecap="round" />
      <path d="M-34 8h68" stroke="#c7ab85" strokeWidth="2.5" strokeLinecap="round" opacity=".44" />
    </g>
  );
}

export function FountainProp({ x, y, scale }: { x: string; y: string; scale: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="12" rx="18" ry="6" fill="#0f1824" opacity=".2" />
      <path d="M-12 10h24l-4 8H-8Z" fill="#80b3c5" stroke="#456174" strokeWidth="4" />
      <path d="M-6 10V0h12v10" fill="#a7cfdd" stroke="#456174" strokeWidth="4" />
      <path d="M0 0V-8" stroke="#dff8ff" strokeWidth="3" strokeLinecap="round" opacity=".78" />
      <path d="M0 -8c0-8 5-12 8-16" fill="none" stroke="#dff8ff" strokeWidth="2.4" strokeLinecap="round" opacity=".64" />
      <path d="M0 -8c0-8-5-12-8-16" fill="none" stroke="#dff8ff" strokeWidth="2.4" strokeLinecap="round" opacity=".64" />
    </g>
  );
}

export function RockSpireProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="18" ry="7" fill="#111a22" opacity=".2" />
      <path d="M-12 18-4-18 4 18Z" fill="#4b5b54" stroke="#22352d" strokeWidth="4" strokeLinejoin="round" />
      <path d="M2 18 12-6 18 18Z" fill="#61746c" stroke="#22352d" strokeWidth="4" strokeLinejoin="round" />
    </g>
  );
}
