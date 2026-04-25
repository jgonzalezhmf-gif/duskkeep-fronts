"use client";

import type { CSSProperties } from "react";
import type { AdventureLevel } from "@/lib/types";
import { cn } from "@/lib/cn";
import ArtPortrait from "@/components/ui/ArtPortrait";
import { FRONTLINE_CARD_BY_ID } from "@/features/frontline/data";
import { getFrontlineAdventureSquad } from "@/features/frontline/adventure";
import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import { GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { frontlineCardName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  SceneButton,
  SceneMedallion,
  ScreenBadge,
  ScreenPanel,
} from "@/components/game/screens/ScreenChrome";
import type { ScreenScene } from "@/components/game/screens/SceneBackdrop";

export type AdventureNodeState = {
  lvl: AdventureLevel;
  cleared: boolean;
  locked: boolean;
  current: boolean;
  pausedHere: boolean;
  firstClearAvailable: boolean;
};

export type AdventureNodeLayout = {
  x: string;
  y: string;
  mobileX: string;
  mobileY: string;
};

export type AdventureLandmark = {
  label: string;
  kind: "camp" | "bridge" | "altar" | "gate" | "spire" | "ruin";
  x: string;
  y: string;
  mobileX: string;
  mobileY: string;
};

export type AdventureCampaignMeta = {
  name: string;
  subtitle: string;
  accent: string;
  scene: ScreenScene;
  hint: string;
  atmosphere: string;
  terrainLabel: string;
  threatLabel: string;
  landmarks: AdventureLandmark[];
};

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function AdventureCampaignMap({
  meta,
  nodes,
  layouts,
  selectedId,
  onSelect,
  embedded = false,
  showOverlayHeader = true,
}: {
  meta: AdventureCampaignMeta;
  nodes: AdventureNodeState[];
  layouts: AdventureNodeLayout[];
  selectedId: string;
  onSelect: (id: string) => void;
  embedded?: boolean;
  showOverlayHeader?: boolean;
}) {
  const desktopPath = buildSmoothPath(layouts, "desktop");
  const mobilePath = buildSmoothPath(layouts, "mobile");
  const progress = nodes.length ? Math.round((nodes.filter((node) => node.cleared).length / nodes.length) * 100) : 0;
  const cleared = nodes.filter((node) => node.cleared).length;

  return (
    <div
      className={cn(
        "relative h-full overflow-hidden",
        embedded
          ? "rounded-[30px] bg-[radial-gradient(circle_at_24%_18%,rgba(251,214,143,0.18),transparent_25%),radial-gradient(circle_at_78%_16%,rgba(141,200,255,0.16),transparent_23%),linear-gradient(180deg,rgba(57,45,28,0.18),rgba(26,28,22,0.2)_30%,rgba(9,13,16,0.72)_100%)]"
          : "rounded-[42px] border border-[#f7d089]/12 bg-[radial-gradient(circle_at_24%_18%,rgba(251,214,143,0.18),transparent_25%),radial-gradient(circle_at_78%_16%,rgba(141,200,255,0.16),transparent_23%),linear-gradient(180deg,rgba(57,45,28,0.2),rgba(26,28,22,0.24)_30%,rgba(9,13,16,0.82)_100%)] shadow-[0_36px_96px_rgba(0,0,0,0.44)]",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_72%,rgba(255,207,120,0.13),transparent_22%),radial-gradient(circle_at_78%_18%,rgba(169,214,255,0.2),transparent_20%),radial-gradient(circle_at_52%_64%,rgba(143,104,58,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_22%,rgba(0,0,0,0.22)_100%)]" />
      <div
        className={cn(
          "pointer-events-none absolute bg-[linear-gradient(120deg,rgba(255,238,178,0.045),rgba(255,255,255,0)_28%,rgba(28,18,9,0.16)_72%,rgba(4,7,11,0.36))]",
          embedded ? "inset-[0.45rem] rounded-[26px] md:inset-[0.65rem] md:rounded-[32px]" : "inset-[1.1rem] rounded-[36px]",
        )}
      />
      <div className={cn("pointer-events-none absolute inset-x-[5%] z-[1] h-[11rem] rounded-[50%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),rgba(255,255,255,0)_70%)] blur-3xl", embedded ? "top-[10%] md:top-[13%]" : "top-[13%] md:top-[15%]")} />
      <div className={cn("pointer-events-none absolute inset-x-[7%] z-[1] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_50%,rgba(150,95,48,0.12),rgba(255,255,255,0.018)_42%,rgba(8,10,16,0)_72%)] blur-sm", embedded ? "top-[18%] h-[46%]" : "top-[18%] h-[46%]")} />
      <div className="pointer-events-none absolute inset-x-[3%] bottom-[10%] z-[1] h-[18rem] rounded-[50%] bg-[radial-gradient(circle_at_50%_56%,rgba(13,17,27,0),rgba(13,17,27,0.08)_32%,rgba(6,8,13,0.82)_78%,rgba(6,8,13,0.96)_100%)]" />
      <AdventureTerrain meta={meta} />
      {showOverlayHeader ? <CampaignHeader meta={meta} progress={progress} nodes={nodes} /> : null}
      {showOverlayHeader ? <CampaignIntel meta={meta} cleared={cleared} total={nodes.length} /> : null}

      <CampaignTrail d={mobilePath} accent={meta.accent} className="md:hidden" />
      <CampaignTrail d={desktopPath} accent={meta.accent} className="hidden md:block" />
      <PathRunes layouts={layouts} accent={meta.accent} />

      {meta.landmarks.map((landmark) => (
        <LandmarkAnchor key={landmark.label} landmark={landmark} accent={meta.accent} />
      ))}

      {nodes.map((node, index) => {
        const layout = layouts[index] ?? layouts[layouts.length - 1];
        return (
          <AdventureNodeAnchor
            key={node.lvl.id}
            node={node}
            layout={layout}
            accent={meta.accent}
            active={selectedId === node.lvl.id}
            onSelect={onSelect}
            totalNodes={nodes.length}
          />
        );
      })}

      <div className="pointer-events-none absolute inset-x-[4%] bottom-[5%] h-[18%] rounded-[50%] bg-[radial-gradient(circle_at_50%_40%,rgba(14,18,28,0),rgba(8,10,16,0.04)_26%,rgba(8,10,16,0.66)_74%,rgba(8,10,16,0.94)_100%)]" />
      <div className="pointer-events-none absolute inset-x-[-8%] bottom-[-5%] h-[16rem] rounded-[50%] bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_28%,rgba(8,10,16,0)_48%)] blur-2xl" />
    </div>
  );
}

export function AdventureMissionPanel({
  meta,
  node,
  totalNodes,
  onOpenBattle,
}: {
  meta: AdventureCampaignMeta;
  node: AdventureNodeState;
  totalNodes: number;
  onOpenBattle: () => void;
}) {
  const { t } = useI18n();
  const nodeRole = getNodeRole(node, node.lvl.index, totalNodes);
  const tone = node.locked ? "neutral" : node.cleared ? "emerald" : nodeRole === "boss" ? "ember" : "gold";
  const statusLabel = node.pausedHere
    ? t("adventure.pausedEncounter")
    : node.locked
      ? node.lvl.unlockAccountLevel
        ? t("adventure.unlocksAtLevel", { level: node.lvl.unlockAccountLevel })
        : t("adventure.routeSealed")
      : node.cleared
        ? t("adventure.clearedEncounter")
        : nodeRole === "boss"
          ? t("adventure.bossEncounter")
          : nodeRole === "elite"
            ? t("adventure.eliteEncounter")
            : t("adventure.battleEncounter");

  const atmosphere = describeEncounter(meta, node, nodeRole, t);
  const frontlineSquad = getFrontlineAdventureSquad(node.lvl);
  const enemyTotal = frontlineSquad.reduce((sum, enemy) => sum + enemy.maxHp + enemy.atk * 2 + enemy.def * 2 + enemy.tier * 6, 0);
  const missionTone = node.locked
    ? t("adventure.sealedRoute")
    : node.pausedHere
      ? t("adventure.activeBreach")
      : nodeRole === "boss"
        ? t("adventure.decisiveStrike")
        : nodeRole === "elite"
          ? t("adventure.pressureLane")
          : t("adventure.forwardAssault");
  const objective =
    nodeRole === "boss"
      ? t("adventure.objectives.boss")
      : nodeRole === "elite"
        ? t("adventure.objectives.elite")
        : node.locked
          ? t("adventure.objectives.locked")
          : t("adventure.objectives.battle");

  return (
    <ScreenPanel className="pointer-events-auto max-h-none overflow-hidden p-0 shadow-[0_28px_68px_rgba(0,0,0,0.4)] xl:max-h-[calc(100dvh-7.5rem)] xl:overflow-y-auto">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(245,196,81,0.12),transparent_22%),radial-gradient(circle_at_84%_18%,rgba(143,213,255,0.12),transparent_16%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0)_28%,rgba(8,10,16,0.16)_100%)]" />
        <div className="relative grid gap-0">
          <div className="px-4 py-4 md:px-5 md:py-5">
            <div className="flex flex-wrap items-center gap-2">
              <ScreenBadge tone="gold">{meta.subtitle}</ScreenBadge>
              <ScreenBadge tone="sky">{t("adventure.power")} {node.lvl.recommendedPower}</ScreenBadge>
              <ScreenBadge tone={tone}>{statusLabel}</ScreenBadge>
              {node.lvl.obstacles?.length ? <ScreenBadge tone="neutral">{node.lvl.obstacles.length} {t("adventure.hazards")}</ScreenBadge> : null}
            </div>

            <div className="mt-4 overflow-hidden rounded-[30px] border border-[#f5d498]/12 bg-[linear-gradient(180deg,rgba(43,31,18,0.32),rgba(7,10,16,0.88))] shadow-[0_20px_44px_rgba(0,0,0,0.22)]">
              <div className="relative px-4 py-4">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_40%,rgba(245,196,81,0.16),transparent_20%),radial-gradient(circle_at_86%_20%,rgba(143,213,255,0.1),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
                <div className="relative grid gap-4">
                  <div>
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="relative mt-0.5 shrink-0">
                        <div className="absolute inset-0 rounded-[24px] blur-xl" style={{ background: `radial-gradient(circle,${meta.accent}36,transparent 72%)` }} />
                        <SceneMedallion
                          icon={node.locked ? "shield" : nodeRole === "boss" ? "battle" : node.cleared ? "rewards" : "adventure"}
                          tone={node.locked ? "violet" : nodeRole === "boss" ? "ember" : node.cleared ? "emerald" : "gold"}
                          className="relative h-14 w-14 rounded-[18px] md:h-16 md:w-16 md:rounded-[22px]"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-[#f5d498]">{missionTone}</div>
                        <h2 className="mt-1 text-[1.35rem] font-black leading-tight text-white md:text-[1.95rem]">{node.lvl.name}</h2>
                        <p className="mt-2 text-[12px] leading-5 text-white/72">{atmosphere.blurb}</p>
                      </div>
                    </div>

                    <SceneButton onClick={onOpenBattle} disabled={node.locked} className="mt-4 w-full">
                      {node.pausedHere ? t("adventure.resumeMission") : node.locked ? t("adventure.lockedCta") : t("adventure.startAdventure")}
                    </SceneButton>

                    <div className="mt-4 grid gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
                      <MissionFact label={t("adventure.terrain")} value={meta.terrainLabel} icon="fortress" />
                      <MissionFact label={t("adventure.threat")} value={meta.threatLabel} icon="battle" />
                      <MissionFact label={t("adventure.enemySquadPower")} value={`${enemyTotal}`} icon="power" />
                    </div>

                    <div className="mt-4 rounded-[24px] border border-[#f5d498]/10 bg-[linear-gradient(180deg,rgba(58,38,18,0.28),rgba(8,10,16,0.88))] px-4 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.18)]">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-[#f5d498]">{t("adventure.objective")}</div>
                      <div className="mt-2 text-[0.95rem] font-black leading-6 text-white">{objective}</div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,22,33,0.68),rgba(8,10,16,0.96))] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/48">{t("adventure.rewardOutlook")}</div>
                      <div className="mt-2 text-sm font-black text-white">{atmosphere.rewardTone}</div>
                      <div className="mt-3 flex flex-wrap gap-2.5">
                        {buildRewardChips(node.lvl, node.firstClearAvailable, t).map((chip) => (
                          <RewardChip key={`${chip.label}-${chip.value}`} compact {...chip} />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,24,0.48),rgba(8,10,16,0.94))] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/48">{t("adventure.formationTag")}</div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="text-sm font-black leading-6 text-white">
                          {nodeRole === "boss"
                            ? t("adventure.commandCell")
                            : nodeRole === "elite"
                              ? t("adventure.chokePointSquad")
                              : t("adventure.forwardPatrol")}
                        </div>
                        <ScreenBadge tone={tone}>{node.lvl.index}/{totalNodes}</ScreenBadge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/48">{t("adventure.enemyFormation")}</div>
                    </div>
                    <ScreenBadge tone={tone}>{frontlineSquad.length} {t("adventure.units")}</ScreenBadge>
                  </div>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar md:flex-wrap md:gap-3 md:overflow-visible md:pb-0">
                    {frontlineSquad.map((enemy, index) => {
                      const visual = getFrontlineHeroVisualAsset(enemy.heroId);
                      return (
                        <EnemyPortraitCard
                          key={`${enemy.heroId}-${index}`}
                          name={enemy.name}
                          portrait={visual.standeeSrc ?? visual.portraitFallbackSrc}
                          tier={enemy.tier}
                          role={enemy.role}
                          factionTone={enemy.role.toLowerCase().includes("troll") || enemy.role.toLowerCase().includes("venom") ? "wild" : enemy.role.toLowerCase().includes("chanter") ? "arcane" : "shadow"}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/8 bg-[linear-gradient(180deg,rgba(9,12,18,0.34),rgba(7,9,14,0.82))] px-4 py-4 md:px-5 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.2)]">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#f5d498]">{t("adventure.encounterPulse")}</div>
              <div className="mt-2 text-[1.05rem] font-black leading-tight text-white">{atmosphere.kicker}</div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,24,0.52),rgba(7,9,14,0.96))] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/48">{t("adventure.routeState")}</div>
              <div className="mt-2 text-sm font-black leading-6 text-white">
                {node.pausedHere
                  ? t("adventure.routePaused")
                  : node.locked
                    ? t("adventure.routeLocked")
                    : node.cleared
                      ? t("adventure.routeCleared")
                      : t("adventure.routeOpen")}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MissionPressureStat label={t("adventure.nodeType")} value={nodeRole === "boss" ? t("adventure.boss") : nodeRole === "elite" ? t("adventure.elite") : t("adventure.battle")} />
                <MissionPressureStat label={t("adventure.routePace")} value={node.locked ? t("adventure.sealed") : node.cleared ? t("adventure.secured") : t("adventure.open")} />
              </div>
            </div>

            <div className="hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,22,33,0.72),rgba(8,10,16,0.96))] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/48">{t("adventure.rewardOutlook")}</div>
              <div className="mt-2 text-sm font-black text-white">
                {node.firstClearAvailable ? t("adventure.reward.firstClearReady") : node.lvl.rewards.gems ? t("adventure.reward.premiumRoute") : t("adventure.reward.steadyFront")}
              </div>
              <div className="mt-2 text-[12px] leading-6 text-white/64">
                {node.lvl.rewards.gems
                  ? t("adventure.reward.gemsDetail")
                  : node.lvl.rewards.dust
                    ? t("adventure.reward.dustDetail")
                    : t("adventure.reward.goldDetail")}
              </div>
            </div>

            <SceneButton onClick={onOpenBattle} disabled={node.locked} className="hidden">
              {node.pausedHere ? t("adventure.resumeMission") : node.locked ? t("adventure.lockedCta") : t("adventure.openBattleGate")}
            </SceneButton>
          </div>
        </div>
      </div>
    </ScreenPanel>
  );
}

