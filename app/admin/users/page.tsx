"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const toggleAdmin = async (userId: number, makeAdmin: boolean) => {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, makeAdmin }),
    });
    const updated = await res.json();
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? { ...u, isAdmin: updated.isAdmin } : u))
    );
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Admin - Manage Users
      </h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            <th className="border p-2 text-left">Username</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Admin</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <td className="border p-2">{u.username}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">
                <input
                  type="checkbox"
                  checked={u.isAdmin}
                  onChange={(e) => toggleAdmin(u.id, e.target.checked)}
                />
              </td>
              <td className="border p-2">
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  onClick={() => deleteUser(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
