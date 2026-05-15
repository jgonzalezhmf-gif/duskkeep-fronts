import { CARD_BY_ID } from "@/data/cards";
import { STARTER_LEADER_ID } from "@/data/leaders";
import {
  createDefaultFrontlineCardUnlocks,
  isFrontlineProgressionCard,
  sanitizeFrontlineCardLevels,
  sanitizeFrontlineCardUnlocks,
} from "@/features/frontline/cardProgression";
import { createDefaultFrontlineLoadout } from "@/features/frontline/engine";
import { createDefaultFrontlineFortress } from "@/features/frontline/fortress";
import { DEFAULT_LOCALE, isLocaleCode } from "@/lib/i18n/locales";
import { DECK_SIZE } from "./constants";
import { defaultFortress, defaultInitial, freshStarterDeck } from "./defaultGameState";
import type { AccountLinkMode, GameState } from "./storeTypes";
import type { FrontlineFortressState, FrontlineLoadout, PlayerHero } from "./types";

function isAccountLinkMode(value: unknown): value is AccountLinkMode {
  return value === "undecided" || value === "guest" || value === "linked";
}

export function mergePersistedGameState<TCurrent extends GameState>(persisted: unknown, current: TCurrent): TCurrent {
  const p = (persisted ?? {}) as Partial<GameState>;
  const mergedDeck = (p.activeDeck ?? current.activeDeck ?? freshStarterDeck())
    .slice(0, DECK_SIZE)
    .map((id) => (id && CARD_BY_ID[id] ? id : null));
  const frontlineCardUnlocks = sanitizeFrontlineCardUnlocks(
    p.frontlineCardUnlocks ?? current.frontlineCardUnlocks ?? createDefaultFrontlineCardUnlocks(),
  );
  for (const cardId of p.frontlineLoadout?.deck ?? []) {
    if (typeof cardId === "string" && isFrontlineProgressionCard(cardId)) {
      frontlineCardUnlocks[cardId] = true;
    }
  }

  return {
    ...current,
    ...p,
    resources: {
      ...(current.resources ?? defaultInitial().resources),
      ...(p.resources ?? {}),
      adventureKeys: p.resources?.adventureKeys ?? current.resources?.adventureKeys ?? 0,
    },
    dailyLogin: p.dailyLogin ?? current.dailyLogin ?? { streak: 0, lastClaim: null },
    roadmapClaimed: p.roadmapClaimed ?? current.roadmapClaimed ?? {},
    milestonesClaimed: p.milestonesClaimed ?? current.milestonesClaimed ?? {},
    adventureMapClaims: p.adventureMapClaims ?? current.adventureMapClaims ?? {},
    activeDeck: mergedDeck,
    activeLeaderId: p.activeLeaderId ?? current.activeLeaderId ?? STARTER_LEADER_ID,
    knownSpellIds: (p.knownSpellIds ?? current.knownSpellIds ?? []).filter((id) => !!CARD_BY_ID[id]),
    fortress: {
      ...(current.fortress ?? defaultFortress()),
      ...(p.fortress ?? {}),
      buildings: {
        ...defaultFortress().buildings,
        ...(current.fortress?.buildings ?? {}),
        ...(p.fortress?.buildings ?? {}),
      },
    },
    frontlineLoadout: {
      ...(current.frontlineLoadout ?? createDefaultFrontlineLoadout()),
      ...(p.frontlineLoadout ?? {}),
      squad: (
        p.frontlineLoadout?.squad ??
        current.frontlineLoadout?.squad ??
        createDefaultFrontlineLoadout().squad
      ).slice(0, 3) as FrontlineLoadout["squad"],
      deck: (
        p.frontlineLoadout?.deck ??
        current.frontlineLoadout?.deck ??
        createDefaultFrontlineLoadout().deck
      )
        .filter((id): id is string => typeof id === "string")
        .slice(0, DECK_SIZE),
    },
    frontlineCardUnlocks,
    frontlineCardLevels: sanitizeFrontlineCardLevels(p.frontlineCardLevels ?? current.frontlineCardLevels ?? {}),
    frontlineFortress: {
      ...(current.frontlineFortress ?? createDefaultFrontlineFortress()),
      ...(p.frontlineFortress ?? {}),
      buildings: {
        ...createDefaultFrontlineFortress().buildings,
        ...(current.frontlineFortress?.buildings ?? {}),
        ...(p.frontlineFortress?.buildings ?? {}),
      },
      garrison: (
        p.frontlineFortress?.garrison ??
        current.frontlineFortress?.garrison ??
        createDefaultFrontlineFortress().garrison
      ).slice(0, 3) as FrontlineFortressState["garrison"],
    },
    eventCompletions: p.eventCompletions ?? current.eventCompletions ?? {},
    dailyShopPurchases: p.dailyShopPurchases ?? current.dailyShopPurchases ?? {},
    shopRefreshedAt: p.shopRefreshedAt ?? current.shopRefreshedAt ?? null,
    audioMuted: typeof p.audioMuted === "boolean" ? p.audioMuted : current.audioMuted ?? false,
    musicVolume: typeof p.musicVolume === "number" ? p.musicVolume : current.musicVolume ?? 0.78,
    sfxVolume: typeof p.sfxVolume === "number" ? p.sfxVolume : current.sfxVolume ?? 0.92,
    language: typeof p.language === "string" && isLocaleCode(p.language) ? p.language : current.language ?? DEFAULT_LOCALE,
    reducedMotion: typeof p.reducedMotion === "boolean" ? p.reducedMotion : current.reducedMotion ?? false,
    visualEffects: typeof p.visualEffects === "boolean" ? p.visualEffects : current.visualEffects ?? true,
    textScale: p.textScale === "large" ? "large" : current.textScale ?? "normal",
    onboarding: p.onboarding ?? current.onboarding ?? { step: 0, completed: false },
    accountLinkMode: isAccountLinkMode(p.accountLinkMode) ? p.accountLinkMode : current.accountLinkMode ?? "undecided",
    pendingUnlockLevel: p.pendingUnlockLevel ?? current.pendingUnlockLevel ?? null,
    arenaTicketsRefreshedAt: p.arenaTicketsRefreshedAt ?? current.arenaTicketsRefreshedAt ?? null,
    heroes: ((p.heroes ?? current.heroes) as PlayerHero[]).map((hero) => ({
      ...hero,
      skillLevel: hero.skillLevel ?? 1,
    })),
  };
}
