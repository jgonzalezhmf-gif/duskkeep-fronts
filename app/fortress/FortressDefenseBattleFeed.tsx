import type { FortressDefenseLogEntry } from "@/features/fortress-defense/engine";
import { cn } from "@/lib/cn";
import { parseAbsorbed } from "./fortressDefenseVisualEvents";
import type { TranslateFn } from "./fortressPageHelpers";

export function FortressDefenseBattleFeed({ entries, t }: { entries: FortressDefenseLogEntry[]; t: TranslateFn }) {
  const visible = entries.slice(-3).reverse();
  return (
    <aside className="absolute right-2 top-[3.75rem] z-20 hidden w-[min(15rem,calc(100%-1rem))] rounded-[18px] border border-white/10 bg-black/34 p-1.5 shadow-[0_18px_38px_rgba(0,0,0,0.26)] backdrop-blur-[2px] md:block lg:right-4 lg:top-3" aria-live="polite">
      <div className="mb-1 flex items-center justify-between gap-2 px-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/42">
        <span>{t("fortressScreen.defense.battleFeed")}</span>
        <span>{visible[0] ? t("fortressScreen.defense.turn", { value: visible[0].turn }) : ""}</span>
      </div>
      <div className="grid gap-1.5">
        {visible.map((entry, index) => (
          <div key={`${entry.turn}-${entry.title}-${index}`} className={cn("rounded-[12px] border px-2 py-1", logToneClass(entry.tone))}>
            <div className="flex items-center justify-between gap-2 text-[8px] font-black uppercase tracking-[0.12em] text-white/42">
              <span>{localizedLogTitle(entry, t)}</span>
              <span>{t(`fortressScreen.defense.logTones.${entry.tone}`)}</span>
            </div>
            <div className="mt-0.5 line-clamp-1 text-[9px] font-bold leading-3 text-white/68">{localizedLogDetail(entry, t)}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function logToneClass(tone: FortressDefenseLogEntry["tone"]) {
  if (tone === "ally") return "border-emerald-200/12 bg-emerald-300/8";
  if (tone === "enemy") return "border-rose-200/14 bg-rose-400/8";
  return "border-[#f5c451]/12 bg-[#f5c451]/8";
}

function localizedLogTitle(entry: FortressDefenseLogEntry, t: TranslateFn) {
  const key = LOG_TITLE_KEYS[entry.title];
  return key ? t(key) : entry.title;
}

function localizedLogDetail(entry: FortressDefenseLogEntry, t: TranslateFn) {
  if (entry.title === "Castle shot") {
    const match = entry.detail.match(/hits (.+) for (\d+)/);
    return t("fortressScreen.defense.logCompact.castleShot", { target: match?.[1] ?? t("fortressScreen.defense.enemies"), value: match?.[2] ?? "?" });
  }
  if (entry.title === "Blade rush") {
    const comboMatch = entry.detail.match(/rushes (.+?) for (\d+), then cuts (.+?) for (\d+)/);
    if (comboMatch) {
      return t("fortressScreen.defense.logCompact.bladeRushCombo", {
        target: comboMatch[1],
        value: comboMatch[2],
        secondTarget: comboMatch[3],
        secondValue: comboMatch[4],
      });
    }
    const followMatch = entry.detail.match(/rushes (.+?) for (\d+) and follows through for (\d+)/);
    if (followMatch) {
      return t("fortressScreen.defense.logCompact.bladeRushFollow", { target: followMatch[1], value: followMatch[2], secondValue: followMatch[3] });
    }
    const match = entry.detail.match(/rushes (.+?) for (\d+)/);
    return t("fortressScreen.defense.logCompact.bladeRush", { target: match?.[1] ?? t("fortressScreen.defense.enemies"), value: match?.[2] ?? "?" });
  }
  if (entry.title === "Bulwark") {
    const match = entry.detail.match(/raises (\d+).*shield/);
    return t("fortressScreen.defense.logCompact.bulwark", { value: match?.[1] ?? "?" });
  }
  if (entry.title === "Mend walls") {
    const match = entry.detail.match(/restore (\d+)/);
    return t("fortressScreen.defense.logCompact.mend", { value: match?.[1] ?? "?" });
  }
  if (entry.title === "Deploy guard") {
    const match = entry.detail.match(/to (\w+) range (\d+)/);
    return t("fortressScreen.defense.logCompact.deployGuard", { lane: match?.[1] ?? "?", range: match?.[2] ?? "?" });
  }
  if (entry.title === "Deploy archer") {
    const match = entry.detail.match(/to (\w+) range (\d+)/);
    return t("fortressScreen.defense.logCompact.deployArcher", { lane: match?.[1] ?? "?", range: match?.[2] ?? "?" });
  }
  if (entry.title === "Guard block") {
    const absorbMatch = entry.detail.match(/blocks (.+) and absorbs (\d+)/);
    if (absorbMatch) return t("fortressScreen.defense.logCompact.guardBlockAbsorb", { enemy: absorbMatch[1], value: absorbMatch[2] });
    const stopMatch = entry.detail.match(/blocks (.+) at range (\d+)/);
    return t("fortressScreen.defense.logCompact.guardBlock", { enemy: stopMatch?.[1] ?? t("fortressScreen.defense.enemies"), range: stopMatch?.[2] ?? "?" });
  }
  if (entry.title === "Guard strike") {
    const match = entry.detail.match(/(?:strikes|fires at) (.+) from (\w+) range (\d+) for (\d+)/);
    return t("fortressScreen.defense.logCompact.guardStrike", {
      enemy: match?.[1] ?? t("fortressScreen.defense.enemies"),
      lane: match?.[2] ?? "?",
      range: match?.[3] ?? "?",
      value: match?.[4] ?? "?",
    });
  }
  if (entry.title === "Guard down") {
    return t("fortressScreen.defense.logCompact.guardDown");
  }
  if (entry.title === "Shadow trap") {
    const match = entry.detail.match(/at (\w+) range (\d+)/);
    return t("fortressScreen.defense.logCompact.trapPlaced", { lane: match?.[1] ?? "?", range: match?.[2] ?? "?" });
  }
  if (entry.title === "Shadow trap sprung") {
    const match = entry.detail.match(/triggers on (.+) at \w+ range \d+ for (\d+)/);
    return t("fortressScreen.defense.logCompact.trapSprung", { enemy: match?.[1] ?? t("fortressScreen.defense.enemies"), value: match?.[2] ?? "?" });
  }
  if (entry.title === "Gate impact") {
    const total = Number(entry.detail.match(/deal (\d+)/)?.[1] ?? entry.detail.match(/(\d+) assault damage/)?.[1] ?? 0);
    const absorbed = parseAbsorbed(entry.detail);
    const damage = Number(entry.detail.match(/Castle takes (\d+)/)?.[1] ?? Math.max(0, total - absorbed));
    if (absorbed > 0) return t("fortressScreen.defense.logCompact.impactAbsorbed", { damage, absorbed });
    return t("fortressScreen.defense.logCompact.impact", { damage: total });
  }
  if (entry.title === "Enemy attack") {
    const match = entry.detail.match(/^(.+) attacks from range \d+ for (\d+)/);
    return t("fortressScreen.defense.logCompact.enemyAttack", { enemy: match?.[1] ?? t("fortressScreen.defense.enemies"), damage: match?.[2] ?? "?" });
  }
  if (entry.title === "Enemy advance") {
    const advanceMatch = entry.detail.match(/^(.+) advances to range (\d+)/);
    if (advanceMatch) return t("fortressScreen.defense.logCompact.advanceOne", { enemy: advanceMatch[1], range: advanceMatch[2] });
    const pinnedMatch = entry.detail.match(/^(.+) is pinned at range (\d+)/);
    if (pinnedMatch) return t("fortressScreen.defense.logCompact.pinned", { enemy: pinnedMatch[1], range: pinnedMatch[2] });
    const stunnedMatch = entry.detail.match(/^(.+) is stunned at range (\d+)/);
    if (stunnedMatch) return t("fortressScreen.defense.logCompact.stunned", { enemy: stunnedMatch[1], range: stunnedMatch[2] });
  }
  if (entry.title.startsWith("Wave ")) {
    const value = Number(entry.title.replace("Wave ", ""));
    return t("fortressScreen.defense.logCompact.wave", { value });
  }
  const key = LOG_DETAIL_KEYS[entry.title];
  return key ? t(key) : entry.detail;
}

const LOG_TITLE_KEYS: Record<string, string> = {
  "The horns sound": "fortressScreen.defense.log.horns",
  "Castle shot": "fortressScreen.defense.log.castleShot",
  "Deploy guard": "fortressScreen.defense.log.deployGuard",
  "Deploy archer": "fortressScreen.defense.log.deployArcher",
  "Blade rush": "fortressScreen.defense.log.bladeRush",
  Bulwark: "fortressScreen.defense.log.bulwark",
  "Arrow volley": "fortressScreen.defense.log.volley",
  "Arcane barrage": "fortressScreen.defense.log.arcane",
  "Shadow trap": "fortressScreen.defense.log.traps",
  "Shadow trap sprung": "fortressScreen.defense.log.trapSprung",
  "Mend walls": "fortressScreen.defense.log.mend",
  "War chant": "fortressScreen.defense.log.chant",
  "Gate impact": "fortressScreen.defense.log.impact",
  "Enemy attack": "fortressScreen.defense.log.enemyAttack",
  "Enemy advance": "fortressScreen.defense.log.advance",
  "Guard block": "fortressScreen.defense.log.guardBlock",
  "Guard strike": "fortressScreen.defense.log.guardStrike",
  "Guard down": "fortressScreen.defense.log.guardDown",
  "Raid broken": "fortressScreen.defense.log.broken",
  "Wave 2": "fortressScreen.defense.log.wave",
  "Wave 3": "fortressScreen.defense.log.wave",
};

const LOG_DETAIL_KEYS: Record<string, string> = {
  "The horns sound": "fortressScreen.defense.logCompact.horns",
  "Arrow volley": "fortressScreen.defense.logCompact.volley",
  "Arcane barrage": "fortressScreen.defense.logCompact.arcane",
  "Shadow trap": "fortressScreen.defense.logCompact.trapPlaced",
  "Shadow trap sprung": "fortressScreen.defense.logCompact.trapSprung",
  "War chant": "fortressScreen.defense.logCompact.chant",
  "Enemy advance": "fortressScreen.defense.logCompact.advance",
  "Raid broken": "fortressScreen.defense.logCompact.broken",
};
