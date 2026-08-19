import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as string | undefined;

  // Root / landing page — always allow
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Auth pages — allow through (but redirect logged-in users to their dashboard)
  const authPages = ["/auth/signin", "/auth/signup", "/auth/error"];
  if (authPages.some((route) => pathname === route)) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(userRole === "officer" ? "/officer" : "/youth", req.url),
      );
    }
    return NextResponse.next();
  }

  // API routes that don't require auth
  if (
    pathname.startsWith("/api/seed") ||
    pathname.startsWith("/api/ai/seed") ||
    pathname.startsWith("/api/ai/documents") ||
    pathname.startsWith("/api/auth")
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
