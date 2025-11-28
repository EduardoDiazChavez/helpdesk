import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";

type PriorityBody = { name?: string; number?: number };

export async function GET(req: NextRequest) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const priorities = await prisma.priority.findMany({
    orderBy: { number: "asc" },
    include: { _count: { select: { requests: true } } },
  });
  return NextResponse.json(priorities);
}

export async function POST(req: NextRequest) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { name, number } = (await req.json()) as PriorityBody;
  if (!name || typeof number !== "number") {
    return NextResponse.json(
      { error: "name and number are required" },
      { status: 400 }
    );
  }

  try {
    const priority = await prisma.priority.create({ data: { name, number } });
    return NextResponse.json(priority, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating priority", error);
    return NextResponse.json(
      { error: "Unable to create priority" },
      { status: 500 }
    );
  }
}
