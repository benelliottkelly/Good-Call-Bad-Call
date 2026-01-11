// app/api/weeks/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const weeks = await prisma.week.findMany({
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(weeks);
}
