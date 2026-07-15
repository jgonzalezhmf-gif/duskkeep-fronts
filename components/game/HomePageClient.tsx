"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import HomeWorldMap, { type HomeHotspot } from "@/components/game/HomeWorldMap";
import { signInSupabaseAnonymously } from "@/features/server/supabaseBrowserSession";
import { shouldShowEntryAuthGate } from "@/features/server/sessionSecurity";
import { HOME_LANDMARK_LAYOUT, toPx } from "@/components/game/home/homeComposition";
import { GameIntro } from "@/components/game/intro/GameIntro";
import {
  INTRO_SEEN_SESSION_EVENT,
  markIntroSeenForSession,
  readIntroSeenForSession,
  shouldShowEntryIntro,
} from "@/lib/introSessionPolicy";
import { useI18n } from "@/lib/i18n/useI18n";
import { nextUnlockedLevel, useGameStore } from "@/lib/store";

const GameAuthGate = dynamic(() => import("@/components/game/auth/GameAuthGate").then((mod) => mod.GameAuthGate), {
  ssr: false,
});

const PasswordRecoveryGate = dynamic(
  () => import("@/components/game/auth/PasswordRecoveryGate").then((mod) => mod.PasswordRecoveryGate),
  {
    ssr: false,
  },
);

let introSeenInPageRuntime = false;
let guestChoiceResolvedInPageRuntime = false;

