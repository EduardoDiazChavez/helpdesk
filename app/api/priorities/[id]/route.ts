import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";

type PriorityBody = { name?: string; number?: number };

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { id } = await params;
  const priorityId = Number(id);
  if (Number.isNaN(priorityId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { name, number } = (await req.json()) as PriorityBody;
  if (!name && typeof number !== "number") {
    return NextResponse.json(
      { error: "name or number required" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.priority.update({
      where: { id: priorityId },
      data: {
        name: name ?? undefined,
        number: typeof number === "number" ? number : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating priority", error);
    return NextResponse.json(
      { error: "Unable to update priority" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { id } = await params;
  const priorityId = Number(id);
  if (Number.isNaN(priorityId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const count = await prisma.request.count({
    where: { priorityId },
  });
  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar, está en uso por solicitudes", inUse: count },
      { status: 400 }
    );
  }

  await prisma.priority.delete({ where: { id: priorityId } });
  return NextResponse.json({ success: true });
}
