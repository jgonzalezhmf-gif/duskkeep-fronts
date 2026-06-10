export const GAME_FIXED_STAGE_ENV_FLAG = "NEXT_PUBLIC_GAME_FIXED_STAGE";

const DISABLED_VALUES = new Set(["0", "false", "off", "disabled", "no"]);

export function isGameFixedStageEnabled(value = process.env.NEXT_PUBLIC_GAME_FIXED_STAGE) {
  if (typeof value !== "string") return true;
  return !DISABLED_VALUES.has(value.trim().toLowerCase());
}
