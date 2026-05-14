"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import TopBar from "@/components/ui/TopBar";
import Notifications from "@/components/ui/Notifications";
import LevelUpModal from "@/components/game/LevelUpModal";
import OnboardingTour from "@/components/game/OnboardingTour";
import RouteAudioDirector from "@/components/game/RouteAudioDirector";
import SessionSecurityMonitor from "@/components/game/auth/SessionSecurityMonitor";
import I18nHtmlSync from "@/components/game/options/I18nHtmlSync";
import Hydrator from "@/components/ui/Hydrator";
import { cn } from "@/lib/cn";

const IMMERSIVE_PREFIXES = [
  "/",
  "/deck",
  "/fortress",
  "/arena",
  "/battle",
  "/adventure",
  "/shop",
  "/events",
  "/roster",
  "/missions",
  "/team",
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive =
    pathname === "/" ||
    IMMERSIVE_PREFIXES.some((prefix) => prefix !== "/" && pathname.startsWith(prefix));

  return (
    <>
      <Hydrator />
      <I18nHtmlSync />
      <RouteAudioDirector />
      <SessionSecurityMonitor />
      <div
        className={cn(
          "flex min-h-dvh w-full flex-col",
          immersive ? "max-w-none px-0" : "mx-auto max-w-[1600px] px-0 lg:px-5",
        )}
      >
        {!immersive ? <TopBar /> : null}
        <div
          className={cn(
            "flex-1",
            immersive
              ? "min-h-dvh"
              : "lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-5 lg:pt-5",
          )}
        >
          {!immersive ? (
            <aside className="hidden lg:block">
              <BottomNav />
            </aside>
          ) : null}
          <main
            className={cn(
              "flex-1",
              immersive ? "min-h-dvh px-0 pt-0 pb-0" : "px-2 pt-2 pb-24 md:px-4 lg:px-0 lg:pt-0 lg:pb-8",
            )}
          >
            {children}
          </main>
        </div>
        {!immersive ? (
          <div className="lg:hidden">
            <BottomNav />
          </div>
        ) : null}
        <Notifications />
        <LevelUpModal />
        <OnboardingTour />
      </div>
    </>
  );
}
