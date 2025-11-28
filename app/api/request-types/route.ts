import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const types = await prisma.requestType.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { requests: true } } },
  });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { name } = (await req.json()) as { name?: string };
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const type = await prisma.requestType.create({ data: { name } });
    return NextResponse.json(type, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating request type", error);
    return NextResponse.json(
      { error: "Unable to create request type" },
      { status: 500 }
    );
  }
}
