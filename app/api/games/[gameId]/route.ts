// app/api/games/[gameId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { gameId: string } }) {
  const gameId = Number(params.gameId);
  if (isNaN(gameId)) return NextResponse.json({ error: 'Invalid gameId' }, { status: 400 });

  const { teamA, teamB } = await req.json();
  if (!teamA || !teamB) return NextResponse.json({ error: 'Missing team names' }, { status: 400 });

  const updated = await prisma.game.update({
    where: { id: gameId },
    data: { teamA, teamB },
  });

  return NextResponse.json(updated);
}