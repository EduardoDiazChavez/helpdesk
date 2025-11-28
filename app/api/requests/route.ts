import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const includeRequest = {
  requestType: true,
  process: true,
  priority: true,
  status: true,
  _count: { select: { pictures: true } },
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
  const isExport = searchParams.get("export") === "csv";

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

  if (!isExport) {
    return NextResponse.json(requests);
  }

  const rows = requests.map((r) => ({
    Codigo: r.requestCode,
    Asunto: r.subject,
    Descripcion: r.description,
    Ubicacion: r.location,
    Fecha: new Date(r.dateRequested).toISOString(),
    Estado: r.status.name,
    Prioridad: r.priority.name,
    Proceso: r.process.name,
    Tipo: r.requestType.name,
    Solicitante: `${r.requester.name} ${r.requester.lastName}`,
    Correo: r.requester.email,
    Empresa: r.company.name,
    TieneFoto: (r._count?.pictures ?? 0) > 0 ? "Si" : "No",
  }));

  const headers = Object.keys(rows[0] || {});
  const escape = (val: any) => {
    const str = val === null || val === undefined ? "" : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };
  const csv =
    headers.map(escape).join(",") +
    "\n" +
    rows.map((row) => headers.map((h) => escape((row as any)[h])).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=\"requests.csv\"",
    },
  });
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
    processId: number;
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

  const requestType = await prisma.requestType.findUnique({
    where: { id: requestTypeId },
  });

  if (!requestType?.code) {
    return NextResponse.json(
      { error: "El tipo de solicitud no tiene código asignado" },
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

  const last = await prisma.request.findFirst({
    where: { requestTypeId },
    orderBy: { requestCode: "desc" },
    select: { requestCode: true },
  });
  let nextSequence = 1;
  if (last?.requestCode) {
    const match = last.requestCode.match(/-(\d+)$/);
    if (match) {
      nextSequence = Number(match[1]) + 1;
    } else {
      const count = await prisma.request.count({ where: { requestTypeId } });
      nextSequence = count + 1;
    }
  }
  const requestCode = `${requestType.code}-${String(nextSequence).padStart(3, "0")}`;

  const request = await prisma.request.create({
    data: {
      requestTypeId,
      requesterId: requester.id,
      processId: body.processId,
      requestCode,
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
