import type { AuthoritativeClientFetch } from "@/features/server/authoritativeClient";
import type {
  FrontlineBattleSummaryPayload,
  ServerOperationInputPayload,
  SupportedAuthoritativeApiOperation,
} from "@/features/server/authoritativeOperations";
import type { AdventureMapInteractionOpenResult } from "@/features/adventure/mapInteractions";
import type { FrontlineFortressBuildingId, FrontlineFortressState, FrontlineLoadout, LadderState, Resources, Rewards } from "@/lib/types";

export type AuthoritativeDispatcherMode = "authoritative" | "local";

export type AuthoritativeDispatcherOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export type AuthoritativeOperationCallResult =
  | { ok: true; result: unknown }
  | { ok: false; mode: "local"; reason: "missing_session" | "api_disabled" }
  | { ok: false; mode: "authoritative"; reason: string };

export type AuthoritativeOperationRequest<TType extends SupportedAuthoritativeApiOperation> = {
  idempotencyKey: string;
  payload: ServerOperationInputPayload<TType>;
};

export type AuthoritativePurchaseSuccess = {
  ok: true;
  mode: "authoritative";
  resources: Resources;
  requiresSnapshotRefresh: boolean;
};

export type AuthoritativePurchaseFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativePurchaseFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativePurchaseResult =
  | AuthoritativePurchaseSuccess
  | AuthoritativePurchaseFailure
  | AuthoritativePurchaseFallback;

export type PurchaseShopOfferAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type LocalSyncSnapshot = {
  account?: {
    name?: string;
    level?: number;
    xp?: number;
  };
  resources?: Partial<Resources>;
  heroes?: Array<{
    heroId: string;
    level?: number;
    stars?: number;
    shards?: number;
    xp?: number;
    skillLevel?: number;
  }>;
  frontlineLoadout?: FrontlineLoadout;
  frontlineCardUnlocks?: Record<string, boolean>;
  frontlineCardLevels?: Record<string, number>;
  adventureProgress?: Record<
    string,
    {
      status?: "locked" | "available" | "current" | "cleared" | "completed" | "claimed" | "hidden";
      cleared?: boolean;
      firstClearTaken?: boolean;
      claimed?: boolean;
    }
  >;
  adventureMapClaims?: Record<
    string,
    {
      claimed?: boolean;
      claimedAt?: string | null;
      resetAvailableAt?: string | null;
    }
  >;
  frontlineFortress?: Pick<
    FrontlineFortressState,
    "buildings" | "integrity" | "garrison" | "lastResolvedAt" | "nextAttackAt" | "raidsResolved"
  >;
};

export type AuthoritativeLocalSnapshotSyncSuccess = {
  ok: true;
  mode: "authoritative";
  profileId: string;
  imported: boolean;
  normalizedSnapshot: LocalSyncSnapshot;
};

export type AuthoritativeLocalSnapshotSyncFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeLocalSnapshotSyncFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeLocalSnapshotSyncResult =
  | AuthoritativeLocalSnapshotSyncSuccess
  | AuthoritativeLocalSnapshotSyncFailure
  | AuthoritativeLocalSnapshotSyncFallback;

export type SyncLocalSnapshotAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeMapInteractionSuccess = {
  ok: true;
  mode: "authoritative";
  result: AdventureMapInteractionOpenResult;
  resources: Resources;
  resetAvailableAt: string | null;
};

export type AuthoritativeMapInteractionFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeMapInteractionFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeMapInteractionResult =
  | AuthoritativeMapInteractionSuccess
  | AuthoritativeMapInteractionFailure
  | AuthoritativeMapInteractionFallback;

export type OpenAdventureMapInteractionAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeNodeRewardSuccess = {
  ok: true;
  mode: "authoritative";
  nodeId: string;
  rewards: Rewards;
  resources: Resources;
};

export type AuthoritativeNodeRewardFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeNodeRewardFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeNodeRewardResult =
  | AuthoritativeNodeRewardSuccess
  | AuthoritativeNodeRewardFailure
  | AuthoritativeNodeRewardFallback;

export type ClaimAdventureNodeRewardAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeAdventureBattleWinner = "ally" | "enemy";

