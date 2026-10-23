import { NextResponse, type NextRequest } from "next/server";
import { activeDestinyCycle, destinyCycleById, publicDestinyCycle } from "@/server/destinyCycle";
import { destinyLeaderboardView } from "@/server/destinyLeaderboard";
import { guestOf } from "@/server/http";
import { destinyLeaderboardStore } from "@/server/store";

const integer = (value: string | null, fallback: number) => {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : Number.NaN;
};

export async function GET(request: NextRequest) {
  const scheduled = activeDestinyCycle(Date.now());
  if (!scheduled.ok) return NextResponse.json({ error: "invalid_time" }, { status: 500 });
  const requestedCycle = request.nextUrl.searchParams.get("cycle");
  const cycle = requestedCycle ? destinyCycleById(requestedCycle) : scheduled.cycle;
  const offset = integer(request.nextUrl.searchParams.get("cursor"), 0);
  const limit = integer(request.nextUrl.searchParams.get("limit"), 20);
  if (!cycle || offset < 0 || offset > 1_000_000 || limit < 1 || limit > 50)
    return NextResponse.json({ error: "badRequest" }, { status: 400 });
  return NextResponse.json(
    await destinyLeaderboardView(
      destinyLeaderboardStore(),
      publicDestinyCycle(cycle),
      guestOf(request),
      offset,
      limit,
    ),
    { headers: { "cache-control": "no-store" } },
  );
}
