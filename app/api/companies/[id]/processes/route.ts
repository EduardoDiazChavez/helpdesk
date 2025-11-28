import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { id } = await params;
  const companyId = Number(id);
  if (Number.isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid company id" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, slug: true, address: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const links = await prisma.companyProcess.findMany({
    where: { companyId },
    include: { process: true },
  });

  const linksWithCounts = await Promise.all(
    links.map(async (link) => {
      const requestCount = await prisma.request.count({
        where: { companyId, processId: link.processId },
      });
      return { ...link, requestCount };
    })
  );

  return NextResponse.json({ company, processes: linksWithCounts });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { id } = await params;
  const companyId = Number(id);
  if (Number.isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid company id" }, { status: 400 });
  }

  const { processId } = (await req.json()) as { processId?: number };
  if (!processId) {
    return NextResponse.json(
      { error: "processId is required" },
      { status: 400 }
    );
  }

  const [company, process] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.process.findUnique({ where: { id: processId } }),
  ]);
  if (!company || !process) {
    return NextResponse.json({ error: "Company or process not found" }, { status: 404 });
  }

  const exists = await prisma.companyProcess.findUnique({
    where: { processId_companyId: { companyId, processId } },
  });
  if (exists) {
    return NextResponse.json(
      { error: "Process already linked to company" },
      { status: 400 }
    );
  }

  const link = await prisma.companyProcess.create({
    data: { companyId, processId, isEnabled: true },
  });

  return NextResponse.json(link, { status: 201 });
}
