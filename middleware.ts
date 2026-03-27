import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/inventory", "/upload", "/inquiries"];
const PROTECTED_API = ["/api/items"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Geo-blocking using Vercel's built-in geo headers
  const country = req.headers.get("x-vercel-ip-country");
  if (country && ["CN", "RU"].includes(country)) {
    return new NextResponse("Access denied", { status: 403 });
  }

  // Admin route protection
  const isProtectedPage = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API.some((p) => pathname.startsWith(p));

  if (isProtectedPage || isProtectedApi) {
    const sessionToken =
      req.cookies.get("__Secure-authjs.session-token") ??
      req.cookies.get("authjs.session-token");

    if (!sessionToken?.value) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
