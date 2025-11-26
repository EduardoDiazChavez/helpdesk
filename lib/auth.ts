import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "helpdesk_session";
const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const key = new TextEncoder().encode(AUTH_SECRET);

export type SessionPayload = {
  userId: number;
  email: string;
  role: string;
};

export const createSessionToken = async (payload: SessionPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
};

export const verifySessionToken = async (token: string) => {
  const { payload } = await jwtVerify<SessionPayload>(token, key);
  return payload;
};

export const getSessionFromRequest = async (
  req: Request | { headers: Headers }
) => {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const token = decodeURIComponent(match.split("=").slice(1).join("="));
  try {
    return await verifySessionToken(token);
  } catch (e) {
    return null;
  }
};

export const getSessionCookieOptions = () => ({
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
});
