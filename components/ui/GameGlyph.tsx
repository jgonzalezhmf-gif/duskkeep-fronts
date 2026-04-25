"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export type GlyphKind =
  | "gem"
  | "gold"
  | "dust"
  | "tickets"
  | "heart"
  | "offers"
  | "rewards"
  | "events"
  | "shop"
  | "team"
  | "missions"
  | "heroes"
  | "deck"
  | "battle"
  | "quests"
  | "pass"
  | "fortress"
  | "arena"
  | "adventure"
  | "market"
  | "sound-on"
  | "sound-off"
  | "move"
  | "attack"
  | "heal"
  | "shield"
  | "skill"
  | "power"
  | "cfg";

type GlyphProps = {
  kind: GlyphKind;
  className?: string;
  shell?: "plate" | "none";
};

type GlyphIds = {
  gold: string;
  goldDeep: string;
  gem: string;
  gemDeep: string;
  violet: string;
  emerald: string;
  ember: string;
  steel: string;
  ivory: string;
  shellOuter: string;
  shellInner: string;
  glowGold: string;
  glowGem: string;
  glowViolet: string;
  glowEmerald: string;
  glowEmber: string;
};

function refUrl(id: string) {
  return `url(#${id})`;
}

function Spark({ x, y, size = 2.3, opacity = 0.94 }: { x: number; y: number; size?: number; opacity?: number }) {
  return (
    <path
      d={`M${x} ${y - size}L${x + size * 0.42} ${y - size * 0.42}L${x + size} ${y}L${x + size * 0.42} ${y + size * 0.42}L${x} ${
        y + size
      }L${x - size * 0.42} ${y + size * 0.42}L${x - size} ${y}L${x - size * 0.42} ${y - size * 0.42}Z`}
      fill="#FFF8E4"
      opacity={opacity}
    />
  );
}

function Shell({ ids }: { ids: GlyphIds }) {
  return (
    <>
      <path
        d="M18 6H46L56 16V48L46 58H18L8 48V16L18 6Z"
        fill={refUrl(ids.shellOuter)}
        stroke="#F7DFA0"
        strokeWidth="1.4"
      />
      <path
        d="M20 10H44L51 17V47L44 54H20L13 47V17L20 10Z"
        fill={refUrl(ids.shellInner)}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1.1"
      />
      <path d="M15 24H49" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
      <path d="M17 39H47" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" />
      <path d="M23 13H41L45 17H19L23 13Z" fill="rgba(255,255,255,0.14)" />
      {[
        [32, 9],
        [55, 32],
        [32, 55],
        [9, 32],
      ].map(([cx, cy]) => (
        <rect
          key={`${cx}-${cy}`}
          x={cx - 2.2}
          y={cy - 2.2}
          width="4.4"
          height="4.4"
          rx="1"
          transform={`rotate(45 ${cx} ${cy})`}
          fill="#FFECC1"
          opacity="0.78"
        />
      ))}
    </>
  );
}

