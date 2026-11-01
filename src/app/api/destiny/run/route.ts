// POST /api/destiny/run `{ rosterIds }`: bắt đầu run khóa roster của cycle hiện tại.
import { NextResponse, type NextRequest } from "next/server";
import { startDestinyRun } from "@/server/destiny";
import { guestOf, isSignedInAccount, loginRequiredResponse, newGuestId, readJson, serverDeps, setAccountCookie } from "@/server/http";

export async function POST(request: NextRequest) {
  const deps = serverDeps();
  const existing = guestOf(request);
  // Thiên Mệnh là chế độ online có bảng xếp hạng và thưởng: khách không bắt đầu run mới. Cờ tắt thì giữ nguyên phản hồi
  // featureDisabled như trước (không lộ khác biệt giữa khách và tài khoản).
  if (deps.destinyEnabled && (!existing || !(await isSignedInAccount(existing)))) return loginRequiredResponse();
  const owner = existing ?? newGuestId();
  const result = await startDestinyRun(owner, await readJson(request), deps);
  const response = NextResponse.json(result, {
    status: result.ok ? 200 : result.error === "featureDisabled" ? 503 : result.error === "run_exists" || result.error === "conflict" ? 409 : 422,
    headers: { "cache-control": "no-store" },
  });
  if (!existing && result.ok) setAccountCookie(response, owner);
  return response;
}
