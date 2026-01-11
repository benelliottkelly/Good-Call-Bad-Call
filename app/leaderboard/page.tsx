"use client";

import { useEffect, useState } from "react";

type LeaderboardRow = {
  rank: number;
  userId: number;
  username: string;
  totalPoints: number;
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setRows(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6">Loading leaderboard...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">🏆 Leaderboard</h1>

      <table className="w-full border-collapse border">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="border p-2">Rank</th>
            <th className="border p-2 text-left">User</th>
            <th className="border p-2 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.userId}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <td className="border p-2 text-center font-semibold">
                {row.rank}
              </td>
              <td className="border p-2">{row.username}</td>
              <td className="border p-2 text-right font-bold">
                {row.totalPoints}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
