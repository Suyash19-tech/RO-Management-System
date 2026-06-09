import { NextRequest, NextResponse } from "next/server";
import { signJwtToken } from "@/lib/auth";
import { withRateLimit } from "@/lib/with-rate-limit";

async function loginHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { username, password } = body;

    const validUsername = process.env.ADMIN_USERNAME || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username === validUsername && password === validPassword) {
      const token = await signJwtToken({ role: "admin", username });
      
      const response = NextResponse.json(
        { success: true },
        { status: 200 }
      );
      
      response.cookies.set({
        name: "admin_token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60, // 8 hours
      });
      
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Very strict: 5 attempts per 15 minutes per IP
export const POST = withRateLimit(loginHandler, { limit: 5, windowMs: 15 * 60 * 1000 });
