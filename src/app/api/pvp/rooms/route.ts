// Phòng mời bằng mã của Đấu người 3vs3 (giao hữu, không tính điểm).
// GET /api/pvp/rooms[?code=ABC234]: phòng đang ở (hoặc phòng theo mã), kèm tướng bạn chọn được.
// POST /api/pvp/rooms `{ action: "create" | "join" | "leave" | "hero" | "move" | "fill" | "start", ... }`.
// Chỉ tài khoản đăng nhập và chỉ khi bật cờ PVP_ENABLED.

import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { pvpEnabled } from "@/server/featureFlags";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import { makeRoomCode, normalizeRoomCode, pvpRoomCreate, pvpRoomFillAi, pvpRoomGet, pvpRoomHero, pvpRoomJoin, pvpRoomLeave, pvpRoomMove, pvpRoomStart, type PvpRoomDeps, type PvpRoomResult } from "@/server/pvpRooms";
import { accountStore, profileStore, pvpStore, seasonStore } from "@/server/store";

const noStore = { "cache-control": "no-store" };

function deps(): PvpRoomDeps {
  return {
    pvp: pvpStore(),
    profiles: profileStore(),
    seasons: seasonStore(),
    now: Date.now(),
    seed: randomInt(0, 2 ** 31),
    newId: () => randomUUID(),
    newCode: () => makeRoomCode(() => randomInt(0, 2 ** 31) / 2 ** 31),
    nameOf: async (id) => (await accountStore().get(id))?.name ?? `Khách ${id.slice(-4)}`,
  };
}

async function owner(request: NextRequest): Promise<string | NextResponse> {
  if (!pvpEnabled()) return NextResponse.json({ error: "featureDisabled" }, { status: 503, headers: noStore });
  const id = guestOf(request);
  if (!id || !(await isSignedInAccount(id))) return loginRequiredResponse();
  return id;
}

function reply(r: PvpRoomResult) {
  if (r.ok) return NextResponse.json({ room: r.room }, { headers: noStore });
  const status = r.error === "notFound" ? 404 : r.error === "conflict" ? 409 : r.error === "notHost" || r.error === "notMember" ? 403 : 422;
  return NextResponse.json({ error: r.error }, { status, headers: noStore });
}

export async function GET(request: NextRequest) {
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const raw = request.nextUrl.searchParams.get("code");
  const code = raw === null ? null : normalizeRoomCode(raw);
  if (raw !== null && code === null) return NextResponse.json({ error: "notFound" }, { status: 404, headers: noStore });
  return reply(await pvpRoomGet(who, code, deps()));
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const who = await owner(request);
  if (typeof who !== "string") return who;
  const body = (await readJson(request)) as { action?: unknown; code?: unknown; hero?: unknown; element?: unknown; profession?: unknown; slot?: unknown; fillAi?: unknown } | null;
  const d = deps();
  switch (body?.action) {
    case "create":
      return reply(await pvpRoomCreate(who, d));
    case "join":
      return reply(await pvpRoomJoin(who, body.code, d));
    case "leave": {
      const r = await pvpRoomLeave(who, d);
      return r.ok ? NextResponse.json({ ok: true }, { headers: noStore }) : NextResponse.json({ error: r.error }, { status: 403, headers: noStore });
    }
    case "hero":
      return reply(await pvpRoomHero(who, body.hero ?? null, { element: body.element, profession: body.profession }, d));
    case "move":
      return reply(await pvpRoomMove(who, body.slot, d));
    case "fill":
      return reply(await pvpRoomFillAi(who, body.fillAi, d));
    case "start":
      return reply(await pvpRoomStart(who, d));
    default:
      return NextResponse.json({ error: "badRequest" }, { status: 400, headers: noStore });
  }
}
