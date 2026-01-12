"use client";

import { useState } from "react";
import { OddsFormat, parseOddsInput } from "./utils";

interface SideBetInputProps {
  gameId: number;
  userId: number;
  onAdd: (gameId: number, userId: number, description: string, odds: number) => void;
  oddsFormat: OddsFormat;
}

export default function SideBetInput({ gameId, userId, onAdd, oddsFormat }: SideBetInputProps) {
  const [description, setDescription] = useState("");
  const [oddsInput, setOddsInput] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!description.trim()) return;

    const decimalOdds = parseOddsInput(oddsInput, oddsFormat);

    if (!Number.isFinite(decimalOdds) ||decimalOdds < 2) {
      setError("Odds must be evens or better");
      return;
    }

    onAdd(gameId, userId, description.trim(), decimalOdds);

    setDescription("");
    setOddsInput("");
    setError("");
  };

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex gap-1">
        <input
          className="border p-1 flex-1"
          placeholder="Side bet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="border p-1 w-20"
          placeholder={oddsFormat === "AMERICAN" ? "+100" : "1/1"}
          value={oddsInput}
          onChange={(e) => setOddsInput(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-2" onClick={handleAdd}>
          +
        </button>
      </div>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}
