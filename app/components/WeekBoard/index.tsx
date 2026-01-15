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
        <div className="overflow-x-auto p-2">
            {/* Week Navigation + Odds Toggle */}
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-2 py-2">
                <div className="flex items-center justify-between gap-2">

                    {/* Navigation */}
                    <div className="flex-[2_1_0] flex items-center justify-center min-w-0 gap-1">
                        {/* Left arrow */}
                        <button
                            disabled={weekIndex === 0}
                            onClick={() => setWeekIndex((i) => i - 1)}
                            className="flex-shrink-0 px-1 sm:px-2 py-1 border rounded text-xs sm:text-sm md:text-base"
                        >
                            <span className="mr-1">←</span>
                            <span className="hidden sm:inline">Previous Week</span>
                        </button>

                        {/* Week Label */}
                        <h2 className="mx-2 text-center font-bold text-xs sm:text-sm md:text-base whitespace-normal break-words px-1">
                            {week.label}
                        </h2>

                        {/* Right arrow */}
                        <button
                            disabled={weekIndex === weekData.length - 1}
                            onClick={() => setWeekIndex((i) => i + 1)}
                            className="flex-shrink-0 px-1 sm:px-2 py-1 border rounded text-xs sm:text-sm md:text-base"
                        >
                            <span className="hidden sm:inline">Next Week</span>
                            <span className="ml-1">→</span>
                        </button>
                    </div>

                    {/* Multiplier */}
                    <div className="flex-[1_1_0] text-center text-xs sm:text-sm md:text-base break-words min-w-0 px-1">
                        {/* Small screens */}
                        <span className="sm:hidden">Multiplier: x{week.multiplier}</span>

                        {/* Medium and up */}
                        <span className="hidden sm:inline">This Week's Multiplier: x{week.multiplier}</span>
                    </div>

                    {/* Odds Toggle */}
                    <div className="justify-end flex-[1_1_0] flex flex-wrap items-center gap-1 text-xs sm:text-sm md:text-base min-w-0 px-1">
                        <label className="whitespace-nowrap">Odds Type:</label>
                        <select
                            value={oddsFormat}
                            onChange={(e) => setOddsFormat(e.target.value as OddsFormat)}
                            className="border p-1 rounded text-xs sm:text-sm md:text-base"
                        >
                            <option value="AMERICAN">American</option>
                            <option value="FRACTIONAL">Fractional</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Week Table */}
            <div className="max-h-[80vh] overflow-y-auto overflow-x-auto mt-2">
                <table className="table-auto border-collapse border w-full min-w-[700px]">
                    <colgroup>
                        <col style={{ minWidth: "150px" }} />
                        {orderedUsers.map((u) => (
                            <col key={u.userId} className="min-w-[120px] sm:min-w-[140px]" />
                        ))}
                    </colgroup>

                    <thead>
                        <tr>
                            {/* Game Column */}
                            <th className="sticky top-0 z-20 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2">
                                Game
                            </th>

                            {/* User Columns */}
                            {orderedUsers.map((u) => (
                                <th
                                    key={u.userId}
                                    style={{
                                        width: u.userId === currentUser?.userId ? "300px" : "200px",
                                    }}
                                    className="sticky top-0 z-20 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 text-center break-words"
                                >
                                    {u.username} ({u.weeklyScore})
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {week.games.map((game) => (
                            <tr key={game.id}>
                                {/* Game Column */}
                                <td className="border p-2 align-top">
                                    <strong>{game.teamA}</strong> vs <strong>{game.teamB}</strong>
                                </td>

                                {/* User Columns */}
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
        </div>
    );
}
