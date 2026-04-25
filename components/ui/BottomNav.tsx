"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", label: "Home", short: "Base" },
  { href: "/adventure", label: "Adventure", short: "PvE" },
  { href: "/deck", label: "Deck", short: "Cards" },
  { href: "/fortress", label: "Fortress", short: "Core" },
  { href: "/arena", label: "Arena", short: "PvP" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-2 lg:static lg:px-0 lg:pb-0">
      <div className="mx-auto w-full max-w-[760px] rounded-[28px] border border-[#c7a46a]/16 bg-[linear-gradient(180deg,rgba(8,10,14,0.76),rgba(8,10,14,0.96))] p-2 shadow-[0_18px_44px_rgba(0,0,0,0.42)] backdrop-blur-xl lg:max-w-none">
        <ul className="grid grid-cols-5 gap-2 lg:grid-cols-1">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-[58px] flex-col items-center justify-center rounded-[20px] border px-2 py-2 text-center transition lg:flex-row lg:justify-between lg:px-4 lg:text-left",
                    active
                      ? "border-[#f5c451]/30 bg-[#f5c451]/12 text-[#f5d498] shadow-[0_0_24px_rgba(245,196,81,0.12)]"
                      : "border-white/6 bg-white/[0.03] text-white/52 hover:text-white/82",
                  )}
                >
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] lg:text-[12px]">{item.label}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.2em] lg:mt-0">{item.short}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
