import type { Role } from "@/lib/session";

const PUBLIC_EXACT = ["/", "/login", "/signup"];
const PUBLIC_PREFIXES = ["/auth", "/api/health"];

export const LOGIN_PATH = "/login";

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function homePathFor(role: Role): string {
  return role === "cashier" ? "/sell" : "/account";
}
