import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ weekId: string; gameId: string }> }
) {

  const { weekId, gameId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { winner, totalTDs } = await req.json();

  if (!winner || totalTDs == null) {
    return NextResponse.json(
      { error: "Winner and totalTDs are required" },
      { status: 400 }
    );
  }

  try {
    // Update official result
    const updatedGame = await prisma.game.update({
      where: { id: Number(gameId) },
      data: { winner, totalTDs },
      include: { picks: true, sideBets: true },
    });

    // Optional: calculate pick correctness and scores
    for (const pick of updatedGame.picks) {
      let points = 0;
      if (pick.pickedWinner === winner) points += 1;
      if (pick.pickedTDs === totalTDs) points += 1;

      // Upsert score for the week
      await prisma.score.upsert({
        where: { userId_weekId: { userId: pick.userId, weekId: updatedGame.weekId } },
        update: { points: { increment: points } },
        create: { userId: pick.userId, weekId: updatedGame.weekId, points },
      });
    }

    return NextResponse.json(updatedGame);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update game" }, { status: 500 });
  }
}
