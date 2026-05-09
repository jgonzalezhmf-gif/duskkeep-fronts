"use client";

import { FRONTLINE_UNIT_BY_ID } from "@/features/frontline/data";
import type { FrontlineHeroDef } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { frontlineHeroName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { FrontlineHeroStandee } from "./FrontlineVisualPrimitives";
import { heroPreviewPower } from "./frontlineBattlePageLogic";
import { getFrontlineHeroVisualAsset } from "./frontlineVisualAssets";

export function ReadinessChip({ label, value, ok, t }: { label: string; value: string; ok: boolean; t: (key: string) => string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] shadow-[0_10px_22px_rgba(0,0,0,0.16)]",
        ok ? "border-emerald-200/20 bg-emerald-300/10 text-emerald-100" : "border-rose-200/20 bg-rose-300/10 text-rose-100",
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", ok ? "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.5)]" : "bg-rose-300 shadow-[0_0_14px_rgba(251,113,133,0.5)]")} />
      {label} {value}
      <span className="text-white/48">{ok ? t("frontline.ready") : t("frontline.missing")}</span>
    </span>
  );
}

export function PowerChip({ label, value, tone }: { label: string; value: number; tone: "ally" | "enemy" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] shadow-[0_10px_22px_rgba(0,0,0,0.16)]",
        tone === "ally" ? "border-cyan-200/18 bg-cyan-300/9 text-cyan-100/82" : "border-rose-200/18 bg-rose-300/9 text-rose-100/82",
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", tone === "ally" ? "bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.44)]" : "bg-rose-300 shadow-[0_0_14px_rgba(251,113,133,0.44)]")} />
      {label}
      <strong className="text-white">{value}</strong>
    </span>
  );
}

export function EnemyStagePiece({ hero, index }: { hero: FrontlineHeroDef | null; index: number }) {
  const { t } = useI18n();
  const visual = hero ? getFrontlineHeroVisualAsset(hero.heroId) : null;
  const src = visual?.standeeSrc ?? visual?.portraitFallbackSrc ?? null;
  const name = hero ? frontlineHeroName(t, hero) : "";
  return (
    <div className={cn("frontline-motion-standee relative isolate flex flex-col items-center", index === 1 && "-mt-2 scale-110")}>
      <div className="relative h-24 w-20 overflow-visible">
        <span className="absolute bottom-0 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full border border-rose-100/16 bg-[linear-gradient(90deg,rgba(62,13,23,0.82),rgba(240,95,114,0.24),rgba(25,8,12,0.74))] shadow-[0_12px_24px_rgba(0,0,0,0.36)]" />
        {src ? (
          <img src={src} alt={name} className="relative z-[1] h-full w-full object-contain object-bottom drop-shadow-[0_18px_18px_rgba(0,0,0,0.52)]" loading="lazy" decoding="async" />
        ) : (
          <div className="relative z-[1] grid h-full w-full place-items-center rounded-[24px] bg-black/24 text-sm font-black text-white/70">?</div>
        )}
      </div>
      <div className="mt-1 rounded-full border border-rose-100/14 bg-black/34 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-rose-100/72">
        T{hero?.tier ?? 1}
      </div>
    </div>
  );
}

export function LaneMatchupForecast({ ally, enemy }: { ally: FrontlineHeroDef | null; enemy: FrontlineHeroDef | null }) {
  const { t } = useI18n();
  if (!ally || !enemy) return null;
  const allyEffectiveDmg = Math.max(1, ally.atk - Math.floor(enemy.def / 2));
  const enemyEffectiveDmg = Math.max(1, enemy.atk - Math.floor(ally.def / 2));
  const turnsAllyKills = Math.ceil(enemy.maxHp / allyEffectiveDmg);
  const turnsEnemyKills = Math.ceil(ally.maxHp / enemyEffectiveDmg);
  const verdict = turnsAllyKills < turnsEnemyKills ? "ally" : turnsAllyKills > turnsEnemyKills ? "enemy" : "even";
  const verdictTone =
    verdict === "ally"
      ? "border-cyan-200/40 bg-cyan-300/14 text-cyan-50"
      : verdict === "enemy"
        ? "border-rose-200/40 bg-rose-300/14 text-rose-50"
        : "border-white/16 bg-white/[0.06] text-white/70";
  const verdictLabel =
    verdict === "ally"
      ? t("frontline.matchupAdvantage")
      : verdict === "enemy"
        ? t("frontline.matchupRisk")
        : t("frontline.matchupEven");
  const allyName = frontlineHeroName(t, ally);
  const enemyName = frontlineHeroName(t, enemy);
  const allyTraitInfo = ally.trait.type !== "none" ? t(`frontlineData.traits.${ally.trait.type}.label`) : null;
  const enemyTraitInfo = enemy.trait.type !== "none" ? t(`frontlineData.traits.${enemy.trait.type}.label`) : null;
  return (
    <details className="group/matchup relative z-[1] mt-2 rounded-[14px] border border-white/8 bg-black/20 px-2.5 py-1.5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
        <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em]", verdictTone)}>
          {verdictLabel}
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/40 transition group-open/matchup:text-white/64">
          v
        </span>
      </summary>
      <div className="mt-2 space-y-1 text-[10px] font-black uppercase tracking-[0.14em]">
        <div className="flex items-center justify-between gap-2 text-white/72">
          <span className="truncate text-cyan-100/82">{t("frontline.matchupKills", { name: allyName, turns: turnsAllyKills })}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-white/72">
          <span className="truncate text-rose-100/82">{t("frontline.matchupKills", { name: enemyName, turns: turnsEnemyKills })}</span>
        </div>
        {allyTraitInfo || enemyTraitInfo ? (
          <div className="flex items-center justify-between gap-1 pt-1 text-[9px] text-white/56">
            <span className="text-cyan-100/82">{allyTraitInfo ?? "-"}</span>
            <span className="opacity-60">vs</span>
            <span className="text-rose-100/82">{enemyTraitInfo ?? "-"}</span>
          </div>
        ) : null}
      </div>
    </details>
  );
}

