// POST /api/auth/avatar `{ hero }`: đặt ảnh đại diện là chân dung một tướng quân đã có (`hero` là id), hoặc `null` để
// về chữ cái đầu. Chỉ tài khoản đã ghi danh. Trả `{ avatarUrl }` hoặc `{ error }`.

import { NextResponse, type NextRequest } from "next/server";
import { chooseAvatar } from "@/server/avatar";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import { accountStore, profileStore } from "@/server/store";

const noStore = { "cache-control": "no-store" };

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const owner = guestOf(request);
  if (!owner || !(await isSignedInAccount(owner))) return loginRequiredResponse();
  const body = (await readJson(request)) as { hero?: unknown } | null;
  const hero = body?.hero;
  if (hero !== null && (typeof hero !== "string" || hero.length > 40))
    return NextResponse.json({ error: "badRequest" }, { status: 400, headers: noStore });
  const r = await chooseAvatar(owner, hero, { accounts: accountStore(), profiles: profileStore() });
  return r.ok
    ? NextResponse.json({ avatarUrl: r.avatarUrl }, { headers: noStore })
    : NextResponse.json({ error: r.error }, { status: 422, headers: noStore });
}
