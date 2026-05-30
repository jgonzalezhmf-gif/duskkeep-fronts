"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  NAVIGATION_TRANSITION_EVENT,
  getInternalNavigationTarget,
  isPlainNavigationClick,
  type NavigationTarget,
} from "@/lib/navigationTransition";
import { PendingActionOverlay } from "./PendingActionFeedback";

const MIN_VISIBLE_MS = 260;
const MAX_VISIBLE_MS = 7000;

type PendingNavigation = NavigationTarget & {
  startedAt: number;
};

function targetHrefFromClick(event: MouseEvent) {
  if (!isPlainNavigationClick(event)) return null;
  const target = event.target instanceof Element ? event.target : null;
  const anchor = target?.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.hasAttribute("download")) return null;
  const targetAttr = anchor.getAttribute("target");
  if (targetAttr && targetAttr !== "_self") return null;
  return anchor.href;
}

export default function NavigationTransitionFeedback() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [pending, setPending] = useState<PendingNavigation | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (maxTimer.current) clearTimeout(maxTimer.current);
    hideTimer.current = null;
    maxTimer.current = null;
  }, []);

  const start = useCallback(
    (href: string) => {
      const target = getInternalNavigationTarget(href, window.location.href);
      if (!target) return;
      clearTimers();
      setPending({ ...target, startedAt: Date.now() });
      maxTimer.current = setTimeout(() => setPending(null), MAX_VISIBLE_MS);
    },
    [clearTimers],
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const href = targetHrefFromClick(event);
      if (href) start(href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  useEffect(() => {
    const onAnnounce = (event: Event) => {
      const href = (event as CustomEvent<{ href?: string }>).detail?.href;
      if (href) start(href);
    };
    window.addEventListener(NAVIGATION_TRANSITION_EVENT, onAnnounce);
    return () => window.removeEventListener(NAVIGATION_TRANSITION_EVENT, onAnnounce);
  }, [start]);

  useEffect(() => {
    if (!pending) return;
    const targetPath = pending.href.split("?")[0] || "/";
    if (pathname !== targetPath) return;
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - pending.startedAt));
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      clearTimers();
      setPending(null);
    }, wait);
  }, [clearTimers, pathname, pending]);

  useEffect(() => clearTimers, [clearTimers]);

  if (!pending) return null;
  return (
    <div className="fixed inset-0 z-[90]">
      <PendingActionOverlay
        label={t("navigation.opening", { destination: t(pending.labelKey) })}
        showLabel={false}
        yOffset="9rem"
      />
    </div>
  );
}
