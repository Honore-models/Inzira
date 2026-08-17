import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Public routes that don't require auth
  const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/auth/error"];
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // If not logged in, redirect to sign in
  if (!isLoggedIn) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based route protection
  if (pathname.startsWith("/officer") && userRole !== "officer") {
    return NextResponse.redirect(new URL("/youth", req.url));
  }

  if (pathname.startsWith("/youth") && userRole !== "youth") {
    return NextResponse.redirect(new URL("/officer", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
