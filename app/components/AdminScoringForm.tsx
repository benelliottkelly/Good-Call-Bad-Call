// app/admin/scoring/AdminScoringForm.tsx
"use client";

import { useState } from "react";
import { Game } from "./WeekBoard/types";

interface Week {
  id: number;
  label: string;
  multiplier: number;
  games: Game[];
}

interface AdminScoringFormProps {
  week: Week;
}

export default function AdminScoringForm({ week }: AdminScoringFormProps) {
  const [games, setGames] = useState<Game[]>(week.games);

  const handleChange = (
    gameId: number,
    field: "winningTeam" | "correctTDs",
    value: string
  ) => {
    setGames((prev) =>
      prev.map((g) =>
        g.id === gameId
          ? {
              ...g,
              [field]: field === "correctTDs" ? Number(value) : value,
            }
          : g
      )
    );
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/admin/scoring/${week.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ games }),
    });

    if (!res.ok) {
      alert("Error updating scores");
      return;
    }

    alert("Scores updated successfully!");
  };

  return (
    <div className="flex flex-col gap-4">
      {games.map((game) => (
        <div key={game.id} className="flex flex-col md:flex-row gap-2 items-center">
          <span className="w-40 font-semibold">
            {game.teamA} vs {game.teamB}
          </span>

          <select
            value={game.winningTeam ?? ""}
            onChange={(e) => handleChange(game.id, "winningTeam", e.target.value)}
            className="border p-1 rounded"
          >
            <option value="">Select Winner</option>
            <option value={game.teamA}>{game.teamA}</option>
            <option value={game.teamB}>{game.teamB}</option>
          </select>

          <input
            type="number"
            placeholder="Correct TDs"
            value={game.correctTDs ?? ""}
            onChange={(e) => handleChange(game.id, "correctTDs", e.target.value)}
            className="border p-1 rounded w-24"
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4 w-32"
      >
        Save Week
      </button>
    </div>
  );
}
