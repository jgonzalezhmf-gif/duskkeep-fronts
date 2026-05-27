const NON_HOME_ONBOARDING_HIDDEN_PREFIXES = [
  "/adventure",
  "/arena",
  "/battle",
  "/deck",
  "/events",
  "/fortress",
  "/missions",
  "/roster",
  "/shop",
  "/team",
] as const;

export function shouldHideOnboardingTourOnPathname(pathname: string) {
  return NON_HOME_ONBOARDING_HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
