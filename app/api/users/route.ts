import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const adminHeadersError = {
  error: "Forbidden: system administrator role required.",
};

export async function GET(req: NextRequest) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role");
  const companySlug = searchParams.get("company");

  const skip = (page - 1) * pageSize;

  const where: any = {
    AND: [],
  };

  if (search) {
    where.AND.push({
      OR: [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (role) {
    where.AND.push({
      role: {
        name: role,
      },
    });
  }

  if (companySlug) {
    where.AND.push({
      userCompanies: {
        some: {
          company: {
            slug: companySlug,
          },
        },
      },
    });
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { id: "asc" },
      include: {
        role: true,
        userCompanies: {
          include: {
            company: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    data: users,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(req: NextRequest) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const body = (await req.json()) as {
    email: string;
    name: string;
    lastName: string;
    password: string;
    roleName: string;
    companySlug?: string;
    isCompanyAdmin?: boolean;
  };

  if (!body.email || !body.name || !body.lastName || !body.password) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const role = await prisma.role.findUnique({
    where: { name: body.roleName || "Regular User" },
  });

  if (!role) {
    return NextResponse.json(
      { error: "Role not found" },
      { status: 400 }
    );
  }

  let company;
  if (body.companySlug) {
    company = await prisma.company.findUnique({
      where: { slug: body.companySlug },
    });
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 400 }
      );
    }
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      lastName: body.lastName,
      password: passwordHash,
      roleId: role.id,
      userCompanies: company
        ? {
            create: {
              companyId: company.id,
              isAdmin: body.isCompanyAdmin ?? false,
            },
          }
        : undefined,
    },
    include: {
      role: true,
      userCompanies: { include: { company: true } },
    },
  });

  return NextResponse.json(user, { status: 201 });
}
