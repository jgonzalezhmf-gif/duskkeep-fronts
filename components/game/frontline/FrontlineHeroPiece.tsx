"use client";

import GameGlyph from "@/components/ui/GameGlyph";
import { StatusIcon } from "@/components/game/shared/StatusIcon";
import { FRONTLINE_UNIT_BY_ID } from "@/features/frontline/data";
import type { FrontlineBattleState, FrontlineEvent } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import { frontlineSupportName, frontlineTraitInfo, tx } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { CompactPill } from "./FrontlineBattlePills";
import { CombatIcon } from "./FrontlineCombatIcon";
import { getFrontlineHeroVisualAsset } from "./frontlineVisualAssets";
import { HeroFxBadge } from "./FrontlineHeroFxBadge";
import { SupportToken } from "./FrontlineSupportToken";
import { SynergyProcBadge } from "./FrontlineSynergyFeedback";
import { TraitProcBadge } from "./FrontlineTraitProcBadge";
import { VisualAssetImage } from "./FrontlineVisualAssetImage";
import type { FrontlineVisualFxTone } from "./FrontlineLaneActionTrail";

export type HeroVisualState = {
  idle?: boolean;
  selected?: boolean;
  targeted?: boolean;
  attacking?: boolean;
  hit?: boolean;
  shielded?: boolean;
  healed?: boolean;
  ko?: boolean;
  breachSource?: boolean;
  damaged?: boolean;
  summoned?: boolean;
  floatLabel?: string;
  floatTone?: FrontlineVisualFxTone;
  trait?: NonNullable<FrontlineEvent["trait"]>;
  synergy?: { id: string; label: string };
};

type FrontlineHeroPieceProps = {
  actor: FrontlineBattleState["lanes"]["left"]["allyHero"];
  support: FrontlineBattleState["lanes"]["left"]["allySupport"];
  accent: "ally" | "enemy";
  pressured?: boolean;
  visualState?: HeroVisualState;
  scorch?: number;
};

function combatIconForTone(tone: FrontlineVisualFxTone): CombatAssetIconName {
  if (tone === "heal") return "heal";
  if (tone === "shield") return "shield";
  if (tone === "breach") return "breach";
  if (tone === "summon") return "summon";
  if (tone === "stun") return "stun";
  if (tone === "power") return "leader_power";
  return "attack";
}

