import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leaderboard = await prisma.score.groupBy({
    by: ["userId"],
    _sum: {
      points: true,
    },
    orderBy: {
      _sum: {
        points: "desc",
      },
    },
  });

  // Attach usernames
  const users = await prisma.user.findMany({
    where: {
      id: { in: leaderboard.map((l) => l.userId) },
    },
    select: {
      id: true,
      username: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.id, u.username]));

  const result = leaderboard.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    username: userMap.get(row.userId) ?? "Unknown",
    totalPoints: row._sum.points ?? 0,
  }));

  return NextResponse.json(result);
}
