// POST /api/battles/:id/actions: một hành động của người chơi `{ seq, action }`.

import type { NextRequest } from "next/server";
import { actBattle } from "@/server/battles";
import { guestOf, readJson, respond, serverDeps } from "@/server/http";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const owner = guestOf(request);
  if (!owner) return respond({ ok: false, error: "notFound" });
  return respond(await actBattle(id, owner, await readJson(request), serverDeps()));
}
