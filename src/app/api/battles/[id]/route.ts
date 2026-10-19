// GET /api/battles/:id: trạng thái trận sau khi chạy bù tới hiện tại (dùng khi F5 hoặc báo hết giờ).

import type { NextRequest } from "next/server";
import { getBattle } from "@/server/battles";
import { guestOf, respond, serverDeps } from "@/server/http";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const owner = guestOf(request);
  if (!owner) return respond({ ok: false, error: "notFound" });
  return respond(await getBattle(id, owner, serverDeps()));
}
