import { cn } from "@/lib/cn";

export function laneSurfaceClass(tone: "ally" | "enemy" | "neutral", active: boolean, focused: boolean) {
  if (active) {
    return "border border-[#f5d498]/5 bg-[radial-gradient(circle_at_50%_46%,rgba(245,196,81,0.08),transparent_48%),linear-gradient(180deg,rgba(111,83,37,0.08),rgba(24,18,13,0.2))] shadow-[0_0_24px_rgba(245,196,81,0.08),inset_0_1px_0_rgba(245,212,152,0.025)] backdrop-blur-[1px]";
  }
  if (tone === "ally") {
    return cn(
      "border border-[#f5d498]/5 bg-[radial-gradient(circle_at_50%_50%,rgba(101,210,200,0.045),transparent_57%),linear-gradient(180deg,rgba(53,128,112,0.05),rgba(8,15,15,0.2))] shadow-[inset_0_1px_0_rgba(245,212,152,0.02)] backdrop-blur-[1px]",
      focused && "shadow-[0_0_20px_rgba(94,197,142,0.08),inset_0_1px_0_rgba(245,212,152,0.035)]",
    );
  }
  if (tone === "enemy") {
    return cn(
      "border border-[#f5d498]/5 bg-[radial-gradient(circle_at_50%_50%,rgba(240,95,114,0.045),transparent_57%),linear-gradient(180deg,rgba(121,49,58,0.05),rgba(17,10,14,0.2))] shadow-[inset_0_1px_0_rgba(245,212,152,0.02)] backdrop-blur-[1px]",
      focused && "shadow-[0_0_20px_rgba(214,96,104,0.08),inset_0_1px_0_rgba(245,212,152,0.035)]",
    );
  }
  return cn(
    "border border-[#f5d498]/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,236,185,0.022),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.008),rgba(7,9,12,0.2))] shadow-[inset_0_1px_0_rgba(245,212,152,0.02)] backdrop-blur-[1px]",
    focused && "shadow-[0_0_20px_rgba(245,212,152,0.045),inset_0_1px_0_rgba(245,212,152,0.035)]",
  );
}

export function cardSurfaceClass(tone: string, selected: boolean, playable: boolean) {
  const selectedGlow = selected
    ? "-translate-y-1 ring-2 ring-[#f5c451]/34 shadow-[0_0_40px_rgba(245,196,81,0.24),0_22px_48px_rgba(0,0,0,0.42)]"
    : "";
  const base = playable ? "" : "border border-white/10 bg-[linear-gradient(180deg,rgba(45,45,48,0.86),rgba(15,15,18,0.92))] text-white/60";
  if (!playable) return cn(base, selectedGlow);
  if (tone === "rare") {
    return cn("border border-sky-300/60 bg-[radial-gradient(circle_at_72%_30%,rgba(160,222,255,0.2),transparent_35%),linear-gradient(180deg,rgba(40,93,126,0.94),rgba(8,18,30,0.98))] text-sky-100 ring-1 ring-sky-200/22", selectedGlow);
  }
  if (tone === "epic") {
    return cn("border border-violet-300/62 bg-[radial-gradient(circle_at_72%_30%,rgba(210,158,255,0.22),transparent_35%),linear-gradient(180deg,rgba(88,54,128,0.94),rgba(24,12,40,0.98))] text-violet-100 ring-1 ring-violet-200/24", selectedGlow);
  }
  if (tone === "legendary") {
    return cn("border border-[#ffe48a]/74 bg-[radial-gradient(circle_at_70%_26%,rgba(255,232,141,0.3),transparent_35%),linear-gradient(180deg,rgba(178,123,43,0.96),rgba(42,24,8,0.99))] text-[#fff0bd] ring-1 ring-[#ffe48a]/34", selectedGlow);
  }
  return cn("border border-[#b98255]/60 bg-[radial-gradient(circle_at_72%_30%,rgba(255,188,127,0.18),transparent_35%),linear-gradient(180deg,rgba(107,70,48,0.94),rgba(28,17,12,0.98))] text-orange-100 ring-1 ring-orange-200/16", selectedGlow);
}
