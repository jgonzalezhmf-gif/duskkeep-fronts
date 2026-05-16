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

export function isServerAuthoritativePersistenceEnabled() {
  return process.env.NEXT_PUBLIC_PERSISTENCE === "supabase";
}

function isAccountLinkMode(value: unknown): value is AccountLinkMode {
  return value === "undecided" || value === "guest" || value === "linked";
}

export function mergePersistedGameState<TCurrent extends GameState>(persisted: unknown, current: TCurrent): TCurrent {
  const p = (persisted ?? {}) as Partial<GameState>;
  const persistSensitiveState = !isServerAuthoritativePersistenceEnabled();
  const sensitive = persistSensitiveState ? p : {};
  const mergedDeck = (sensitive.activeDeck ?? current.activeDeck ?? freshStarterDeck())
    .slice(0, DECK_SIZE)
    .map((id) => (id && CARD_BY_ID[id] ? id : null));
  const frontlineCardUnlocks = sanitizeFrontlineCardUnlocks(
    sensitive.frontlineCardUnlocks ?? current.frontlineCardUnlocks ?? createDefaultFrontlineCardUnlocks(),
  );
  for (const cardId of sensitive.frontlineLoadout?.deck ?? []) {
    if (typeof cardId === "string" && isFrontlineProgressionCard(cardId)) {
      frontlineCardUnlocks[cardId] = true;
    }
  }

  return {
    ...current,
    ...sensitive,
    resources: {
      ...(current.resources ?? defaultInitial().resources),
      ...(sensitive.resources ?? {}),
      adventureKeys: sensitive.resources?.adventureKeys ?? current.resources?.adventureKeys ?? 0,
    },
    dailyLogin: sensitive.dailyLogin ?? current.dailyLogin ?? { streak: 0, lastClaim: null },
    roadmapClaimed: sensitive.roadmapClaimed ?? current.roadmapClaimed ?? {},
    milestonesClaimed: sensitive.milestonesClaimed ?? current.milestonesClaimed ?? {},
    adventureMapClaims: sensitive.adventureMapClaims ?? current.adventureMapClaims ?? {},
    activeDeck: mergedDeck,
    activeLeaderId: sensitive.activeLeaderId ?? current.activeLeaderId ?? STARTER_LEADER_ID,
    knownSpellIds: (sensitive.knownSpellIds ?? current.knownSpellIds ?? []).filter((id) => !!CARD_BY_ID[id]),
    fortress: {
      ...(current.fortress ?? defaultFortress()),
      ...(sensitive.fortress ?? {}),
      buildings: {
        ...defaultFortress().buildings,
        ...(current.fortress?.buildings ?? {}),
        ...(sensitive.fortress?.buildings ?? {}),
      },
    },
    frontlineLoadout: {
      ...(current.frontlineLoadout ?? createDefaultFrontlineLoadout()),
      ...(sensitive.frontlineLoadout ?? {}),
      squad: (
        sensitive.frontlineLoadout?.squad ??
        current.frontlineLoadout?.squad ??
        createDefaultFrontlineLoadout().squad
      ).slice(0, 3) as FrontlineLoadout["squad"],
      deck: (
        sensitive.frontlineLoadout?.deck ??
        current.frontlineLoadout?.deck ??
        createDefaultFrontlineLoadout().deck
      )
        .filter((id): id is string => typeof id === "string")
        .slice(0, DECK_SIZE),
    },
    frontlineCardUnlocks,
    frontlineCardLevels: sanitizeFrontlineCardLevels(sensitive.frontlineCardLevels ?? current.frontlineCardLevels ?? {}),
    frontlineFortress: {
      ...(current.frontlineFortress ?? createDefaultFrontlineFortress()),
      ...(sensitive.frontlineFortress ?? {}),
      buildings: {
        ...createDefaultFrontlineFortress().buildings,
        ...(current.frontlineFortress?.buildings ?? {}),
        ...(sensitive.frontlineFortress?.buildings ?? {}),
      },
      garrison: (
        sensitive.frontlineFortress?.garrison ??
        current.frontlineFortress?.garrison ??
        createDefaultFrontlineFortress().garrison
      ).slice(0, 3) as FrontlineFortressState["garrison"],
    },
    eventCompletions: sensitive.eventCompletions ?? current.eventCompletions ?? {},
    dailyShopPurchases: sensitive.dailyShopPurchases ?? current.dailyShopPurchases ?? {},
    shopRefreshedAt: sensitive.shopRefreshedAt ?? current.shopRefreshedAt ?? null,
    audioMuted: typeof p.audioMuted === "boolean" ? p.audioMuted : current.audioMuted ?? false,
    musicVolume: typeof p.musicVolume === "number" ? p.musicVolume : current.musicVolume ?? 0.78,
    sfxVolume: typeof p.sfxVolume === "number" ? p.sfxVolume : current.sfxVolume ?? 0.92,
    language: typeof p.language === "string" && isLocaleCode(p.language) ? p.language : current.language ?? DEFAULT_LOCALE,
    reducedMotion: typeof p.reducedMotion === "boolean" ? p.reducedMotion : current.reducedMotion ?? false,
    visualEffects: typeof p.visualEffects === "boolean" ? p.visualEffects : current.visualEffects ?? true,
    textScale: p.textScale === "large" ? "large" : current.textScale ?? "normal",
    onboarding: p.onboarding ?? current.onboarding ?? { step: 0, completed: false },
    hasSeenIntro: typeof p.hasSeenIntro === "boolean" ? p.hasSeenIntro : current.hasSeenIntro ?? false,
    accountLinkMode: isAccountLinkMode(p.accountLinkMode) ? p.accountLinkMode : current.accountLinkMode ?? "undecided",
    pendingUnlockLevel: sensitive.pendingUnlockLevel ?? current.pendingUnlockLevel ?? null,
    arenaTicketsRefreshedAt: sensitive.arenaTicketsRefreshedAt ?? current.arenaTicketsRefreshedAt ?? null,
    heroes: ((sensitive.heroes ?? current.heroes) as PlayerHero[]).map((hero) => ({
      ...hero,
      skillLevel: hero.skillLevel ?? 1,
    })),
  };
}
