// POST /api/formation/start {level}: mở (hoặc nối lại) ván xếp hạng của kỳ hiện tại. Chỉ tài khoản đã đăng nhập; khách
// không chơi xếp hạng (không tạo khách mới ở đây).

import { NextResponse, type NextRequest } from "next/server";
import { formationHttpStatus, startFormation } from "@/server/formation";
import { formationDeps, guestOf, readJson, sameOrigin } from "@/server/http";
import { accountStore } from "@/server/store";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const deps = formationDeps();
  const owner = guestOf(request);
  if (!owner) return NextResponse.json({ error: deps.enabled ? "loginRequired" : "featureDisabled" }, { status: deps.enabled ? 401 : 403 });
  const body = (await readJson(request)) as { level?: unknown } | null;
  const account = await accountStore().get(owner);
  const result = await startFormation(deps, owner, body?.level, account?.name ?? null);
  return result.ok
    ? NextResponse.json({ view: result.view, resumed: result.resumed, now: deps.now }, { headers: { "cache-control": "no-store" } })
    : NextResponse.json({ error: result.error }, { status: formationHttpStatus(result.error) });
}
