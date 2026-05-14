"use client";

import { getHero } from "@/data/heroes";
import { heroUnlockLevel } from "@/data/unlocks";
import { getFrontlineHeroProfile, isFrontlineReadyHero } from "@/features/frontline/heroProfile";
import { LEVEL_UP_GOLD, MAX_STARS, SHARDS_FOR_STAR } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { sfx } from "@/lib/audio";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import Button from "@/components/ui/Button";
import GameIcon from "@/components/game/shared/GameIcon";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";

export default function HeroDetailModal({ heroId, onClose }: { heroId: string; onClose: () => void }) {
  const { t } = useI18n();
  const hero = getHero(heroId);
  const ph = useGameStore((state) => state.heroes.find((entry) => entry.heroId === heroId));
  const gold = useGameStore((state) => state.resources.gold);
  const accountLevel = useGameStore((state) => state.account.level);
  const levelUp = useGameStore((state) => state.levelUpHeroOnlineFirst);
  const starUp = useGameStore((state) => state.starUpHeroOnlineFirst);

  const owned = Boolean(ph && ph.stars > 0);
  const shards = ph?.shards ?? 0;
  const gateLevel = heroUnlockLevel(heroId);
  const levelGated = gateLevel !== null && accountLevel < gateLevel;
  const frontlineProfile = getFrontlineHeroProfile(hero, ph);
  const canLevelUp = owned && ph && gold >= LEVEL_UP_GOLD(ph.level);
  const canStarUp = owned && ph && ph.stars < MAX_STARS && ph.shards >= (SHARDS_FOR_STAR[ph.stars] ?? Infinity);
  const shardGoal = owned && ph ? SHARDS_FOR_STAR[ph.stars] ?? 1 : 10;
  const shardProgress = Math.min(100, (shards / shardGoal) * 100);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/78 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[92dvh] w-full max-w-[70rem] overflow-y-auto rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(36,25,44,0.96),rgba(10,13,20,0.98)_52%,rgba(6,8,13,0.99)_100%)] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.56)] md:p-5"
      >
        <button
          onClick={onClose}
          aria-label={t("rosterScreen.modal.close")}
          className="absolute right-4 top-4 z-[3] grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/56 text-lg font-black text-white/80 transition hover:border-[#f5c451]/28 hover:text-[#f5d498]"
        >
          x
        </button>

        <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div>
            <FrontlineHeroStandee
              hero={frontlineProfile}
              selected={owned}
              label={owned && ph
                ? t("rosterScreen.labels.levelStar", { level: ph.level, stars: ph.stars })
                : levelGated
                  ? t("rosterScreen.labels.unlockLevel", { level: gateLevel ?? 1 })
                  : t("rosterScreen.labels.shards", { current: shards, target: 10 })}
              className="min-h-[26rem]"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4 pr-12">
              <div>
                <div className="inline-flex rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
                  {isFrontlineReadyHero(hero.id) ? t("rosterScreen.modal.frontlineProfile") : t("rosterScreen.modal.reserveProfile")}
                </div>
                <h2 className="mt-3 text-[2rem] font-black leading-[0.95] text-white md:text-[3.1rem]">{hero.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <MetaPill>{t(`rosterScreen.rarity.${hero.rarity}`)}</MetaPill>
                  <MetaPill>{t(`rosterScreen.roles.${hero.role}`)}</MetaPill>
                  <MetaPill>{hero.faction}</MetaPill>
                  <MetaPill tone={isFrontlineReadyHero(hero.id) ? "gold" : "neutral"}>
                    {isFrontlineReadyHero(hero.id) ? t("rosterScreen.modal.combatReady") : t("rosterScreen.modal.futureTier")}
                  </MetaPill>
                </div>
              </div>
              <GameIcon kind={hero.role === "support" ? "heal" : hero.role === "tank" ? "shield" : "attack"} tone="violet" size="lg" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label={t("rosterScreen.modal.frontHp")} value={frontlineProfile.maxHp} />
              <Stat label={t("rosterScreen.modal.frontAtk")} value={frontlineProfile.atk} />
              <Stat label={t("rosterScreen.modal.frontDef")} value={frontlineProfile.def} />
              <Stat label={t("rosterScreen.modal.frontSpeed")} value={frontlineProfile.speed} />
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <AbilityCard title={t("rosterScreen.modal.active")} name={hero.active.name} desc={hero.active.description} />
              <AbilityCard title={t("rosterScreen.modal.passive")} name={hero.passive.name} desc={hero.passive.description} />
            </div>

            <div className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
                    <ProgressionIcon name={owned ? "star" : "unlock"} size="sm" />
                    {owned ? t("rosterScreen.modal.nextEvolution") : levelGated ? t("rosterScreen.modal.accountGate") : t("rosterScreen.modal.unlockProgress")}
                  </div>
                  <div className="mt-1 text-sm font-black text-white">
                    {owned && ph
                      ? ph.stars >= MAX_STARS
                        ? t("rosterScreen.modal.maxStarsReached")
                        : t("rosterScreen.modal.shardsTowardNext", { current: ph.shards, required: SHARDS_FOR_STAR[ph.stars] })
                      : levelGated
                        ? t("rosterScreen.modal.reachAccountLevel", { level: gateLevel ?? 1 })
                        : t("rosterScreen.modal.shardsToUnlock", { current: shards, required: 10 })}
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/48">{t("rosterScreen.modal.tierVisualsPending")}</div>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/34">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#8bdfff,#f5d498)]" style={{ width: `${levelGated ? 0 : shardProgress}%` }} />
              </div>
            </div>

            {owned && ph ? (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button
                  onClick={async () => {
                    const result = await levelUp(heroId);
                    if (result.ok) sfx.levelUp();
                    else sfx.error();
                  }}
                  disabled={!canLevelUp}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <ProgressionIcon name="level_up" size="sm" />
                    {t("rosterScreen.modal.levelUpCost", { gold: LEVEL_UP_GOLD(ph.level) })}
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const result = await starUp(heroId);
                    if (result.ok) sfx.levelUp();
                    else sfx.error();
                  }}
                  disabled={!canStarUp}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <ProgressionIcon name="star" size="sm" />
                    {ph.stars >= MAX_STARS ? t("rosterScreen.modal.maxStars") : t("rosterScreen.modal.starUpCost", { current: ph.shards, required: SHARDS_FOR_STAR[ph.stars] })}
                  </span>
                </Button>
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
                {levelGated ? t("rosterScreen.modal.keepProgressing") : t("rosterScreen.modal.collectShards")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "gold" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]",
        tone === "gold" ? "border-[#f5c451]/24 bg-[#f5c451]/12 text-[#f5d498]" : "border-white/10 bg-white/[0.055] text-white/62",
      )}
    >
      {children}
    </span>
  );
}

function Stat({ label, value, dim }: { label: string; value: number; dim?: boolean }) {
  return (
    <div className={cn("rounded-[20px] border border-white/10 bg-black/22 px-4 py-3", dim && "opacity-62")}>
      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/42">{label}</div>
      <div className="mt-1 text-xl font-black tabular-nums text-white">{value}</div>
    </div>
  );
}

function AbilityCard({ title, name, desc }: { title: string; name: string; desc: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.88))] p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{title}</div>
      <div className="mt-1 text-lg font-black text-white">{name}</div>
      <div className="mt-2 text-[13px] leading-6 text-white/62">{desc}</div>
    </div>
  );
}