export default function HomePageClient({
  qaClean = false,
  qaEffects = false,
}: {
  qaClean?: boolean;
  qaEffects?: boolean;
}) {
  const { t } = useI18n();
  const store = useGameStore();
  const nextLevel = nextUnlockedLevel(store);
  const markIntroSeen = useGameStore((state) => state.markIntroSeen);
  const accountLinkMode = useGameStore((state) => state.accountLinkMode);
  const setAccountLinkMode = useGameStore((state) => state.setAccountLinkMode);
  const syncLocalSnapshotOnlineFirst = useGameStore((state) => state.syncLocalSnapshotOnlineFirst);
  const loadServerSnapshotOnlineFirst = useGameStore((state) => state.loadServerSnapshotOnlineFirst);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [introSeenThisSession, setIntroSeenThisSession] = useState(() => introSeenInPageRuntime || readIntroSeenForSession());
  const [guestChoiceResolvedThisPageLoad, setGuestChoiceResolvedThisPageLoad] = useState(() => guestChoiceResolvedInPageRuntime);
  const introEligible = !qaClean && !qaEffects;
  const showIntro = shouldShowEntryIntro({
    hydrated: store.hydrated,
    introEligible,
    introDismissed,
    introSeenThisSession,
  });
  // Until the persisted store has hydrated we don't know whether to show
  // the intro yet. If we render Home behind it we get a visible flash of
  // HUD before the cinematic mounts (the user reported this). Cover the
  // viewport with a solid black layer while we wait so the first frame is
  // always either black or the intro itself.
  const showPreHydrationVeil = !store.hydrated && introEligible && !introDismissed && !introSeenThisSession;
  const showAuthGate = shouldShowEntryAuthGate({
    hydrated: store.hydrated,
    introEligible,
    showIntro,
    accountLinkMode,
    guestChoiceResolvedThisPageLoad,
  });
  const showHomeWorld = !showIntro && !showPreHydrationVeil;

  function handleIntroDone() {
    markIntroCompleteForSession();
    markIntroSeen();
  }

  function markIntroCompleteForSession() {
    introSeenInPageRuntime = true;
    markIntroSeenForSession();
    setIntroSeenThisSession(true);
    setIntroDismissed(true);
  }

  function markEntryChoiceResolvedForCurrentSession() {
    guestChoiceResolvedInPageRuntime = true;
    setGuestChoiceResolvedThisPageLoad(true);
    markIntroCompleteForSession();
  }

  useEffect(() => {
    if (!introEligible) return;

    function syncIntroSeenForCurrentSession() {
      if (!readIntroSeenForSession()) return;
      introSeenInPageRuntime = true;
      setIntroSeenThisSession(true);
      setIntroDismissed(true);
    }

    syncIntroSeenForCurrentSession();
    window.addEventListener(INTRO_SEEN_SESSION_EVENT, syncIntroSeenForCurrentSession);
    return () => window.removeEventListener(INTRO_SEEN_SESSION_EVENT, syncIntroSeenForCurrentSession);
  }, [introEligible]);

  const hotspots: HomeHotspot[] = [
    {
      zoneId: "fortress",
      href: "/fortress",
      label: t("home.hotspots.fortress.label"),
      sublabel: t("home.hotspots.fortress.sublabel"),
      icon: "fortress",
      landmarkId: "fortress",
      tone: "gold",
      ...getHomeHotspotLayout("fortress"),
    },
    {
      zoneId: "arena",
      href: "/arena",
      label: t("home.hotspots.arena.label"),
      sublabel: t("home.hotspots.arena.sublabel"),
      icon: "arena",
      modeIcon: "arena_draft",
      landmarkId: "arena",
      tone: "sky",
      ...getHomeHotspotLayout("arena"),
    },
    {
      zoneId: "events",
      href: "/events",
      label: t("home.hotspots.events.label"),
      sublabel: t("home.hotspots.events.sublabel"),
      icon: "events",
      modeIcon: "daily_event",
      landmarkId: "events",
      tone: "violet",
      ...getHomeHotspotLayout("events"),
    },
    {
      zoneId: "deck",
      href: "/deck",
      label: t("home.hotspots.deck.label"),
      sublabel: t("home.hotspots.deck.sublabel"),
      icon: "deck",
      landmarkId: "deck",
      tone: "gold",
      ...getHomeHotspotLayout("deck"),
    },
    {
      zoneId: "market",
      href: "/shop",
      label: t("home.hotspots.market.label"),
      sublabel: t("home.hotspots.market.sublabel"),
      icon: "market",
      landmarkId: "market",
      tone: "emerald",
      ...getHomeHotspotLayout("market"),
    },
    {
      zoneId: "adventure",
      href: "/adventure",
      label: t("home.hotspots.adventure.label"),
      sublabel: t("home.hotspots.adventure.sublabel"),
      icon: "adventure",
      modeIcon: "campaign",
      landmarkId: "adventure",
      tone: "rose",
      ...getHomeHotspotLayout("adventure"),
      badge: nextLevel ? `${nextLevel.chapter}-${nextLevel.index}` : "OK",
    },
  ];

  return (
    <>
      {showHomeWorld ? (
        <HomeWorldMap hotspots={hotspots} tutorialOpen={!store.onboarding.completed} qaClean={qaClean} qaEffects={qaEffects} />
      ) : null}
      {showPreHydrationVeil ? (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "#050608",
            pointerEvents: "none",
          }}
        />
      ) : null}
      {showIntro ? <GameIntro onDone={handleIntroDone} /> : null}
      <GameAuthGate
        open={showAuthGate}
        onGuest={async () => {
          const result = await signInSupabaseAnonymously();
          if (result.ok && result.session.status === "authenticated" && !result.session.isAnonymous) {
            markEntryChoiceResolvedForCurrentSession();
            setAccountLinkMode("linked");
            return;
          }
          markEntryChoiceResolvedForCurrentSession();
          setAccountLinkMode("guest");
        }}
        onLinked={() => {
          markEntryChoiceResolvedForCurrentSession();
          setAccountLinkMode("linked");
          void loadServerSnapshotOnlineFirst();
        }}
      />
      <PasswordRecoveryGate
        onRecovered={async ({ source }) => {
          markEntryChoiceResolvedForCurrentSession();
          setAccountLinkMode("linked");
          if (source === "guestUpgrade") {
            await syncLocalSnapshotOnlineFirst();
            return;
          }
          await loadServerSnapshotOnlineFirst();
        }}
      />
    </>
  );
}

function getHomeHotspotLayout(id: keyof typeof HOME_LANDMARK_LAYOUT) {
  const layout = HOME_LANDMARK_LAYOUT[id];

  return {
    anchorX: toPx(layout.x + layout.hotspotDx),
    anchorY: toPx(layout.y + layout.hotspotDy),
    mobileAnchorX: toPx(layout.x + layout.hotspotDx),
    mobileAnchorY: toPx(layout.y + layout.hotspotDy),
    width: toPx(layout.hotspotWidth),
    height: toPx(layout.hotspotHeight),
    mobileWidth: toPx(layout.hotspotWidth),
    mobileHeight: toPx(layout.hotspotHeight),
    plaqueWidth: toPx(layout.plaqueWidth),
    mobilePlaqueWidth: toPx(layout.plaqueWidth),
    labelDx: toPx(layout.labelDx),
    labelDy: toPx(layout.labelDy),
    mobileLabelDx: toPx(layout.labelDx),
    mobileLabelDy: toPx(layout.labelDy),
  };
}