function CampaignHeader({
  meta,
  progress,
  nodes,
}: {
  meta: AdventureCampaignMeta;
  progress: number;
  nodes: AdventureNodeState[];
}) {
  const { t } = useI18n();
  const cleared = nodes.filter((node) => node.cleared).length;

  return (
    <div className="pointer-events-none absolute inset-x-4 top-[4.7rem] z-20 flex flex-wrap items-start justify-between gap-3 md:inset-x-6 md:top-[4.9rem]">
      <div className="max-w-[31rem] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,18,30,0.44),rgba(8,10,16,0.82))] px-4 py-3 shadow-[0_20px_44px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
        <div className="text-[10px] uppercase tracking-[0.22em] text-[#f5d498]">{meta.subtitle}</div>
        <div className="mt-1 text-xl font-black text-white md:text-[1.8rem]">{meta.name}</div>
        <div className="mt-2 max-w-[29rem] text-[12px] leading-6 text-white/66">{meta.hint}</div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,16,26,0.42),rgba(8,10,16,0.88))] px-4 py-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/46">{t("adventure.campaignPressure")}</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2.5 w-28 overflow-hidden rounded-full bg-white/10 md:w-36">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#ffe5a3_0%,#f5c451_46%,#ff8f4a_100%)] shadow-[0_0_18px_rgba(245,196,81,0.34)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm font-black text-white">{cleared}/{nodes.length}</div>
        </div>
      </div>
    </div>
  );
}

