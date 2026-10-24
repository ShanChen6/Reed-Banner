// POST /api/trial/sweep: nhận Đá Cường Hóa quét ngày hiện tại theo progress server.

import { NextResponse, type NextRequest } from "next/server";
import { guestOf, serverDeps } from "@/server/http";
import { settleTrialSweepRequest } from "@/server/trialApi";

export async function POST(request: NextRequest) {
  const deps = serverDeps();
  const reply = await settleTrialSweepRequest(deps.profiles, guestOf(request), deps.now, deps.trialEnabled);
  return NextResponse.json(reply.body, {
    status: reply.status,
    headers: { "cache-control": "no-store" },
  });
}
