import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { prisma } from "./prisma";

export async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || typeof payload === "string") return null;

  const user = await prisma.user.findUnique({ where: { id: Number(payload.id) } });
  return user;
}
