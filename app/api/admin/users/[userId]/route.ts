import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

async function getAdminUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (user?.isAdmin) return user;
  return null;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const admin = await getAdminUser(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const userId = Number((await params).userId);
  if (userId === admin.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
