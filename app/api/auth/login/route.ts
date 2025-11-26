import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json()) as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email y contraseña son requeridos" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role.name,
  });

  const { name, options } = getSessionCookieOptions();

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role.name },
  });
  response.cookies.set({
    name,
    value: token,
    ...options,
  });
  return response;
}
