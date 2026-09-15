import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as string | undefined;
  const hasValidRole = userRole === "youth" || userRole === "officer";

  // Root / landing page — always allow
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Auth pages — allow through (but redirect logged-in users to their dashboard)
  // Exception: /auth/signup?google=1 allows logged-in Google users to complete profile
  const authPages = ["/auth/signin", "/auth/signup", "/auth/error"];
  if (authPages.some((route) => pathname === route)) {
    if (isLoggedIn && hasValidRole) {
      const isGoogleSignup = pathname === "/auth/signup" && req.nextUrl.searchParams.get("google") === "1";
      if (isGoogleSignup) {
        return NextResponse.next();
      }
      return NextResponse.redirect(
        new URL(userRole === "officer" ? "/officer" : "/youth", req.url),
      );
    }
    return NextResponse.next();
  }

  // Public authentication endpoints only. Administrative maintenance routes
  // authorize themselves and must not be exposed anonymously.
  if (
    pathname.startsWith("/api/auth") ||
    pathname === "/api/institutions"
  ) {
    return NextResponse.next();
  }

  // Onboarding page — only accessible by logged-in youth
  if (pathname === "/onboarding") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    if (userRole !== "youth") {
      return NextResponse.redirect(
        new URL(userRole === "officer" ? "/officer" : "/", req.url),
      );
    }
    return NextResponse.next();
  }

  // If not logged in, redirect to sign in
  // A session without a recognised role can exist after an auth configuration
  // change or an interrupted sign-up. Let the user sign in again instead of
  // bouncing indefinitely between the two role dashboards.
  if (!isLoggedIn || !hasValidRole) {
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
