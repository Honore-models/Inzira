import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PAGES = new Set(["/", "/privacy", "/terms"]);
const AUTH_PAGES = new Set(["/auth/signin", "/auth/signup", "/auth/error"]);
// Public API endpoints. Every other API route checks the session itself, but
// unauthenticated calls get a JSON 401 here instead of an HTML redirect.
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/institutions"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role as string | undefined;
  const hasValidRole = role === "youth" || role === "officer";
  const home = role === "officer" ? "/officer" : "/youth";

  if (PUBLIC_PAGES.has(pathname)) return NextResponse.next();

  if (AUTH_PAGES.has(pathname)) {
    // Logged-in users skip the auth pages, except a Google user finishing
    // sign-up (/auth/signup?google=1).
    const isGoogleSignup =
      pathname === "/auth/signup" && req.nextUrl.searchParams.get("google") === "1";
    if (hasValidRole && !isGoogleSignup && pathname !== "/auth/error") {
      return NextResponse.redirect(new URL(home, req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();
    if (!hasValidRole) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // A session without a recognised role can exist after an interrupted
  // sign-up; send it back to sign in rather than bouncing between dashboards.
  if (!hasValidRole) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname === "/onboarding" && role !== "youth") {
    return NextResponse.redirect(new URL(home, req.url));
  }
  if (pathname.startsWith("/officer") && role !== "officer") {
    return NextResponse.redirect(new URL("/youth", req.url));
  }
  if (pathname.startsWith("/youth") && role !== "youth") {
    return NextResponse.redirect(new URL("/officer", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
