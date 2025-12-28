import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JONADREW_ALLOWED_PATH = `/portfolio`;
const PORTFOLIO_WEBSITE = `jonadrew.com`;
// const PORTFOLIO_WEBSITE = `localhost:3000`;

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Check if the request is from jonadrew.com
  if (hostname.includes(PORTFOLIO_WEBSITE)) {
    // Allow the specific board page
    if (pathname === JONADREW_ALLOWED_PATH) {
      return NextResponse.next();
    }

    // Allow static assets and API routes
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/favicon") ||
      pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
    ) {
      return NextResponse.next();
    }

    // Redirect any other path to the allowed board
    return NextResponse.redirect(new URL(JONADREW_ALLOWED_PATH, request.url));
  }

  // For mudboard.com or other domains, allow all access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
