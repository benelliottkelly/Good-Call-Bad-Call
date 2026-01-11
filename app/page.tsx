"use client";

import { useEffect, useState } from "react";

export default function LandingPage() {
  const [showJohnGall, setShowJohnGall] = useState(false);

  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setShowJohnGall(true);
      const revertTimeout = setTimeout(() => setShowJohnGall(false), 1000); // show John Gall for 1s
      return () => clearTimeout(revertTimeout);
    }, 4000); // repeat every 4 seconds

    return () => clearInterval(flickerInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold flex flex-col sm:flex-row items-center gap-4 text-center">
        <span className="text-green-400 neon-glow animate-neon-flicker">
          Good Call
        </span>
        <span
          className={`text-red-500 neon-glow animate-neon-flicker ${
            showJohnGall ? "text-red-500" : ""
          }`}
        >
          {showJohnGall ? "John Gall" : "Bad Call"}
        </span>
      </h1>
    </div>
  );
}
