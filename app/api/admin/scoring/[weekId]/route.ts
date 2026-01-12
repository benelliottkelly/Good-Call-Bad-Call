// app/api/admin/scoring/[weekId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { recalculateWeeksScores } from "@/lib/recalculateWeeksScores";

export async function POST(req: NextRequest, { params }: { params: Promise<{ weekId: string }> }) {
    const token = req.cookies.get("token")?.value;
    const currentUser = token ? verifyToken(token) : null;
    
    if (!currentUser?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const { weekId } = await params

    if (isNaN(Number(weekId))) {
        return NextResponse.json({ error: "Invalid weekId" }, { status: 400 });
    }
    const { games } = await req.json();

    // Update each game's winner and TDs
    for (const game of games) {
        await prisma.game.update({
            where: { id: game.id },
            data: {
                winningTeam: game.winningTeam,
                correctTDs: game.correctTDs,
            },
        });
    }

    await recalculateWeeksScores(weekId);

    return NextResponse.json({ success: true });
}
