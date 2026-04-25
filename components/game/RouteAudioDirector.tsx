"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { audio } from "@/lib/audio";
import { useGameStore } from "@/lib/store";

function isBattleRoute(pathname: string) {
  return /^\/battle(?:\/|$)/.test(pathname) || /^\/adventure\/[^/]+$/.test(pathname);
}

function isAdventureRoute(pathname: string) {
  return pathname === "/adventure";
}

function isEventRoute(pathname: string) {
  return /^\/events(?:\/|$)/.test(pathname);
}

function isShopRoute(pathname: string) {
  return /^\/shop(?:\/|$)/.test(pathname);
}

export default function RouteAudioDirector() {
  const pathname = usePathname();
  const muted = useGameStore((state) => state.audioMuted);
  const musicVolume = useGameStore((state) => state.musicVolume);
  const sfxVolume = useGameStore((state) => state.sfxVolume);

  useEffect(() => {
    audio.init();
    audio.syncFromStore({ muted, musicVolume, sfxVolume });
  }, [muted, musicVolume, sfxVolume]);

  useEffect(() => {
    if (isBattleRoute(pathname)) {
      audio.setTheme("battle");
      return;
    }
    if (isAdventureRoute(pathname)) {
      audio.setTheme("adventure");
      return;
    }
    if (isEventRoute(pathname)) {
      audio.setTheme("event");
      return;
    }
    if (isShopRoute(pathname)) {
      audio.setTheme("shop");
      return;
    }
    audio.setTheme("home");
  }, [pathname]);

  return null;
}
