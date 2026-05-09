"use client";

import type { ReactNode } from "react";

export function BattlePageSetupLayout({
  hero,
  launch,
  main,
  sidebar,
}: {
  hero: ReactNode;
  launch: ReactNode;
  main: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-3 pb-24 pt-20 md:px-6 md:pb-28 md:pt-24 xl:px-8">
      <section className="relative isolate overflow-hidden rounded-[40px] border border-[#f5d498]/14 bg-[radial-gradient(circle_at_16%_8%,rgba(245,196,81,0.2),transparent_24%),radial-gradient(circle_at_80%_14%,rgba(240,95,114,0.18),transparent_27%),linear-gradient(135deg,rgba(55,34,19,0.94),rgba(14,19,29,0.97)_44%,rgba(5,7,12,0.99)_100%)] shadow-[0_38px_96px_rgba(0,0,0,0.46)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.06),transparent_21%,rgba(0,0,0,0.22)_80%),radial-gradient(ellipse_at_50%_54%,rgba(156,100,51,0.24),transparent_44%)]" />
        <div className="pointer-events-none absolute inset-x-[4%] top-[21%] h-[28rem] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_50%,rgba(245,196,81,0.16),rgba(105,72,36,0.2)_34%,transparent_72%)] blur-sm" />
        <div className="pointer-events-none absolute left-[10%] top-16 h-36 w-36 rounded-full bg-[#65d2c8]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[14%] top-12 h-44 w-44 rounded-full bg-[#f05f72]/12 blur-3xl" />
        <div className="relative z-[1] px-4 py-5 md:px-6 md:py-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
            {hero}
            {launch}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
            {main}
            {sidebar}
          </div>
        </div>
      </section>
    </div>
  );
}
