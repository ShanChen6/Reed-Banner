// POST /api/formation/claim {level, period}: nhận thưởng hạng của một kỳ đã khép lại (đúng một lần mỗi ván).

import { NextResponse, type NextRequest } from "next/server";
import { claimFormation, formationHttpStatus } from "@/server/formation";
import { formationDeps, guestOf, readJson, sameOrigin } from "@/server/http";

export async function POST(request: NextRequest) {
  const owner = guestOf(request);
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  if (!owner) {
    const enabled = formationDeps().enabled;
    return NextResponse.json({ error: enabled ? "loginRequired" : "featureDisabled" }, { status: enabled ? 401 : 403 });
  }
  const body = (await readJson(request)) as { level?: unknown; period?: unknown } | null;
  const result = await claimFormation(formationDeps(), owner, body?.level, body?.period);
  return result.ok
    ? NextResponse.json(result, { headers: { "cache-control": "no-store" } })
    : NextResponse.json({ error: result.error }, { status: formationHttpStatus(result.error) });
}
