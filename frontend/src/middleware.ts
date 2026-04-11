import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { PROTECTED_ROUTE_PREFIXES } from "@/lib/auth/routes";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Auth-ready middleware: extend with session / JWT checks.
 * For local development, all routes pass through unless you implement redirects below.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  const isProtected = PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return response;
  }

  if (user != null) {
    return response;
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("from", pathname);
  const redirect = NextResponse.redirect(login);
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie.name, cookie.value);
  }
  return redirect;
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
