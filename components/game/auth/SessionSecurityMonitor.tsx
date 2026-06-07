"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  completeSupabaseAuthRedirect,
  getSupabaseSessionSnapshot,
  signOutSupabase,
  subscribeToSupabaseAuthEvents,
  type SupabaseSessionSnapshot,
} from "@/features/server/supabaseBrowserSession";
import {
  AUTH_IDLE_TIMEOUT_MS,
  createSupabaseAuthRedirectCleanPath,
  hasSupabaseOAuthRedirectUrl,
  hasAuthIdleSessionExpired,
  reconcileAuthSessionState,
  shouldStripSupabaseAuthRedirectUrl,
  shouldRecordAuthActivity,
} from "@/features/server/sessionSecurity";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";

const GameAuthGate = dynamic(() => import("@/components/game/auth/GameAuthGate").then((mod) => mod.GameAuthGate), {
  ssr: false,
});

const AUTH_ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

export function SessionSecurityMonitor() {
  const { t } = useI18n();
  const sessionExpiredText = t("auth.sessionExpired");
  const accountLinkMode = useGameStore((state) => state.accountLinkMode);
  const setAccountLinkMode = useGameStore((state) => state.setAccountLinkMode);
  const pushNotification = useGameStore((state) => state.pushNotification);
  const loadServerSnapshotOnlineFirst = useGameStore((state) => state.loadServerSnapshotOnlineFirst);
  const [expired, setExpired] = useState(false);
  const lastActivityAtRef = useRef(0);
  const lastRecordedAtRef = useRef(0);
  const lastSnapshotUserIdRef = useRef<string | null>(null);
  const expiringRef = useRef(false);
  const linked = accountLinkMode === "linked";

  const queueServerSnapshotLoad = useCallback((session: SupabaseSessionSnapshot) => {
    if (session.status !== "authenticated") return;
    if (lastSnapshotUserIdRef.current === session.userId) return;
    lastSnapshotUserIdRef.current = session.userId;
    void loadServerSnapshotOnlineFirst().then((result) => {
      if (!result.ok && result.reason !== "unconfigured") lastSnapshotUserIdRef.current = null;
    });
  }, [loadServerSnapshotOnlineFirst]);

  useEffect(() => {
    const now = Date.now();
    lastActivityAtRef.current = now;
    lastRecordedAtRef.current = now;
  }, []);

  useEffect(() => {
    if (!hasCurrentSupabaseOAuthRedirectUrl()) return;

    let cancelled = false;
    void completeSupabaseAuthRedirect().then((result) => {
      stripCurrentSupabaseAuthRedirectUrl();
      if (cancelled || !result.ok) return;

      const session = result.session;
      if (session.status !== "authenticated") return;

      lastActivityAtRef.current = Date.now();
      lastRecordedAtRef.current = Date.now();
      setExpired(false);
      setAccountLinkMode(session.isAnonymous ? "guest" : "linked");
      queueServerSnapshotLoad(session);
    });

    return () => {
      cancelled = true;
    };
  }, [queueServerSnapshotLoad, setAccountLinkMode]);

  useEffect(() => {
    const subscription = subscribeToSupabaseAuthEvents((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        lastActivityAtRef.current = Date.now();
        lastRecordedAtRef.current = Date.now();
        if (session.status === "authenticated") {
          setExpired(false);
          setAccountLinkMode(session.isAnonymous ? "guest" : "linked");
          queueServerSnapshotLoad(session);
        }
      }
      if (event === "SIGNED_OUT" && linked) {
        lastSnapshotUserIdRef.current = null;
        setExpired(true);
        setAccountLinkMode("undecided");
      }
    });

    return () => subscription?.unsubscribe();
  }, [linked, queueServerSnapshotLoad, setAccountLinkMode]);

  useEffect(() => {
    let cancelled = false;
    void getSupabaseSessionSnapshot().then((session) => {
      if (cancelled) return;
      const reconciled = reconcileAuthSessionState({
        accountLinkMode,
        sessionStatus: session.status,
        sessionIsAnonymous: session.status === "authenticated" ? session.isAnonymous : false,
      });
      if (reconciled.accountLinkMode !== accountLinkMode) setAccountLinkMode(reconciled.accountLinkMode);
      if (reconciled.requiresLogin) setExpired(true);
      if (session.status === "authenticated") {
        setExpired(false);
        lastActivityAtRef.current = Date.now();
        lastRecordedAtRef.current = Date.now();
        queueServerSnapshotLoad(session);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [accountLinkMode, queueServerSnapshotLoad, setAccountLinkMode]);

  useEffect(() => {
    if (!linked) return;

    async function expireForInactivity() {
      if (expiringRef.current) return;
      expiringRef.current = true;
      setExpired(true);
      setAccountLinkMode("undecided");
      pushNotification("info", sessionExpiredText);
      await signOutSupabase();
      expiringRef.current = false;
    }

    function checkExpiry(now = Date.now()) {
      if (
        hasAuthIdleSessionExpired({
          linked: true,
          lastActivityAt: lastActivityAtRef.current,
          now,
          idleTimeoutMs: AUTH_IDLE_TIMEOUT_MS,
        })
      ) {
        void expireForInactivity();
        return true;
      }
      return false;
    }

    function recordActivity() {
      const now = Date.now();
      if (checkExpiry(now)) return;
      if (shouldRecordAuthActivity({ lastRecordedAt: lastRecordedAtRef.current, now })) {
        lastActivityAtRef.current = now;
        lastRecordedAtRef.current = now;
      }
    }

    function checkOnReturn() {
      if (document.visibilityState === "visible") checkExpiry();
    }

    AUTH_ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
    window.addEventListener("focus", recordActivity);
    document.addEventListener("visibilitychange", checkOnReturn);
    const interval = window.setInterval(() => checkExpiry(), 60 * 1000);

    return () => {
      AUTH_ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      window.removeEventListener("focus", recordActivity);
      document.removeEventListener("visibilitychange", checkOnReturn);
      window.clearInterval(interval);
    };
  }, [linked, pushNotification, sessionExpiredText, setAccountLinkMode]);

  if (!expired) return null;

  return (
    <GameAuthGate
      open
      allowGuest={false}
      initialNoticeKey="auth.sessionExpired"
      onLinked={() => {
        lastActivityAtRef.current = Date.now();
        lastRecordedAtRef.current = Date.now();
        setExpired(false);
        setAccountLinkMode("linked");
        void loadServerSnapshotOnlineFirst();
      }}
    />
  );
}

export default SessionSecurityMonitor;

function hasCurrentSupabaseOAuthRedirectUrl() {
  if (typeof window === "undefined") return false;
  return hasSupabaseOAuthRedirectUrl({ search: window.location.search, hash: window.location.hash });
}

function stripCurrentSupabaseAuthRedirectUrl() {
  if (typeof window === "undefined") return;
  const parts = { search: window.location.search, hash: window.location.hash };
  if (!shouldStripSupabaseAuthRedirectUrl(parts)) return;
  window.history.replaceState(
    null,
    "",
    createSupabaseAuthRedirectCleanPath({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    }),
  );
}
