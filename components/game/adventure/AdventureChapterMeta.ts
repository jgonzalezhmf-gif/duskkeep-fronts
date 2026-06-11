import type { AdventureCampaignMeta, TranslateFn } from "@/features/adventure/campaignTypes";

const CHAPTER_META: Record<number, AdventureCampaignMeta> = {
  1: {
    name: "The Eclipse Rising",
    subtitle: "Chapter I",
    accent: "#f5c451",
    scene: "adventureMoon",
    hint: "Climb through ruined ridge roads, moonlit shrines and fractured gates until the eclipse citadel opens.",
    atmosphere: "Moonlit campaign route with broken sanctuaries, ritual bridges and cold blue haze hanging over the ascent.",
    terrainLabel: "Moon ridges and shrine roads",
    threatLabel: "Cult patrols, ambush lanes and citadel defenders",
    landmarks: [
      { label: "Crossroads Camp", kind: "camp", x: "13%", y: "82%", mobileX: "13%", mobileY: "77%" },
      { label: "Lumen Altar", kind: "altar", x: "36%", y: "58%", mobileX: "31%", mobileY: "53%" },
      { label: "Broken Span", kind: "bridge", x: "53%", y: "47%", mobileX: "53%", mobileY: "44%" },
      { label: "Citadel Gate", kind: "gate", x: "70%", y: "22%", mobileX: "73%", mobileY: "22%" },
    ],
  },
  2: {
    name: "Ashes of the Pact",
    subtitle: "Chapter II",
    accent: "#ff9c5f",
    scene: "adventureAsh",
    hint: "Advance through scorched passes, kiln basins and siege furnaces toward the crown of ash.",
    atmosphere: "A volcanic route with obsidian spires, cinder winds, forge-light and collapsing bridges across a burning basin.",
    terrainLabel: "Scorched ravines and kiln basins",
    threatLabel: "Ash warbands, brute elites and spire wardens",
    landmarks: [
      { label: "Scorched Pass", kind: "spire", x: "13%", y: "80%", mobileX: "15%", mobileY: "74%" },
      { label: "Ember Kiln", kind: "ruin", x: "40%", y: "58%", mobileX: "37%", mobileY: "54%" },
      { label: "Forge Span", kind: "bridge", x: "59%", y: "43%", mobileX: "58%", mobileY: "39%" },
      { label: "Ash Crown", kind: "gate", x: "78%", y: "20%", mobileX: "79%", mobileY: "19%" },
    ],
  },
  3: {
    name: "Starlit Tower",
    subtitle: "Chapter III",
    accent: "#8ec5ff",
    scene: "adventureMoon",
    hint: "Reserved for the next campaign drop.",
    atmosphere: "Placeholder chapter slot kept visible to preserve progression rhythm and future content pacing.",
    terrainLabel: "Future chapter",
    threatLabel: "Content drop pending",
    landmarks: [],
  },
};

const CHAPTER_TRANSLATION_KEYS: Record<number, "one" | "two" | "three"> = {
  1: "one",
  2: "two",
  3: "three",
};

const CHAPTER_LANDMARK_KEYS: Record<number, string[]> = {
  1: ["camp", "altar", "bridge", "gate"],
  2: ["pass", "kiln", "bridge", "crown"],
  3: [],
};

export function getLocalizedChapterMeta(chapter: number, t: TranslateFn): AdventureCampaignMeta {
  const base = CHAPTER_META[chapter] ?? CHAPTER_META[1];
  const key = CHAPTER_TRANSLATION_KEYS[chapter] ?? "one";
  const landmarkKeys = CHAPTER_LANDMARK_KEYS[chapter] ?? [];

  return {
    ...base,
    name: t(`adventure.chaptersMeta.${key}.name`),
    subtitle: t(`adventure.chaptersMeta.${key}.subtitle`),
    hint: t(`adventure.chaptersMeta.${key}.hint`),
    atmosphere: t(`adventure.chaptersMeta.${key}.atmosphere`),
    terrainLabel: t(`adventure.chaptersMeta.${key}.terrain`),
    threatLabel: t(`adventure.chaptersMeta.${key}.threat`),
    landmarks: base.landmarks.map((landmark, index) => ({
      ...landmark,
      label: t(`adventure.chaptersMeta.${key}.landmarks.${landmarkKeys[index]}`),
    })),
  };
}
