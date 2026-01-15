"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LandingPage() {
  const [showJohnGall, setShowJohnGall] = useState(false);

  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setShowJohnGall(true);
      const revertTimeout = setTimeout(() => setShowJohnGall(false), 1200);
      return () => clearTimeout(revertTimeout);
    }, 3000); // repeat every 3 seconds

    return () => clearInterval(flickerInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-black overflow-hidden p-4">
      <div className="flex flex-1 items-center justify-center">
        <h1 className="text-center font-extrabold flex flex-col sm:flex-row items-center gap-4 
                       text-[clamp(2rem,10vw,6rem)] sm:text-[clamp(3rem,8vw,8rem)]"
          style={{
            // dynamically scale text so it fits 90% of viewport height
            fontSize: 'clamp(2rem, 10vh, 10vw)',
            lineHeight: 1.1,
          }}>
          <span className="text-green-400 neon-glow animate-neon-flicker">
            Good Call
          </span>
          <span
            className={`text-red-500 neon-glow animate-neon-flicker ${showJohnGall ? "text-red-500" : ""
              }`}
          >
            {showJohnGall ? "John Gall" : "Bad Call"}
          </span>
        </h1>
      </div>
      <div className="mt-auto flex-col justify-center items-center pb-6">
        <p className="text-gray-400 text-center text-sm sm:text-base max-w-md">
          Proudly supporting <a href="https://www.facebook.com/share/14QjM3c85fR/?mibextid=wwXIfr" className="underline">Simy Community Development</a>
        </p>
        <div className="mt-2 flex justify-center">
          <Image
            className="block w-16 sm:w-20 md:w-24 h-auto rounded-lg object-contain"
            src="/simy-community-development.jpeg"
            alt="Simy Community Development Logo"
            width={45}
            height={45}
          />
        </div>
      </div>
    </div>
  );
}