export function BattlePageMatchupGrid({
  allyHeroes,
  enemyHeroes,
}: {
  allyHeroes: (FrontlineHeroDef | null)[];
  enemyHeroes: (FrontlineHeroDef | null)[];
}) {
  const { t } = useI18n();

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {allyHeroes.map((hero, index) => (
        <div key={`matchup-${index}`} className="relative overflow-hidden rounded-[32px] border border-white/9 bg-[radial-gradient(ellipse_at_50%_50%,rgba(245,196,81,0.13),transparent_56%),linear-gradient(180deg,rgba(19,24,34,0.68),rgba(7,8,13,0.9))] p-3 shadow-[0_20px_38px_rgba(0,0,0,0.24)]">
          <div className="pointer-events-none absolute inset-x-4 top-1/2 h-px bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.34),transparent)]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f5c451]/24 bg-[#120d08]/88 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#f5d498] shadow-[0_10px_20px_rgba(0,0,0,0.36)]">
            VS
          </div>
          <div className="relative z-[1] mb-2 flex items-center justify-between gap-2">
            <span className="rounded-full border border-cyan-200/14 bg-cyan-200/8 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100/72">
              {index === 0 ? t("frontline.left") : index === 1 ? t("frontline.center") : t("frontline.right")}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/34">{t("frontline.front")}</span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end gap-2">
            <FrontlineHeroStandee hero={hero} side="ally" compact label={t("frontline.yourHero")} className="min-h-[13rem] border-cyan-200/18 bg-[radial-gradient(circle_at_50%_22%,rgba(103,232,249,0.16),transparent_40%),linear-gradient(180deg,rgba(16,46,54,0.66),rgba(6,9,14,0.9))]" />
            <FrontlineHeroStandee hero={enemyHeroes[index]} side="enemy" compact label={t("frontline.enemy")} className="min-h-[13rem] border-rose-200/18 bg-[radial-gradient(circle_at_50%_22%,rgba(251,113,133,0.18),transparent_40%),linear-gradient(180deg,rgba(72,24,34,0.66),rgba(8,7,12,0.92))]" />
          </div>
          <LanePowerReadout ally={hero} enemy={enemyHeroes[index]} />
          <LaneMatchupForecast ally={hero} enemy={enemyHeroes[index]} />
        </div>
      ))}
    </div>
  );
}

export function LanePowerReadout({ ally, enemy }: { ally: FrontlineHeroDef | null; enemy: FrontlineHeroDef | null }) {
  const allyPower = heroPreviewPower(ally);
  const enemyPower = heroPreviewPower(enemy);
  const total = Math.max(1, allyPower + enemyPower);
  const allyWidth = Math.max(10, Math.round((allyPower / total) * 100));
  const enemyWidth = Math.max(10, 100 - allyWidth);
  return (
    <div className="relative z-[1] mt-3 rounded-[16px] border border-white/8 bg-black/20 px-3 py-2">
      <div className="flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/42">
        <span>{allyPower}</span>
        <span>{enemyPower}</span>
      </div>
      <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-white/8">
        <div className="bg-[linear-gradient(90deg,#65d2c8,#7aa2ff)]" style={{ width: `${allyWidth}%` }} />
        <div className="bg-[linear-gradient(90deg,#ffb36d,#f05f72)]" style={{ width: `${enemyWidth}%` }} />
      </div>
    </div>
  );
}

export function EnemyMini({ combatantId }: { combatantId: string }) {
  const { t } = useI18n();
  const combatant = FRONTLINE_UNIT_BY_ID[combatantId];
  const visual = getFrontlineHeroVisualAsset(combatantId);
  const src = visual.standeeSrc ?? visual.portraitFallbackSrc;
  const combatantName = frontlineHeroName(t, combatant) || combatantId;
  const initials = combatantName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2) ?? "?";

  return (
    <div className="relative h-[3.25rem] w-[3.25rem] overflow-hidden rounded-[18px] border border-rose-100/18 bg-[radial-gradient(circle_at_50%_25%,rgba(255,160,150,0.24),rgba(37,10,14,0.94))] shadow-[0_12px_24px_rgba(0,0,0,0.34)]">
      {src ? (
        <img src={src} alt={combatantName} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
      ) : (
        <div className="grid h-full w-full place-items-center text-sm font-black text-white">{initials}</div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-7 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.72))]" />
      <div className="absolute bottom-1 left-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] font-black text-white">T{combatant?.tier ?? 1}</div>
    </div>
  );
}
