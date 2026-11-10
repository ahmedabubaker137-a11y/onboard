import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * OnboardX Enterprise Edge Security Middleware
 * Enforces:
 * 1. Enterprise HTTP Security Headers (OWASP Top 10 compliance)
 * 2. Role-Based Access Control (RBAC) route gating at the edge
 * 3. Tenant isolation headers
 */

// Gated routes and allowed roles
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/settings": ["ADMIN"],
  "/templates": ["ADMIN", "HR_MANAGER"],
  "/assets": ["ADMIN", "IT_PROVISIONER"],
  "/requisitions": ["ADMIN", "HR_MANAGER", "MANAGER"],
  "/compliance": ["ADMIN", "HR_MANAGER"],
  "/portal": ["ADMIN", "EMPLOYEE", "HR_MANAGER"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Enterprise HTTP Security Headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "X-XSS-Protection",
    "1; mode=block"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-ancestors 'none';"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  // Prevent browser/client-side caching on all API data routes
  if (pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  // 2. Edge RBAC Inspection via Session Cookie
  const activeRoleCookie = request.cookies.get("onboardx_active_role")?.value || "ADMIN";

  // Check matching gated routes
  for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(activeRoleCookie)) {
        // Redirect unauthorized users to their designated home or 403 page
        const redirectUrl = new URL(
          activeRoleCookie === "EMPLOYEE" ? "/portal" : "/dashboard",
          request.url
        );
        redirectUrl.searchParams.set("unauthorized", "true");
        redirectUrl.searchParams.set("attemptedPath", pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset patterns (.png, .ico, .svg, .jpg)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