export function FrontlineHeroPiece({
  actor,
  support,
  accent,
  pressured,
  visualState,
  scorch,
}: FrontlineHeroPieceProps) {
  const { t } = useI18n();

  if (!actor) {
    return (
      <div className="grid h-[9.25rem] place-items-center rounded-[26px] border border-white/6 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.04),transparent_60%)] text-[10px] font-black uppercase tracking-[0.16em] text-white/32">
        <span className="inline-flex items-center gap-1.5">
          <CombatIcon name="breach" size="sm" fallbackClassName="opacity-55" />
          {t("frontline.openFront")}
        </span>
      </div>
    );
  }

  const hpWidth = Math.max(0, (actor.hp / actor.maxHp) * 100);
  const fx = visualState ?? { idle: true };
  const sideGlow =
    accent === "ally"
      ? "bg-[radial-gradient(circle,rgba(101,210,200,0.18),transparent_66%)]"
      : "bg-[radial-gradient(circle,rgba(240,95,114,0.18),transparent_66%)]";
  const visual = getFrontlineHeroVisualAsset(actor.heroId);
  const actorName = tx(t, `frontlineData.heroes.${actor.heroId}.name`, actor.name);
  const actorRole = tx(t, `frontlineData.heroes.${actor.heroId}.role`, actor.role);
  const supportName = support ? frontlineSupportName(t, support) : "";
  const heroDef = FRONTLINE_UNIT_BY_ID[actor.heroId];
  const traitInfo = heroDef ? frontlineTraitInfo(t, heroDef.trait) : null;

  return (
    <div
      title={`${actorName} - ${actorRole}${supportName ? ` - support ${supportName}` : ""}`}
      className={cn(
        "relative min-h-[11.5rem] overflow-visible px-2 pb-4 pt-5",
        pressured && "ring-2 ring-rose-300/24 shadow-[0_0_34px_rgba(244,99,112,0.2)]",
        fx.hit && "frontline-hit-fx",
        fx.ko && "frontline-ko-fx",
      )}
    >
      <div className={cn("absolute left-1/2 top-4 h-32 w-32 -translate-x-1/2 blur-xl opacity-80", sideGlow)} />
      {fx.selected || fx.targeted ? (
        <div
          className={cn(
            "frontline-target-pulse-fx pointer-events-none absolute left-1/2 top-4 h-36 w-36 -translate-x-1/2 rounded-full blur-md",
            accent === "ally" ? "bg-cyan-300/15" : "bg-rose-300/15",
          )}
        />
      ) : null}
      <div className="absolute left-1/2 bottom-6 h-4 w-36 -translate-x-1/2 rounded-full bg-black/32 blur-sm" />
      <div
        className={cn(
          "absolute bottom-5 left-1/2 h-7 w-[10rem] -translate-x-1/2 rounded-[999px] border shadow-[0_8px_20px_rgba(0,0,0,0.24)]",
          accent === "ally"
            ? "border-cyan-200/12 bg-[linear-gradient(90deg,rgba(12,55,62,0.42),rgba(91,221,206,0.14),rgba(10,26,30,0.36))]"
            : "border-rose-200/12 bg-[linear-gradient(90deg,rgba(62,13,23,0.42),rgba(240,95,114,0.14),rgba(25,8,12,0.36))]",
        )}
      />
      <div className="pointer-events-none absolute inset-x-3 top-0 z-[3] flex items-center justify-center gap-2">
        <div className="max-w-[11rem] truncate rounded-full border border-white/10 bg-black/30 px-3 py-1 text-center text-[12px] font-black text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)] backdrop-blur-[1px]">
          {actorName}
        </div>
        {traitInfo ? (
          <div
            title={`${traitInfo.label} - ${traitInfo.description}`}
            className={cn(
              "absolute right-0 top-0 grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-black/30 backdrop-blur-[1px]",
              accent === "ally" ? "border-cyan-200/28 text-cyan-100" : "border-rose-200/28 text-rose-100",
            )}
          >
            <StatusIcon name={traitInfo.icon} size="md" className="h-8 w-8" fallbackClassName="opacity-90" />
          </div>
        ) : null}
      </div>
      <div className="relative z-[1] grid min-h-[10.8rem] place-items-center pt-3">
        <div className="relative mx-auto shrink-0">
          <div
            className={cn(
              "absolute -inset-1 rounded-[26px] blur-sm",
              accent === "ally" ? "bg-cyan-300/13" : "bg-rose-300/13",
              (fx.shielded || fx.healed || fx.breachSource) && "opacity-90",
            )}
          />
          {fx.shielded ? (
            <div className="frontline-shield-fx pointer-events-none absolute -inset-4 z-[2] rounded-[34px] border border-cyan-200/40 bg-cyan-200/10 shadow-[0_0_30px_rgba(101,210,200,0.3)]" />
          ) : null}
          {fx.healed ? (
            <div className="frontline-heal-fx pointer-events-none absolute -inset-4 z-[2] rounded-[34px] border border-emerald-200/36 bg-emerald-200/10 shadow-[0_0_30px_rgba(75,224,141,0.28)]" />
          ) : null}
          {fx.floatLabel ? (
            <HeroFxBadge tone={fx.floatTone ?? "damage"} icon={combatIconForTone(fx.floatTone ?? "damage")}>
              {fx.floatLabel}
            </HeroFxBadge>
          ) : null}
          {fx.trait ? <TraitProcBadge trait={fx.trait} side={accent} /> : null}
          {fx.synergy ? <SynergyProcBadge label={fx.synergy.label} /> : null}
          <VisualAssetImage
            src={visual.standeeSrc}
            fallbackSrc={visual.portraitFallbackSrc}
            alt={actorName}
            className={cn(
              "relative h-44 w-32 rounded-t-[34px] rounded-b-[22px] bg-black/6 shadow-[0_18px_38px_rgba(0,0,0,0.34)] transition duration-300 group-hover:scale-[1.045]",
              accent === "ally" ? "ring-1 ring-cyan-200/10" : "ring-1 ring-rose-200/10",
              fx.idle && !fx.attacking && !fx.hit && !fx.ko && "frontline-idle-fx",
              fx.attacking && (accent === "ally" ? "frontline-attack-ally-fx" : "frontline-attack-enemy-fx"),
              fx.selected && "ring-[#f5c451]/40 shadow-[0_0_34px_rgba(245,196,81,0.22),0_22px_44px_rgba(0,0,0,0.46)]",
              fx.targeted && "ring-[#f5c451]/55",
              fx.breachSource && "shadow-[0_0_38px_rgba(245,196,81,0.34),0_22px_44px_rgba(0,0,0,0.46)]",
              actor.stun > 0 && "frontline-stun-pulse-fx",
            )}
            imgClassName={cn("h-full w-full object-top", visual.standeeSrc ? "object-contain" : "object-cover")}
            fallback={
              <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),rgba(0,0,0,0.28))]">
                <GameGlyph kind="heroes" shell="none" className="h-10 w-10" />
              </div>
            }
          />
          <div className="absolute -bottom-1 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full bg-[#f5d498]/16 blur-sm" />
          <div className="absolute -bottom-5 left-1/2 w-36 -translate-x-1/2">
            <div className="h-3 overflow-hidden rounded-full bg-black/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ff6d69,#ffd86f)] shadow-[0_0_16px_rgba(255,216,111,0.24)]"
                style={{ width: `${hpWidth}%` }}
              />
            </div>
            <div className="mt-1 text-center text-[10px] font-black uppercase tracking-[0.12em] text-white/72">
              {actor.hp}/{actor.maxHp}
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-4 z-[3] inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/64 backdrop-blur-[1px]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/58">
                <span className="inline-flex items-center gap-1">
                  <CombatIcon name="attack" size="lg" className="h-8 w-8" fallbackClassName="opacity-85" />
                  <span className="text-[12px] text-white/78">{actor.atk + actor.tempAtk}</span>
                </span>
                {traitInfo ? (
                  <span
                    title={`${traitInfo.label} - ${traitInfo.description}`}
                    className={cn(
                      "hidden",
                      accent === "ally"
                        ? "border-cyan-200/30 bg-cyan-300/12 text-cyan-100/82"
                        : "border-rose-200/30 bg-rose-300/12 text-rose-100/82",
                    )}
                  >
                    <StatusIcon name={traitInfo.icon} size="sm" className="h-5 w-5" fallbackClassName="opacity-90" />
                    <span className="truncate max-w-[5.2rem]">{traitInfo.label}</span>
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {support ? <SupportToken support={support} side={accent} active={Boolean(fx.summoned)} /> : null}
              {actor.stun > 0 ? (
                <CompactPill tone="enemy">
                  <span className="inline-flex items-center gap-1">
                    <StatusIcon name="debuff" size="md" className="h-7 w-7" fallbackClassName="opacity-90" />
                    {actor.stun}
                  </span>
                </CompactPill>
              ) : null}
              {scorch && scorch > 0 ? (
                <CompactPill tone="enemy">
                  <span className="inline-flex items-center gap-1">
                    <StatusIcon name="poison" size="md" className="h-7 w-7" fallbackClassName="opacity-90" />
                    {scorch}
                  </span>
                </CompactPill>
              ) : null}
              {pressured ? (
                <CompactPill tone="enemy">
                  <span className="inline-flex items-center gap-1">
                    <CombatIcon name="danger" size="md" className="h-6 w-6" fallbackClassName="opacity-85" />
                    {t("frontline.low")}
                  </span>
                </CompactPill>
              ) : null}
            </div>
          </div>
          <div className="hidden">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#ff6d69,#ffd86f)] shadow-[0_0_16px_rgba(255,216,111,0.24)]"
              style={{ width: `${hpWidth}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/72">
            <span className="sr-only">
              {actor.hp}/{actor.maxHp}
            </span>
            {actor.shield > 0 ? (
              <span className="inline-flex items-center gap-1">
                <StatusIcon name="guard" size="md" className="h-7 w-7" fallbackClassName="opacity-90" />
                {actor.shield}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
