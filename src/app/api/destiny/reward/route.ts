// POST /api/destiny/reward `{ floor, index, targetIds? }`: claim đúng offer đã persist.
import { NextResponse, type NextRequest } from "next/server";
import { claimDestinyReward } from "@/server/destiny";
import { guestOf, readJson, serverDeps } from "@/server/http";

export async function POST(request: NextRequest) {
  const owner = guestOf(request);
  if (!owner) return NextResponse.json({ error: "no_run" }, { status: 403 });
  const result = await claimDestinyReward(owner, await readJson(request), serverDeps());
  return NextResponse.json(result, {
    status: result.ok ? 200 : result.error === "featureDisabled" ? 503 : result.error === "stale_reward" || result.error === "conflict" ? 409 : 422,
    headers: { "cache-control": "no-store" },
  });
}
