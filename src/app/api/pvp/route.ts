// GET /api/pvp: điểm hạng, trạng thái hàng đợi và trận đang chơi của người chơi hiện tại. Mỗi lần hỏi là một lần ghi nhận
// tín hiệu còn sống và một lần thử ghép trận (không có tiến trình nền).
// POST /api/pvp `{ action: "queue", format: "duel" } | { action: "leave" }`: vào hoặc rời hàng đợi ghép trận.
// Quần Hùng online là chế độ có xếp hạng: chỉ tài khoản đăng nhập, và chỉ khi bật cờ PVP_ENABLED.

import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { pvpEnabled } from "@/server/featureFlags";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import { pvpEnqueue, pvpLeaveQueue, pvpOverview, type PvpDeps } from "@/server/pvp";
import { accountStore, profileStore, pvpStore, seasonStore } from "@/server/store";

const noStore = { "cache-control": "no-store" };

function deps(): PvpDeps {
  return {
    pvp: pvpStore(),
    profiles: profileStore(),
    seasons: seasonStore(),
    now: Date.now(),
    seed: randomInt(0, 2 ** 31),
    newId: () => randomUUID(),
    nameOf: async (id) => (await accountStore().get(id))?.name ?? `Khách ${id.slice(-4)}`,
  };
}

async function owner(request: NextRequest): Promise<string | NextResponse> {
  if (!pvpEnabled()) return NextResponse.json({ error: "featureDisabled" }, { status: 503, headers: noStore });
  const id = guestOf(request);
  if (!id || !(await isSignedInAccount(id))) return loginRequiredResponse();
  return id;
}

export async function GET(request: NextRequest) {
  const who = await owner(request);
  if (typeof who !== "string") return who;
  return NextResponse.json(await pvpOverview(who, deps()), { headers: noStore });
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const body = (await readJson(request)) as { action?: unknown; format?: unknown; element?: unknown; profession?: unknown } | null;
  const d = deps();
  if (body?.action === "leave") {
    await pvpLeaveQueue(who, d);
  } else if (body?.action === "queue") {
    const r = await pvpEnqueue(who, body.format as "duel" | "team", d, { element: body.element, profession: body.profession });
    if (!r.ok)
      return NextResponse.json({ error: r.error, ...(r.until ? { until: r.until } : {}) }, { status: r.error === "inMatch" ? 409 : r.error === "banned" ? 403 : 400, headers: noStore });
  } else {
    return NextResponse.json({ error: "badRequest" }, { status: 400, headers: noStore });
  }
  return NextResponse.json(await pvpOverview(who, d), { headers: noStore });
}
