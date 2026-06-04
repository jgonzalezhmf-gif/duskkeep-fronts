export type SmokeAuthoritativeApiAuthMode = "password" | "anonymous";

export type SmokeAuthoritativeApiArgs = {
  [key: string]: string | true | undefined;
  anonymous?: string | true;
  auth?: SmokeAuthoritativeApiAuthMode | string;
};

export type SmokeAdventureBattleRequest = {
  operationType: "claimAdventureBattleResult";
  idempotencyKey: string;
  payload: {
    nodeId: "c1l1";
    battleSeed: number;
    winner: "ally";
    turns: 6;
    battleSummary: {
      round: 6;
      winner: "ally";
      allyCoreHp: 12;
      enemyCoreHp: 0;
      lanes: [];
    };
  };
};

export function parseSmokeAuthoritativeApiArgs(rawArgs: string[]): SmokeAuthoritativeApiArgs;

export function resolveSmokeAuthMode(args: SmokeAuthoritativeApiArgs): SmokeAuthoritativeApiAuthMode;

export function buildSmokeAdventureBattleRequest(input: {
  idempotencyKey: string;
  battleSeed: number;
}): SmokeAdventureBattleRequest;
