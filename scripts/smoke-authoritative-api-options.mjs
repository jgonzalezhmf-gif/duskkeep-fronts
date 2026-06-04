const SUPPORTED_AUTH_MODES = new Set(["password", "anonymous"]);

export function parseSmokeAuthoritativeApiArgs(rawArgs) {
  const parsed = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) continue;

    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      parsed[key] = inlineValue;
      continue;
    }

    const nextValue = rawArgs[index + 1];
    if (!nextValue || nextValue.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = nextValue;
    index += 1;
  }

  return parsed;
}

export function resolveSmokeAuthMode(args) {
  if (args.anonymous === true || args.anonymous === "true") return "anonymous";

  const mode = args.auth ?? "password";
  if (!SUPPORTED_AUTH_MODES.has(mode)) {
    throw new Error(`Unsupported authoritative smoke auth mode: ${mode}`);
  }

  return mode;
}

export function buildSmokeAdventureBattleRequest({ idempotencyKey, battleSeed }) {
  return {
    operationType: "claimAdventureBattleResult",
    idempotencyKey,
    payload: {
      nodeId: "c1l1",
      battleSeed,
      winner: "ally",
      turns: 6,
      battleSummary: {
        round: 6,
        winner: "ally",
        allyCoreHp: 12,
        enemyCoreHp: 0,
        lanes: [],
      },
    },
  };
}
