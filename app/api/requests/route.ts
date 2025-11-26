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
};

const resolveStatusId = async (name?: string) => {
  if (!name) return null;
  const status = await prisma.requestStatus.findUnique({ where: { name } });
  return status?.id ?? null;
};

const resolvePriorityId = async (name?: string) => {
  if (!name) return null;
  const priority = await prisma.priority.findUnique({ where: { name } });
  return priority?.id ?? null;
};

const resolveRequestTypeId = async (name?: string) => {
  if (!name) return null;
  const type = await prisma.requestType.findUnique({ where: { name } });
  return type?.id ?? null;
};

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      role: true,
      userCompanies: {
        include: { company: true },
      },
    },
  });

  const { searchParams } = new URL(req.url);
  const statusName = searchParams.get("status") || undefined;
  const companySlug = searchParams.get("company") || undefined;
  const userIdFilter = searchParams.get("userId") || undefined;

  const statusId = await resolveStatusId(statusName || undefined);

  let where: any = {};

  const isSysAdmin = user?.role.name === "Systems Administrator";
  const isCompanyAdmin =
    user?.role.name === "Company Administrator" ||
    user?.userCompanies.some((uc) => uc.isAdmin);

  if (isSysAdmin) {
    where = {
      ...(statusId ? { requestStatusId: statusId } : {}),
      ...(companySlug
        ? {
            company: { slug: companySlug },
          }
        : {}),
      ...(userIdFilter ? { requesterId: Number(userIdFilter) } : {}),
    };
  } else if (isCompanyAdmin) {
    const companyIds = user?.userCompanies.map((uc) => uc.companyId) || [];
    where = {
      companyId: { in: companyIds },
      ...(statusId ? { requestStatusId: statusId } : {}),
    };
  } else {
    where = {
      requesterId: session.userId,
      ...(statusId ? { requestStatusId: statusId } : {}),
    };
  }

  const requests = await prisma.request.findMany({
    where,
    orderBy: { dateRequested: "desc" },
    include: includeRequest,
  });

  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    requestTypeId?: number;
    requestTypeName?: string;
    subject: string;
    description: string;
    location: string;
    processId: string;
    priorityId?: number;
    priorityName?: string;
    companySlug?: string;
  };

  if (!body.subject || !body.description || !body.location || !body.processId) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  const requestTypeId =
    body.requestTypeId ??
    (await resolveRequestTypeId(body.requestTypeName || "Mantenimiento"));
  const priorityId =
    body.priorityId ??
    (await resolvePriorityId(
      body.priorityName || "Media - Afecta parcialmente"
    ));
  const status = await prisma.requestStatus.findUnique({
    where: { name: "Pending" },
  });

  if (!requestTypeId || !priorityId || !status) {
    return NextResponse.json(
      { error: "Catálogo de tipos, prioridad o estado incompleto" },
      { status: 400 }
    );
  }

  const requester = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      role: true,
      userCompanies: { include: { company: true } },
    },
  });

  if (!requester) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  let companyId: number | null = null;

  if (body.companySlug) {
    const company = await prisma.company.findUnique({
      where: { slug: body.companySlug },
    });
    if (!company) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 400 }
      );
    }
    companyId = company.id;
  } else if (requester.userCompanies.length > 0) {
    companyId = requester.userCompanies[0].companyId;
  }

  if (!companyId) {
    return NextResponse.json(
      { error: "No se encontró una empresa asociada al usuario" },
      { status: 400 }
    );
  }

  const request = await prisma.request.create({
    data: {
      requestTypeId,
      requesterId: requester.id,
      processId: body.processId,
      subject: body.subject,
      location: body.location,
      description: body.description,
      priorityId,
      requestStatusId: status.id,
      companyId,
      logs: {
        create: {
          userId: requester.id,
          actionDone: "Solicitud creada",
        },
      },
    },
    include: includeRequest,
  });

  return NextResponse.json(request, { status: 201 });
}
