import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { id } = await params;
  const typeId = Number(id);
  if (Number.isNaN(typeId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { name } = (await req.json()) as { name?: string };
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const updated = await prisma.requestType.update({
      where: { id: typeId },
      data: { name },
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating request type", error);
    return NextResponse.json(
      { error: "Unable to update request type" },
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
  const typeId = Number(id);
  if (Number.isNaN(typeId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const count = await prisma.request.count({
    where: { requestTypeId: typeId },
  });
  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar, está en uso por solicitudes", inUse: count },
      { status: 400 }
    );
  }

  await prisma.requestType.delete({ where: { id: typeId } });
  return NextResponse.json({ success: true });
}
