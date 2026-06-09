import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwtToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect the /dashboard routes for the frontend
  // APIs are left unprotected to allow the customer portal to access them
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyJwtToken(token);

    if (!payload || payload.role !== "admin") {
      // Invalid token, clear it and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("admin_token");
      return response;
    }
  }

  // Redirect root to dashboard if logged in, else login
  if (pathname === "/") {
    const token = request.cookies.get("admin_token")?.value;
    if (token) {
      const payload = await verifyJwtToken(token);
      if (payload && payload.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  if (pathname === "/login") {
    const token = request.cookies.get("admin_token")?.value;
    if (token) {
      const payload = await verifyJwtToken(token);
      if (payload && payload.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
