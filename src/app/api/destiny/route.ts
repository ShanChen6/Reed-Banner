// GET /api/destiny: cycle, run authoritative, floor public và offer đã persist.
import { NextResponse, type NextRequest } from "next/server";
import { destinyOverview } from "@/server/destiny";
import { guestOf, serverDeps } from "@/server/http";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    await destinyOverview(guestOf(request), serverDeps()),
    { headers: { "cache-control": "no-store" } },
  );
}
