// Vây Thành Kỳ do server làm trọng tài (src/server/coVay.ts): đấu sứ quân có thưởng và đấu người bằng mã phòng.
// GET /api/go?id=...: xem ván (xử hết giờ).
// POST /api/go `{ action: "ai" | "host" | "join" | "move" | "resign", ... }`.
// Chỉ tài khoản đã trình danh. Tắt nhanh bằng VAY_THANH_KY_SERVER_ENABLED=false.

import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { chooseMove, parseGoPoint } from "@/core/co-vay";
import { vayThanhKyServerEnabled } from "@/server/featureFlags";
import { goGet, goHost, goJoin, goMove, goResignMatch, goStartAi, type GoApiResult, type GoDeps } from "@/server/coVay";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import { makeRoomCode, normalizeRoomCode } from "@/server/pvpRooms";
import { accountStore, goStore, profileStore } from "@/server/store";

const noStore = { "cache-control": "no-store" };
/** Trần thời gian máy nghĩ mỗi nước trên server (ms): bàn lớn độ khó cao không kéo request quá lâu. */
const SERVER_THINK_MS = 2500;

function deps(): GoDeps {
  return {
    store: goStore(),
    profiles: profileStore(),
    think: (pos, level) => chooseMove(pos, level, randomInt(0, 2 ** 31), () => performance.now(), SERVER_THINK_MS),
    now: Date.now(),
    newId: () => randomUUID(),
    newCode: () => makeRoomCode(() => randomInt(0, 2 ** 31) / 2 ** 31),
    nameOf: async (id) => (await accountStore().get(id))?.name ?? `Lữ khách ${id.slice(-4)}`,
  };
}

async function owner(request: NextRequest): Promise<string | NextResponse> {
  if (!vayThanhKyServerEnabled()) return NextResponse.json({ error: "featureDisabled" }, { status: 503, headers: noStore });
  const id = guestOf(request);
  if (!id || !(await isSignedInAccount(id))) return loginRequiredResponse();
  return id;
}

function reply(r: GoApiResult) {
  if (r.ok) return NextResponse.json({ view: r.view }, { headers: noStore });
  const status = r.error === "notFound" ? 404 : r.error === "conflict" ? 409 : r.error === "notMember" ? 403 : r.error === "badRequest" ? 400 : 422;
  return NextResponse.json({ error: r.error }, { status, headers: noStore });
}

export async function GET(request: NextRequest) {
  const who = await owner(request);
  if (typeof who !== "string") return who;
  return reply(await goGet(who, request.nextUrl.searchParams.get("id"), deps()));
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const body = (await readJson(request)) as Record<string, unknown> | null;
  const d = deps();
  switch (body?.action) {
    case "ai":
      return reply(
        await goStartAi(
          who,
          { level: body.level, rival: body.rival, human: body.human, size: body.size, mode: body.mode, element: body.element, rivalElement: body.rivalElement },
          d,
        ),
      );
    case "host":
      return reply(await goHost(who, { size: body.size, mode: body.mode, clock: body.clock, element: body.element }, d));
    case "join": {
      const code = normalizeRoomCode(body.code);
      return code ? reply(await goJoin(who, code, { element: body.element }, d)) : reply({ ok: false, error: "notFound" });
    }
    case "move": {
      const point = parseGoPoint(body.point, 19);
      return point === null ? reply({ ok: false, error: "badRequest" }) : reply(await goMove(who, body.id, point, d));
    }
    case "resign":
      return reply(await goResignMatch(who, body.id, d));
    default:
      return NextResponse.json({ error: "badRequest" }, { status: 400, headers: noStore });
  }
}
