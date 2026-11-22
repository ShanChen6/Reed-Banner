// Tam Quân Kỳ do server làm trọng tài (src/server/tamQuanKy.ts).
// GET /api/tam-quan-ky?id=...: xem ván (xử hết giờ).
// POST /api/tam-quan-ky `{ action: "ai" | "host" | "join" | "move" | "resign", ... }`.
// Chỉ tài khoản đăng nhập. Tắt nhanh bằng TAM_QUAN_KY_SERVER_ENABLED=false.

import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { chooseMove, parseTqkMove } from "@/core/tam-quan-ky";
import { tamQuanKyServerEnabled } from "@/server/featureFlags";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import { makeRoomCode, normalizeRoomCode } from "@/server/pvpRooms";
import { accountStore, profileStore, tqkStore } from "@/server/store";
import { tqkGet, tqkHost, tqkJoin, tqkMove, tqkResignMatch, tqkStartAi, type TqkDeps, type TqkResult } from "@/server/tamQuanKy";

const noStore = { "cache-control": "no-store" };

function deps(): TqkDeps {
  return {
    store: tqkStore(),
    profiles: profileStore(),
    now: Date.now(),
    newId: () => randomUUID(),
    newCode: () => makeRoomCode(() => randomInt(0, 2 ** 31) / 2 ** 31),
    nameOf: async (id) => (await accountStore().get(id))?.name ?? `Lữ khách ${id.slice(-4)}`,
    think: (pos, level) => chooseMove(pos, level, randomInt(0, 2 ** 31), () => performance.now()).move,
  };
}

async function owner(request: NextRequest): Promise<string | NextResponse> {
  if (!tamQuanKyServerEnabled()) return NextResponse.json({ error: "featureDisabled" }, { status: 503, headers: noStore });
  const id = guestOf(request);
  if (!id || !(await isSignedInAccount(id))) return loginRequiredResponse();
  return id;
}

function reply(r: TqkResult) {
  if (r.ok) return NextResponse.json({ view: r.view }, { headers: noStore });
  const status = r.error === "notFound" ? 404 : r.error === "conflict" ? 409 : r.error === "notMember" ? 403 : r.error === "badRequest" ? 400 : 422;
  return NextResponse.json({ error: r.error }, { status, headers: noStore });
}

export async function GET(request: NextRequest) {
  const who = await owner(request);
  if (typeof who !== "string") return who;
  return reply(await tqkGet(who, request.nextUrl.searchParams.get("id"), deps()));
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const body = (await readJson(request)) as Record<string, unknown> | null;
  const d = deps();
  switch (body?.action) {
    case "ai":
      return reply(await tqkStartAi(who, { level: body.level, rival: body.rival, human: body.human }, d));
    case "host":
      return reply(await tqkHost(who, { clock: body.clock, rival: body.rival }, d));
    case "join": {
      const code = normalizeRoomCode(body.code);
      return code ? reply(await tqkJoin(who, code, d)) : reply({ ok: false, error: "notFound" });
    }
    case "move": {
      const move = parseTqkMove(body.move);
      return move ? reply(await tqkMove(who, body.id, move, d)) : reply({ ok: false, error: "badRequest" });
    }
    case "resign":
      return reply(await tqkResignMatch(who, body.id, d));
    default:
      return NextResponse.json({ error: "badRequest" }, { status: 400, headers: noStore });
  }
}
