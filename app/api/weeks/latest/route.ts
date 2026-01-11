// app/api/weeks/latest/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const latestWeek = await prisma.week.findFirst({
    orderBy: { order: "desc" },
  });

  if (!latestWeek)
    return NextResponse.json({ error: "No weeks found" }, { status: 404 });

  return NextResponse.json(latestWeek);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch latest week" }, { status: 500 });
  }
}