function CampaignIntel({
  meta,
  cleared,
  total,
}: {
  meta: AdventureCampaignMeta;
  cleared: number;
  total: number;
}) {
  const { t } = useI18n();

  return (
    <div className="pointer-events-none absolute inset-x-4 top-[12.7rem] z-20 hidden items-center justify-between gap-3 md:inset-x-6 md:flex xl:top-[13.1rem]">
      <div className="inline-flex items-center gap-2 rounded-[999px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,22,0.46),rgba(7,10,16,0.88))] px-3 py-2 shadow-[0_16px_34px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <ScreenBadge tone="gold">{t("adventure.terrain")}</ScreenBadge>
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/74">{meta.terrainLabel}</span>
      </div>
      <div className="inline-flex items-center gap-2 rounded-[999px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,22,0.46),rgba(7,10,16,0.88))] px-3 py-2 shadow-[0_16px_34px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <ScreenBadge tone="sky">{t("adventure.front")}</ScreenBadge>
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/74">{meta.threatLabel}</span>
        <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/76">
          {cleared}/{total}
        </span>
      </div>
    </div>
  );
}

function AdventureTerrain({ meta }: { meta: AdventureCampaignMeta }) {
  const moon = meta.scene === "adventureMoon";

  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0)_28%,rgba(8,10,16,0.08)_60%,rgba(8,10,16,0.34)_100%)]" />
      <div
        className={cn(
          "absolute inset-x-[-4%] bottom-[3%] h-[64%] rounded-[45%] opacity-90 blur-[0.2px]",
          moon
            ? "bg-[radial-gradient(ellipse_at_20%_66%,rgba(63,86,119,0.38),transparent_31%),radial-gradient(ellipse_at_58%_48%,rgba(55,76,98,0.3),transparent_34%),linear-gradient(180deg,rgba(26,42,62,0),rgba(21,34,48,0.46)_42%,rgba(10,16,24,0.88)_100%)]"
            : "bg-[radial-gradient(ellipse_at_20%_66%,rgba(114,71,37,0.34),transparent_31%),radial-gradient(ellipse_at_58%_48%,rgba(119,82,45,0.28),transparent_34%),linear-gradient(180deg,rgba(62,39,22,0),rgba(58,35,23,0.5)_42%,rgba(12,10,15,0.88)_100%)]",
        )}
      />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(115deg,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(25deg,rgba(0,0,0,0.12)_1px,transparent_1px)] [background-size:64px_38px,46px_58px]" />
      <div className={cn("absolute left-[9%] top-[14%] h-24 w-24 rounded-full blur-xl md:h-36 md:w-36", moon ? "bg-sky-200/24" : "bg-orange-200/24")} />
      <div className={cn("absolute right-[12%] top-[17%] h-28 w-28 rounded-full blur-2xl md:h-40 md:w-40", moon ? "bg-sky-300/16" : "bg-amber-300/18")} />
      <div className={cn("absolute left-[26%] top-[8%] h-20 w-40 rounded-full blur-3xl animate-[cloudDrift_22s_ease-in-out_infinite]", moon ? "bg-sky-200/10" : "bg-orange-100/10")} />
      <div className={cn("absolute right-[18%] top-[10%] h-24 w-44 rounded-full blur-3xl animate-[cloudDriftReverse_26s_ease-in-out_infinite]", moon ? "bg-sky-100/8" : "bg-orange-100/8")} />

      <div className="absolute inset-x-0 bottom-[35%] h-[34%] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0)_40%,rgba(8,10,16,0.12)_100%)]" />
      <MountainBand className="bottom-[32%] h-[24%] opacity-90" tone={moon ? "moonFar" : "ashFar"} />
      <MountainBand className="bottom-[21%] h-[29%]" tone={moon ? "moonNear" : "ashNear"} />
      <MountainBand className="bottom-[8%] h-[22%] opacity-90" tone={moon ? "moonFront" : "ashFront"} />

      <PathValley tone={moon ? "moon" : "ash"} />
      <TerrainScatter tone={moon ? "moon" : "ash"} />
      <AmbientFog className="bottom-[24%] left-[-12%] h-[14rem] w-[58%]" reverse={false} />
      <AmbientFog className="bottom-[17%] right-[-10%] h-[12rem] w-[54%]" reverse />

      <WorldSetPiece className="left-[9%] bottom-[25%] md:left-[11%]" kind={moon ? "camp" : "spire"} />
      <WorldSetPiece className="left-[19%] bottom-[31%] md:left-[20%]" kind={moon ? "watch" : "totem"} />
      <WorldSetPiece className="left-[31%] bottom-[16%] md:left-[30%]" kind={moon ? "altar" : "ruin"} />
      <WorldSetPiece className="left-[39%] bottom-[28%] md:left-[40%]" kind={moon ? "arch" : "forge"} />
      <WorldSetPiece className="left-[51%] bottom-[25%] md:left-[49%]" kind={moon ? "bridge" : "forge"} />
      <WorldSetPiece className="left-[61%] bottom-[15%] md:left-[60%]" kind={moon ? "tree" : "obelisk"} />
      <WorldSetPiece className="left-[74%] bottom-[20%] md:left-[73%]" kind={moon ? "gate" : "crater"} />
      <WorldSetPiece className="left-[81%] bottom-[29%] md:left-[81%]" kind={moon ? "ruin" : "watch"} />
      <WorldSetPiece className="left-[24%] bottom-[21%] md:left-[26%]" kind={moon ? "wagon" : "barricade"} />
      <WorldSetPiece className="left-[57%] bottom-[32%] md:left-[58%]" kind={moon ? "lantern" : "totem"} />
      <WorldSetPiece className="left-[87%] bottom-[18%] md:left-[87%]" kind={moon ? "camp" : "forge"} />
      <WorldSetPiece className="left-[13%] bottom-[41%] md:left-[14%]" kind={moon ? "lantern" : "crystal"} />
      <WorldSetPiece className="left-[28%] bottom-[39%] md:left-[30%]" kind={moon ? "wagon" : "barricade"} />
      <WorldSetPiece className="left-[47%] bottom-[37%] md:left-[49%]" kind={moon ? "lantern" : "crystal"} />
      <WorldSetPiece className="left-[69%] bottom-[38%] md:left-[70%]" kind={moon ? "wagon" : "totem"} />
      <WorldSetPiece className="left-[85%] bottom-[35%] md:left-[85%]" kind={moon ? "lantern" : "barricade"} />

      <ParticleCluster tone={moon ? "#c8e2ff" : "#ffc17f"} />
      <BirdSweep />
    </>
  );
}

