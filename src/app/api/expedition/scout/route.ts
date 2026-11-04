// POST /api/expedition/scout `{ army }`: trinh sát, đạo đó đứng yên một ngày vén sương quanh mình (Cửa Biển).
import { NextResponse, type NextRequest } from "next/server";
import { scoutExpeditionArmy } from "@/server/expedition";
import { guestOf, readJson, serverDeps } from "@/server/http";
import { expeditionStatus } from "../status";

export async function POST(request: NextRequest) {
  const owner = guestOf(request);
  if (!owner) return NextResponse.json({ ok: false, error: "noRun" }, { status: 422 });
  const result = await scoutExpeditionArmy(owner, await readJson(request), serverDeps());
  return NextResponse.json(result, { status: expeditionStatus(result), headers: { "cache-control": "no-store" } });
}