export type ClaimAdventureBattleResultInput = {
  nodeId: string;
  battleSeed: number;
  winner: AuthoritativeAdventureBattleWinner;
  turns: number;
  battleSummary: FrontlineBattleSummaryPayload;
};

export type AuthoritativeAdventureBattleResultSuccess = {
  ok: true;
  mode: "authoritative";
  nodeId: string;
  winner: AuthoritativeAdventureBattleWinner;
  firstClear: boolean;
  rewards: Rewards;
  resources: Resources;
  unlockedNodeIds: string[];
};

export type AuthoritativeAdventureBattleResultFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeAdventureBattleResultFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeAdventureBattleResult =
  | AuthoritativeAdventureBattleResultSuccess
  | AuthoritativeAdventureBattleResultFailure
  | AuthoritativeAdventureBattleResultFallback;

export type ClaimAdventureBattleResultAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeArenaWinner = "ally" | "enemy" | "draw";

export type RecordArenaResultInput = {
  opponentId: string;
  battleSeed: number;
  winner: AuthoritativeArenaWinner;
  turns: number;
  battleSummary: FrontlineBattleSummaryPayload;
};

export type AuthoritativeArenaResultSuccess = {
  ok: true;
  mode: "authoritative";
  opponentId: string;
  winner: AuthoritativeArenaWinner;
  rewards: Rewards;
  resources: Resources;
  arenaWins: number;
  arenaLosses: number;
};

export type AuthoritativeArenaResultFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeArenaResultFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeArenaResult =
  | AuthoritativeArenaResultSuccess
  | AuthoritativeArenaResultFailure
  | AuthoritativeArenaResultFallback;

export type RecordArenaResultAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type RecordLadderResultInput = {
  opponentId: string;
  battleSeed: number;
  winner: AuthoritativeArenaWinner;
  turns: number;
  battleSummary: FrontlineBattleSummaryPayload;
};

export type AuthoritativeLadderResultSuccess = {
  ok: true;
  mode: "authoritative";
  opponentId: string;
  winner: AuthoritativeArenaWinner;
  rewards: Rewards;
  resources: Resources;
  ladder: LadderState;
  pointsDelta: number;
  keyProgressDelta: number;
  adventureKeysGranted: number;
  rewardMode: "normal" | "reduced" | "draw" | "loss";
};

export type AuthoritativeLadderResultFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeLadderResultFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeLadderResult =
  | AuthoritativeLadderResultSuccess
  | AuthoritativeLadderResultFailure
  | AuthoritativeLadderResultFallback;

export type RecordLadderResultAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type RecordEventResultInput = {
  eventId: string;
  battleSeed: number;
  winner: AuthoritativeArenaWinner;
  turns: number;
  battleSummary: FrontlineBattleSummaryPayload;
};

export type AuthoritativeEventResultSuccess = {
  ok: true;
  mode: "authoritative";
  eventId: string;
  winner: AuthoritativeArenaWinner;
  firstClear: boolean;
  rewards: Rewards;
  resources: Resources;
};

export type AuthoritativeEventResultFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeEventResultFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeEventResult =
  | AuthoritativeEventResultSuccess
  | AuthoritativeEventResultFailure
  | AuthoritativeEventResultFallback;

export type RecordEventResultAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeLoadoutSaveSuccess = {
  ok: true;
  mode: "authoritative";
  loadout: FrontlineLoadout;
  updatedAt: string;
};

export type AuthoritativeLoadoutSaveFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeLoadoutSaveFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeLoadoutSaveResult =
  | AuthoritativeLoadoutSaveSuccess
  | AuthoritativeLoadoutSaveFailure
  | AuthoritativeLoadoutSaveFallback;

export type SaveFrontlineLoadoutAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeDailyLoginSuccess = {
  ok: true;
  mode: "authoritative";
  dayKey: string;
  streak: number;
  rewards: Rewards;
  resources: Resources;
};

export type AuthoritativeDailyLoginFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeDailyLoginFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeDailyLoginResult =
  | AuthoritativeDailyLoginSuccess
  | AuthoritativeDailyLoginFailure
  | AuthoritativeDailyLoginFallback;

