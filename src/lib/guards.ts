import { getSession, type AppSession, type Role } from "@/lib/session";

export type AuthErrorCode = "UNAUTHENTICATED" | "FORBIDDEN";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code === "UNAUTHENTICATED" ? "Sign in required" : "Not allowed");
    this.name = "AuthError";
    this.code = code;
  }
}

export async function requireRole(...allowed: Role[]): Promise<AppSession> {
  const session = await getSession();
  if (!session) throw new AuthError("UNAUTHENTICATED");
  if (!allowed.includes(session.role)) throw new AuthError("FORBIDDEN");
  return session;
}