function CampaignTrail({
  d,
  accent,
  className,
}: {
  d: string;
  accent: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={cn("pointer-events-none absolute inset-0 z-10 h-full w-full", className)}>
      <defs>
        <filter id="adventureRoadRoughness" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.55" />
        </filter>
      </defs>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="rgba(54,34,20,0.86)" strokeWidth="21" strokeLinecap="round" strokeLinejoin="round" filter="url(#adventureRoadRoughness)" />
      <path d={d} fill="none" stroke="rgba(134,88,47,0.78)" strokeWidth="16.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#adventureRoadRoughness)" />
      <path d={d} fill="none" stroke="rgba(203,151,82,0.68)" strokeWidth="11.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#adventureRoadRoughness)" />
      <path d={d} fill="none" stroke="rgba(255,224,162,0.22)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.9 7.5" />
      <path d={d} fill="none" stroke={accent} strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 15" />
    </svg>
  );
}

function PathRunes({
  layouts,
  accent,
}: {
  layouts: AdventureNodeLayout[];
  accent: string;
}) {
  const desktopMarkers = buildTrailMarkers(layouts, "desktop");
  const mobileMarkers = buildTrailMarkers(layouts, "mobile");

  return (
    <>
      {mobileMarkers.map((marker, index) => (
        <div key={`mobile-${index}`}>
          <div
            className="pointer-events-none absolute z-10 block md:hidden"
            style={{ left: marker.x, top: marker.y, transform: "translate(-50%, -50%)" }}
          >
            <RuneMarker accent={accent} variant={marker.variant} />
          </div>
        </div>
      ))}
      {desktopMarkers.map((marker, index) => (
        <div key={`desktop-${index}`}>
          <div
            className="pointer-events-none absolute z-10 hidden md:block"
            style={{ left: marker.x, top: marker.y, transform: "translate(-50%, -50%)" }}
          >
            <RuneMarker accent={accent} variant={marker.variant} />
          </div>
        </div>
      ))}
    </>
  );
}

function RuneMarker({
  accent,
  variant,
}: {
  accent: string;
  variant: "rune" | "torch" | "cache";
}) {
  return (
    <div className={cn("relative", variant === "torch" ? "h-7 w-5" : "h-5 w-6")}>
      <div className="absolute inset-[-0.35rem] rounded-full blur-md" style={{ background: `radial-gradient(circle,${accent}30,transparent 72%)` }} />
      {variant === "torch" ? (
        <>
          <div className="absolute bottom-0 left-1/2 h-5 w-[2px] -translate-x-1/2 rounded-full bg-[#4b2c18]" />
          <div
            className="absolute left-1/2 top-[8%] h-3 w-3 -translate-x-1/2 rounded-full animate-[sparkPulse_4.6s_ease-in-out_infinite]"
            style={{ background: `radial-gradient(circle,#fff2b5 0%,${accent} 48%,rgba(255,120,46,0.18) 100%)` }}
          />
        </>
      ) : variant === "cache" ? (
        <div className="absolute left-1/2 top-1/2 h-3 w-5 -translate-x-1/2 -translate-y-1/2 rounded-[4px] border border-[#ffe1a6]/24 bg-[linear-gradient(180deg,rgba(91,58,30,0.92),rgba(34,22,15,0.96))]" />
      ) : (
        <div className="absolute left-1/2 top-1/2 h-2.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-[#ffe1a6]/16 bg-[linear-gradient(180deg,rgba(157,114,64,0.72),rgba(52,35,20,0.96))]" />
      )}
    </div>
  );
}

function LandmarkAnchor({
  landmark,
  accent,
}: {
  landmark: AdventureLandmark;
  accent: string;
}) {
  const mobilePoint = projectPoint(landmark.mobileX, landmark.mobileY, "mobile");
  const desktopPoint = projectPoint(landmark.x, landmark.y, "desktop");

  return (
    <>
      <div
        className="pointer-events-none absolute z-20 block md:hidden"
        style={{ left: mobilePoint.left, top: mobilePoint.top, transform: "translate(-50%, -50%)" }}
      >
        <LandmarkPill landmark={landmark} accent={accent} />
      </div>
      <div
        className="pointer-events-none absolute z-20 hidden md:block"
        style={{ left: desktopPoint.left, top: desktopPoint.top, transform: "translate(-50%, -50%)" }}
      >
        <LandmarkPill landmark={landmark} accent={accent} />
      </div>
    </>
  );
}

function LandmarkPill({
  landmark,
  accent,
}: {
  landmark: AdventureLandmark;
  accent: string;
}) {
  const icon =
    landmark.kind === "camp"
      ? "fortress"
      : landmark.kind === "bridge"
        ? "adventure"
        : landmark.kind === "altar"
          ? "power"
          : landmark.kind === "gate"
            ? "battle"
            : landmark.kind === "spire"
              ? "events"
              : "rewards";

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-full h-8 w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0))]" />
      <div className="relative grid place-items-center">
        <div className="absolute inset-0 rounded-full blur-lg" style={{ background: `radial-gradient(circle,${accent}2e,transparent 72%)` }} />
        <div className="relative grid h-9 w-9 place-items-center rounded-[16px] border border-white/12 bg-[linear-gradient(180deg,rgba(10,13,22,0.62),rgba(7,10,16,0.94))] shadow-[0_14px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl md:h-10 md:w-10">
          <SceneMedallion icon={icon} tone={landmark.kind === "gate" ? "ember" : "sky"} className="h-8 w-8 rounded-[12px] border-0 p-1.5 shadow-none" />
        </div>
        <div className="mt-2 hidden rounded-[999px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,22,0.54),rgba(7,10,16,0.9))] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/76 shadow-[0_14px_30px_rgba(0,0,0,0.22)] md:block">
          {landmark.label}
        </div>
      </div>
    </div>
  );
}

function AdventureNodeAnchor({
  node,
  layout,
  accent,
  active,
  onSelect,
  totalNodes,
}: {
  node: AdventureNodeState;
  layout: AdventureNodeLayout;
  accent: string;
  active: boolean;
  onSelect: (id: string) => void;
  totalNodes: number;
}) {
  const mobilePoint = projectPoint(layout.mobileX, layout.mobileY, "mobile");
  const desktopPoint = projectPoint(layout.x, layout.y, "desktop");

  return (
    <>
      <NodeButton
        node={node}
        accent={accent}
        active={active}
        totalNodes={totalNodes}
        onSelect={onSelect}
        style={{ left: mobilePoint.left, top: mobilePoint.top, transform: "translate(-50%, -50%)" }}
        className="md:hidden"
      />
      <NodeButton
        node={node}
        accent={accent}
        active={active}
        totalNodes={totalNodes}
        onSelect={onSelect}
        style={{ left: desktopPoint.left, top: desktopPoint.top, transform: "translate(-50%, -50%)" }}
        className="hidden md:block"
      />
    </>
  );
}

