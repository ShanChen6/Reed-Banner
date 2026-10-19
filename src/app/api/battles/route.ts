// POST /api/battles: tạo trận online mới cho khách hiện tại (tạo khách nếu chưa có).

import type { NextRequest } from "next/server";
import { createBattleFor, parseNewBattle } from "@/server/battles";
import { guestOf, newGuestId, readJson, respond, serverDeps } from "@/server/http";

export async function POST(request: NextRequest) {
  const input = parseNewBattle(await readJson(request));
  if (!input) return respond({ ok: false, error: "badRequest" });
  const existing = guestOf(request);
  const owner = existing ?? newGuestId();
  const result = await createBattleFor(owner, input, serverDeps());
  return respond(result, existing ? undefined : owner);
}
