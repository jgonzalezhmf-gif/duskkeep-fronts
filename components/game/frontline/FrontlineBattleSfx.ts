import { FRONTLINE_CARD_BY_ID } from "@/features/frontline/data";
import type { FrontlineEvent } from "@/features/frontline/types";
import { sfx } from "@/lib/audio";
import type { FrontlineDeathGhostState, FrontlineVisualTone } from "./FrontlineBattleFxState";

export function playFrontlineCardSfx(cardId: string, tone: FrontlineVisualTone) {
  if (cardId.startsWith("leader:")) {
    sfx.leaderPower();
  } else {
    const card = FRONTLINE_CARD_BY_ID[cardId];
    if (card?.kind === "order") sfx.cardOrder();
    else if (card?.kind === "tactic") sfx.cardTactic();
    else if (card?.kind === "summon") sfx.cardSummon();
    else sfx.ability();
  }
  if (tone === "heal") window.setTimeout(() => sfx.heal(), 260);
  if (tone === "shield") window.setTimeout(() => sfx.shield(), 260);
  if (tone === "breach") window.setTimeout(() => sfx.breach(), 320);
  if (tone === "summon") window.setTimeout(() => sfx.summon(), 260);
}

const FEMALE_HERO_IDS = new Set(["kara", "mira", "tovi", "lyria", "fenra"]);

function playDeathVoiceForGhost(ghost: FrontlineDeathGhostState | undefined) {
  if (!ghost) {
    sfx.death();
    return;
  }
  if (ghost.targetSide !== "ally") {
    sfx.deathMonster();
    return;
  }
  if (FEMALE_HERO_IDS.has(ghost.actor.heroId)) {
    sfx.deathHumanFemale();
    return;
  }
  sfx.deathHumanMale();
}

export function playFrontlineResolutionSfx(event: FrontlineEvent, ghosts: FrontlineDeathGhostState[]) {
  if (event.kind === "damage" || event.kind === "stun") {
    sfx.attack();
    window.setTimeout(() => sfx.hit(), 420);
    return;
  }
  if (event.kind === "ko") {
    sfx.hit();
    const ghost = ghosts.find((entry) => entry.eventId === event.id);
    window.setTimeout(() => playDeathVoiceForGhost(ghost), 360);
    return;
  }
  if (event.kind === "breach") {
    sfx.coreDamage();
    return;
  }
  if (event.kind === "heal") {
    sfx.heal();
    return;
  }
  if (event.kind === "shield") {
    sfx.shield();
    return;
  }
  if (event.kind === "summon") {
    sfx.summon();
    return;
  }
  if (event.kind === "power") {
    sfx.leaderPower();
    return;
  }
  if (event.kind === "boss_signature" && event.signature === "cast") {
    sfx.coreDamage();
    window.setTimeout(() => sfx.breach(), 220);
  }
}
