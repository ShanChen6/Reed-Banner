// GET /api/destiny: cycle, run authoritative, floor public và offer đã persist.
import { NextResponse, type NextRequest } from "next/server";
import { destinyOverview } from "@/server/destiny";
import { guestOf, isSignedInAccount, loginRequiredResponse, serverDeps } from "@/server/http";

export async function GET(request: NextRequest) {
  const deps = serverDeps();
  const viewer = guestOf(request);
  // Cờ tắt thì giữ phản hồi featureDisabled như trước; cờ bật thì khách không xem (chế độ online có xếp hạng và thưởng).
  if (deps.destinyEnabled && (!viewer || !(await isSignedInAccount(viewer)))) return loginRequiredResponse();
  return NextResponse.json(
    await destinyOverview(viewer, deps),
    { headers: { "cache-control": "no-store" } },
  );
}
