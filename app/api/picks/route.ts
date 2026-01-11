import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, gameId, pickedWinner, pickedTDs } = body;

        // Validate required fields
        if (userId == null || gameId == null) {
            return NextResponse.json(
                { error: "Missing required fields: userId or gameId" },
                { status: 400 }
            );
        }

        // Convert empty string or undefined pickedTDs to null
        const tdValue = pickedTDs === "" || pickedTDs == null ? null : Number(pickedTDs);

        // Upsert pick: ensures only one pick per user per game
        const pick = await prisma.pick.upsert({
            where: {
                userId_gameId: { userId, gameId },
            },
            create: {
                pickedWinner: pickedWinner ?? null,
                pickedTDs: pickedTDs ?? null,
                user: { connect: { id: userId } },
                game: { connect: { id: gameId } },
            },
            update: {
                pickedWinner: pickedWinner ?? null,
                pickedTDs: pickedTDs ?? null,
            },
        });
        return NextResponse.json(pick);
    } catch (error) {
        console.error("Error submitting pick:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return NextResponse.json(
            { error: "Failed to submit pick" },
            { status: 500 }
        );
    }
}
