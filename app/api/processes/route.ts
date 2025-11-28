import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";

type CreateProcessBody = {
  name?: string;
  code?: string;
  description?: string;
};

export async function GET(req: NextRequest) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const processes = await prisma.process.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { requests: true } } },
  });

  return NextResponse.json(processes);
}

export async function POST(req: NextRequest) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const body = (await req.json()) as CreateProcessBody;
  if (!body.name || !body.code || !body.description) {
    return NextResponse.json(
      { error: "code, name and description are required" },
      { status: 400 }
    );
  }

  try {
    const process = await prisma.process.create({
      data: {
        name: body.name,
        code: body.code,
        description: body.description,
      },
    });
    return NextResponse.json(process, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating process", error);
    return NextResponse.json(
      { error: "Unable to create process" },
      { status: 500 }
    );
  }
}
