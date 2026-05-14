"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  getSupabaseSessionSnapshot,
  signOutSupabase,
  subscribeToSupabaseAuthEvents,
} from "@/features/server/supabaseBrowserSession";
import {
  AUTH_IDLE_TIMEOUT_MS,
  hasAuthIdleSessionExpired,
  reconcileAuthSessionState,
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
  const [expired, setExpired] = useState(false);
  const lastActivityAtRef = useRef(0);
  const lastRecordedAtRef = useRef(0);
  const expiringRef = useRef(false);
  const linked = accountLinkMode === "linked";

  useEffect(() => {
    const now = Date.now();
    lastActivityAtRef.current = now;
    lastRecordedAtRef.current = now;
  }, []);

  useEffect(() => {
    const subscription = subscribeToSupabaseAuthEvents((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        lastActivityAtRef.current = Date.now();
        lastRecordedAtRef.current = Date.now();
        if (session.status === "authenticated") {
          setExpired(false);
          setAccountLinkMode("linked");
        }
      }
      if (event === "SIGNED_OUT" && linked) {
        setExpired(true);
        setAccountLinkMode("undecided");
      }
    });

    return () => subscription?.unsubscribe();
  }, [linked, setAccountLinkMode]);

  useEffect(() => {
    let cancelled = false;
    void getSupabaseSessionSnapshot().then((session) => {
      if (cancelled) return;
      const reconciled = reconcileAuthSessionState({
        accountLinkMode,
        sessionStatus: session.status,
      });
      if (reconciled.accountLinkMode !== accountLinkMode) setAccountLinkMode(reconciled.accountLinkMode);
      if (reconciled.requiresLogin) setExpired(true);
      if (session.status === "authenticated") {
        setExpired(false);
        lastActivityAtRef.current = Date.now();
        lastRecordedAtRef.current = Date.now();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [accountLinkMode, setAccountLinkMode]);

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
      }}
    />
  );
}

export default SessionSecurityMonitor;
