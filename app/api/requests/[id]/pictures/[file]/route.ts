import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "tmp", "request-pictures");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; file: string }> }
) {
  const { id, file } = await params;
  if (!id || !file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filePath = path.join(UPLOAD_DIR, file);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : ext === ".gif"
        ? "image/gif"
        : "image/jpeg";
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; file: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, file } = await params;
  const requestId = Number(id);
  if (Number.isNaN(requestId) || !file) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const pictureUrl = `/api/requests/${requestId}/pictures/${file}`;
  const picture = await prisma.requestPicture.findFirst({
    where: { requestId, pictureUrl },
    include: {
      request: {
        include: {
          status: true,
          company: true,
        },
      },
    },
  });

  if (!picture) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      role: true,
      userCompanies: { select: { companyId: true } },
    },
  });
  const isSysAdmin = user?.role.name === "Systems Administrator";
  const companyIds = user?.userCompanies.map((uc) => uc.companyId) || [];
  const allowed =
    isSysAdmin ||
    picture.request.requesterId === session.userId ||
    companyIds.includes(picture.request.companyId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (["Completed", "Cancelled"].includes(picture.request.status.name)) {
    return NextResponse.json(
      { error: "No se pueden eliminar imágenes de solicitudes cerradas" },
      { status: 400 }
    );
  }

  // remove db record first
  await prisma.requestPicture.delete({ where: { id: picture.id } });
  await prisma.requestLog.create({
    data: {
      requestId,
      userId: session.userId,
      actionDone: "Imagen eliminada de la solicitud",
    },
  });

  // attempt to delete the file; ignore failures
  const filePath = path.join(UPLOAD_DIR, file);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    // ignore missing file
  }

  return NextResponse.json({ success: true });
}
