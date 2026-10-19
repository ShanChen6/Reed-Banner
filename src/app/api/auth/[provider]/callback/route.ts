// GET /api/auth/:provider/callback: nhà cung cấp chuyển về sau khi người chơi đồng ý (hoặc hủy).

import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { completeLogin, credentials, decodePending, isProvider, redirectUri, withLoginError } from "@/server/oauth";
import { guestOf, LOGIN_MAX_AGE, PENDING_COOKIE, setAccountCookie } from "@/server/http";
import { accountStore } from "@/server/store";

export async function GET(request: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  if (!isProvider(provider)) return NextResponse.json({ error: "notFound" }, { status: 404 });
  const creds = credentials(provider);
  if (!creds) return NextResponse.json({ error: "providerDisabled" }, { status: 404 });
  const q = request.nextUrl.searchParams;
  const result = await completeLogin({
    provider,
    pending: decodePending(request.cookies.get(PENDING_COOKIE)?.value),
    code: q.get("code"),
    state: q.get("state"),
    current: guestOf(request),
    creds,
    redirect: redirectUri(request.nextUrl.origin, provider),
    store: accountStore(),
    now: Date.now(),
    newId: () => `g_${randomUUID()}`,
  });
  const target = result.ok ? result.returnTo : withLoginError(result.returnTo);
  const res = NextResponse.redirect(new URL(target, request.nextUrl.origin));
  res.cookies.set(PENDING_COOKIE, "", { path: "/api/auth", maxAge: 0 });
  if (result.ok) setAccountCookie(res, result.accountId, LOGIN_MAX_AGE);
  return res;
}
