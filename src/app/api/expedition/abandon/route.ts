// POST /api/expedition/abandon: rút khỏi viễn chinh (trận đang dở tính thua).
import { NextResponse, type NextRequest } from "next/server";
import { abandonExpeditionRun } from "@/server/expedition";
import { guestOf, serverDeps } from "@/server/http";
import { expeditionStatus } from "../status";

export async function POST(request: NextRequest) {
  const owner = guestOf(request);
  if (!owner) return NextResponse.json({ ok: true, stopped: false });
  const result = await abandonExpeditionRun(owner, serverDeps());
  return NextResponse.json(result, { status: expeditionStatus(result), headers: { "cache-control": "no-store" } });
}
