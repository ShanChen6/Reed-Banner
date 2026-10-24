// POST /api/trial/battles `{ floor, companions, leaderBuild? }`: mở (hoặc nối lại) trận Trial.
// DELETE /api/trial/battles: bỏ trận Trial đang mở. Trận sau đó chơi qua /api/battles/:id như thường.

import { NextResponse, type NextRequest } from "next/server";
import { guestOf, newGuestId, readJson, serverDeps, setAccountCookie } from "@/server/http";
import { abandonTrialRequest, startTrialRequest, trialRegistry } from "@/server/trialApi";

const noStore = { "cache-control": "no-store" };

export async function POST(request: NextRequest) {
  const existing = guestOf(request);
  const owner = existing ?? newGuestId();
  const reply = await startTrialRequest(owner, await readJson(request), {
    ...serverDeps(),
    floors: trialRegistry(),
  });
  const res = NextResponse.json(reply.body, { status: reply.status, headers: noStore });
  if (!existing && reply.status === 200) setAccountCookie(res, owner);
  return res;
}

export async function DELETE(request: NextRequest) {
  const owner = guestOf(request);
  if (!owner) return NextResponse.json({ abandoned: false }, { headers: noStore });
  const reply = await abandonTrialRequest(owner, { ...serverDeps(), floors: trialRegistry() });
  return NextResponse.json(reply.body, { status: reply.status, headers: noStore });
}
