// POST /api/destiny/battles `{ activeIds, leaderBuild }`: mở hoặc resume trận tầng hiện tại.
import { NextResponse, type NextRequest } from "next/server";
import { startDestinyBattle } from "@/server/destiny";
import { guestOf, readJson, serverDeps } from "@/server/http";

export async function POST(request: NextRequest) {
  const owner = guestOf(request);
  if (!owner) return NextResponse.json({ error: "no_run" }, { status: 403 });
  const result = await startDestinyBattle(owner, await readJson(request), serverDeps());
  return NextResponse.json(result, {
    status: result.ok ? 200 : result.error === "conflict" || result.error === "invalid_phase" ? 409 : 422,
    headers: { "cache-control": "no-store" },
  });
}
