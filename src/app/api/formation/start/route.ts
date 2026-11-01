// POST /api/formation/start {level}: mở (hoặc nối lại) ván xếp hạng của kỳ hiện tại. Tạo khách nếu chưa có.

import { NextResponse, type NextRequest } from "next/server";
import { formationHttpStatus, startFormation } from "@/server/formation";
import { formationDeps, guestOf, newGuestId, readJson, sameOrigin, setAccountCookie } from "@/server/http";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const body = (await readJson(request)) as { level?: unknown } | null;
  const existing = guestOf(request);
  const owner = existing ?? newGuestId();
  const deps = formationDeps();
  const result = await startFormation(deps, owner, body?.level);
  const res = result.ok
    ? NextResponse.json({ view: result.view, resumed: result.resumed, now: deps.now }, { headers: { "cache-control": "no-store" } })
    : NextResponse.json({ error: result.error }, { status: formationHttpStatus(result.error) });
  if (result.ok && !existing) setAccountCookie(res, owner);
  return res;
}