function NodeButton({
  node,
  accent,
  active,
  totalNodes,
  onSelect,
  style,
  className,
}: {
  node: AdventureNodeState;
  accent: string;
  active: boolean;
  totalNodes: number;
  onSelect: (id: string) => void;
  style: CSSProperties;
  className?: string;
}) {
  const { t } = useI18n();
  const role = getNodeRole(node, node.lvl.index, totalNodes);
  const tone = node.locked ? "#7b889e" : node.cleared ? "#64e3b1" : role === "boss" ? "#ff9a5c" : accent;
  const label = node.pausedHere
    ? t("adventure.node.resume")
    : node.locked
      ? t("adventure.node.sealed")
      : role === "boss"
        ? t("adventure.node.boss")
        : role === "elite"
          ? t("adventure.node.elite")
          : node.cleared
            ? t("adventure.node.cleared")
            : t("adventure.node.battle");
  const icon = role === "boss" ? "battle" : role === "elite" ? "power" : node.locked ? "shield" : "adventure";
  const shortName = compactNodeName(node.lvl.name);
  const rewardHint = node.lvl.rewards.gems ? "gem" : node.firstClearAvailable ? "cache" : node.lvl.rewards.dust ? "dust" : "gold";
  const rewardTone =
    rewardHint === "gem"
      ? "bg-sky-300/88"
      : rewardHint === "cache"
        ? "bg-emerald-300/88"
        : rewardHint === "dust"
          ? "bg-violet-300/88"
          : "bg-amber-300/88";

  return (
    <button
      onClick={() => onSelect(node.lvl.id)}
      className={cn("absolute z-[14] h-[5.25rem] w-[5.1rem] transition-transform duration-200 hover:scale-[1.06] md:h-[6rem] md:w-[5.85rem]", className)}
      style={style}
    >
      {active ? (
        <>
          <span
            className="absolute left-1/2 top-[42%] h-[5rem] w-[5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border animate-[pulseRing_2.2s_ease-out_infinite] md:h-[5.9rem] md:w-[5.9rem]"
            style={{ borderColor: `${tone}55` }}
          />
          <span
            className="absolute left-1/2 top-[42%] h-[4.7rem] w-[4.7rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: `radial-gradient(circle,${tone}38,transparent 68%)` }}
          />
        </>
      ) : null}

      <div
        className="absolute left-1/2 top-[41%] h-[4.15rem] w-[3.9rem] -translate-x-1/2 -translate-y-1/2 border shadow-[0_18px_36px_rgba(0,0,0,0.34)] md:h-[4.75rem] md:w-[4.45rem]"
        style={{
          borderColor: `${tone}d0`,
          clipPath: "polygon(50% 0%,86% 12%,100% 45%,83% 82%,50% 100%,17% 82%,0% 45%,14% 12%)",
          background: node.locked
            ? "linear-gradient(180deg,rgba(25,28,39,0.92),rgba(8,10,16,0.98))"
            : node.cleared
              ? "linear-gradient(180deg,rgba(38,102,74,0.94),rgba(7,20,16,0.98))"
              : role === "boss"
                ? "linear-gradient(180deg,rgba(93,42,26,0.96),rgba(12,9,12,0.98))"
                : "linear-gradient(180deg,rgba(46,34,18,0.96),rgba(8,10,16,0.98))",
        }}
      />
      <div
        className="absolute left-1/2 top-[40%] h-[3.25rem] w-[3rem] -translate-x-1/2 -translate-y-1/2 border border-white/14 opacity-80 md:h-[3.7rem] md:w-[3.45rem]"
        style={{
          clipPath: "polygon(50% 0%,86% 15%,96% 48%,78% 78%,50% 94%,22% 78%,4% 48%,14% 15%)",
          background: `radial-gradient(circle at 50% 35%,rgba(255,255,255,0.18),transparent 30%),linear-gradient(180deg,${tone}33,rgba(6,8,13,0.58))`,
        }}
      />
      <div
        className="absolute left-1/2 top-[42%] h-[5rem] w-[5rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl md:h-[5.5rem] md:w-[5.5rem]"
        style={{ background: `radial-gradient(circle,${tone}2f,transparent 70%)` }}
      />
      <div
        className="absolute left-1/2 top-[72%] h-4 w-[4.2rem] -translate-x-1/2 rounded-[999px] blur-md md:w-[4.9rem]"
        style={{ background: `radial-gradient(circle,rgba(0,0,0,0.72),rgba(0,0,0,0))` }}
      />
      <div
        className="absolute left-1/2 top-[62%] h-[0.82rem] w-[3.35rem] -translate-x-1/2 rounded-[999px] border border-white/10 shadow-[0_6px_12px_rgba(0,0,0,0.18)] md:w-[3.85rem]"
        style={{
          background: node.locked
            ? "linear-gradient(180deg,rgba(88,96,112,0.88),rgba(36,40,50,0.98))"
            : node.cleared
              ? "linear-gradient(180deg,rgba(105,227,176,0.82),rgba(24,82,58,0.98))"
              : role === "boss"
                ? "linear-gradient(180deg,rgba(255,162,102,0.86),rgba(102,44,24,0.98))"
                : `linear-gradient(180deg,${tone}d0,rgba(60,38,15,0.98))`,
        }}
      />

      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
        <SceneMedallion
          icon={icon}
          tone={role === "boss" ? "ember" : node.cleared ? "emerald" : node.locked ? "violet" : "gold"}
          className="h-10 w-10 rounded-[15px] border-0 bg-transparent p-0 shadow-none md:h-11 md:w-11"
        />
      </div>

      <div
        className="absolute right-[-2%] top-[5%] rounded-full border border-black/24 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.34)]"
        style={{
          background:
            role === "boss"
              ? "linear-gradient(180deg,rgba(255,148,92,0.94),rgba(91,34,20,0.96))"
              : node.cleared
                ? "linear-gradient(180deg,rgba(112,248,178,0.88),rgba(20,74,52,0.96))"
                : node.locked
                  ? "linear-gradient(180deg,rgba(123,136,158,0.9),rgba(39,44,57,0.96))"
                  : "linear-gradient(180deg,rgba(255,230,161,0.9),rgba(118,79,18,0.96))",
        }}
      >
        {node.cleared ? "OK" : role === "boss" ? "BOSS" : role === "elite" ? "EL" : node.lvl.index}
      </div>

      <div className={cn("absolute left-[3%] top-[17%] h-3 w-3 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.18)]", rewardTone)} />

      {active ? (
        <div className="absolute left-1/2 top-[94%] min-w-[6.4rem] -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-[#f5d498]/16 bg-[linear-gradient(180deg,rgba(45,30,15,0.82),rgba(7,9,14,0.97))] px-2.5 py-1.5 shadow-[0_14px_24px_rgba(0,0,0,0.24)]">
          <div className="text-[7px] font-black uppercase tracking-[0.2em] text-[#f5d498]/86 md:text-[8px]">{label}</div>
          <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white md:text-[9px]">{shortName}</div>
        </div>
      ) : null}
    </button>
  );
}

function MissionFact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: "fortress" | "battle" | "power" | "rewards";
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,24,0.38),rgba(8,10,16,0.88))] px-3 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.18)]">
      <div className="flex items-center gap-3">
        <SceneMedallion icon={icon} className="h-10 w-10 rounded-[14px] shadow-[0_10px_18px_rgba(0,0,0,0.22)]" />
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/42">{label}</div>
          <div className="mt-1 text-sm font-black leading-5 text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function MissionPressureStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-3 py-2">
      <div className="text-[8px] uppercase tracking-[0.18em] text-white/42">{label}</div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
    </div>
  );
}

function RewardChip({
  icon,
  label,
  value,
  tone,
  compact = false,
}: {
  icon: "gold" | "gem" | "dust" | "rewards";
  label: string;
  value: string;
  tone: "gold" | "sky" | "violet" | "emerald";
  compact?: boolean;
}) {
  return (
    <GameRewardToken
      icon={icon}
      tone={tone}
      label={label}
      value={value}
      size={compact ? "sm" : "md"}
      featured={icon === "gold" || icon === "gem" || icon === "dust"}
    />
  );
}

function EnemyPortraitCard({
  name,
  portrait,
  tier,
  role,
  factionTone,
}: {
  name: string;
  portrait: string | null;
  tier: number;
  role: string;
  factionTone: "order" | "shadow" | "wild" | "arcane";
}) {
  const tone =
    factionTone === "order"
      ? "from-sky-200/42 via-sky-500/28 to-slate-900"
      : factionTone === "shadow"
        ? "from-fuchsia-200/42 via-violet-500/28 to-slate-950"
        : factionTone === "wild"
          ? "from-emerald-200/38 via-emerald-500/28 to-slate-950"
          : "from-cyan-100/38 via-indigo-500/28 to-slate-950";

  return (
    <div className="w-[5.9rem] overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,24,0.52),rgba(7,9,14,0.96))] shadow-[0_16px_32px_rgba(0,0,0,0.22)] md:w-[6.25rem]">
      <div className={cn("relative h-[4.6rem] bg-gradient-to-b md:h-20", tone)}>
        <ArtPortrait
          src={portrait}
          alt={name}
          className="h-full w-full"
          imgClassName="object-contain object-bottom"
          fallback={<span className="text-lg font-black text-white">{name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>}
        />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(6,8,14,0.84))]" />
        <div className="absolute right-2 top-2 rounded-full border border-black/18 bg-black/42 px-1.5 py-0.5 text-[9px] font-black text-white">
          T{tier}
        </div>
      </div>
      <div className="px-2.5 py-2">
        <div className="truncate text-[11px] font-black text-white">{name}</div>
        <div className="mt-1 truncate text-[10px] uppercase tracking-[0.16em] text-[#f5d498]">{role}</div>
      </div>
    </div>
  );
}

