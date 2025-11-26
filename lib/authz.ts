import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "./auth";

const SYS_ADMIN_ROLE = "Systems Administrator";

export const requireSystemAdmin = async (
  req: NextRequest
): Promise<NextResponse | null> => {
  const session = await getSessionFromRequest(req);
  const headerRole = req.headers.get("x-user-role");
  const isAdmin =
    session?.role === SYS_ADMIN_ROLE || headerRole === SYS_ADMIN_ROLE;

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: system administrator role required." },
      { status: 403 }
    );
  }

  return null;
};

export const requireAuth = async (req: NextRequest) => {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
};
