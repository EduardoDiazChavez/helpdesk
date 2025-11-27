import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = (await req.json()) as {
    email?: string;
    name?: string;
    lastName?: string;
    password?: string;
    roleName?: string;
    companySlug?: string | null;
    isCompanyAdmin?: boolean;
  };

  const data: any = {};
  if (body.email) data.email = body.email;
  if (body.name) data.name = body.name;
  if (body.lastName) data.lastName = body.lastName;
  if (body.password) data.password = await bcrypt.hash(body.password, 10);

  if (body.roleName) {
    const role = await prisma.role.findUnique({
      where: { name: body.roleName },
    });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 400 });
    }
    data.roleId = role.id;
  }

  let companyId: number | null = null;
  if (body.companySlug) {
    const company = await prisma.company.findUnique({
      where: { slug: body.companySlug },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 400 });
    }
    companyId = company.id;
  } else {
    return NextResponse.json(
      { error: "Company is required" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    await prisma.userCompany.deleteMany({ where: { userId } });
    await prisma.userCompany.create({
      data: {
        userId,
        companyId,
        isAdmin: body.isCompanyAdmin ?? false,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        userCompanies: { include: { company: true } },
      },
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("Error updating user", error);
    return NextResponse.json(
      { error: "Unable to update user" },
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
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    await prisma.userCompany.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting user", error);
    return NextResponse.json(
      { error: "Unable to delete user" },
      { status: 500 }
    );
  }
}
