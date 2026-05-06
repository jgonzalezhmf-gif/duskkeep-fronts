"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { ResourceIcon, type ResourceIconKind } from "@/components/game/shared/ResourceIcon";
import { cn } from "@/lib/cn";
import { translate, useI18n } from "@/lib/i18n/useI18n";
import type { Rewards } from "@/lib/types";

type FlightKind = "gold" | "dust" | "gems" | "tickets" | "keys" | "xp" | "shards" | "cards";

type FlightEntry = {
  kind: FlightKind;
  label: string;
  value: number;
};

type FlightItem = FlightEntry & {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delayMs: number;
};

const RESOURCE_TARGET: Partial<Record<FlightKind, ResourceIconKind>> = {
  gold: "gold",
  dust: "dust",
  gems: "gems",
  tickets: "tickets",
  keys: "adventure_key",
};

const FLIGHT_STYLE: Record<FlightKind, string> = {
  gold: "border-[#ffe4a3]/40 bg-[linear-gradient(180deg,rgba(255,233,168,0.98),rgba(159,99,24,0.92))] text-[#2a1504]",
  dust: "border-[#efd4ff]/40 bg-[linear-gradient(180deg,rgba(232,204,255,0.98),rgba(96,55,148,0.92))] text-white",
  gems: "border-[#d9f7ff]/40 bg-[linear-gradient(180deg,rgba(212,247,255,0.98),rgba(37,112,166,0.92))] text-[#041923]",
  tickets: "border-[#ffd8b2]/40 bg-[linear-gradient(180deg,rgba(255,220,180,0.98),rgba(172,73,32,0.92))] text-[#2b1104]",
  keys: "border-[#ffe4a3]/40 bg-[linear-gradient(180deg,rgba(255,233,168,0.98),rgba(118,76,28,0.92))] text-[#241204]",
  xp: "border-emerald-200/36 bg-[linear-gradient(180deg,rgba(172,255,216,0.95),rgba(24,100,72,0.92))] text-[#031611]",
  shards: "border-violet-200/36 bg-[linear-gradient(180deg,rgba(236,212,255,0.95),rgba(91,48,134,0.92))] text-white",
  cards: "border-[#f5d498]/36 bg-[linear-gradient(180deg,rgba(255,229,164,0.95),rgba(117,75,22,0.92))] text-[#241204]",
};

function buildFlightEntries(rewards: Rewards, t: (key: string) => string): FlightEntry[] {
  const entries: FlightEntry[] = [];
  if (rewards.gold) entries.push({ kind: "gold", label: t("resources.gold"), value: rewards.gold });
  if (rewards.dust) entries.push({ kind: "dust", label: t("resources.dust"), value: rewards.dust });
  if (rewards.gems) entries.push({ kind: "gems", label: t("resources.gems"), value: rewards.gems });
  if (rewards.arenaTickets) entries.push({ kind: "tickets", label: t("resources.tickets"), value: rewards.arenaTickets });
  if (rewards.adventureKeys) entries.push({ kind: "keys", label: t("resources.adventureKeys"), value: rewards.adventureKeys });
  const xp = rewards.accountXp ?? rewards.xp ?? 0;
  if (xp) entries.push({ kind: "xp", label: t("frontline.accountXp"), value: xp });
  const shards = rewards.shards?.reduce((sum, shard) => sum + shard.amount, 0) ?? 0;
  if (shards) entries.push({ kind: "shards", label: t("shop.categoryShort.shards"), value: shards });
  if (rewards.frontlineCards?.length) entries.push({ kind: "cards", label: t("frontline.cardUnlocks"), value: rewards.frontlineCards.length });
  return entries;
}

