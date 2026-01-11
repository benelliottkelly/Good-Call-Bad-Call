import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// Admin-only access helper
async function getAdminUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (user?.isAdmin) return user;
  return null;
}

export async function GET(req: NextRequest) {
  const admin = await getAdminUser(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, isAdmin: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { userId, makeAdmin }: { userId: number; makeAdmin: boolean } = await req.json();

  if (admin.id === userId) {
    return NextResponse.json({ error: "Cannot change your own admin status" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isAdmin: makeAdmin },
    select: { id: true, username: true, isAdmin: true },
  });

  return NextResponse.json(updated);
}
