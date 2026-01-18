// app/api/weeks/[weekId]/games/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const weekId = Number((await params).weekId);
  if (isNaN(weekId)) {
    return NextResponse.json({ error: "Invalid weekId" }, { status: 400 });
  }

  // Fetch all games for this week (minimal fields)
  const games = await prisma.game.findMany({
    where: { weekId },
    orderBy: { id: "asc" },
    select: {
      id: true,
      teamA: true,
      teamB: true,
      winningTeam: true,
      correctTDs: true,
    },
  });

  const gameIds = games.map((g) => g.id);

  // Fetch all picks for these games (only fields needed)
  const picks = await prisma.pick.findMany({
    where: { gameId: { in: gameIds } },
    select: {
      id: true,
      gameId: true,
      userId: true,
      pickedWinner: true,
      pickedTDs: true,
      user: { select: { id: true, username: true, isAdmin: true } },
    },
  });

  // Fetch all sideBets for these games
  const sideBets = await prisma.sideBet.findMany({
    where: { gameId: { in: gameIds } },
    select: {
      id: true,
      gameId: true,
      userId: true,
      description: true,
      odds: true,
      result: true,
      user: { select: { id: true, username: true, isAdmin: true } },
    },
  });

  // Fetch scores for this week
  const scores = await prisma.score.findMany({
    where: { weekId },
    select: { userId: true, points: true },
  });

  // Combine picks and sideBets into games
  const gameMap = games.map((game) => {
    return {
      ...game,
      picks: picks.filter((p) => p.gameId === game.id),
      sideBets: sideBets.filter((sb) => sb.gameId === game.id),
      scores,
    };
  });

  return NextResponse.json(gameMap);
}