function targetPoint(kind: FlightKind, index: number) {
  const resourceKind = RESOURCE_TARGET[kind];
  if (resourceKind) {
    const target = document.querySelector<HTMLElement>(`[data-resource-kind="${resourceKind}"]`);
    if (target) {
      const rect = target.getBoundingClientRect();
      if (rect.width > 1 && rect.height > 1) {
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    }
  }

  return {
    x: Math.max(72, window.innerWidth - 92 - index * 54),
    y: 58 + (kind === "xp" || kind === "cards" || kind === "shards" ? 34 : 0),
  };
}

export function RewardFlightOverlay({
  rewards,
  active = true,
  nonce,
  origin = "center",
  className,
}: {
  rewards?: Rewards | null;
  active?: boolean;
  nonce?: string | number | null;
  origin?: "center" | "lower" | "upper";
  className?: string;
}) {
  const { locale } = useI18n();
  const gold = rewards?.gold ?? 0;
  const dust = rewards?.dust ?? 0;
  const gems = rewards?.gems ?? 0;
  const arenaTickets = rewards?.arenaTickets ?? 0;
  const adventureKeys = rewards?.adventureKeys ?? 0;
  const xp = rewards?.accountXp ?? rewards?.xp ?? 0;
  const shards = rewards?.shards?.reduce((sum, shard) => sum + shard.amount, 0) ?? 0;
  const cardUnlocks = rewards?.frontlineCards?.length ?? 0;
  const entries = useMemo(
    () =>
      buildFlightEntries(
        {
          gold,
          dust,
          gems,
          arenaTickets,
          adventureKeys,
          accountXp: xp,
          shards: shards ? [{ heroId: "any", amount: shards }] : undefined,
          frontlineCards: cardUnlocks ? Array.from({ length: cardUnlocks }, (_, index) => ({ cardId: `card-${index}` })) : undefined,
        },
        (key) => translate(locale, key),
      ),
    [adventureKeys, arenaTickets, cardUnlocks, dust, gems, gold, locale, shards, xp],
  );
  const [items, setItems] = useState<FlightItem[]>([]);

  useEffect(() => {
    if (!active || !entries.length || typeof window === "undefined") {
      setItems((current) => (current.length ? [] : current));
      return;
    }

    const startY = origin === "upper" ? window.innerHeight * 0.28 : origin === "lower" ? window.innerHeight * 0.68 : window.innerHeight * 0.5;
    const startX = window.innerWidth * 0.5;
    const next = entries.map((entry, index) => {
      const target = targetPoint(entry.kind, index);
      const spread = (index - (entries.length - 1) / 2) * 34;
      return {
        ...entry,
        id: `${entry.kind}-${entry.value}-${nonce ?? "flight"}-${index}`,
        fromX: startX + spread,
        fromY: startY + Math.sin(index + 1) * 12,
        toX: target.x,
        toY: target.y,
        delayMs: index * 95,
      };
    });
    setItems(next);

    const timeout = window.setTimeout(() => setItems([]), 1500 + entries.length * 100);
    return () => window.clearTimeout(timeout);
  }, [active, entries, nonce, origin]);

  if (!items.length) return null;

  return (
    <div className={cn("pointer-events-none fixed inset-0 z-[90]", className)} aria-hidden="true">
      {items.map((item) => (
        <span
          key={item.id}
          className={cn(
            "frontline-reward-flight fixed inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-black shadow-[0_14px_34px_rgba(0,0,0,0.36),0_0_24px_rgba(245,196,81,0.24)]",
            FLIGHT_STYLE[item.kind],
          )}
          style={
            {
              "--flight-from-x": `${item.fromX}px`,
              "--flight-from-y": `${item.fromY}px`,
              "--flight-to-x": `${item.toX}px`,
              "--flight-to-y": `${item.toY}px`,
              animationDelay: `${item.delayMs}ms`,
            } as CSSProperties
          }
        >
          <span className="frontline-reward-flight-tail" />
          <span className="frontline-reward-flight-flare" />
          <span className="frontline-reward-flight-spark spark-a" />
          <span className="frontline-reward-flight-spark spark-b" />
          <span className="frontline-reward-flight-spark spark-c" />
          <span className="frontline-reward-flight-core relative z-[1] inline-flex items-center gap-1.5">
            <FlightIcon kind={item.kind} />
            <span>+{item.value}</span>
            <span className="hidden text-[8px] uppercase tracking-[0.16em] opacity-70 sm:inline">{item.label}</span>
          </span>
        </span>
      ))}
    </div>
  );
}

function FlightIcon({ kind }: { kind: FlightKind }) {
  const resourceKind = RESOURCE_TARGET[kind];
  if (resourceKind) return <ResourceIcon kind={resourceKind} size="small" className="h-7 w-7" />;
  if (kind === "keys") return <ProgressionIcon name="reward_chest" size="sm" />;
  if (kind === "xp") return <ProgressionIcon name="level_up" size="sm" />;
  if (kind === "cards") return <ProgressionIcon name="unlock" size="sm" />;
  return <ProgressionIcon name="star" size="sm" />;
}
