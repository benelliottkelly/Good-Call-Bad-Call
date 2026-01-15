// app/api/sidebets/[id]/result/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalculateWeeksScores } from '@/lib/recalculateWeeksScores';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sideBetId = Number(id);

  if (isNaN(sideBetId)) {
    return NextResponse.json({ error: "Invalid sideBet ID" }, { status: 400 });
  }

  const { result } = await req.json(); // result: 'CORRECT' | 'INCORRECT' | 'UNMARKED'

  // Update the sideBet
  const updatedSideBet = await prisma.sideBet.update({
    where: { id: sideBetId },
    data: { result },
  });

  // Recalculate scores for the week this sideBet belongs to
  const game = await prisma.game.findUnique({
    where: { id: updatedSideBet.gameId },
    select: { weekId: true },
  });

  if (!game) {
    return NextResponse.json({ error: "Game not found for this sideBet" }, { status: 404 });
  }

  await recalculateWeeksScores(String(game.weekId));

  // Fetch the updated week scores to send back
  const scores = await prisma.score.findMany({
    where: { weekId: game.weekId },
    select: { userId: true, points: true },
  });

  // Return only what the front end needs: updated sideBet + updated scores
  return NextResponse.json({ updated: updatedSideBet, scores: scores });
}
