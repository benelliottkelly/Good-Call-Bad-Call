// app/api/sidebets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { userId, gameId, description, odds } = await req.json();
  if (!userId || !gameId || !description || odds == null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const sideBet = await prisma.sideBet.create({
    data: { userId, gameId, description, odds },
  });

  return NextResponse.json(sideBet);
}