function renderGlyph(kind: GlyphKind, ids: GlyphIds) {
  switch (kind) {
    case "gold":
      return (
        <>
          <ellipse cx="32" cy="45.4" rx="18.5" ry="6.4" fill="#3E2409" opacity="0.32" />
          <ellipse cx="23.8" cy="39.8" rx="10.8" ry="7.4" fill={refUrl(ids.goldDeep)} stroke="#FFF4C9" strokeWidth="1.8" filter={refUrl(ids.glowGold)} />
          <ellipse cx="40.7" cy="37.2" rx="11.7" ry="7.8" fill={refUrl(ids.goldDeep)} stroke="#FFF4C9" strokeWidth="1.8" filter={refUrl(ids.glowGold)} />
          <ellipse cx="31.8" cy="27.3" rx="15.4" ry="10.8" fill={refUrl(ids.gold)} filter={refUrl(ids.glowGold)} />
          <ellipse cx="31.8" cy="27.3" rx="15.4" ry="10.8" stroke="#FFF8DB" strokeWidth="2.1" />
          <ellipse cx="30.2" cy="23.2" rx="9.8" ry="4.2" fill="rgba(255,255,255,0.34)" />
          <path
            d="M31.8 20.4 34.4 24.7 39.2 25.6 35.7 29.1 36.6 34 31.8 31.6 27 34 27.9 29.1 24.4 25.6 29.2 24.7Z"
            fill="#8B5C18"
            stroke="#FFF1AF"
            strokeWidth="0.7"
          />
          <path d="M17.2 39.5h12.2M34 37.2h13.2M21.4 43.2h6.4M38.6 41.4h7" stroke="#7E4E12" strokeWidth="1.7" strokeLinecap="round" opacity="0.72" />
          <path d="M20.3 34.8c4.6 2.6 9.6 2.8 14.8 0.4M31.6 22.4c4.4-0.2 8 1.1 10.5 3.8" stroke="#FFF7D2" strokeWidth="1.1" strokeLinecap="round" opacity="0.72" />
          <Spark x={46.8} y={19.4} size={2.5} />
          <Spark x={16.8} y={27.5} size={1.7} opacity={0.78} />
          <Spark x={42.2} y={48.2} size={1.8} opacity={0.72} />
        </>
      );
    case "gem":
      return (
        <>
          <ellipse cx="32" cy="49.2" rx="14" ry="4.2" fill="#082853" opacity="0.35" />
          <path d="M15.5 24.5 24.2 12.2H39.8L48.5 24.5 32 53.5 15.5 24.5Z" fill={refUrl(ids.gem)} filter={refUrl(ids.glowGem)} />
          <path d="M15.5 24.5 24.2 12.2H39.8L48.5 24.5 32 53.5 15.5 24.5Z" stroke="#EEFEFF" strokeWidth="2" strokeLinejoin="round" />
          <path d="M15.5 24.5H48.5M24.2 12.2 32 24.5 39.8 12.2M22.6 24.5 32 53.5 41.4 24.5M32 24.5V53.5" stroke="#F8FFFF" strokeWidth="1.55" strokeLinecap="round" opacity="0.92" />
          <path d="M22.2 22.4 32 15.8 41.8 22.4 32 30.2Z" fill="rgba(255,255,255,0.28)" />
          <path d="M20.6 26.6 32 45.6 43.4 26.6" stroke="#A9F2FF" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <path d="M27.1 32.2h10M29 37.3h6.2" stroke="#E7FDFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
          <Spark x={45.8} y={17.6} size={2.3} />
          <Spark x={18.8} y={19.5} size={1.8} opacity={0.8} />
          <Spark x={40.5} y={42.8} size={1.6} opacity={0.74} />
        </>
      );
    case "dust":
      return (
        <>
          <ellipse cx="32" cy="50.2" rx="10.4" ry="3.4" fill="#2C134B" opacity="0.34" />
          <path d="M26.5 12.5H37.5L35.7 20.2 40.8 27.2V43.2C40.8 50.1 36.8 54 32 54S23.2 50.1 23.2 43.2V27.2L28.3 20.2 26.5 12.5Z" fill={refUrl(ids.violet)} filter={refUrl(ids.glowViolet)} />
          <path d="M26.5 12.5H37.5L35.7 20.2 40.8 27.2V43.2C40.8 50.1 36.8 54 32 54S23.2 50.1 23.2 43.2V27.2L28.3 20.2 26.5 12.5Z" stroke="#FBECFF" strokeWidth="2" strokeLinejoin="round" />
          <path d="M25.2 26.3H38.8M27.8 20.4H36.2" stroke="#FFF7FF" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          <path d="M27.4 31.3C30.6 33.5 34 33.3 37.3 30.9V43.4C37.3 47.2 35.1 49.5 32.2 49.5S27.4 47.2 27.4 43.4Z" fill="rgba(255,255,255,0.16)" />
          <circle cx="29.4" cy="35.3" r="2.3" fill="#FFF7FF" />
          <circle cx="35.8" cy="38.9" r="2.7" fill="#FFF4FF" />
          <circle cx="31.6" cy="45.1" r="2" fill="#FFF8FF" />
          <circle cx="33.2" cy="32.7" r="1.3" fill="#F1C9FF" />
          <path d="M32 18.5V14.2M29.1 16.3h5.8" stroke="#F8EAFF" strokeWidth="1.45" strokeLinecap="round" />
          <Spark x={42.8} y={27.2} size={2.1} opacity={0.9} />
          <Spark x={21.2} y={33.8} size={1.6} opacity={0.76} />
          <Spark x={39.4} y={48.2} size={1.6} opacity={0.7} />
        </>
      );
    case "tickets":
      return (
        <>
          <path
            d="M16 23H48C48 26.8 50.8 29.6 54.6 29.6V34.4C50.8 34.4 48 37.2 48 41H16C16 37.2 13.2 34.4 9.4 34.4V29.6C13.2 29.6 16 26.8 16 23Z"
            fill={refUrl(ids.gold)}
            filter={refUrl(ids.glowGold)}
          />
          <path
            d="M16 23H48C48 26.8 50.8 29.6 54.6 29.6V34.4C50.8 34.4 48 37.2 48 41H16C16 37.2 13.2 34.4 9.4 34.4V29.6C13.2 29.6 16 26.8 16 23Z"
            stroke="#FFF3C6"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M25 23V41" stroke="#8F5F17" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2.8 3" />
          <path d="M33 27.5 35.1 31.2 39.2 32 36.2 34.9 37 39 33 36.9 29 39 29.8 34.9 26.8 32 30.9 31.2Z" fill="#8B5816" />
        </>
      );
    case "offers":
      return (
        <>
          <path d="M17 23H42L49 30 32 49 15 32 17 23Z" fill={refUrl(ids.ember)} filter={refUrl(ids.glowEmber)} />
          <path d="M17 23H42L49 30 32 49 15 32 17 23Z" stroke="#FFE7DE" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="39.5" cy="27.5" r="2.4" fill="#FFF7F0" />
          <path d="M24 34 39 39M26 40 37 29" stroke="#FFF8F4" strokeWidth="2.4" strokeLinecap="round" />
          <Spark x={46} y={22.5} size={2.1} />
        </>
      );
    case "rewards":
      return (
        <>
          <path d="M16 28H48V44C48 48.4 44.4 52 40 52H24C19.6 52 16 48.4 16 44V28Z" fill={refUrl(ids.gold)} filter={refUrl(ids.glowGold)} />
          <path d="M16 28H48V44C48 48.4 44.4 52 40 52H24C19.6 52 16 48.4 16 44V28Z" stroke="#FFF3C3" strokeWidth="1.8" />
          <path d="M14 23C14 19.7 16.7 17 20 17H44C47.3 17 50 19.7 50 23V28H14V23Z" fill={refUrl(ids.ember)} stroke="#FFE4DA" strokeWidth="1.8" />
          <path d="M32 17V52M16 35H48" stroke="#8A5C19" strokeWidth="1.7" opacity="0.78" />
          <path d="M24 18C24 14.2 28 13.2 32 18 36 13.2 40 14.2 40 18" stroke="#FFF2EE" strokeWidth="1.8" strokeLinecap="round" />
        </>
      );
    case "events":
      return (
        <>
          <path d="M19 14H45L50 19V40L32 50 14 40V19L19 14Z" fill={refUrl(ids.violet)} filter={refUrl(ids.glowViolet)} />
          <path d="M19 14H45L50 19V40L32 50 14 40V19L19 14Z" stroke="#F7E9FF" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M23 14V21M41 14V21M18 24H46" stroke="#FFF3FF" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M32 27 34.2 31.4 39 32.1 35.5 35.4 36.3 40.1 32 37.8 27.7 40.1 28.5 35.4 25 32.1 29.8 31.4Z" fill="#FFF8FF" />
          <Spark x={43.5} y={28} size={1.8} opacity={0.88} />
        </>
      );
    case "shop":
    case "market":
      return (
        <>
          <path d="M14 28H50L47 47H17L14 28Z" fill={refUrl(ids.emerald)} filter={refUrl(ids.glowEmerald)} />
          <path d="M14 28H50L47 47H17L14 28Z" stroke="#E6FFF0" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M18 28 21 18H43L46 28" fill={refUrl(ids.ember)} stroke="#FFE4D9" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M18 28V22H46V28" stroke="#FFF7F1" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 35H42M25 40.5H39" stroke="#174633" strokeWidth="2.2" strokeLinecap="round" />
          {kind === "market" ? <Spark x={42.5} y={20.5} size={2.1} /> : null}
        </>
      );
    case "team":
      return (
        <>
          <circle cx="22" cy="28" r="6.4" fill={refUrl(ids.gem)} stroke="#EAFDFF" strokeWidth="1.7" />
          <circle cx="32" cy="22" r="7.2" fill={refUrl(ids.gold)} stroke="#FFF3C8" strokeWidth="1.7" />
          <circle cx="42" cy="28" r="6.4" fill={refUrl(ids.violet)} stroke="#F7EAFF" strokeWidth="1.7" />
          <path d="M14 47C15.6 41.3 20 38 25.1 38C28.5 38 31 39.1 34 41.9C36.7 39.2 39.3 38 42.8 38C48 38 52.4 41.3 54 47" stroke="#F5F9FF" strokeWidth="2.6" strokeLinecap="round" />
        </>
      );
    case "missions":
      return (
        <>
          <path d="M19 15H42L47 21V49L35 44 23 49V21L19 15Z" fill={refUrl(ids.gold)} filter={refUrl(ids.glowGold)} />
          <path d="M19 15H42L47 21V49L35 44 23 49V21L19 15Z" stroke="#FFF4C8" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M23 15H42V21H23L19 15Z" fill="rgba(255,255,255,0.14)" />
          <path d="M27 28H40M27 34H39M27 40H34" stroke="#8C5C18" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M24.5 28 26 29.5 28.5 26.8" stroke="#FFF7E5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case "heroes":
      return (
        <>
          <path d="M19 20 32 13 45 20V35C45 44.6 39 49.6 32 52 25 49.6 19 44.6 19 35V20Z" fill={refUrl(ids.violet)} filter={refUrl(ids.glowViolet)} />
          <path d="M19 20 32 13 45 20V35C45 44.6 39 49.6 32 52 25 49.6 19 44.6 19 35V20Z" stroke="#F7EAFF" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M25.5 19H38.5L41 23.5H23L25.5 19Z" fill={refUrl(ids.gold)} stroke="#FFF0C8" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="32" cy="28.5" r="4.2" fill="#FFE3C5" />
          <path d="M25.7 39C27.3 34.6 29.3 33 32 33C34.7 33 36.7 34.6 38.3 39" stroke="#FFF7F1" strokeWidth="2.8" strokeLinecap="round" />
        </>
      );
    case "deck":
      return (
        <>
          <rect x="16" y="18" width="18" height="26" rx="5.2" fill={refUrl(ids.gem)} stroke="#EAFDFF" strokeWidth="1.8" />
          <rect x="24" y="14" width="18" height="26" rx="5.2" fill={refUrl(ids.gold)} stroke="#FFF4C9" strokeWidth="1.8" />
          <rect x="32" y="18" width="18" height="26" rx="5.2" fill={refUrl(ids.violet)} stroke="#F7EAFF" strokeWidth="1.8" />
          <path d="M32 23 34.1 27.1 38.5 27.7 35.3 30.9 36.1 35.2 32 33 27.9 35.2 28.7 30.9 25.5 27.7 29.9 27.1Z" fill="#FFF9F0" />
        </>
      );
    case "battle":
      return (
        <>
          <path d="M19 47 29 17 37 25 47 21 35 51 30 36 19 47Z" fill={refUrl(ids.ember)} filter={refUrl(ids.glowEmber)} />
          <path d="M45 47 35 17 27 25 17 21 29 51 34 36 45 47Z" fill={refUrl(ids.gold)} filter={refUrl(ids.glowGold)} opacity="0.98" />
          <path d="M29 17 45 47M35 17 19 47" stroke="#FFF6EE" strokeWidth="1.9" strokeLinecap="round" />
        </>
      );
    case "quests":
      return (
        <>
          <circle cx="32" cy="32" r="16" fill={refUrl(ids.gold)} filter={refUrl(ids.glowGold)} />
          <circle cx="32" cy="32" r="16" stroke="#FFF5CC" strokeWidth="1.8" />
          <path d="M32 18 35.2 28.8 46 32 35.2 35.2 32 46 28.8 35.2 18 32 28.8 28.8Z" fill="#FFF8EA" />
          <path d="M24 24 32 32 40 24" stroke="#915F18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.78" />
        </>
      );
    case "pass":
      return (
        <>
          <path d="M18 16H46V48H18V16Z" fill={refUrl(ids.violet)} filter={refUrl(ids.glowViolet)} />
          <path d="M18 16H46V48H18V16Z" stroke="#F7EAFF" strokeWidth="1.8" />
          <path d="M18 24H46M24 16V21M40 16V21" stroke="#FFF4FF" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M32 27 35 33 41 36 35 39 32 45 29 39 23 36 29 33Z" fill="#FFF8FF" />
        </>
      );
    case "fortress":
      return (
        <>
          <path d="M16 49V27L22 30V18H28V24H36V18H42V30L48 27V49H16Z" fill={refUrl(ids.gold)} filter={refUrl(ids.glowGold)} />
          <path d="M16 49V27L22 30V18H28V24H36V18H42V30L48 27V49H16Z" stroke="#FFF4C8" strokeWidth="1.8" />
          <path d="M28 49V37H36V49" stroke="#8E5E18" strokeWidth="2.2" />
          <rect x="24" y="28" width="4" height="7" rx="1.2" fill="#FFF2C4" opacity="0.84" />
          <rect x="36" y="28" width="4" height="7" rx="1.2" fill="#FFF2C4" opacity="0.84" />
        </>
      );
    case "arena":
      return (
        <>
          <path d="M17 44C17 28.5 23.6 19 32 19C40.4 19 47 28.5 47 44" stroke={refUrl(ids.ember)} strokeWidth="4.4" strokeLinecap="round" filter={refUrl(ids.glowEmber)} />
          <path d="M20 44H44" stroke="#FFECE4" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 34H40M26 28H38M27 22L32 18 37 22" stroke="#FFD6C6" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 19V26M44 19V26" stroke="#FFF0EA" strokeWidth="1.8" strokeLinecap="round" />
        </>
      );
    case "adventure":
      return (
        <>
          <path d="M18 46 24 32 32 18 40 32 46 46H18Z" fill={refUrl(ids.ember)} filter={refUrl(ids.glowEmber)} />
          <path d="M18 46 24 32 32 18 40 32 46 46H18Z" stroke="#FFE7DD" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M24.5 40 29.5 35 33 38.5 39 30 43 34" stroke="#FFF8F2" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 18V24" stroke="#FFF2E8" strokeWidth="1.7" strokeLinecap="round" />
          <Spark x={41.5} y={23.5} size={1.9} opacity={0.86} />
        </>
      );
    case "heart":
      return (
        <>
          <path
            d="M32 50C31 50 29.9 49.6 28.9 48.9C25 46 18.2 40.5 14.2 35.6C11.7 32.6 10.4 29.6 10.4 26.5C10.4 19.4 15.8 14.4 22.6 14.4C26.3 14.4 29.5 15.8 32 18.3C34.5 15.8 37.7 14.4 41.4 14.4C48.2 14.4 53.6 19.4 53.6 26.5C53.6 29.6 52.3 32.6 49.8 35.6C45.8 40.5 39 46 35.1 48.9C34.1 49.6 33 50 32 50Z"
            fill={refUrl(ids.ember)}
            filter={refUrl(ids.glowEmber)}
          />
          <path
            d="M32 47.8C28.1 45 22.2 40.1 18.5 35.8C16.7 33.7 15.6 30.9 15.6 27.7C15.6 22.7 19.2 18.7 23.9 18.7C27.3 18.7 30 20.3 32 23.3C34 20.3 36.7 18.7 40.1 18.7C44.8 18.7 48.4 22.7 48.4 27.7C48.4 30.9 47.3 33.7 45.5 35.8C41.8 40.1 35.9 45 32 47.8Z"
            stroke="#FFF0EA"
            strokeWidth="1.8"
            fill="rgba(255,255,255,0.1)"
          />
        </>
      );
    case "sound-on":
      return (
        <>
          <path d="M16 37H24L35 45V19L24 27H16V37Z" fill={refUrl(ids.gem)} stroke="#EAFDFF" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M41 25.5C44.2 28 46 29.9 46 32C46 34.1 44.2 36 41 38.5M38 19.5C43.3 23.4 47.2 27.7 47.2 32C47.2 36.3 43.3 40.6 38 44.5" stroke="#EAFDFF" strokeWidth="2.6" strokeLinecap="round" />
        </>
      );
    case "sound-off":
      return (
        <>
          <path d="M16 37H24L35 45V19L24 27H16V37Z" fill={refUrl(ids.gem)} stroke="#EAFDFF" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M41 24 50 40M50 24 41 40" stroke="#FFD4C7" strokeWidth="2.8" strokeLinecap="round" />
        </>
      );
    case "move":
      return (
        <>
          <path d="M32 13 45 26H38V40H26V26H19L32 13Z" fill={refUrl(ids.emerald)} filter={refUrl(ids.glowEmerald)} />
          <path d="M32 13 45 26H38V40H26V26H19L32 13Z" stroke="#EEFFF6" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M19 46H45" stroke="#E6FFF0" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "attack":
      return (
        <>
          <path d="M18 45 28 15 39 26 49 21 31 51 28 36 18 45Z" fill={refUrl(ids.ember)} filter={refUrl(ids.glowEmber)} />
          <path d="M18 45 28 15 39 26 49 21 31 51 28 36 18 45Z" stroke="#FFE6DD" strokeWidth="1.8" strokeLinejoin="round" />
        </>
      );
    case "heal":
      return (
        <>
          <circle cx="32" cy="32" r="16" fill={refUrl(ids.emerald)} filter={refUrl(ids.glowEmerald)} />
          <circle cx="32" cy="32" r="16" stroke="#ECFFF4" strokeWidth="1.8" />
          <path d="M32 22V42M22 32H42" stroke="#F7FFF9" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M32 13 46 19V32.5C46 42.6 39 48.8 32 51.8 25 48.8 18 42.6 18 32.5V19L32 13Z" fill={refUrl(ids.gem)} filter={refUrl(ids.glowGem)} />
          <path d="M32 13 46 19V32.5C46 42.6 39 48.8 32 51.8 25 48.8 18 42.6 18 32.5V19L32 13Z" stroke="#EAFDFF" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M33 22 28.3 29.4H32L30.3 40.8 37.9 29.6H34L36.1 22H33Z" fill="#F8FEFF" />
        </>
      );
    case "skill":
      return (
        <>
          <circle cx="32" cy="32" r="16" fill={refUrl(ids.violet)} filter={refUrl(ids.glowViolet)} />
          <circle cx="32" cy="32" r="16" stroke="#F7EAFF" strokeWidth="1.8" />
          <path d="M32 18 35.5 28.5 46 32 35.5 35.5 32 46 28.5 35.5 18 32 28.5 28.5Z" fill="#FFF9FF" />
        </>
      );
    case "power":
      return (
        <>
          <path d="M30 13 20 35H29L27.5 51 44 26H34L40 13H30Z" fill={refUrl(ids.gold)} filter={refUrl(ids.glowGold)} />
          <path d="M30 13 20 35H29L27.5 51 44 26H34L40 13H30Z" stroke="#FFF4C8" strokeWidth="1.8" strokeLinejoin="round" />
        </>
      );
    case "cfg":
      return (
        <>
          <circle cx="32" cy="32" r="8.8" fill={refUrl(ids.gem)} stroke="#EAFDFF" strokeWidth="1.8" />
          <path
            d="M32 13V19M32 45V51M51 32H45M19 32H13M45.4 18.6 41 23M23 41 18.6 45.4M45.4 45.4 41 41M23 23 18.6 18.6"
            stroke="#EAFDFF"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </>
      );
    default:
      return null;
  }
}

export default function GameGlyph({ kind, className, shell = "plate" }: GlyphProps) {
  const rawId = useId().replace(/:/g, "");
  const ids: GlyphIds = {
    gold: `${rawId}-gold`,
    goldDeep: `${rawId}-gold-deep`,
    gem: `${rawId}-gem`,
    gemDeep: `${rawId}-gem-deep`,
    violet: `${rawId}-violet`,
    emerald: `${rawId}-emerald`,
    ember: `${rawId}-ember`,
    steel: `${rawId}-steel`,
    ivory: `${rawId}-ivory`,
    shellOuter: `${rawId}-shell-outer`,
    shellInner: `${rawId}-shell-inner`,
    glowGold: `${rawId}-glow-gold`,
    glowGem: `${rawId}-glow-gem`,
    glowViolet: `${rawId}-glow-violet`,
    glowEmerald: `${rawId}-glow-emerald`,
    glowEmber: `${rawId}-glow-ember`,
  };

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-full w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.32)]", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={ids.gold} x1="12" y1="8" x2="48" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF9D1" />
          <stop offset="0.32" stopColor="#F3D36E" />
          <stop offset="0.72" stopColor="#DA972A" />
          <stop offset="1" stopColor="#8A5717" />
        </linearGradient>
        <linearGradient id={ids.goldDeep} x1="18" y1="18" x2="45" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD983" />
          <stop offset="1" stopColor="#A5661A" />
        </linearGradient>
        <linearGradient id={ids.gem} x1="10" y1="10" x2="50" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECFDFF" />
          <stop offset="0.4" stopColor="#88E0FF" />
          <stop offset="1" stopColor="#246CCC" />
        </linearGradient>
        <linearGradient id={ids.gemDeep} x1="12" y1="12" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4F8FF" />
          <stop offset="1" stopColor="#2A7AE1" />
        </linearGradient>
        <linearGradient id={ids.violet} x1="9" y1="12" x2="55" y2="53" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1FF" />
          <stop offset="0.42" stopColor="#D59FFF" />
          <stop offset="1" stopColor="#6A32B8" />
        </linearGradient>
        <linearGradient id={ids.emerald} x1="12" y1="12" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0FFF4" />
          <stop offset="0.42" stopColor="#7AE0A8" />
          <stop offset="1" stopColor="#1B8A59" />
        </linearGradient>
        <linearGradient id={ids.ember} x1="12" y1="10" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1E6" />
          <stop offset="0.36" stopColor="#FFAB80" />
          <stop offset="1" stopColor="#B73620" />
        </linearGradient>
        <linearGradient id={ids.steel} x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9FBFF" />
          <stop offset="0.5" stopColor="#B9C7DC" />
          <stop offset="1" stopColor="#40536E" />
        </linearGradient>
        <linearGradient id={ids.ivory} x1="18" y1="14" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFDF0" />
          <stop offset="1" stopColor="#ECD9B1" />
        </linearGradient>
        <linearGradient id={ids.shellOuter} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF3C0" />
          <stop offset="0.24" stopColor="#E4BB63" />
          <stop offset="0.7" stopColor="#7A4D16" />
          <stop offset="1" stopColor="#28160A" />
        </linearGradient>
        <linearGradient id={ids.shellInner} x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#223247" />
          <stop offset="0.54" stopColor="#101826" />
          <stop offset="1" stopColor="#070C13" />
        </linearGradient>
        <filter id={ids.glowGold} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.6" floodColor="#F4C453" floodOpacity="0.34" />
        </filter>
        <filter id={ids.glowGem} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.6" floodColor="#67D7FF" floodOpacity="0.3" />
        </filter>
        <filter id={ids.glowViolet} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.6" floodColor="#BE82FF" floodOpacity="0.3" />
        </filter>
        <filter id={ids.glowEmerald} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.6" floodColor="#79E2A8" floodOpacity="0.28" />
        </filter>
        <filter id={ids.glowEmber} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.6" floodColor="#FF8C69" floodOpacity="0.3" />
        </filter>
      </defs>

      {shell === "plate" ? <Shell ids={ids} /> : null}
      {renderGlyph(kind, ids)}
    </svg>
  );
}
