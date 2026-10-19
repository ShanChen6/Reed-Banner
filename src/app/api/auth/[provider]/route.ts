// GET /api/auth/:provider?returnTo=/play: bắt đầu đăng nhập Google hoặc GitHub.

import { NextResponse, type NextRequest } from "next/server";
import { authorizationUrl, credentials, encodePending, isProvider, newPendingLogin, redirectUri } from "@/server/oauth";
import { PENDING_COOKIE, PENDING_MAX_AGE } from "@/server/http";

export async function GET(request: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  if (!isProvider(provider)) return NextResponse.json({ error: "notFound" }, { status: 404 });
  const creds = credentials(provider);
  if (!creds) return NextResponse.json({ error: "providerDisabled" }, { status: 404 });
  const pending = newPendingLogin(provider, request.nextUrl.searchParams.get("returnTo") ?? "/play");
  const res = NextResponse.redirect(authorizationUrl(pending, creds, redirectUri(request.nextUrl.origin, provider)));
  res.cookies.set(PENDING_COOKIE, encodePending(pending), {
    httpOnly: true,
    // lax: cookie vẫn được gửi khi nhà cung cấp chuyển hướng (GET) về trang.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: PENDING_MAX_AGE,
  });
  return res;
}
