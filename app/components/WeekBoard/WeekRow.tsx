"use client";

import { useState, useEffect } from "react";
import SideBetInput from "./SideBetInput";
import { formatOdds, OddsFormat } from "./utils";
import { User, Game, BetResult } from "./types";

interface WeekRowProps {
    game: Game;
    user: User;
    currentUserId: number;
    isAdmin: boolean;
    oddsFormat: OddsFormat;
    onPickChange: (gameId: number, userId: number, pickedWinner: string | null, pickedTDs: number | null) => void;
    onAddSideBet: (gameId: number, userId: number, description: string, odds: number) => void;
    onSetSideBetResult: (sideBetId: number, result: BetResult) => void;
    onUpdateSideBet: (sideBetId: number, description: string, odds: number) => void;
}

export default function WeekRow({
    game,
    user,
    currentUserId,
    isAdmin,
    oddsFormat,
    onPickChange,
    onAddSideBet,
    onSetSideBetResult,
    onUpdateSideBet
}: WeekRowProps) {
    const pick = game.picks.find((p) => p.userId === user.userId);
    const sideBets = (game.sideBets ?? []).filter((sb) => sb?.userId === user.userId);

    const canEdit = isAdmin || currentUserId === user.userId;

    const [localWinner, setLocalWinner] = useState("");
    const [localTDs, setLocalTDs] = useState("");
    const [editingSideBetId, setEditingSideBetId] = useState<number | null>(null);

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
        {sideBets.map(sb => (
          <div
            key={sb.id}
            className="flex justify-between items-start border p-1 text-sm gap-2"
          >
            <div className="flex-1">
              {editingSideBetId === sb.id ? (
                <SideBetInput
                  mode="edit"
                  oddsFormat={oddsFormat}
                  sideBetId={sb.id}
                  initialDescription={sb.description}
                  initialOdds={sb.odds}
                  autoFocus
                  onUpdate={async (id, description, odds) => {
                    await onUpdateSideBet(id, description, odds);
                    setEditingSideBetId(null);
                  }}
                  onCancel={() => setEditingSideBetId(null)}
                />
              ) : (
                <span>
                  {sb.description} ({formatOdds(sb.odds, oddsFormat)})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {isAdmin && editingSideBetId !== sb.id && (
                <>
                  <select
                    value={sb.result}
                    onChange={e =>
                      onSetSideBetResult(
                        sb.id,
                        e.target.value as BetResult
                      )
                    }
                    className="border p-1 text-black"
                  >
                    <option value="UNMARKED">❓</option>
                    <option value="CORRECT">✅</option>
                    <option value="INCORRECT">❌</option>
                  </select>

                  <button
                    className="text-blue-600"
                    onClick={() => setEditingSideBetId(sb.id)}
                  >
                    ✏️
                  </button>
                </>
              )}

              {!isAdmin && (
                <span>
                  {sb.result === "CORRECT"
                    ? "✅"
                    : sb.result === "INCORRECT"
                    ? "❌"
                    : "❓"}
                </span>
              )}
            </div>
          </div>
        ))}

        {currentUserId === user.userId && (
          <SideBetInput
            mode="add"
            gameId={game.id}
            userId={user.userId}
            oddsFormat={oddsFormat}
            onAdd={onAddSideBet}
          />
        )}
      </div>
        </td>
    );
}
