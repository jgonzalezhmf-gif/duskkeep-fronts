"use client";

import { FortressIcon } from "@/components/game/shared/FortressIcon";
import { cn } from "@/lib/cn";
import { getHomeLandmarkAsset } from "@/lib/homeLandmarkAssets";
import type { FrontlineFortressBuildingId } from "@/lib/types";
import {
  BUILDING_META,
  buildingLabel,
  type TranslateFn,
} from "./fortressPageHelpers";

export function CastleStage({
  selectedBuilding,
  setSelectedBuilding,
  levels,
  integrity,
  raidReady,
  reportPulse,
  t,
}: {
  selectedBuilding: FrontlineFortressBuildingId;
  setSelectedBuilding: (building: FrontlineFortressBuildingId) => void;
  levels: Record<FrontlineFortressBuildingId, number>;
  integrity: number;
  raidReady: boolean;
  reportPulse: boolean;
  t: TranslateFn;
}) {
  return (
    <div className="relative z-[1] mt-3 h-[24rem] md:absolute md:inset-x-0 md:top-[9.5rem] md:mt-0 md:h-[25rem]">
      <div className="absolute left-1/2 top-[39%] h-[16rem] w-[64%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle_at_50%_44%,rgba(110,159,217,0.13),rgba(31,53,86,0.14)_42%,rgba(4,7,12,0.32)_78%,transparent_100%)]" />
      <div className="absolute bottom-[24%] left-[16%] right-[16%] h-[12%] rounded-[50%] border border-sky-200/8 bg-[radial-gradient(circle_at_50%_45%,rgba(71,162,218,0.18),rgba(22,58,99,0.16)_42%,rgba(2,7,12,0.38)_100%)] animate-[waterShimmer_12s_ease-in-out_infinite]" />

      <FortressSilhouette integrity={integrity} raidReady={raidReady} reportPulse={reportPulse} />

      <div className="absolute inset-x-[4%] bottom-20 grid grid-cols-[1fr_1.16fr_1fr] items-end gap-2 sm:inset-x-[8%] sm:gap-3 md:bottom-20 lg:inset-x-[12%]">
        {(["treasury", "keep", "barracks"] as FrontlineFortressBuildingId[]).map((buildingId) => (
          <BuildingNode
            key={buildingId}
            buildingId={buildingId}
            level={levels[buildingId]}
            selected={selectedBuilding === buildingId}
            emphasized={buildingId === "keep"}
            onClick={() => setSelectedBuilding(buildingId)}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

function BuildingNode({
  buildingId,
  level,
  selected,
  emphasized,
  onClick,
  t,
}: {
  buildingId: FrontlineFortressBuildingId;
  level: number;
  selected: boolean;
  emphasized: boolean;
  onClick: () => void;
  t: TranslateFn;
}) {
  const meta = BUILDING_META[buildingId];
  const label = buildingLabel(buildingId, t);
  return (
    <button
      className={cn(
        "frontline-motion-tab group relative isolate grid min-w-0 place-items-center overflow-hidden rounded-[22px] border px-2 py-2 text-center shadow-[0_16px_34px_rgba(0,0,0,0.24)] backdrop-blur-md transition duration-300",
        emphasized ? "min-h-[6.4rem] -translate-y-2 sm:min-h-[7rem]" : "min-h-[5.6rem] sm:min-h-[6.1rem]",
        selected
          ? "border-[#f5c451]/34 bg-[linear-gradient(180deg,rgba(245,196,81,0.16),rgba(12,10,8,0.72))]"
          : "border-white/12 bg-[linear-gradient(180deg,rgba(15,20,31,0.46),rgba(6,8,14,0.68))] hover:border-white/22",
      )}
      onClick={onClick}
    >
      <span className={cn("pointer-events-none absolute -inset-5 bg-[radial-gradient(circle_at_50%_30%,var(--tw-gradient-stops))] opacity-40 blur-2xl transition", selected ? meta.glow : "from-white/10 via-white/0 to-transparent")} />
      <FortressIcon
        name={meta.icon}
        size={emphasized ? "xl" : "lg"}
        className={cn("transition", selected ? "opacity-100 animate-[iconBreath_2.8s_ease-in-out_infinite]" : "opacity-88 group-hover:opacity-100")}
      />
      <span className="relative z-[1] mt-1 max-w-full truncate rounded-full border border-white/12 bg-black/56 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">
        {label} {t("fortressScreen.buildings.level", { level })}
      </span>
    </button>
  );
}

function FortressSilhouette({
  integrity,
  raidReady,
  reportPulse,
}: {
  integrity: number;
  raidReady: boolean;
  reportPulse: boolean;
}) {
  const fortressAsset = getHomeLandmarkAsset("fortress");

  return (
    <div className={cn("absolute left-1/2 top-[1%] h-[16.5rem] w-[30rem] max-w-[82%] -translate-x-1/2 transition", reportPulse && "animate-[fortressHit_0.7s_ease-in-out_1]")}>
      <div className="absolute bottom-[12%] left-[19%] right-[19%] h-[13%] rounded-[50%] bg-black/28 blur-lg" />
      {fortressAsset ? (
        <img
          src={fortressAsset.src}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_24px_26px_rgba(0,0,0,0.44)]"
        />
      ) : (
        <>
          <div className="absolute inset-x-[8%] bottom-[23%] h-[20%] rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(92,116,177,0.82),rgba(27,38,65,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.36)]" />
          <div className="absolute bottom-[39%] left-[19%] h-[31%] w-[16%] rounded-t-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(98,125,191,0.88),rgba(29,42,72,0.98))]" />
          <div className="absolute bottom-[34%] left-[42%] h-[47%] w-[17%] rounded-t-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(122,151,217,0.92),rgba(31,45,78,0.98))]" />
          <div className="absolute bottom-[39%] right-[19%] h-[31%] w-[16%] rounded-t-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(98,125,191,0.88),rgba(29,42,72,0.98))]" />
          <div className="absolute bottom-[28%] left-[45%] h-[24%] w-[10%] rounded-t-[20px] border border-amber-100/10 bg-[linear-gradient(180deg,rgba(76,48,28,0.92),rgba(22,15,13,0.98))]" />
        </>
      )}

      {[24, 50, 76].map((left, index) => (
        <span
          key={left}
          className="absolute h-6 w-2.5 -translate-x-1/2 rounded-full bg-amber-100/28 blur-sm animate-[iconBreath_4.6s_ease-in-out_infinite]"
          style={{ left: `${left}%`, top: `${36 + (index === 1 ? -5 : 2)}%`, animationDelay: `${index * 0.5}s` }}
        />
      ))}

      <div
        className={cn(
          "absolute left-1/2 top-[8%] h-[12.5rem] w-[12.5rem] -translate-x-1/2 rounded-full border blur-[1px] transition",
          raidReady
            ? "border-rose-300/18 bg-[radial-gradient(circle,rgba(244,63,94,0.16),transparent_66%)]"
            : "border-cyan-200/10 bg-[radial-gradient(circle,rgba(125,211,252,0.12),transparent_68%)]",
        )}
      />

      <div className="absolute bottom-[6%] left-[25%] right-[25%] h-2.5 overflow-hidden rounded-full bg-black/42">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            integrity >= 70
              ? "bg-[linear-gradient(90deg,#5fd092,#f5d498)]"
              : integrity >= 40
                ? "bg-[linear-gradient(90deg,#f0b25f,#ffe2a4)]"
                : "bg-[linear-gradient(90deg,#d95764,#ffab8a)]",
          )}
          style={{ width: `${Math.max(8, integrity)}%` }}
        />
      </div>
    </div>
  );
}
