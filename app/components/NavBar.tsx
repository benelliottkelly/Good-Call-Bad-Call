"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`px-2 py-1 rounded ${isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-200 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
        >
            {children}
        </Link>
    );
}

export default function NavBar() {
    const { currentUser, setCurrentUser } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });

            // Clear user immediately
            setCurrentUser(null);

            // Redirect to login page
            router.push("/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="flex justify-between items-center">
                <NavLink href="/">Home</NavLink>

                <button
                    className="md:hidden text-xl"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Toggle menu"
                >
                    ☰
                </button>

                <div className="hidden md:flex gap-3 items-center">
                    {currentUser ? (
                        <>
                            <span className="font-semibold mr-2">{currentUser.username}</span>
                            <NavLink href="/weekboard">Picks</NavLink>
                            <NavLink href="/leaderboard">Leaderboard</NavLink>


                            {currentUser.isAdmin && (
                                <>
                                    <NavLink href="/admin/setup-week">Setup Week</NavLink>
                                    <NavLink href="/admin/users">Users</NavLink>
                                    <NavLink href="/admin/scoring">Scoring</NavLink>
                                </>
                            )}

                            <button
                                onClick={handleLogout}
                                className="bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                        <NavLink href="/leaderboard">Leaderboard</NavLink>
                            <NavLink href="/login">Login</NavLink>
                            <NavLink href="/register">Register</NavLink>
                        </>
                    )}
                </div>
            </div>

            {menuOpen && (
                <div className="flex flex-col gap-2 mt-3 md:hidden">
                    {currentUser ? (
                        <>
                            <span className="font-semibold">{currentUser.username}</span>
                            <NavLink href="/weekboard">Picks</NavLink>
                            <NavLink href="/leaderboard">Leaderboard</NavLink>


                            {currentUser.isAdmin && (
                                <>
                                    <NavLink href="/admin/setup-week">Setup Week</NavLink>
                                    <NavLink href="/admin/users">Users</NavLink>
                                    <NavLink href="/admin/scoring">Scoring</NavLink>
                                </>
                            )}

                            <button
                                onClick={handleLogout}
                                className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-left"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                        <NavLink href="/leaderboard">Leaderboard</NavLink>

                            <NavLink href="/login">Login</NavLink>
                            <NavLink href="/register">Register</NavLink>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
