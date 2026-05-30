export const NAVIGATION_TRANSITION_EVENT = "duskkeep:navigation-transition";

const ROUTE_LABELS = [
  ["/adventure", "nav.adventure"],
  ["/arena", "nav.arena"],
  ["/battle", "frontline.command"],
  ["/deck", "nav.deck"],
  ["/events", "nav.events"],
  ["/fortress", "nav.fortress"],
  ["/missions", "nav.quests"],
  ["/roster", "nav.heroes"],
  ["/shop", "nav.market"],
  ["/team", "nav.team"],
] as const;

export type NavigationTarget = {
  href: string;
  labelKey: string;
};

export type NavigationClickMeta = {
  button?: number;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
};

export function isPlainNavigationClick(click: NavigationClickMeta) {
  return (
    (click.button ?? 0) === 0 &&
    !click.altKey &&
    !click.ctrlKey &&
    !click.metaKey &&
    !click.shiftKey
  );
}

export function getNavigationTargetLabelKey(pathname: string) {
  if (pathname === "/") return "nav.home";
  return ROUTE_LABELS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1] ?? "navigation.destination";
}

export function getInternalNavigationTarget(href: string, currentHref: string): NavigationTarget | null {
  const target = new URL(href, currentHref);
  const current = new URL(currentHref);
  if (target.origin !== current.origin) return null;
  if (target.pathname === current.pathname && target.search === current.search) return null;
  return {
    href: `${target.pathname}${target.search}`,
    labelKey: getNavigationTargetLabelKey(target.pathname),
  };
}

export function announceNavigationTransition(href: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NAVIGATION_TRANSITION_EVENT, { detail: { href } }));
}
