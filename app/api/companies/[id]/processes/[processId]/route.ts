import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; processId: string }> }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { id, processId } = await params;
  const companyIdNum = Number(id);
  const processIdNum = Number(processId);
  if (Number.isNaN(companyIdNum) || Number.isNaN(processIdNum)) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }

  const { isEnabled } = (await req.json()) as { isEnabled?: boolean };
  if (isEnabled === undefined) {
    return NextResponse.json(
      { error: "isEnabled is required" },
      { status: 400 }
    );
  }

  const link = await prisma.companyProcess.findUnique({
    where: { processId_companyId: { companyId: companyIdNum, processId: processIdNum } },
  });
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  if (isEnabled === false) {
    const count = await prisma.request.count({
      where: { companyId: companyIdNum, processId: processIdNum },
    });
    if (count > 0) {
      return NextResponse.json(
        { error: "No se puede deshabilitar, tiene solicitudes", inUse: count },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.companyProcess.update({
    where: { processId_companyId: { companyId: companyIdNum, processId: processIdNum } },
    data: { isEnabled },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; processId: string }> }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { id, processId } = await params;
  const companyIdNum = Number(id);
  const processIdNum = Number(processId);
  if (Number.isNaN(companyIdNum) || Number.isNaN(processIdNum)) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }

  const count = await prisma.request.count({
    where: { companyId: companyIdNum, processId: processIdNum },
  });
  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar, está en uso por solicitudes", inUse: count },
      { status: 400 }
    );
  }

  await prisma.companyProcess.delete({
    where: { processId_companyId: { companyId: companyIdNum, processId: processIdNum } },
  });

  return NextResponse.json({ success: true });
}
