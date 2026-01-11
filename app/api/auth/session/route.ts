import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  // Get token from cookies
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(null); // no user logged in
  }

  try {
    const user = verifyToken(token); // returns { userId, username, isAdmin }
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json(null); // invalid token
  }
}
