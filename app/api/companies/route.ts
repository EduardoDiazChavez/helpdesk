import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

type CreateCompanyBody = {
  name: string;
  address: string;
  user?: {
    email: string;
    name: string;
    lastName: string;
    password: string;
    isAdmin?: boolean;
  };
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const ensureUniqueSlug = async (base: string) => {
  let slug = slugify(base);
  let counter = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await prisma.company.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${slugify(base)}-${counter}`;
    counter += 1;
  }
};

export async function GET(req: NextRequest) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const companies = await prisma.company.findMany({
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
    orderBy: { id: "asc" },
  });

  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const forbidden = await requireSystemAdmin(req);
  if (forbidden) return forbidden;

  const body = (await req.json()) as CreateCompanyBody;

  if (!body?.name || !body?.address) {
    return NextResponse.json(
      { error: "name and address are required" },
      { status: 400 }
    );
  }

  const slug = await ensureUniqueSlug(body.name);

  const roleCompanyAdmin = await prisma.role.findUnique({
    where: { name: "Company Administrator" },
  });

  if (!roleCompanyAdmin) {
    return NextResponse.json(
      { error: "Missing Company Administrator role in database" },
      { status: 500 }
    );
  }

  try {
    const company = await prisma.company.create({
      data: {
        name: body.name,
        slug,
        address: body.address,
        userCompanies: body.user
          ? {
              create: {
                isAdmin: body.user.isAdmin ?? true,
                user: {
                  create: {
                    email: body.user.email,
                    name: body.user.name,
                    lastName: body.user.lastName,
                    password: await bcrypt.hash(body.user.password, 10),
                    roleId: roleCompanyAdmin.id,
                  },
                },
              },
            }
          : undefined,
      },
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

    return NextResponse.json(company, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating company", error);
    return NextResponse.json(
      { error: "Unable to create company" },
      { status: 500 }
    );
  }
}
