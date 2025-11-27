import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const includeRequest = {
  requestType: true,
  process: true,
  priority: true,
  status: true,
  requester: {
    select: {
      id: true,
      email: true,
      name: true,
      lastName: true,
    },
  },
  company: true,
  logs: {
    orderBy: { logDate: "desc" },
    include: {
      user: {
        select: { id: true, email: true, name: true, lastName: true },
      },
    },
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestId = Number(params.id);
  if (Number.isNaN(requestId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
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

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: includeRequest,
  });

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isSysAdmin) {
    const isRequester = request.requesterId === session.userId;
    const sameCompany = companyIds.includes(request.companyId);
    if (!isRequester && !sameCompany) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(request);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestId = Number(params.id);
  if (Number.isNaN(requestId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as { statusName: string; comment?: string };
  if (!body.statusName) {
    return NextResponse.json({ error: "Missing statusName" }, { status: 400 });
  }
  if (
    (body.statusName === "Completed" || body.statusName === "Cancelled") &&
    !body.comment
  ) {
    return NextResponse.json(
      { error: "Comment is required for this status" },
      { status: 400 }
    );
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

  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isSysAdmin && !companyIds.includes(request.companyId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const newStatus = await prisma.requestStatus.findUnique({
    where: { name: body.statusName },
  });

  if (!newStatus) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.request.update({
    where: { id: requestId },
    data: {
      requestStatusId: newStatus.id,
      logs: {
        create: {
          userId: session.userId,
          actionDone: `Estado cambiado a ${body.statusName}${
            body.comment ? ` - ${body.comment}` : ""
          }`,
        },
      },
    },
    include: includeRequest,
  });

  return NextResponse.json(updated);
}
