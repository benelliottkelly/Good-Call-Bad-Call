import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    const res = NextResponse.json({ success: true });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
