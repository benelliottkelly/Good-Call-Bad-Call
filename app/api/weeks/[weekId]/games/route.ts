// app/api/weeks/[weekId]/games/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { weekId: string } }
) {
  const weekId = Number(params.weekId);
  if (isNaN(weekId)) {
    return NextResponse.json({ error: 'Invalid weekId' }, { status: 400 });
  }

  const games = await prisma.game.findMany({
    where: { weekId },
    orderBy: { id: 'asc' },
    include: {
      picks: { include: { user: true } },
      sideBets: { include: { user: true } },
    },
  });

  return NextResponse.json(games);
}
