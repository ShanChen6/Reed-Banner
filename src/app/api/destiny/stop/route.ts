// POST /api/destiny/stop: kết thúc run; battle đang mở được chốt thua qua settlement chung.
import { NextResponse, type NextRequest } from "next/server";
import { stopDestinyRun } from "@/server/destiny";
import { guestOf, serverDeps } from "@/server/http";

export async function POST(request: NextRequest) {
  const owner = guestOf(request);
  if (!owner) return NextResponse.json({ stopped: false });
  const result = await stopDestinyRun(owner, serverDeps());
  return NextResponse.json(result, {
    status: result.ok ? 200 : result.error === "featureDisabled" ? 503 : result.error === "conflict" ? 409 : 422,
    headers: { "cache-control": "no-store" },
  });
}
