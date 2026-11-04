// POST /api/expedition/run `{ map, tier, main: [2 id], second: [3 id] }`: xuất quân. Khách chơi được (không có bảng xếp hạng).
import { NextResponse, type NextRequest } from "next/server";
import { startExpedition } from "@/server/expedition";
import { guestOf, newGuestId, readJson, serverDeps, setAccountCookie } from "@/server/http";
import { expeditionStatus } from "../status";

export async function POST(request: NextRequest) {
  const existing = guestOf(request);
  const owner = existing ?? newGuestId();
  const result = await startExpedition(owner, await readJson(request), serverDeps());
  const response = NextResponse.json(result, { status: expeditionStatus(result), headers: { "cache-control": "no-store" } });
  if (!existing && result.ok) setAccountCookie(response, owner);
  return response;
}
