"use client";

import { EmberRain, StarfallLayer } from "./SceneBackdropSceneEffects";
import {
  CrystalCluster,
  ForgeOutpost,
  LavaRibbon,
  Moon,
  MoonTempleSteps,
  MountainLayer,
  ObsidianSpire,
  RiverGlow,
  RuinedGate,
  SunOrb,
} from "./SceneBackdropWorldProps";

export function AdventureMoonScene() {
  return (
    <>
      <Moon top="13%" left="71%" size="11rem" />
      <StarfallLayer tone="sky" />
      <RiverGlow tone="rgba(129,198,255,0.2)" />
      <MountainLayer
        className="absolute bottom-[29%] left-[-8%] right-[-8%] h-[34%] opacity-95"
        fill="linear-gradient(180deg,#1b294a 0%,#12203a 54%,#0a1120 100%)"
        points="0,100 8,62 16,58 24,40 32,48 41,31 48,44 56,24 63,38 72,16 81,42 90,28 100,38 100,100"
      />
      <MountainLayer
        className="absolute bottom-[18%] left-[-12%] right-[-12%] h-[32%] opacity-100"
        fill="linear-gradient(180deg,#26365f 0%,#16233d 48%,#09111d 100%)"
        points="0,100 10,54 18,66 28,36 36,52 45,30 53,38 60,20 71,46 79,30 88,44 100,24 100,100"
      />
      <RuinedGate left="19%" bottom="29%" scale={1} />
      <RuinedGate left="69%" bottom="31%" scale={0.8} />
      <MoonTempleSteps />
      <CrystalCluster left="54%" bottom="26%" tone="sky" />
      <CrystalCluster left="33%" bottom="23%" tone="amber" />
    </>
  );
}

export function AdventureAshScene() {
  return (
    <>
      <SunOrb />
      <EmberRain />
      <LavaRibbon />
      <MountainLayer
        className="absolute bottom-[28%] left-[-8%] right-[-8%] h-[36%] opacity-95"
        fill="linear-gradient(180deg,#56362d 0%,#2f2021 54%,#140f19 100%)"
        points="0,100 8,58 18,66 28,36 36,44 46,22 53,36 60,18 69,40 78,30 86,44 100,20 100,100"
      />
      <MountainLayer
        className="absolute bottom-[16%] left-[-12%] right-[-12%] h-[36%]"
        fill="linear-gradient(180deg,#6a4532 0%,#3e2420 52%,#110d17 100%)"
        points="0,100 8,64 14,50 24,60 30,36 40,48 48,22 58,38 66,26 74,46 83,30 92,44 100,32 100,100"
      />
      <ObsidianSpire left="21%" bottom="25%" />
      <ObsidianSpire left="63%" bottom="28%" />
      <ObsidianSpire left="79%" bottom="22%" scale={0.82} />
      <ForgeOutpost />
    </>
  );
}
