// POST /api/expedition/run `{ map, tier, main: [2 id], second: [3 id] }`: xuất quân. Chỉ tài khoản đã đăng nhập
// (Viễn Chinh có bảng xếp hạng); giới hạn lượt mỗi ngày báo `dailyLimit`.
import { NextResponse, type NextRequest } from "next/server";
import { startExpedition } from "@/server/expedition";
import { guestOf, loginRequiredResponse, readJson, serverDeps } from "@/server/http";
import { expeditionStatus } from "../status";

export async function POST(request: NextRequest) {
  const owner = guestOf(request);
  if (!owner) return loginRequiredResponse();
  const result = await startExpedition(owner, await readJson(request), serverDeps());
  return NextResponse.json(result, { status: expeditionStatus(result), headers: { "cache-control": "no-store" } });
}
