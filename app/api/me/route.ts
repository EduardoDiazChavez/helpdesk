import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

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

  return NextResponse.json({
    id: user?.id,
    email: user?.email,
    name: user?.name,
    lastName: user?.lastName,
    role: user?.role.name,
    companies: user?.userCompanies.map((uc) => ({
      id: uc.companyId,
      name: uc.company.name,
      slug: uc.company.slug,
      isAdmin: uc.isAdmin,
    })),
  });
}
