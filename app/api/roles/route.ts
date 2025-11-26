import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const roles = await prisma.role.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json(roles);
}
