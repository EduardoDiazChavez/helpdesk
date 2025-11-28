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
  const processId = Number(id);
  if (Number.isNaN(processId)) {
    return NextResponse.json({ error: "Invalid process id" }, { status: 400 });
  }

  const { code, name, description } = (await req.json()) as {
    code?: string;
    name?: string;
    description?: string;
  };

  if (!code && !name && !description) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const updated = await prisma.process.update({
      where: { id: processId },
      data: {
        code: code ?? undefined,
        name: name ?? undefined,
        description: description ?? undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating process", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el proceso" },
      { status: 400 }
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
  const processId = Number(id);
  if (Number.isNaN(processId)) {
    return NextResponse.json({ error: "Invalid process id" }, { status: 400 });
  }

  const count = await prisma.request.count({
    where: { processId },
  });

  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar, está en uso por solicitudes", inUse: count },
      { status: 400 }
    );
  }

  try {
    await prisma.process.delete({
      where: { id: processId },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting process", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el proceso" },
      { status: 400 }
    );
  }
}
