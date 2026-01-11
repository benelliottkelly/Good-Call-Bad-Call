import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { label, multiplier, games } = await req.json();

    if (!label) {
      return NextResponse.json(
        { error: "Week label is required" },
        { status: 400 }
      );
    }

    if (games && !Array.isArray(games)) {
      return NextResponse.json(
        { error: "Games must be an array" },
        { status: 400 }
      );
    }

    if (games) {
      for (const g of games) {
        if (!g.teamA || !g.teamB) {
          return NextResponse.json(
            { error: "Each game must have teamA and teamB" },
            { status: 400 }
          );
        }
      }
    }

    // 🔥 Compute next order automatically
    const lastWeek = await prisma.week.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = lastWeek ? lastWeek.order + 1 : 1;

    const week = await prisma.week.create({
      data: {
        label,
        order: nextOrder,
        multiplier: multiplier ?? 1,
        games: games
          ? {
              create: games.map((g: any) => ({
                teamA: g.teamA,
                teamB: g.teamB,
              })),
            }
          : undefined,
      },
      include: { games: true },
    });

    return NextResponse.json(week);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create week" },
      { status: 500 }
    );
  }
}
