import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const companyId = Number(params.id);
  if (Number.isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid company id" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      userCompanies: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json(company);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const companyId = Number(params.id);
  if (Number.isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid company id" }, { status: 400 });
  }

  const { name, address } = (await req.json()) as {
    name?: string;
    address?: string;
  };

  if (!name && !address) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: name ?? undefined,
        address: address ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating company", error);
    return NextResponse.json(
      { error: "Unable to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const companyId = Number(params.id);
  if (Number.isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid company id" }, { status: 400 });
  }

  try {
    await prisma.userCompany.deleteMany({ where: { companyId } });
    await prisma.company.delete({ where: { id: companyId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting company", error);
    return NextResponse.json(
      { error: "Unable to delete company" },
      { status: 500 }
    );
  }
}
