// POST /api/expedition/camp: đóng quân, cả hai đạo nghỉ một ngày.
import { NextResponse, type NextRequest } from "next/server";
import { campExpeditionArmies } from "@/server/expedition";
import { guestOf, serverDeps } from "@/server/http";
import { expeditionStatus } from "../status";

export async function POST(request: NextRequest) {
  const owner = guestOf(request);
  if (!owner) return NextResponse.json({ ok: false, error: "noRun" }, { status: 422 });
  const result = await campExpeditionArmies(owner, serverDeps());
  return NextResponse.json(result, { status: expeditionStatus(result), headers: { "cache-control": "no-store" } });
}
