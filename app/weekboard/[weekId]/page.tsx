import { prisma } from "@/lib/prisma";
import WeekBoard from "@/app/components/WeekBoard";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { redirect } from "next/navigation";
import { Week, User, BetResult } from "@/app/components/WeekBoard/types";

export default async function WeekBoardPage({ params: rawParams }: { params: any }) {
  const params = await rawParams;
  const weekIdNum = Number(params.weekId);

  // ---------------- Fetch weeks ----------------
  const weeks = await prisma.week.findMany({
    orderBy: { order: "asc" },
    include: {
      games: {
        include: { picks: true, sideBets: true },
        orderBy: { id: "asc" },
      },
      scores: true,
    },
  });

  if (weeks.length === 0) {
    return (
      <div className="p-6 text-center text-gray-800 dark:text-gray-200">
        <h1 className="text-2xl font-bold mb-4">No weeks created yet</h1>
        <p>Please check back once an admin has created a week.</p>
      </div>
    );
  }

  // ---------------- Validate weekId ----------------
  const weekExists = weeks.find((w) => w.id === weekIdNum);
  const activeWeekId = weekExists ? weekIdNum : weeks[weeks.length - 1].id;
  if (!weekExists) return redirect(`/weekboard/${activeWeekId}`);

  // ---------------- Current user ----------------
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let currentUser: User | null = null;

  if (token) {
    const payload = verifyToken(token);
    if (payload?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, isAdmin: true },
      });
      if (user) {
        // Map id → userId for client consistency
        currentUser = {
          userId: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        } as User;
      }
    }
  }

  // ---------------- Fetch all users ----------------
  const users = await prisma.user.findMany({
    select: { id: true, username: true, isAdmin: true },
  });

  // ---------------- Format weeks for WeekBoard ----------------
  const weeksFormatted: Week[] = weeks.map((w) => ({
    id: w.id,
    label: w.label,
    order: w.order,
    multiplier: w.multiplier,
    scores: w.scores?.map((s) => ({
      userId: s.userId,
      points: s.points,
    })) ?? [],
    games: w.games?.map((g) => ({
      id: g.id,
      teamA: g.teamA,
      teamB: g.teamB,
      winningTeam: g.winningTeam ?? null,
      correctTDs: g.correctTDs ?? null,
      picks: g.picks?.map((p) => ({
        id: p.id,
        userId: p.userId,
        gameId: p.gameId,
        pickedWinner: p.pickedWinner ?? null,
        pickedTDs: p.pickedTDs ?? null,
      })) ?? [],
      sideBets: g.sideBets?.map((sb) => ({
        id: sb.id,
        userId: sb.userId,
        gameId: sb.gameId,
        description: sb.description,
        odds: sb.odds,
        result: sb.result as BetResult,
        createdAt: sb.createdAt.toISOString(),
      })) ?? [],
    })) ?? [],
  }));


  // ---------------- Render ----------------
  return (
    <WeekBoard
      weeks={weeksFormatted}
      users={users}
      currentUser={currentUser}
      activeWeekId={activeWeekId}
    />
  );
}
