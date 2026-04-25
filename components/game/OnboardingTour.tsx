"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/store";
import Button from "@/components/ui/Button";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";

type Step = {
  emoji: string;
  title: string;
  body: string;
  cta: string;
  href?: string;
  hrefLabel?: string;
};

const STEPS: Step[] = [
  {
    emoji: "🏰",
    title: "Welcome to Dawnkeep",
    body:
      "Build a flashy deck, win fast battles and upgrade the fortress so the game always gives you one more rewarding tap.",
    cta: "Next",
  },
  {
    emoji: "🃏",
    title: "Build your deck first",
    body:
      "Pick a leader, slot hero cards and a couple of spells. Keep the first deck simple, powerful and easy to understand.",
    cta: "Next",
    href: "/deck",
    hrefLabel: "Open deck",
  },
  {
    emoji: "⚔",
    title: "Then jump into battle",
    body:
      "Use the new deck battle, not the old squad flow. Summon cards, cast spells and trigger your hero power.",
    cta: "Next",
    href: "/battle",
    hrefLabel: "Open battle",
  },
  {
    emoji: "✨",
    title: "Collect and loop",
    body:
      "After the first win, collect fortress income and continue the campaign. The early game should feel obvious, fast and generous.",
    cta: "Finish",
    href: "/fortress",
    hrefLabel: "Open castle",
  },
];

export default function OnboardingTour() {
  const onboarding = useGameStore((state) => state.onboarding);
  const hydrated = useGameStore((state) => state.hydrated);
  const setStep = useGameStore((state) => state.setOnboardingStep);
  const complete = useGameStore((state) => state.completeOnboarding);
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [hideOverlay, setHideOverlay] = useState(false);

  const stepIndex = useMemo(() => Math.min(onboarding.step, STEPS.length - 1), [onboarding.step]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hidden = params.get("clean") === "1" || window.localStorage.getItem("codex:hideOverlays") === "1";
    setHideOverlay(hidden);
  }, []);

  const hiddenOnCombat =
    pathname.startsWith("/battle") ||
    pathname.startsWith("/deck") ||
    pathname.startsWith("/fortress") ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/arena") ||
    pathname.startsWith("/events") ||
    pathname.startsWith("/team");

  if (!hydrated || onboarding.completed || onboarding.step >= STEPS.length || hideOverlay || hiddenOnCombat) return null;

  const current = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const onHome = pathname === "/";
  const showFullCard = expanded;

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-50",
        onHome
          ? "left-3 right-3 top-[88px] md:left-auto md:right-5 md:top-5 md:w-[320px]"
          : "left-3 right-3 top-[88px] md:left-auto md:w-[320px] lg:right-6",
      )}
    >
      {!showFullCard ? (
        <button
          className="pointer-events-auto ml-auto flex items-center gap-2 rounded-full border border-accent/30 bg-[linear-gradient(180deg,#171d2f_0%,#0b0f18_100%)] px-3 py-2 text-left shadow-[0_12px_34px_rgba(0,0,0,0.48)] backdrop-blur"
          onClick={() => {
            sfx.tap();
            setExpanded(true);
          }}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/6 text-xl">{current.emoji}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-accent">Tutorial</span>
            <span className="block truncate text-sm font-black text-white">{current.title}</span>
          </span>
          <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-black text-black">
            {stepIndex + 1}/{STEPS.length}
          </span>
        </button>
      ) : (
        <div className="pointer-events-auto rounded-[26px] border border-accent/30 bg-[linear-gradient(180deg,#171d2f_0%,#0b0f18_100%)] p-4 shadow-[0_16px_46px_rgba(0,0,0,0.62)] backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/6 text-3xl">{current.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Quick Start</div>
              <div className="mt-1 text-base font-black leading-tight">{current.title}</div>
              <div className="mt-2 text-[13px] leading-5 text-white/78">{current.body}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={cn("h-1.5 rounded-full", index <= stepIndex ? "bg-accent" : "bg-white/15")}
              />
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            {current.href && (
              <Link href={current.href} className="flex-1">
                <Button variant="secondary" fullWidth>
                  {current.hrefLabel ?? "Open"}
                  {pathname === current.href ? " · Here" : ""}
                </Button>
              </Link>
            )}
            <Button
              fullWidth={!current.href}
              onClick={() => {
                sfx.tap();
                if (isLast) complete();
                else setStep(stepIndex + 1);
              }}
            >
              {current.cta}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                sfx.tap();
                complete();
              }}
            >
              Skip
            </Button>
            {!onHome && (
              <Button
                variant="ghost"
                onClick={() => {
                  sfx.tap();
                  setExpanded(false);
                }}
              >
                Minimize
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
