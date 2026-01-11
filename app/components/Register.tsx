"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext"; // import your context hook

export interface RegisterProps {
  onSuccess?: () => void; // optional callback for parent component
}

export default function Register({ onSuccess }: RegisterProps) {
  const router = useRouter();
  const { setCurrentUser } = useUser(); // context setter
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Register the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch current user session
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) throw new Error("Failed to fetch session");
        const user = await sessionRes.json();
        setCurrentUser(user); // update context immediately
      } catch (err) {
        console.error(err);
        setError("Failed to load user session");
        setLoading(false);
        return;
      }

      // 3️⃣ Call optional onSuccess callback
      onSuccess?.();

      // 4️⃣ Redirect to weekboard
      router.push("/weekboard");
    } catch (err) {
      console.error("Register error:", err);
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 w-80 p-4 border rounded shadow"
    >
      <h1 className="text-xl font-bold">Register</h1>

      <input
        suppressHydrationWarning
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <input
        suppressHydrationWarning
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <input
        suppressHydrationWarning
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded"
        required
      />

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        className="bg-green-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
