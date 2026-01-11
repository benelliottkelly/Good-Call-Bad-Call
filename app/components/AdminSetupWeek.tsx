"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

type Game = { teamA: string; teamB: string };

export default function AdminSetupWeek() {
  const [label, setLabel] = useState("");
  const [multiplier, setMultiplier] = useState("1"); // store as string for smooth editing
  const [games, setGames] = useState<Game[]>([{ teamA: "", teamB: "" }]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addGame = () =>
    setGames([...games, { teamA: "", teamB: "" }]);

  const updateGame = (index: number, field: "teamA" | "teamB", value: string) => {
    const next = [...games];
    next[index][field] = value;
    setGames(next);
  };

  const removeGame = (index: number) =>
    setGames(games.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!label || games.length === 0) {
      setError("Week label and at least one game are required.");
      return;
    }

    for (const g of games) {
      if (!g.teamA || !g.teamB) {
        setError("Each game must have two teams.");
        return;
      }
    }

    // Convert multiplier to number safely, default to 1
    const numericMultiplier = Number(multiplier) || 1;

    try {
      const res = await fetch("/api/admin/weeks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, multiplier: numericMultiplier, games }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create week.");
        return;
      }

      setSuccess(`Week "${data.label}" created.`);
      setLabel("");
      setMultiplier("1");
      setGames([{ teamA: "", teamB: "" }]);
    } catch (err) {
      console.error(err);
      setError("Failed to create week.");
    }
  };

  return (
    <div suppressHydrationWarning className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Setup Week
      </h1>

      {/* Week Label */}
      <div>
        <label className="font-medium text-gray-900 dark:text-gray-100">
          Week Label
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Week 17"
          className="border p-2 w-full rounded bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      {/* Multiplier */}
      <div>
        <label className="font-medium text-gray-900 dark:text-gray-100">
          Multiplier
        </label>
        <input
          type="number"
          step={0.1}
          value={multiplier}
          onChange={(e) => setMultiplier(e.target.value)}
          onBlur={() => {
            if (multiplier.trim() === "") setMultiplier("1"); // default if empty
          }}
          placeholder="1"
          className="border p-2 w-full rounded bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      {/* Games */}
      <div>
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
          Games
        </h2>

        {games.map((g, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <input
              type="text"
              placeholder="Team A"
              value={g.teamA}
              onChange={(e) => updateGame(i, "teamA", e.target.value)}
              className="border p-2 flex-1 rounded bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Team B"
              value={g.teamB}
              onChange={(e) => updateGame(i, "teamB", e.target.value)}
              className="border p-2 flex-1 rounded bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            />

            {/* Remove game */}
            <button
              type="button"
              onClick={() => removeGame(i)}
              aria-label="Remove game"
              className="text-red-500 hover:text-red-700 hover:bg-red-100
                         dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30
                         rounded p-2 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addGame}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          Add Game
        </button>
      </div>

      {/* Messages */}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded w-full transition-colors"
      >
        Create Week
      </button>
    </div>
  );
}
