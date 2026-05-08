import type { HomeZoneId } from "@/components/game/home/types";

const ZONE_COLORS: Record<HomeZoneId, string> = {
  fortress: "#ffd57a",
  arena: "#79d8ff",
  events: "#d698ff",
  deck: "#ffd57a",
  market: "#82f0b8",
  adventure: "#ff9a73",
};

const ZONE_AURA_OFFSETS = [
  { x: 0.6755, y: -0.36 },
  { x: 0, y: 0.72 },
  { x: -0.6755, y: -0.36 },
  { x: -0.6755, y: -0.36 },
  { x: 0, y: -0.72 },
  { x: 0.6755, y: -0.36 },
] as const;

export function ZoneAura({
  cx,
  cy,
  rx,
  ry,
  zone,
  active,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  zone: HomeZoneId;
  active: boolean;
}) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={ZONE_COLORS[zone]} opacity={active ? 0.22 : 0.1} />
      <ellipse cx={cx} cy={cy} rx={rx * 0.72} ry={ry * 0.54} fill={ZONE_COLORS[zone]} opacity={active ? 0.16 : 0.06} />
      {active ? (
        <>
          <ellipse cx={cx} cy={cy - ry * 0.18} rx={rx * 0.36} ry={ry * 0.92} fill={ZONE_COLORS[zone]} opacity={0.12} className="home-window" />
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx * 0.82}
            ry={ry * 0.82}
            fill="none"
            stroke={ZONE_COLORS[zone]}
            strokeWidth={2.5}
            opacity={0.32}
            style={{ animation: "homeZoneSweep 2.8s ease-in-out infinite" }}
          />
        </>
      ) : null}
      <ellipse cx={cx} cy={cy} rx={rx * 0.94} ry={ry * 0.9} fill="none" stroke={ZONE_COLORS[zone]} strokeWidth={active ? 8 : 4} opacity={active ? 0.82 : 0.34} />
      {active ? ZONE_AURA_OFFSETS.map((point, index) => {
        const x = Number((cx + point.x * rx).toFixed(2));
        const y = Number((cy + point.y * ry).toFixed(2));
        return (
          <rect
            key={`${zone}-${index}`}
            x={x - 4.5}
            y={y - 4.5}
            width="9"
            height="9"
            rx="1.4"
            transform={`rotate(45 ${x} ${y})`}
            fill={ZONE_COLORS[zone]}
            opacity={0.82}
            className="home-rune"
            style={{ animationDelay: `${index * 0.22}s` }}
          />
        );
      }) : null}
    </g>
  );
}

export function AssetLandmarkGrounds({
  activeZone,
  nearX,
  nearY,
}: {
  activeZone: HomeZoneId | null;
  nearX: number;
  nearY: number;
}) {
  return (
    <g transform={`translate(${nearX} ${nearY})`}>
      <LandmarkPad zone="arena" cx={292} cy={548} rx={144} ry={54} active={activeZone === "arena"} />
      <LandmarkPad zone="events" cx={424} cy={690} rx={112} ry={42} active={activeZone === "events"} />
      <LandmarkPad zone="deck" cx={656} cy={732} rx={120} ry={38} active={activeZone === "deck"} />
      <LandmarkPad zone="market" cx={1006} cy={728} rx={128} ry={42} active={activeZone === "market"} />
      <LandmarkPad zone="adventure" cx={1256} cy={548} rx={132} ry={50} active={activeZone === "adventure"} />
      <LandmarkPad zone="fortress" cx={802} cy={534} rx={188} ry={66} active={activeZone === "fortress"} />
    </g>
  );
}

function LandmarkPad({
  zone,
  cx,
  cy,
  rx,
  ry,
  active,
}: {
  zone: HomeZoneId;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  active: boolean;
}) {
  const color = ZONE_COLORS[zone];

  return (
    <g>
      <ellipse cx={cx} cy={cy + ry * 0.24} rx={rx * 0.7} ry={ry * 0.3} fill="#050b12" opacity={0.2} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} opacity={active ? 0.09 : 0.04} />
      <ellipse cx={cx} cy={cy + ry * 0.18} rx={rx * 0.86} ry={ry * 0.48} fill="#101c2b" opacity={0.28} />
      <ellipse cx={cx} cy={cy - ry * 0.04} rx={rx * 0.7} ry={ry * 0.32} fill="#708188" opacity={active ? 0.055 : 0.02} />
      <ellipse cx={cx} cy={cy} rx={rx * 0.94} ry={ry * 0.82} fill="none" stroke={color} strokeWidth={active ? 3.2 : 1.8} opacity={active ? 0.34 : 0.12} />
    </g>
  );
}
