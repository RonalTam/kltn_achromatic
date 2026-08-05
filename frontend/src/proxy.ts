import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/checkout",
  "/account/orders",
  "/account/settings",
  "/account/wishlist",
  "/admin",
];

const AUTH_ONLY_ROUTES = [
  "/account/login",
  "/account/register",
  "/account/forgot-password",
  "/account/reset-password",
];

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

function getIsAuthenticated(request: NextRequest) {
  if (request.cookies.get("auth_status")?.value === "1") return true;
  return Boolean(request.cookies.get("refreshToken")?.value);
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = getIsAuthenticated(request);
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("redirect", search ? `${pathname}${search}` : pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && isAuthenticated) {
    const role = request.cookies.get("auth_role")?.value;
    if (role && !ADMIN_ROLES.has(role)) {
      const forbiddenUrl = new URL("/forbidden", request.url);
      forbiddenUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  const isAuthOnly = AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthOnly && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get("redirect") || "/account";
    const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/account";
    return NextResponse.redirect(new URL(safeRedirect, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout",
    "/account/orders/:path*",
    "/account/settings/:path*",
    "/account/wishlist/:path*",
    "/account/login",
    "/account/register",
    "/account/forgot-password",
    "/account/reset-password",
    "/admin/:path*",
  ],
};
