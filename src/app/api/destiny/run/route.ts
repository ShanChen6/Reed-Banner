// POST /api/destiny/run `{ rosterIds }`: bắt đầu run khóa roster của cycle hiện tại.
import { NextResponse, type NextRequest } from "next/server";
import { startDestinyRun } from "@/server/destiny";
import { guestOf, newGuestId, readJson, serverDeps, setAccountCookie } from "@/server/http";

export async function POST(request: NextRequest) {
  const existing = guestOf(request);
  const owner = existing ?? newGuestId();
  const result = await startDestinyRun(owner, await readJson(request), serverDeps());
  const response = NextResponse.json(result, {
    status: result.ok ? 200 : result.error === "run_exists" || result.error === "conflict" ? 409 : 422,
    headers: { "cache-control": "no-store" },
  });
  if (!existing && result.ok) setAccountCookie(response, owner);
  return response;
}
