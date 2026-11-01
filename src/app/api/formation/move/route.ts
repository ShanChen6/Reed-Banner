// POST /api/formation/move {level, seq, command}: áp một lệnh (đặt quân hoặc bỏ lệnh) vào ván xếp hạng đang chơi.

import { NextResponse, type NextRequest } from "next/server";
import { formationHttpStatus, moveFormation } from "@/server/formation";
import { formationDeps, guestOf, readJson, sameOrigin } from "@/server/http";

export async function POST(request: NextRequest) {
  const owner = guestOf(request);
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  if (!owner) {
    const enabled = formationDeps().enabled;
    return NextResponse.json({ error: enabled ? "loginRequired" : "featureDisabled" }, { status: enabled ? 401 : 403 });
  }
  const body = (await readJson(request)) as { level?: unknown; seq?: unknown; command?: unknown } | null;
  const deps = formationDeps();
  const result = await moveFormation(deps, owner, body?.level, body?.seq, body?.command);
  return result.ok
    ? NextResponse.json({ view: result.view, events: result.events, now: deps.now }, { headers: { "cache-control": "no-store" } })
    : NextResponse.json({ error: result.error, reason: result.reason, view: result.view }, { status: formationHttpStatus(result.error) });
}
