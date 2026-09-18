import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_USER_ID_HEADER,
  AUTH_USER_ROLE_HEADER,
  TELEGRAM_SIGNATURE_HEADER
} from "./src/lib/security";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userId = request.headers.get(AUTH_USER_ID_HEADER)?.trim();
  const role = request.headers.get(AUTH_USER_ROLE_HEADER)?.trim();

  if (pathname.startsWith("/api/admin/")) {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (pathname === "/api/payments/card-to-card/receipt" && !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    pathname === "/api/payments/telegram-stars/webhook" &&
    !request.headers.get(TELEGRAM_SIGNATURE_HEADER)?.trim()
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/payments/card-to-card/receipt",
    "/api/payments/telegram-stars/webhook"
  ]
};