export type ClaimDailyLoginAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeMissionClaimSuccess = {
  ok: true;
  mode: "authoritative";
  missionId: string;
  cycleKey: string;
  rewards: Rewards;
  resources: Resources;
};

export type AuthoritativeMissionClaimFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeMissionClaimFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeMissionClaimResult =
  | AuthoritativeMissionClaimSuccess
  | AuthoritativeMissionClaimFailure
  | AuthoritativeMissionClaimFallback;

export type ClaimMissionAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeFrontlineCardUpgradeSuccess = {
  ok: true;
  mode: "authoritative";
  cardId: string;
  level: number;
  costPaid: {
    gold: number;
    dust: number;
  };
  resources: Resources;
};

export type AuthoritativeFrontlineCardUpgradeFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeFrontlineCardUpgradeFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeFrontlineCardUpgradeResult =
  | AuthoritativeFrontlineCardUpgradeSuccess
  | AuthoritativeFrontlineCardUpgradeFailure
  | AuthoritativeFrontlineCardUpgradeFallback;

export type UpgradeFrontlineCardAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeFrontlineFortressUpgradeSuccess = {
  ok: true;
  mode: "authoritative";
  buildingId: FrontlineFortressBuildingId;
  level: number;
  costPaid: {
    gold: number;
    dust: number;
  };
  resources: Resources;
  frontlineFortress: FrontlineFortressState;
};

export type AuthoritativeFrontlineFortressUpgradeFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeFrontlineFortressUpgradeFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeFrontlineFortressUpgradeResult =
  | AuthoritativeFrontlineFortressUpgradeSuccess
  | AuthoritativeFrontlineFortressUpgradeFailure
  | AuthoritativeFrontlineFortressUpgradeFallback;

export type UpgradeFrontlineFortressAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeFrontlineFortressRaidSuccess = {
  ok: true;
  mode: "authoritative";
  report: NonNullable<FrontlineFortressState["lastReport"]>;
  resources: Resources;
  frontlineFortress: FrontlineFortressState;
};

export type AuthoritativeFrontlineFortressRaidFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeFrontlineFortressRaidFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeFrontlineFortressRaidResult =
  | AuthoritativeFrontlineFortressRaidSuccess
  | AuthoritativeFrontlineFortressRaidFailure
  | AuthoritativeFrontlineFortressRaidFallback;

export type ResolveFrontlineFortressRaidAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeHeroLevelUpSuccess = {
  ok: true;
  mode: "authoritative";
  heroId: string;
  level: number;
  costPaid: {
    gold: number;
  };
  resources: Resources;
};

export type AuthoritativeHeroLevelUpFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeHeroLevelUpFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeHeroLevelUpResult =
  | AuthoritativeHeroLevelUpSuccess
  | AuthoritativeHeroLevelUpFailure
  | AuthoritativeHeroLevelUpFallback;

export type LevelUpHeroAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeHeroStarUpSuccess = {
  ok: true;
  mode: "authoritative";
  heroId: string;
  stars: number;
  shards: number;
  shardsSpent: number;
  resources: Resources;
};

export type AuthoritativeHeroStarUpFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeHeroStarUpFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeHeroStarUpResult =
  | AuthoritativeHeroStarUpSuccess
  | AuthoritativeHeroStarUpFailure
  | AuthoritativeHeroStarUpFallback;

export type StarUpHeroAuthoritativelyOptions = AuthoritativeDispatcherOptions;

export type AuthoritativeHeroSkillUpSuccess = {
  ok: true;
  mode: "authoritative";
  heroId: string;
  skillLevel: number;
  costPaid: {
    dust: number;
  };
  resources: Resources;
};

export type AuthoritativeHeroSkillUpFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativeHeroSkillUpFallback = {
  ok: false;
  mode: "local";
  reason: "missing_session" | "api_disabled";
};

export type AuthoritativeHeroSkillUpResult =
  | AuthoritativeHeroSkillUpSuccess
  | AuthoritativeHeroSkillUpFailure
  | AuthoritativeHeroSkillUpFallback;

export type SkillUpHeroAuthoritativelyOptions = AuthoritativeDispatcherOptions;
