"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext"; // import your UserContext hook

interface LoginProps {
  onSuccess?: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setCurrentUser } = useUser(); // get context setter
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Attempt login
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!res.ok) {
      setError("Invalid login details");
      return;
    }

    // Fetch current user from session
    try {
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) throw new Error("Failed to fetch session");
      const user = await sessionRes.json();
      setCurrentUser(user); // update context immediately
    } catch (err) {
      console.error(err);
      setError("Failed to load user session");
      return;
    }

    // Call optional onSuccess callback
    onSuccess?.();

    // Optional: redirect to picks if no onSuccess
    router.push("/weekboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <input
        suppressHydrationWarning
        className="border p-2 w-full"
        placeholder="Username or email"
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
      />

      <input
        suppressHydrationWarning
        type="password"
        className="border p-2 w-full"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500">{error}</p>}

      <button className="bg-blue-500 text-white px-4 py-2 w-full">
        Login
      </button>
    </form>
  );
}
