// Điền Trang Ký do server làm trọng tài (src/server/dienTrangKy.ts): đấu sứ quân có thưởng theo hạng và phòng mã 2–4 người.
// GET /api/tycoon?id=...: xem ván (phòng mã: quá giờ thì máy đi thay).
// POST /api/tycoon `{ action: "ai" | "host" | "join" | "color" | "addBot" | "removeSeat" | "start" | "act" | "resign", ... }`.
// Chỉ tài khoản đã trình danh. Tắt nhanh bằng DIEN_TRANG_KY_SERVER_ENABLED=false.

import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { dienTrangKyServerEnabled } from "@/server/featureFlags";
import { dtkAct, dtkAddBot, dtkGet, dtkHost, dtkJoin, dtkRemoveSeat, dtkResign, dtkSetColor, dtkStart, dtkStartAi, parseDtkAction, type DtkApiResult, type DtkDeps } from "@/server/dienTrangKy";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import { makeRoomCode, normalizeRoomCode } from "@/server/pvpRooms";
import { accountStore, dtkStore, profileStore } from "@/server/store";

const noStore = { "cache-control": "no-store" };

function deps(): DtkDeps {
  return {
    store: dtkStore(),
    profiles: profileStore(),
    now: Date.now(),
    newId: () => randomUUID(),
    newCode: () => makeRoomCode(() => randomInt(0, 2 ** 31) / 2 ** 31),
    newSeed: () => randomInt(1, 2 ** 31),
    nameOf: async (id) => (await accountStore().get(id))?.name ?? `Lữ khách ${id.slice(-4)}`,
  };
}

async function owner(request: NextRequest): Promise<string | NextResponse> {
  if (!dienTrangKyServerEnabled()) return NextResponse.json({ error: "featureDisabled" }, { status: 503, headers: noStore });
  const id = guestOf(request);
  if (!id || !(await isSignedInAccount(id))) return loginRequiredResponse();
  return id;
}

function reply(r: DtkApiResult) {
  if (r.ok) return NextResponse.json({ view: r.view }, { headers: noStore });
  const status = r.error === "notFound" ? 404 : r.error === "conflict" ? 409 : r.error === "notMember" || r.error === "notHost" ? 403 : r.error === "badRequest" ? 400 : 422;
  return NextResponse.json({ error: r.error }, { status, headers: noStore });
}

export async function GET(request: NextRequest) {
  const who = await owner(request);
  if (typeof who !== "string") return who;
  return reply(await dtkGet(who, request.nextUrl.searchParams.get("id"), deps()));
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const body = (await readJson(request)) as Record<string, unknown> | null;
  const d = deps();
  switch (body?.action) {
    case "ai":
      return reply(await dtkStartAi(who, { element: body.element, rivals: body.rivals, color: body.color }, d));
    case "host":
      return reply(await dtkHost(who, { element: body.element, color: body.color }, d));
    case "join": {
      const code = normalizeRoomCode(body.code);
      return code ? reply(await dtkJoin(who, code, { element: body.element, color: body.color }, d)) : reply({ ok: false, error: "notFound" });
    }
    case "color":
      return reply(await dtkSetColor(who, body.id, body.color, d));
    case "addBot":
      return reply(await dtkAddBot(who, body.id, body.rival, d));
    case "removeSeat":
      return reply(await dtkRemoveSeat(who, body.id, body.index, d));
    case "start":
      return reply(await dtkStart(who, body.id, d));
    case "act": {
      const action = parseDtkAction(body.move);
      return action ? reply(await dtkAct(who, body.id, action, d)) : reply({ ok: false, error: "badRequest" });
    }
    case "resign":
      return reply(await dtkResign(who, body.id, d));
    default:
      return NextResponse.json({ error: "badRequest" }, { status: 400, headers: noStore });
  }
}
