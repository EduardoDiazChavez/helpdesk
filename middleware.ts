import { NextResponse, NextRequest } from "next/server";
import { getSessionFromRequest } from "./lib/auth";

const PUBLIC_PATHS = [
  "/login",
  "/login/forgot-password",
  "/login/reset-password",
  "/api/auth/login",
  "/api/auth/logout",
  "/favicon.ico",
  "/_next",
  "/static",
];

const ADMIN_PATHS = ["/companies", "/users", "/api/companies", "/api/users", "/api/roles"];

const isPublic = (path: string) =>
  PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

const isAdminPath = (path: string) =>
  ADMIN_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isPublic(pathname)) {
    const session = await getSessionFromRequest(req);

    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminPath(pathname) && session.role !== "Systems Administrator") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
