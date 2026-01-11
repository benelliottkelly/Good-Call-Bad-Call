// app/admin/scoring/page.tsx
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { redirect } from "next/navigation";
import { BetResult, Week } from "@/app/components/WeekBoard/types";
import AdminScoringForm from "@/app/components/AdminScoringForm";

export default async function AdminScoringPage() {
    // Get current user
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const currentUser = token ? verifyToken(token) : null;

    if (!currentUser?.isAdmin) {
        // Redirect non-admins
        return redirect("/weekboard");
    }

    // Fetch all weeks and their games
    const weeks = await prisma.week.findMany({
        orderBy: { order: "asc" },
        include: {
            games: {
                include: { picks: true, sideBets: true },
                orderBy: { id: "asc" },
            },
            scores: true,
        },
    });

    // ---------------- Format weeks for WeekBoard ----------------
    const weeksFormatted: Week[] = weeks.map((w) => ({
        id: w.id,
        label: w.label,
        order: w.order,
        multiplier: w.multiplier,
        scores: w.scores?.map((s) => ({
            userId: s.userId,
            points: s.points,
        })) ?? [],
        games: w.games?.map((g) => ({
            id: g.id,
            teamA: g.teamA,
            teamB: g.teamB,
            winningTeam: g.winningTeam ?? null,
            correctTDs: g.correctTDs ?? null,
            picks: g.picks?.map((p) => ({
                id: p.id,
                userId: p.userId,
                gameId: p.gameId,
                pickedWinner: p.pickedWinner ?? null,
                pickedTDs: p.pickedTDs ?? null,
            })) ?? [],
            sideBets: g.sideBets?.map((sb) => ({
                id: sb.id,
                userId: sb.userId,
                gameId: sb.gameId,
                description: sb.description,
                odds: sb.odds,
                result: sb.result as BetResult,
                createdAt: sb.createdAt.toISOString(),
            })) ?? [],
        })) ?? [],
    }));


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin - Score Management</h1>
            {weeksFormatted.map((week) => (
                <div key={week.id} className="mb-8 border-b pb-4">
                    <h2 className="text-xl font-semibold mb-2">{week.label}</h2>
                    <AdminScoringForm week={week} />
                </div>
            ))}
        </div>
    );
}
