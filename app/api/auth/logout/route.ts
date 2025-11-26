import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, options } = getSessionCookieOptions();
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name,
    value: "",
    ...options,
    maxAge: 0,
  });
  return response;
}
