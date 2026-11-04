// POST /api/expedition/march `{ army: 0|1, to }`: tiến quân sang ô kề; gặp đồn thì mở trận (trả về id trận).
import { NextResponse, type NextRequest } from "next/server";
import { marchExpeditionArmy } from "@/server/expedition";
import { guestOf, readJson, serverDeps } from "@/server/http";
import { expeditionStatus } from "../status";

export async function POST(request: NextRequest) {
  const owner = guestOf(request);
  if (!owner) return NextResponse.json({ ok: false, error: "noRun" }, { status: 422 });
  const result = await marchExpeditionArmy(owner, await readJson(request), serverDeps());
  return NextResponse.json(result, { status: expeditionStatus(result), headers: { "cache-control": "no-store" } });
}
