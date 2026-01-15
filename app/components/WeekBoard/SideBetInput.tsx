"use client";

import { useEffect, useState } from "react";
import { formatOdds, OddsFormat, parseOddsInput } from "./utils";

type AddSideBetProps = {
  mode: "add";
  gameId: number;
  userId: number;
  onAdd: (
    gameId: number,
    userId: number,
    description: string,
    odds: number
  ) => void;
};

type EditSideBetProps = {
  mode: "edit";
  sideBetId: number;
  initialDescription: string;
  initialOdds: number;
  onUpdate: (
    sideBetId: number,
    description: string,
    odds: number
  ) => Promise<void> | void;
  onCancel: () => void;
};

export type SideBetInputProps = {
  oddsFormat: OddsFormat;
  autoFocus?: boolean;
} & (AddSideBetProps | EditSideBetProps);


export default function SideBetInput(props: SideBetInputProps) {
  const { oddsFormat, autoFocus } = props;
  const isEditMode = props.mode === "edit";

  const [description, setDescription] = useState(
    isEditMode ? props.initialDescription : "");
  const [oddsInput, setOddsInput] = useState(
    isEditMode ? String(props.initialOdds) : "");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!description.trim()) return;

    const decimalOdds = parseOddsInput(oddsInput, oddsFormat);

    if (!Number.isFinite(decimalOdds) || decimalOdds < 2) {
      setError("Odds must be evens or better");
      return;
    }

    if (isEditMode) {
      try {
        await props.onUpdate(props.sideBetId, description.trim(), decimalOdds);
      } catch (err) {
        setError("Failed to update side bet");
        console.log(err);
        return;
      }
    } else {
      props.onAdd(
        props.gameId,
        props.userId,
        description.trim(),
        decimalOdds
      );
      setDescription("");
      setOddsInput("");
    }

    setError("");
  };

  useEffect(() => {
    if (props.mode === "edit") {
      setOddsInput(formatOdds(props.initialOdds, oddsFormat));
    }
    // Only include dependencies when in edit mode
  }, [props.mode, oddsFormat, ...(props.mode === "edit" ? [props.initialOdds] : [])]);

  return (
    <div className="flex flex-col gap-1 mt-1 min-w-0">
      <div className="flex gap-1 min-w-0">
        <input
          autoFocus={autoFocus}
          className="border p-1 flex-1 min-w-0"
          placeholder="Side bet"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          className="border p-1 w-10 sm:w-20 flex-shrink"
          placeholder={oddsFormat === "AMERICAN" ? "+100" : "1/1"}
          value={oddsInput}
          onChange={e => setOddsInput(e.target.value)}
        />

        <button
          className={`px-2 text-white flex-shrink-0 ${isEditMode ? "bg-green-600" : "bg-blue-500"}`}
          onClick={handleSubmit}
        >
          {isEditMode ? "💾" : "+"}
        </button>

        {isEditMode && (
          <button className="px-2 bg-gray-300 flex-shrink-0" onClick={props.onCancel}>
            ↩️
          </button>
        )}
      </div>

      {error && <span className="text-red-500 text-sm break-words">{error}</span>}
    </div>

  );
}
