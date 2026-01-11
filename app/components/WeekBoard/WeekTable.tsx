"use client";

import WeekRow from "./WeekRow";
import { OddsFormat } from "./utils";
import { Week, User, BetResult } from "./types";

interface WeekTableProps {
    weekData: Week[];
    // setWeekData: any;
    weekIndex: number;
    setWeekData: React.Dispatch<React.SetStateAction<Week[]>>;
    setWeekIndex: React.Dispatch<React.SetStateAction<number>>;
    // setWeekIndex: any;
    users: User[];
    currentUser: User | null;
    oddsFormat: OddsFormat;
    setOddsFormat: any;
    handlePickChange: (
        gameId: number,
        userId: number,
        pickedWinner: string | null,
        pickedTDs: number | null
    ) => void;
    handleAddSideBet: (
        gameId: number,
        userId: number,
        description: string,
        odds: number
    ) => void;
}

export default function WeekTable({
    weekData,
    setWeekData,
    weekIndex,
    setWeekIndex,
    users,
    currentUser,
    oddsFormat,
    setOddsFormat,
    handlePickChange,
    handleAddSideBet,
}: WeekTableProps) {
    const week = weekData[weekIndex];
    if (!week) return <div>No weeks available</div>;
    const isAdmin = currentUser?.isAdmin ?? false;

    // ---------------- Order users with currentUser first ----------------
    const orderedUsers = currentUser
        ? [
            {
                userId: currentUser.userId,
                username: currentUser.username,
                isAdmin: currentUser.isAdmin,
                weeklyScore:
                    week.scores.find((s) => s.userId === currentUser.userId)?.points ??
                    0,
            },
            ...users
                .filter((u) => u.userId !== currentUser.userId)
                .map((u) => ({
                    userId: u.userId,
                    username: u.username,
                    isAdmin: u.isAdmin,
                    weeklyScore: week.scores.find((s) => s.userId === u.userId)?.points ??
                        0,
                })),
        ]
        : users.map((u) => ({
            userId: u.userId,
            username: u.username,
            isAdmin: u.isAdmin,
            weeklyScore: week.scores.find((s) => s.userId === u.userId)?.points ?? 0,
        }));

    const handleUpdateSideBet = async (
        sideBetId: number,
        result: BetResult
    ) => {
        // Optimistic update
        setWeekData((prev: any[]) =>
            prev.map((w) =>
                w.id !== week.id
                    ? w
                    : {
                        ...w,
                        games: w.games.map((g: { sideBets: any[]; }) => ({
                            ...g,
                            sideBets: g.sideBets.map((sb) =>
                                sb.id === sideBetId ? { ...sb, result } : sb
                            ),
                        })),
                    }
            )
        );

        console.log({ sideBetId, result });

        // Persist to server
        await fetch("/api/admin/sidebet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sideBetId, result }),
        });

        // Refresh scores + week data
        await refetchWeek();
    };

    const refetchWeek = async () => {
        const res = await fetch(`/api/week/${week.id}`);
        if (!res.ok) return;
        const updatedWeek = await res.json();

        setWeekData((prev: any[]) =>
            prev.map((w) => (w.id === week.id ? updatedWeek : w))
        );
    };


    return (
        <div className="overflow-x-auto p-4">
            {/* Week Navigation + Odds Toggle */}
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 z-20 p-2 border-b">
                <div className="flex items-center gap-4">
                    <button
                        disabled={weekIndex === 0}
                        onClick={() => setWeekIndex((i: number) => i - 1)}
                        className="px-2 py-1 border rounded"
                    >
                        ← Previous
                    </button>
                    <h2 className="text-xl font-bold">{week.label}</h2>
                    <button
                        disabled={weekIndex === weekData.length - 1}
                        onClick={() => setWeekIndex((i: number) => i + 1)}
                        className="px-2 py-1 border rounded"
                    >
                        Next →
                    </button>
                </div>
                <div>
                    <label className="mr-2 font-semibold text-gray-800 dark:text-gray-200">
                        Odds:
                    </label>
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
                <thead className="sticky top-12 z-20 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-b border-gray-400 dark:border-gray-600">
                    <tr>
                        <th className="border p-2 text-left bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            Game
                        </th>
                        {orderedUsers.map((u) => (
                            <th
                                key={u.userId}
                                className="border p-2 text-center bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
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
                            {orderedUsers.map((user) => (
                                <WeekRow
                                    key={user.userId}
                                    game={game}
                                    user={user}
                                    currentUserId={currentUser?.userId ?? 0}
                                    isAdmin={isAdmin}
                                    oddsFormat={oddsFormat}
                                    onPickChange={handlePickChange}
                                    onAddSideBet={handleAddSideBet}
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
