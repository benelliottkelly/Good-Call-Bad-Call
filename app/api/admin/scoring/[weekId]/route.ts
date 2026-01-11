// app/api/admin/scoring/[weekId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { recalculateWeeksScores } from "@/lib/recalculateWeeksScores";

export async function POST(req: NextRequest, context: { params: { weekId: string } }) {
    const token = req.cookies.get("token")?.value;
    const currentUser = token ? verifyToken(token) : null;
    
    if (!currentUser?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const params = await context.params;
    const weekId = Number(params.weekId);
    if (isNaN(weekId)) {
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

    // // Fetch updated week, including multiplier and all picks
    // const week = await prisma.week.findUnique({
    //     where: { id: weekId },
    //     include: {
    //         games: {
    //             include: { picks: true },
    //         },
    //     },
    // });

    // if (!week) return NextResponse.json({ error: "Week not found" }, { status: 404 });

    // const multiplier = week.multiplier;

    // // Aggregate scores per user
    // const userScoresMap: Record<number, number> = {}; // userId => points

    // for (const game of week.games) {
    //     for (const pick of game.picks) {
    //         let points = 0;

    //         // Winner points
    //         if (game.winningTeam && pick.pickedWinner) {
    //             points += pick.pickedWinner === game.winningTeam ? 1 * multiplier : -1 * multiplier;
    //         }

    //         // TD points
    //         if (game.correctTDs !== null && pick.pickedTDs !== null) {
    //             points += pick.pickedTDs === game.correctTDs ? 1 * multiplier : 0;
    //         }

    //         if (!userScoresMap[pick.userId]) userScoresMap[pick.userId] = 0;
    //         userScoresMap[pick.userId] += points;
    //     }
    // }

    // // Upsert scores for each user
    // for (const [userIdStr, points] of Object.entries(userScoresMap)) {
    //     const userId = Number(userIdStr);
    //     await prisma.score.upsert({
    //         where: { userId_weekId: { userId, weekId } },
    //         update: { points },
    //         create: { userId, weekId, points },
    //     });
    // }

    // // ToDO: To here

    return NextResponse.json({ success: true });
}
