"use client";

import { useState, useEffect } from "react";
import SideBetInput from "./SideBetInput";
import { formatOdds, OddsFormat } from "./utils";
import { Week, User, Game, Pick, SideBet, BetResult } from "./types";

interface WeekRowProps {
    game: Game;
    user: User;
    currentUserId: number;
    isAdmin: boolean;
    oddsFormat: OddsFormat;
    onPickChange: (gameId: number, userId: number, pickedWinner: string | null, pickedTDs: number | null) => void;
    onAddSideBet: (gameId: number, userId: number, description: string, odds: number) => void;
    onUpdateSideBet: (sideBetId: number, result: BetResult) => void;
}

export default function WeekRow({
    game,
    user,
    currentUserId,
    isAdmin,
    oddsFormat,
    onPickChange,
    onAddSideBet,
    onUpdateSideBet
}: WeekRowProps) {
    const pick = game.picks.find((p) => p.userId === user.userId);
    // const sideBets = game.sideBets.filter((sb) => sb.userId === user.userId);
    console.log(game.id)
    console.log(game.sideBets);
    // const sideBets = (game.sideBets ?? []).filter((sb) => sb.userId === user.userId);
    const sideBets = (game.sideBets ?? []).filter((sb) => sb?.userId === user.userId);

    const canEdit = isAdmin || currentUserId === user.userId;

    const winnerResult =
        game.winningTeam && pick?.pickedWinner
            ? pick.pickedWinner === game.winningTeam
                ? "correct"
                : "incorrect"
            : null;

    const tdsResult =
        game.correctTDs != null && pick?.pickedTDs != null
            ? pick.pickedTDs === game.correctTDs
                ? "correct"
                : "incorrect"
            : null;

    const [localWinner, setLocalWinner] = useState("");
    const [localTDs, setLocalTDs] = useState("");

    useEffect(() => {
        setLocalWinner(pick?.pickedWinner ?? "");
        setLocalTDs(pick?.pickedTDs != null ? String(pick.pickedTDs) : "");
    }, [pick]);

    const commitPick = () => {
        const winner = localWinner.trim() === "" ? null : localWinner;
        const tds = localTDs.trim() === "" ? null : Number(localTDs);
        if (winner === pick?.pickedWinner && tds === pick?.pickedTDs) return;
        onPickChange(game.id, user.userId, winner, tds);
    };

    const resultClass = (result: "correct" | "incorrect" | null) => {
        if (result === "correct") return "bg-green-100 border-green-400 text-black";
        if (result === "incorrect") return "bg-red-100 border-red-400 text-black";
        return "";
    };


    return (
        <td className="border p-2 align-top">
            {/* Winner */}
            <select
                value={localWinner}
                disabled={!canEdit}
                onChange={(e) => setLocalWinner(e.target.value)}
                onBlur={commitPick}
                className={`border p-1 w-full mb-1 ${resultClass(winnerResult)}`}
            >
                <option value="">Winner</option>
                <option value={game.teamA}>{game.teamA}</option>
                <option value={game.teamB}>{game.teamB}</option>
            </select>

            {/* TDs */}
            <input
                type="number"
                value={localTDs}
                disabled={!canEdit}
                placeholder="TDs"
                onChange={(e) => setLocalTDs(e.target.value)}
                onBlur={commitPick}
                className={`border p-1 w-full mb-1 ${resultClass(tdsResult)}`}
            />

            {/* Side Bets */}
            <div className="space-y-1">
                {sideBets.map((sb) => (
                    <div key={sb.id} className="flex justify-between items-center border p-1 text-sm">
                        <span>
                            {sb.description} ({formatOdds(sb.odds, oddsFormat)})
                        </span>
                        {isAdmin ? (
                            <select
                                value={sb.result}
                                onChange={(e) => onUpdateSideBet(sb.id, e.target.value as BetResult)}
                                className="border p-1 text-black"
                            >
                                <option value="UNMARKED">❓</option>
                                <option value="CORRECT">✅</option>
                                <option value="INCORRECT">❌</option>
                            </select>
                        ) : (
                            <span>
                                {sb.result === "CORRECT" ? "✅" : sb.result === "INCORRECT" ? "❌" : "❓"}
                            </span>
                        )}

                    </div>
                ))}

                {currentUserId === user.userId && (
                    <SideBetInput
                        gameId={game.id}
                        userId={user.userId}
                        onAdd={onAddSideBet}
                        oddsFormat={oddsFormat}
                    />
                )}
            </div>
        </td>
    );
}