function MountainBand({
  className,
  tone,
}: {
  className?: string;
  tone: "moonFar" | "moonNear" | "moonFront" | "ashFar" | "ashNear" | "ashFront";
}) {
  const fill =
    tone === "moonFar"
      ? "linear-gradient(180deg,#263963 0%,#14253f 54%,#0b1422 100%)"
      : tone === "moonNear"
        ? "linear-gradient(180deg,#31456d 0%,#192942 52%,#09111d 100%)"
        : tone === "moonFront"
          ? "linear-gradient(180deg,#223650 0%,#121f32 48%,#081019 100%)"
          : tone === "ashFar"
            ? "linear-gradient(180deg,#704a38 0%,#382324 54%,#110e18 100%)"
            : tone === "ashNear"
              ? "linear-gradient(180deg,#86553d 0%,#442624 52%,#110d17 100%)"
              : "linear-gradient(180deg,#55322d 0%,#2a1719 50%,#0b0912 100%)";

  const points =
    tone === "moonFar" || tone === "ashFar"
      ? "0,100 8,56 17,64 28,34 38,44 48,24 58,38 69,20 78,42 88,28 100,38 100,100"
      : tone === "moonNear" || tone === "ashNear"
        ? "0,100 10,62 18,48 28,58 36,38 46,48 56,24 66,40 74,28 84,46 92,32 100,44 100,100"
        : "0,100 8,78 18,60 28,70 38,52 50,60 60,42 71,57 82,44 92,58 100,54 100,100";

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("absolute left-[-8%] right-[-8%]", className)}>
      <polygon points={points} fill={fill} />
    </svg>
  );
}

function PathValley({ tone }: { tone: "moon" | "ash" }) {
  return (
    <>
      <div
        className={cn(
          "absolute bottom-[9%] left-[11%] h-[28%] w-[78%] rotate-[-8deg] rounded-[999px] blur-2xl",
          tone === "moon" ? "bg-sky-300/12" : "bg-orange-300/12",
        )}
      />
      <div
        className={cn(
          "absolute bottom-[10.5%] left-[13%] h-[13%] w-[74%] rotate-[-8deg] rounded-[999px] border border-white/8",
          tone === "moon"
            ? "bg-[linear-gradient(90deg,rgba(35,49,78,0.38),rgba(80,116,170,0.4),rgba(29,42,60,0.32))]"
            : "bg-[linear-gradient(90deg,rgba(75,47,28,0.42),rgba(149,92,56,0.4),rgba(39,25,18,0.34))]",
        )}
      />
      <div
        className={cn(
          "absolute bottom-[11.8%] left-[16%] h-[8.4%] w-[68%] rotate-[-8deg] rounded-[999px] border border-white/10",
          tone === "moon"
            ? "bg-[linear-gradient(90deg,rgba(220,244,255,0.06),rgba(171,216,255,0.16),rgba(220,244,255,0.06))]"
            : "bg-[linear-gradient(90deg,rgba(255,221,188,0.06),rgba(255,184,128,0.18),rgba(255,221,188,0.06))]",
        )}
      />
      <div
        className={cn(
          "absolute bottom-[13.2%] left-[19%] h-[2.4%] w-[60%] rotate-[-8deg] rounded-[999px] blur-sm",
          tone === "moon" ? "bg-sky-200/30" : "bg-orange-200/28",
        )}
      />
      <div
        className={cn(
          "absolute bottom-[11.9%] left-[20%] h-[1.6%] w-[49%] rotate-[-8deg] rounded-[999px] animate-[waterShimmer_7s_ease-in-out_infinite]",
          tone === "moon" ? "bg-sky-100/24" : "bg-orange-100/18",
        )}
      />
    </>
  );
}

