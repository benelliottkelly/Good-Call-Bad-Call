import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { recalculateWeeksScores } from "@/lib/recalculateWeeksScores";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const currentUser = token ? verifyToken(token) : null;

  if (!currentUser?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { sideBetId, result } = await req.json();

  const sideBet = await prisma.sideBet.update({
    where: { id: sideBetId },
    data: { result },
    include: {
      game: {
        include: {
          week: true,
        },
      },
    },
  });

  await recalculateWeeksScores(String(sideBet.game.weekId));

  return NextResponse.json({ success: true });
}
