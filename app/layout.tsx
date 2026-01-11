// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/app/components/NavBar";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { UserProvider } from "@/app/context/UserContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const currentUser = token ? verifyToken(token) : null;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider initialUser={currentUser}>
          <NavBar />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