function TerrainScatter({ tone }: { tone: "moon" | "ash" }) {
  const props =
    tone === "moon"
      ? [
          { left: "11%", top: "64%", w: 16, h: 6, kind: "rock" },
          { left: "22%", top: "56%", w: 20, h: 7, kind: "bush" },
          { left: "34%", top: "66%", w: 22, h: 8, kind: "rock" },
          { left: "48%", top: "60%", w: 18, h: 6, kind: "torch" },
          { left: "59%", top: "68%", w: 24, h: 8, kind: "rock" },
          { left: "69%", top: "58%", w: 20, h: 7, kind: "bush" },
          { left: "82%", top: "63%", w: 16, h: 6, kind: "rock" },
        ]
      : [
          { left: "14%", top: "63%", w: 18, h: 6, kind: "rock" },
          { left: "26%", top: "55%", w: 20, h: 7, kind: "torch" },
          { left: "39%", top: "67%", w: 22, h: 8, kind: "rock" },
          { left: "52%", top: "58%", w: 20, h: 7, kind: "ember" },
          { left: "65%", top: "68%", w: 24, h: 8, kind: "rock" },
          { left: "74%", top: "54%", w: 22, h: 7, kind: "torch" },
          { left: "86%", top: "61%", w: 16, h: 6, kind: "rock" },
        ];

  return (
    <>
      {props.map((item, index) => (
        <div
          key={`${item.kind}-${index}`}
          className="pointer-events-none absolute z-[2]"
          style={{ left: item.left, top: item.top, width: item.w, height: item.h, transform: "translate(-50%, -50%)" }}
        >
          {item.kind === "rock" ? (
            <div className="h-full w-full rounded-[999px] border border-white/6 bg-[linear-gradient(180deg,rgba(84,90,112,0.36),rgba(10,12,17,0.92))]" />
          ) : item.kind === "bush" ? (
            <div className="h-full w-full rounded-[999px] bg-[radial-gradient(circle_at_40%_40%,rgba(183,229,255,0.18),rgba(31,55,67,0.92)_72%)]" />
          ) : item.kind === "ember" ? (
            <div className="relative h-full w-full">
              <div className="absolute inset-0 rounded-[999px] bg-[linear-gradient(180deg,rgba(83,47,30,0.56),rgba(15,11,14,0.96))]" />
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/30 blur-sm animate-[sparkPulse_4.6s_ease-in-out_infinite]" />
            </div>
          ) : (
            <div className="relative h-full w-full">
              <div className="absolute left-1/2 bottom-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-white/18" />
              <div className={cn("absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full blur-[1px] animate-[sparkPulse_4.8s_ease-in-out_infinite]", tone === "moon" ? "bg-sky-100/60" : "bg-orange-200/70")} />
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function AmbientFog({
  className,
  reverse,
}: {
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute rounded-[50%] bg-white/6 blur-3xl",
        reverse ? "animate-[fogDriftReverse_14s_ease-in-out_infinite]" : "animate-[fogDrift_16s_ease-in-out_infinite]",
        className,
      )}
    />
  );
}

function WorldSetPiece({
  className,
  kind,
}: {
  className?: string;
  kind: "camp" | "altar" | "bridge" | "gate" | "spire" | "ruin" | "forge" | "crater" | "watch" | "tree" | "arch" | "obelisk" | "totem" | "wagon" | "lantern" | "barricade" | "crystal";
}) {
  if (kind === "camp") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-24 w-24">
          <div className="absolute bottom-0 left-2 right-2 h-10 rounded-[16px] bg-[linear-gradient(180deg,rgba(16,21,30,0.74),rgba(8,10,16,0.96))]" />
          <div className="absolute left-0 right-0 top-1 h-12 bg-[linear-gradient(180deg,#dfefff_0%,#78a8ff_44%,#27426d_100%)]" style={{ clipPath: "polygon(50% 0%,100% 48%,86% 100%,14% 100%,0 48%)" }} />
          <div className="absolute left-1/2 top-[30%] h-8 w-8 -translate-x-1/2 rounded-full bg-amber-200/26 blur-lg animate-[iconBreath_4.4s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }
  if (kind === "watch") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-24 w-20">
          <div className="absolute bottom-0 left-1/2 h-20 w-14 -translate-x-1/2 rounded-t-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(74,84,109,0.9),rgba(9,12,18,0.96))]" />
          <div className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-[14px] border border-white/8 bg-[linear-gradient(180deg,rgba(101,116,148,0.9),rgba(21,27,40,0.98))]" />
          <div className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-sky-100/30 blur-md animate-[sparkPulse_5.4s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }
  if (kind === "altar") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-20 w-20 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(37,49,83,0.84),rgba(10,14,22,0.98))]">
          <div className="absolute left-1/2 top-3 h-8 w-8 -translate-x-1/2 rotate-45 rounded-[10px] bg-sky-200/18 shadow-[0_0_22px_rgba(173,224,255,0.2)] animate-[sparkPulse_5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }
  if (kind === "bridge") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-16 w-32">
          <div className="absolute inset-x-0 top-6 h-6 rounded-[999px] border border-white/10 bg-[linear-gradient(180deg,rgba(82,63,43,0.88),rgba(20,15,14,0.98))]" />
          {[12, 32, 52, 72, 92, 112].map((left) => (
            <div key={left} className="absolute top-4 h-10 w-[3px] rounded-full bg-white/10" style={{ left }} />
          ))}
        </div>
      </div>
    );
  }
  if (kind === "gate") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-28 w-28 rounded-t-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(64,48,32,0.9),rgba(12,10,12,0.98))]">
          <div className="absolute inset-x-5 bottom-0 top-7 rounded-t-[16px] border border-white/10 bg-[#090b12]" />
          <div className="absolute left-1/2 top-4 h-8 w-8 -translate-x-1/2 rounded-full bg-orange-200/24 blur-lg animate-[iconBreath_4.8s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }
  if (kind === "spire") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-32 w-20">
          <div className="absolute bottom-0 left-1/2 h-full w-16 -translate-x-1/2 bg-[linear-gradient(180deg,#7b5c47_0%,#391f22_38%,#0d0b14_100%)]" style={{ clipPath: "polygon(46% 0%,58% 10%,100% 100%,0% 100%)" }} />
          <div className="absolute left-1/2 top-[26%] h-9 w-4 -translate-x-1/2 rounded-full bg-amber-200/22 blur-lg animate-[iconBreath_5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }
  if (kind === "tree") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-28 w-[5.5rem]">
          <div className="absolute bottom-0 left-1/2 h-16 w-[5px] -translate-x-1/2 rounded-full bg-[#2d1f14]" />
          <div className="absolute left-1/2 top-2 h-16 w-16 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle_at_45%_40%,rgba(170,216,255,0.26),rgba(40,72,88,0.9)_68%,rgba(15,24,30,0.98)_100%)]" />
          <div className="absolute left-[26%] top-7 h-8 w-8 rounded-[50%] bg-[radial-gradient(circle_at_40%_40%,rgba(210,236,255,0.18),rgba(32,62,77,0.92)_70%)]" />
          <div className="absolute right-[22%] top-8 h-7 w-7 rounded-[50%] bg-[radial-gradient(circle_at_40%_40%,rgba(210,236,255,0.18),rgba(32,62,77,0.92)_70%)]" />
        </div>
      </div>
    );
  }
  if (kind === "arch") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-20 w-28">
          <div className="absolute bottom-0 left-3 h-16 w-4 rounded-full bg-white/10" />
          <div className="absolute bottom-0 right-3 h-16 w-4 rounded-full bg-white/10" />
          <div className="absolute left-1/2 top-2 h-8 w-20 -translate-x-1/2 rounded-t-[999px] border border-white/8 border-b-0 bg-[linear-gradient(180deg,rgba(97,87,70,0.84),rgba(24,18,18,0.98))]" />
        </div>
      </div>
    );
  }
  if (kind === "forge") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-24 w-28 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(64,40,28,0.88),rgba(10,10,14,0.98))]">
          <div className="absolute left-1/2 top-[42%] h-10 w-10 -translate-x-1/2 rounded-full bg-orange-300/20 blur-xl animate-[sparkPulse_4.8s_ease-in-out_infinite]" />
          <div className="absolute inset-x-3 bottom-3 h-4 rounded-full bg-white/8" />
        </div>
      </div>
    );
  }
  if (kind === "obelisk") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-24 w-[4.5rem]">
          <div className="absolute bottom-0 left-1/2 h-24 w-12 -translate-x-1/2 bg-[linear-gradient(180deg,#4d2e2c_0%,#1c1218_52%,#0d0a12_100%)]" style={{ clipPath: "polygon(50% 0%,100% 100%,0% 100%)" }} />
          <div className="absolute left-1/2 top-[28%] h-4 w-4 -translate-x-1/2 rotate-45 rounded-[5px] bg-orange-200/18 shadow-[0_0_18px_rgba(255,167,98,0.24)] animate-[sparkPulse_5.6s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }
  if (kind === "totem") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-20 w-[4.5rem]">
          <div className="absolute bottom-0 left-1/2 h-20 w-6 -translate-x-1/2 rounded-full bg-[#2a1715]" />
          <div className="absolute left-1/2 top-3 h-10 w-10 -translate-x-1/2 rounded-[14px] border border-white/8 bg-[linear-gradient(180deg,rgba(107,67,49,0.92),rgba(25,15,16,0.98))]" />
          <div className="absolute left-1/2 top-6 h-4 w-4 -translate-x-1/2 rounded-full bg-orange-200/16 blur-sm" />
        </div>
      </div>
    );
  }
  if (kind === "wagon") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-16 w-24">
          <div className="absolute inset-x-3 bottom-4 h-7 rounded-[14px] border border-white/8 bg-[linear-gradient(180deg,rgba(88,66,45,0.92),rgba(24,18,18,0.98))]" />
          <div className="absolute left-6 bottom-0 h-5 w-5 rounded-full border border-white/8 bg-[linear-gradient(180deg,rgba(36,42,56,0.94),rgba(10,11,16,0.98))]" />
          <div className="absolute right-6 bottom-0 h-5 w-5 rounded-full border border-white/8 bg-[linear-gradient(180deg,rgba(36,42,56,0.94),rgba(10,11,16,0.98))]" />
          <div className="absolute left-7 top-0 h-7 w-[2px] rounded-full bg-white/12" />
          <div className="absolute right-7 top-0 h-7 w-[2px] rounded-full bg-white/12" />
        </div>
      </div>
    );
  }
  if (kind === "lantern") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-16 w-10">
          <div className="absolute left-1/2 top-0 h-6 w-[2px] -translate-x-1/2 rounded-full bg-white/16" />
          <div className="absolute left-1/2 top-5 h-8 w-6 -translate-x-1/2 rounded-[12px] border border-white/10 bg-[linear-gradient(180deg,rgba(70,82,104,0.92),rgba(14,16,24,0.98))]" />
          <div className="absolute left-1/2 top-7 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-200/28 blur-sm animate-[sparkPulse_4.8s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }
  if (kind === "barricade") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-16 w-24">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="absolute bottom-0 h-14 w-[7px] rounded-full bg-[linear-gradient(180deg,rgba(91,56,39,0.94),rgba(21,14,16,0.98))]"
              style={{ left: `${20 + index * 15}px`, transform: "rotate(18deg)" }}
            />
          ))}
          <div className="absolute inset-x-2 bottom-4 h-[3px] rounded-full bg-white/10" />
        </div>
      </div>
    );
  }
  if (kind === "crystal") {
    return (
      <div className={cn("absolute", className)}>
        <div className="relative h-20 w-20">
          <div className="absolute left-1/2 top-3 h-12 w-9 -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,191,135,0.72),rgba(120,54,40,0.18))] blur-sm" style={{ clipPath: "polygon(50% 0%,100% 36%,72% 100%,28% 100%,0% 36%)" }} />
          <div className="absolute left-[22%] top-8 h-7 w-5 bg-[linear-gradient(180deg,rgba(255,191,135,0.48),rgba(120,54,40,0.16))] blur-sm" style={{ clipPath: "polygon(50% 0%,100% 36%,72% 100%,28% 100%,0% 36%)" }} />
          <div className="absolute right-[22%] top-10 h-6 w-4 bg-[linear-gradient(180deg,rgba(255,191,135,0.48),rgba(120,54,40,0.16))] blur-sm" style={{ clipPath: "polygon(50% 0%,100% 36%,72% 100%,28% 100%,0% 36%)" }} />
        </div>
      </div>
    );
  }
  if (kind === "crater") {
    return (
      <div className={cn("absolute", className)}>
        <div className="h-20 w-28 rounded-[50%] border border-white/8 bg-[radial-gradient(circle_at_50%_44%,rgba(255,167,98,0.22),rgba(61,28,17,0.42)_40%,rgba(10,10,14,0.92)_100%)]" />
      </div>
    );
  }
  return (
    <div className={cn("absolute", className)}>
      <div className="relative h-20 w-24">
        <div className="absolute bottom-0 left-1/2 h-16 w-20 -translate-x-1/2 rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(61,74,109,0.82),rgba(10,14,22,0.96))]" />
        <div className="absolute left-1/2 top-2 h-7 w-7 -translate-x-1/2 rotate-45 rounded-[9px] bg-white/10" />
      </div>
    </div>
  );
}

