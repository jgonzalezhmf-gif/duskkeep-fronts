import type { Resources, Rewards } from "@/lib/types";

export type ArenaBattleWinner = "ally" | "enemy" | "draw";

export type LocalArenaResultPlan =
  | { ok: false; reason: "Arena ticket required" }
  | {
      ok: true;
      rewards: Rewards;
      source: string;
      shouldSpendTicket: boolean;
      won: boolean;
    };

export function planLocalArenaResult({
  resources,
  winner,
  rewards,
  source,
  ticketAlreadySpent,
}: {
  resources: Resources;
  winner: ArenaBattleWinner;
  rewards: Rewards;
  source: string;
  ticketAlreadySpent?: boolean;
}): LocalArenaResultPlan {
  const shouldSpendTicket = !ticketAlreadySpent;
  if (shouldSpendTicket && resources.arenaTickets <= 0) {
    return { ok: false, reason: "Arena ticket required" };
  }

  return {
    ok: true,
    rewards,
    source,
    shouldSpendTicket,
    won: winner === "ally",
  };
}
