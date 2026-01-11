// app/components/WeekBoard/types.ts
export interface User {
  userId: number;
  username: string;
  isAdmin: boolean;
}

export interface Pick {
  id: number;
  userId: number;
  gameId: number;
  pickedWinner: string | null;
  pickedTDs: number | null;
}

export type BetResult = "UNMARKED" | "CORRECT" | "INCORRECT";

export interface SideBet {
  id: number;
  userId: number;
  gameId: number;
  description: string;
  odds: number;
  result: BetResult;
  createdAt: string; // serialized
}

export interface Game {
  id: number;
  teamA: string;
  teamB: string;
  picks: Pick[];
  sideBets: SideBet[];
  winningTeam: string | null;
  correctTDs: number | null;
}

export interface Score {
  userId: number;
  points: number;
}

export interface Week {
  id: number;
  label: string;
  order: number;
  multiplier: number;
  games: Game[];
  scores: Score[];
}