function ParticleCluster({ tone }: { tone: string }) {
  return (
    <>
      {[
        { left: "15%", top: "28%", size: 4, delay: 0 },
        { left: "26%", top: "20%", size: 5, delay: 2.2 },
        { left: "42%", top: "30%", size: 3, delay: 1.1 },
        { left: "58%", top: "22%", size: 4, delay: 3.1 },
        { left: "72%", top: "31%", size: 5, delay: 0.6 },
        { left: "84%", top: "24%", size: 3, delay: 2.7 },
      ].map((item, index) => (
        <span
          key={index}
          className="absolute rounded-full blur-[1px] animate-[particleFloat_18s_ease-in-out_infinite]"
          style={{
            left: item.left,
            top: item.top,
            width: item.size,
            height: item.size,
            background: tone,
            opacity: 0.72,
            animationDelay: `-${item.delay}s`,
          }}
        />
      ))}
    </>
  );
}

function BirdSweep() {
  return (
    <>
      {[
        { left: "18%", top: "18%", delay: 0, scale: 1 },
        { left: "22%", top: "21%", delay: 0.7, scale: 0.78 },
        { left: "76%", top: "17%", delay: 1.4, scale: 0.86 },
      ].map((bird, index) => (
        <div
          key={index}
          className="absolute text-white/18 animate-[birdDrift_9s_ease-in-out_infinite]"
          style={{ left: bird.left, top: bird.top, transform: `scale(${bird.scale})`, animationDelay: `-${bird.delay}s` }}
        >
          <svg width="34" height="14" viewBox="0 0 34 14" fill="none">
            <path d="M1 11C4.5 7.6 7.7 6.4 10.5 7.1C13.2 7.8 15.4 9.4 16.8 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M16.8 11C19.6 7.6 22.6 6.1 25.4 6.7C28.2 7.3 30.5 8.6 33 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      ))}
    </>
  );
}

function buildRewardChips(level: AdventureLevel, firstClearAvailable: boolean, t: TranslateFn) {
  const chips: { icon: "gold" | "gem" | "dust" | "rewards"; label: string; value: string; tone: "gold" | "sky" | "violet" | "emerald" }[] = [];
  if (level.rewards.gold) chips.push({ icon: "gold", label: t("adventure.reward.gold"), value: `${level.rewards.gold}`, tone: "gold" });
  if (level.rewards.dust) chips.push({ icon: "dust", label: t("adventure.reward.dust"), value: `${level.rewards.dust}`, tone: "violet" });
  if (level.rewards.gems) chips.push({ icon: "gem", label: t("adventure.reward.gems"), value: `${level.rewards.gems}`, tone: "sky" });
  if (firstClearAvailable && level.firstClearRewards) chips.push({ icon: "rewards", label: t("adventure.reward.firstClear"), value: t("adventure.reward.bonusCache"), tone: "emerald" });
  for (const unlock of firstClearAvailable ? level.firstClearRewards?.frontlineCards ?? [] : []) {
    const card = FRONTLINE_CARD_BY_ID[unlock.cardId];
    if (!card) continue;
    chips.push({ icon: "rewards", label: t("frontline.cardUnlocks"), value: frontlineCardName(t, card), tone: "emerald" });
  }
  return chips;
}

function getNodeRole(node: AdventureNodeState, index: number, totalNodes: number) {
  if (node.pausedHere) return "resume";
  if (/boss/i.test(node.lvl.name) || index === totalNodes) return "boss";
  if ((node.lvl.obstacles?.length ?? 0) >= 2 || node.lvl.enemyTeam.some((enemy) => enemy.stars >= 2)) return "elite";
  return "battle";
}

function describeEncounter(
  meta: AdventureCampaignMeta,
  node: AdventureNodeState,
  role: ReturnType<typeof getNodeRole>,
  t: TranslateFn,
) {
  const hasHazards = Boolean(node.lvl.obstacles?.length);
  const roleKey = role === "boss" ? "boss" : role === "elite" ? "elite" : "battle";

  return {
    kicker: t(`adventure.encounter.${roleKey}.kicker`),
    blurb: t(`adventure.encounter.${roleKey}.${hasHazards ? "blurbHazards" : "blurbClean"}`, { chapter: meta.name.toLowerCase() }),
    secondary: t(`adventure.encounter.${roleKey}.secondary`),
    rewardTone:
      node.firstClearAvailable
        ? t("adventure.reward.firstClearTone")
        : node.lvl.rewards.gems
          ? t("adventure.reward.gemTone")
          : node.lvl.rewards.dust
            ? t("adventure.reward.dustTone")
            : t("adventure.reward.goldTone"),
  };
}

function compactNodeName(name: string) {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= 2) return words.join(" ");
  return `${words[0]} ${words[1]}`;
}

function buildTrailMarkers(layouts: AdventureNodeLayout[], mode: "desktop" | "mobile") {
  const points = layouts.map((layout) => {
    const point = projectPoint(mode === "desktop" ? layout.x : layout.mobileX, mode === "desktop" ? layout.y : layout.mobileY, mode);
    return { x: parseFloat(point.left), y: parseFloat(point.top) };
  });

  const markers: { x: string; y: string; variant: "rune" | "torch" | "cache" }[] = [];
  for (let index = 0; index < points.length - 1; index++) {
    if (index % 2 === 1 && index !== points.length - 2) continue;
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const offset = index % 2 === 0 ? 1.65 : -1.65;
    const normalX = (-dy / length) * offset;
    const normalY = (dx / length) * offset;
    markers.push({
      x: `${midX + normalX}%`,
      y: `${midY + normalY}%`,
      variant: index % 5 === 0 ? "cache" : index % 2 === 0 ? "torch" : "rune",
    });
  }
  return markers;
}

function buildSmoothPath(layouts: AdventureNodeLayout[], mode: "desktop" | "mobile") {
  const points = layouts.map((layout) => {
    const point = projectPoint(mode === "desktop" ? layout.x : layout.mobileX, mode === "desktop" ? layout.y : layout.mobileY, mode);
    return { x: parseFloat(point.left), y: parseFloat(point.top) };
  });
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x} ${points[0].y}`;

  const parts = [`M${points[0].x} ${points[0].y}`];
  for (let index = 0; index < points.length - 1; index++) {
    const current = points[index];
    const next = points[index + 1];
    const prev = points[index - 1] ?? current;
    const after = points[index + 2] ?? next;
    const tension = mode === "desktop" ? 4.8 : 4.2;
    const c1x = current.x + (next.x - prev.x) / tension;
    const c1y = current.y + (next.y - prev.y) / tension;
    const c2x = next.x - (after.x - current.x) / tension;
    const c2y = next.y - (after.y - current.y) / tension;
    parts.push(`C${c1x} ${c1y}, ${c2x} ${c2y}, ${next.x} ${next.y}`);
  }
  return parts.join(" ");
}

function projectPoint(x: string, y: string, mode: "desktop" | "mobile") {
  const stage = mode === "desktop" ? { left: 8, right: 8, top: 24, bottom: 14 } : { left: 8, right: 8, top: 28, bottom: 16 };
  const usableWidth = 100 - stage.left - stage.right;
  const usableHeight = 100 - stage.top - stage.bottom;
  const px = parseFloat(x);
  const py = parseFloat(y);
  return {
    left: `${stage.left + (px / 100) * usableWidth}%`,
    top: `${stage.top + (py / 100) * usableHeight}%`,
  };
}
