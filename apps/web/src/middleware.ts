import { NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import { ROLES, getDashboardRoute, type AllRoles } from "@intilaqa/shared";

const publicRoutes = ["/login", "/api/auth"];

export default auth(async (req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const session = req.auth;

  const pathParts = pathname.split("/").filter(Boolean);
  const locale = pathParts[0];
  const path = "/" + (pathParts.slice(1).join("/") || "");

  if (!session) {
    if (publicRoutes.some((r) => path.startsWith(r))) {
      return NextResponse.next();
    }
    const loginUrl = new URL(`/${locale || "ar"}/login`, nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = (session.user as { role?: string })?.role || "employee";
  const roleDef = ROLES[userRole as AllRoles];

  if (!roleDef?.isActive) {
    return NextResponse.redirect(new URL(`/${locale || "ar"}/login`, nextUrl.origin));
  }

  const isSharedRoute = publicRoutes.some((r) => path.startsWith(r));
  if (isSharedRoute) {
    return NextResponse.next();
  }

  const dashboardRoute = roleDef.dashboardRoute;
  if (!path.startsWith(dashboardRoute)) {
    return NextResponse.redirect(new URL(`/${locale || "ar"}${dashboardRoute}`, nextUrl.origin));
  }

  if (!locale || !["ar", "en"].includes(locale)) {
    return NextResponse.redirect(new URL(`/ar${pathname.startsWith("/ar") ? "" : pathname}`, nextUrl.origin));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  return response;
});

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next|_vercel|.*\\..*|api/auth).*)"],
};
