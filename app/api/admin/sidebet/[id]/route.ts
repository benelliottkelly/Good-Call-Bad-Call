import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { recalculateWeeksScores } from "@/lib/recalculateWeeksScores";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const sideBetId = Number((await params).id);

    if (!sideBetId) {
        return NextResponse.json(
            { error: "Invalid side bet ID" },
            { status: 400 }
        );
    }

    // Auth check (admin only)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user || !user.isAdmin) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { description, odds } = await req.json();

    // Validation
    if (typeof description !== "string" || description.trim() === "") {
        return NextResponse.json(
            { error: "Description is required" },
            { status: 400 }
        );
    }

    try {
        const updatedSideBet = await prisma.sideBet.update({
            where: { id: sideBetId },
            data: {
                description: description.trim(),
                odds
            },
            include: {
                game: {
                    select: { weekId: true }
                }
            }
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

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to update side bet" },
            { status: 500 }
        );
    }
}
