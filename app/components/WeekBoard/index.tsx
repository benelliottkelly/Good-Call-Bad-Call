"use client";

import { useState } from "react";
import WeekRow from "./WeekRow";
import { Week, User, Pick, SideBet, BetResult } from "./types";
import { OddsFormat } from "./utils";

interface WeekBoardProps {
    weeks: Week[];
    users: { id: number; username: string; isAdmin: boolean }[];
    currentUser: User | null;
    activeWeekId: number;
}

export default function WeekBoard({
    weeks,
    users,
    currentUser,
    activeWeekId,
}: WeekBoardProps) {
    const initialIndex = weeks.findIndex((w) => w.id === activeWeekId) ?? 0;
    const [weekIndex, setWeekIndex] = useState(initialIndex);
    const [weekData, setWeekData] = useState(weeks);
    const [oddsFormat, setOddsFormat] = useState<OddsFormat>("FRACTIONAL");

    const week = weekData[weekIndex];
    if (!week) return <div>No weeks available yet.</div>;

    const isAdmin = currentUser?.isAdmin ?? false;

    // Order users: current user first
    const orderedUsers = currentUser
        ? [
            {
                userId: currentUser.userId,
                username: currentUser.username,
                isAdmin: currentUser.isAdmin,
                weeklyScore:
                    week.scores?.find((s) => s.userId === currentUser.userId)?.points ?? 0,
            },
            ...users
                .filter((u) => u.id !== currentUser.userId)
                .map((u) => ({
                    userId: u.id,
                    username: u.username,
                    isAdmin: u.isAdmin,
                    weeklyScore: week.scores?.find((s) => s.userId === u.id)?.points ?? 0,
                })),
        ]
        : users.map((u) => ({
            userId: u.id,
            username: u.username,
            isAdmin: u.isAdmin,
            weeklyScore: week.scores?.find((s) => s.userId === u.id)?.points ?? 0,
        }));

    // ---------------- Pick Change ----------------
    const handlePickChange = async (
        gameId: number,
        userId: number,
        pickedWinner: string | null,
        pickedTDs: number | null
    ) => {
        if (!currentUser) return;
        if (!isAdmin && currentUser.userId !== userId) return;

        const res = await fetch("/api/picks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId, userId, pickedWinner, pickedTDs }),
        });

        if (!res.ok) return;
        const updatedPick: Pick = await res.json();

        setWeekData((prev) =>
            prev.map((w) =>
                w.id !== week.id
                    ? w
                    : {
                        ...w,
                        games: w.games.map((g) =>
                            g.id !== gameId
                                ? g
                                : {
                                    ...g,
                                    picks: [
                                        ...g.picks.filter((p) => p.userId !== userId),
                                        updatedPick,
                                    ],
                                }
                        ),
                    }
            )
        );
    };

    // ---------------- Add Side Bet ----------------
    const handleAddSideBet = async (
        gameId: number,
        userId: number,
        description: string,
        odds: number
    ) => {
        if (!currentUser) return;
        if (!isAdmin && currentUser.userId !== userId) return;

        const clampedOdds = Math.max(odds, 2.0);

        const res = await fetch("/api/sidebets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId, userId, description, odds: clampedOdds }),
        });

        if (!res.ok) return;
        const newSideBet: SideBet = await res.json();

        setWeekData((prev) =>
            prev.map((w) =>
                w.id !== week.id
                    ? w
                    : {
                        ...w,
                        games: w.games.map((g) =>
                            g.id !== gameId
                                ? g
                                : { ...g, sideBets: [...g.sideBets, newSideBet] }
                        ),
                    }
            )
        );
    };

    // ---------------- Mark Side Bet Result ----------------
    const handleChangeSideBetResult = async (sideBetId: number, result: BetResult) => {
        if (!isAdmin) return;

        const res = await fetch(`/api/sidebets/${sideBetId}/result`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ result }),
        });
        if (!res.ok) return;
        const { updated, scores } = await res.json();
        setWeekData((prev) =>
            prev.map((w) =>
                w.id !== week.id
                    ? w
                    : {
                        ...w,
                        scores,
                        games: w.games.map((g) => ({
                            ...g,
                            sideBets: (g.sideBets ?? [])
                                .filter(Boolean) // remove any stray undefineds
                                .map((sb) => (sb.id === sideBetId ? updated : sb)),
                        })),
                    }
            )
        );
    };

    // ---------------- Update Side Bet ----------------
    const handleUpdateSideBet = async (
        sideBetId: number,
        description: string,
        odds: number
    ) => {

        if (!isAdmin) return;

        const clampedOdds = Math.max(odds, 2.0);

        const res = await fetch(`/api/admin/sidebet/${sideBetId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description, odds: clampedOdds }),
        });
        if (!res.ok) return;
        const { updated, scores } = await res.json();

        setWeekData((prev) =>
            prev.map((w) =>
                w.id !== week.id
                    ? w
                    : {
                        ...w,
                        scores,
                        games: w.games.map((g) => ({
                            ...g,
                            sideBets: (g.sideBets ?? [])
                                .filter(Boolean) // remove any stray undefineds
                                .map((sb) => (sb.id === sideBetId ? updated : sb)),
                        })),
                    }
            )
        );
    };

    return (
        <div className="overflow-x-auto p-4">
            {/* Week Navigation + Odds Toggle */}
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 z-20 p-2 border-b">
                <div className="flex items-center gap-4">
                    <button
                        disabled={weekIndex === 0}
                        onClick={() => setWeekIndex((i) => i - 1)}
                        className="px-2 py-1 border rounded"
                    >
                        ← Previous
                    </button>
                    <h2 className="text-xl font-bold">{week.label}</h2>
                    <button
                        disabled={weekIndex === weekData.length - 1}
                        onClick={() => setWeekIndex((i) => i + 1)}
                        className="px-2 py-1 border rounded"
                    >
                        Next →
                    </button>
                </div>
                <div>
                    <label className="mr-3 font-semibold">This Weeks' Multiplier: x{week.multiplier}</label>
                </div>
                <div>
                    <label className="mr-2 font-semibold">Odds Type:</label>
                    <select
                        value={oddsFormat}
                        onChange={(e) => setOddsFormat(e.target.value as OddsFormat)}
                        className="border p-1 rounded"
                    >
                        <option value="AMERICAN">American</option>
                        <option value="FRACTIONAL">Fractional</option>
                    </select>
                </div>
            </div>

            {/* Week Table */}
            <table className="table-auto border-collapse border w-full">
                <thead className="sticky top-12 z-10 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <tr>
                        <th className="border p-2">Game</th>
                        {orderedUsers.map((u) => (
                            <th key={u.userId} className="border p-2">
                                {u.username} ({u.weeklyScore})
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {week.games.map((game) => (
                        <tr key={game.id}>
                            <td className="border p-2 align-top">
                                <strong>{game.teamA}</strong> vs <strong>{game.teamB}</strong>
                            </td>

                            {orderedUsers.map((u) => (
                                <WeekRow
                                    key={u.userId}
                                    game={game}
                                    user={u}
                                    currentUserId={currentUser?.userId ?? 0}
                                    isAdmin={isAdmin}
                                    oddsFormat={oddsFormat}
                                    onPickChange={handlePickChange}
                                    onAddSideBet={handleAddSideBet}
                                    onSetSideBetResult={handleChangeSideBetResult}
                                    onUpdateSideBet={handleUpdateSideBet}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
