import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { PROTECTED_ROUTE_PREFIXES } from "@/lib/auth/routes";

/**
 * Auth-ready middleware: extend with session / JWT checks.
 * For local development, all routes pass through unless you implement redirects below.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Example: require `access_token` cookie before entering the app shell.
  // const token = request.cookies.get("access_token")?.value;
  // if (!token) {
  //   const login = new URL("/login", request.url);
  //   login.searchParams.set("from", pathname);
  //   return NextResponse.redirect(login);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/resumes",
    "/resumes/:path*",
    "/billing",
    "/billing/:path*",
    "/settings",
    "/settings/:path*",
  ],
};
