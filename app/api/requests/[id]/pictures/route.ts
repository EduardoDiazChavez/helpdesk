import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "tmp", "request-pictures");

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const requestId = Number(id);
  if (Number.isNaN(requestId)) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      company: true,
      requester: true,
      pictures: true,
    },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
    request.requesterId === session.userId ||
    companyIds.includes(request.companyId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(request.pictures);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const requestId = Number(id);
  if (Number.isNaN(requestId)) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { status: true, company: true },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
    request.requesterId === session.userId ||
    companyIds.includes(request.companyId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (["Completed", "Cancelled"].includes(request.status.name)) {
    return NextResponse.json(
      { error: "No se pueden subir imágenes para solicitudes cerradas" },
      { status: 400 }
    );
  }

  const data = await req.formData();
  const file = data.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  await ensureUploadDir();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = (file.name && file.name.split(".").pop()) || "jpg";
  const fileName = `${requestId}-${randomUUID()}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  await fs.writeFile(filePath, buffer);

  const urlPath = `/api/requests/${requestId}/pictures/${fileName}`;

  const created = await prisma.requestPicture.create({
    data: {
      requestId,
      pictureUrl: urlPath,
    },
  });

  await prisma.requestLog.create({
    data: {
      requestId,
      userId: session.userId,
      actionDone: "Imagen agregada a la solicitud",
    },
  });

  return NextResponse.json(created, { status: 201 });
}
